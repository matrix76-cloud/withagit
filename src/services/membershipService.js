/* eslint-disable */
// /src/services/membershipService.js
// Withagit — Membership Service (SSOT v5 + cashpass)
// - 모든 시간: millis(number, UTC)
// - 경로: members/{phoneE164}/memberships/{mid}
// - 기간형 종료 시각: 배타(exclusive) — now < expiresAt 면 활성
// - 스코프: agitz / family / timepass / cashpass = 모두 child-scoped

import {
    doc, setDoc, updateDoc, getDoc, getDocs,
    collection, query, where, orderBy, limit as qlimit,
    runTransaction
} from "firebase/firestore";
import { db } from "./api";
import { MEMBERSHIP_KIND, MEMBERSHIP_STATUS } from "../constants/membershipDefine";

/* ===== Time Helpers (저장=UTC millis, 달력=KST 기준) ===== */
const KST_OFFSET = 9 * 60 * 60 * 1000;
const nowMs = () => Date.now();

/** baseMs 시점의 "KST 자정(00:00)"을 UTC millis로 반환 */
function floorToKstMidnightUtcMillis(baseMs = nowMs()) {
    const k = new Date(baseMs + KST_OFFSET);
    k.setUTCHours(0, 0, 0, 0);
    return k.getTime() - KST_OFFSET;
}

/** KST 달력 기준 months개월 뒤 같은 자정(배타 종료용) UTC millis */
function addMonthsExclusiveKstUtcMillis(startUtcMs, months) {
    const k = new Date(startUtcMs + KST_OFFSET);
    const day = k.getUTCDate();
    k.setUTCMonth(k.getUTCMonth() + months);
    if (k.getUTCDate() !== day) k.setUTCDate(0); // 말일 보정
    return k.getTime() - KST_OFFSET;
}

/* ===== Guards ===== */
function assertKind(kind) {
    const ok = [
        MEMBERSHIP_KIND.AGITZ,
        MEMBERSHIP_KIND.FAMILY,
        MEMBERSHIP_KIND.TIMEPASS,
        MEMBERSHIP_KIND.CASHPASS, // 정액권
    ].includes(kind);
    if (!ok) throw new Error(`invalid kind: ${kind}`);
}

function assertStatus(status) {
    const ok = [
        MEMBERSHIP_STATUS.ACTIVE,
        MEMBERSHIP_STATUS.EXPIRED,
        MEMBERSHIP_STATUS.REVOKED,
        MEMBERSHIP_STATUS.PENDING,
        MEMBERSHIP_STATUS.FUTURE,
    ].includes(status);
    if (!ok) throw new Error(`invalid status: ${status}`);
}

async function ensureChildExists(phoneE164, childId) {
    const ref = doc(db, "members", phoneE164, "children", childId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`child not found: ${childId}`);
}

/* 동일 자녀·동일 kind에 대해 ACTIVE/FUTURE 1개만 허용 */
async function assertSingleActivePerKindChild(phoneE164, kind, childId) {
    const col = collection(db, "members", phoneE164, "memberships");
    const qy = query(
        col,
        where("kind", "==", kind),
        where("childId", "==", childId),
        where("status", "in", [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.FUTURE]),
        qlimit(1)
    );
    const snap = await getDocs(qy);
    if (!snap.empty) throw new Error(`${kind} already active/future on child ${childId}`);
}

/* ===== Reads ===== */
export async function listMemberships(phoneE164, limit = 100) {
    const colRef = collection(db, "members", phoneE164, "memberships");
    const qy = query(colRef, orderBy("createdAt", "desc"), qlimit(limit));
    const snap = await getDocs(qy);
    return snap.docs.map(d => ({ mid: d.id, ...(d.data() || {}) }));
}

export async function listMembershipsByChild(phoneE164, childId, limit = 100) {
    const colRef = collection(db, "members", phoneE164, "memberships");
    const qy = query(
        colRef,
        where("childId", "==", childId),
        orderBy("createdAt", "desc"),
        qlimit(limit)
    );
    const snap = await getDocs(qy);
    return snap.docs.map(d => ({ mid: d.id, ...(d.data() || {}) }));
}

export async function getActiveAgitzByChild(phoneE164, childId) {
    const col = collection(db, "members", phoneE164, "memberships");
    const qy = query(
        col,
        where("kind", "==", MEMBERSHIP_KIND.AGITZ),
        where("childId", "==", childId),
        where("status", "in", [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.FUTURE]),
        orderBy("expiresAt", "desc"),
        qlimit(1)
    );
    const snap = await getDocs(qy);
    if (snap.empty) return null;
    const d0 = snap.docs[0];
    return { mid: d0.id, ...(d0.data() || {}) };
}

export async function getActiveFamilyByChild(phoneE164, childId) {
    const col = collection(db, "members", phoneE164, "memberships");
    const qy = query(
        col,
        where("kind", "==", MEMBERSHIP_KIND.FAMILY),
        where("childId", "==", childId),
        where("status", "in", [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.FUTURE]),
        orderBy("expiresAt", "desc"),
        qlimit(1)
    );
    const snap = await getDocs(qy);
    if (snap.empty) return null;
    const d0 = snap.docs[0];
    return { mid: d0.id, ...(d0.data() || {}) };
}

/* 내부: 동일 kind(+childId) ACTIVE/FUTURE 최신 expiresAt */
async function getLatestFutureOrActiveExpiry(phoneE164, kind, childId) {
    const colRef = collection(db, "members", phoneE164, "memberships");
    const qy = query(
        colRef,
        where("kind", "==", kind),
        where("childId", "==", childId),
        where("status", "in", [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.FUTURE]),
        orderBy("expiresAt", "desc"),
        qlimit(1)
    );
    const snap = await getDocs(qy);
    if (snap.empty) return null;
    const data0 = snap.docs[0].data() || {};
    return Number(data0.expiresAt || 0) || null;
}

/* ===== Create ===== */
/**
 * createMembership(phoneE164, {
 *   kind, childId, months=1, minutes=0, amountKRW=0, orderId?, startedAt?
 * })
 *
 * 규칙:
 * - agitz / family: 기간형. childId 필수. 기존 활성/예약이 있으면 만료 이후로 이어붙임.
 * - timepass: 기간 없음. minutes/remainMinutes 저장.
 * - cashpass: 기본은 기간 없음(금액권). months>0 전달 시 기간형으로도 운용 가능.
 */
export async function createMembership(phoneE164, payload = {}) {
    if (!phoneE164) throw new Error("createMembership: phone required");
    const {
        kind,
        childId,
        months = 1,
        minutes = 0,
        amountKRW = 0,
        orderId = null,
        startedAt: startedAtInput, // 존재해도 KST 규칙으로 정규화
    } = payload;

    assertKind(kind);

    // 모두 child-scoped
    if (!childId) throw new Error(`${kind} requires childId`);
    await ensureChildExists(phoneE164, childId);

    // kind별 필수값
    if (kind === MEMBERSHIP_KIND.TIMEPASS) {
        if (!(minutes > 0)) throw new Error("timepass requires minutes > 0");
    } else if (kind === MEMBERSHIP_KIND.CASHPASS) {
        if (!(amountKRW > 0)) throw new Error("cashpass requires amountKRW > 0");
    } else {
        if (!(months > 0)) throw new Error("months must be > 0");
    }

    // 자녀·동종 1개 원칙(agitz/family만 강제)
    if (kind === MEMBERSHIP_KIND.AGITZ || kind === MEMBERSHIP_KIND.FAMILY) {
        await assertSingleActivePerKindChild(phoneE164, kind, childId);
    }

    const colRef = collection(db, "members", phoneE164, "memberships");
    const mid = `${kind}_${Date.now()}`;
    const createdAt = nowMs();

    let startedAt = null;
    let expiresAt = null;
    let initialStatus = MEMBERSHIP_STATUS.ACTIVE;

    if (kind === MEMBERSHIP_KIND.TIMEPASS) {
        startedAt = createdAt; // 기록용
        expiresAt = null;
        initialStatus = MEMBERSHIP_STATUS.ACTIVE;
    } else if (kind === MEMBERSHIP_KIND.CASHPASS) {
        if (months > 0) {
            const todayKstStartUtc = floorToKstMidnightUtcMillis(createdAt);
            const latestExpiry = await getLatestFutureOrActiveExpiry(phoneE164, kind, childId);
            const startBase = Math.max(todayKstStartUtc, latestExpiry || 0);
            const startCandidate = Number(startedAtInput) > 0 ? Number(startedAtInput) : startBase;
            const startNorm = floorToKstMidnightUtcMillis(startCandidate);

            startedAt = startNorm;
            expiresAt = addMonthsExclusiveKstUtcMillis(startedAt, Math.max(1, Number(months) || 1));

            const now = createdAt;
            if (now < startedAt) initialStatus = MEMBERSHIP_STATUS.FUTURE;
            else if (now < expiresAt) initialStatus = MEMBERSHIP_STATUS.ACTIVE;
            else initialStatus = MEMBERSHIP_STATUS.EXPIRED;
        } else {
            // 기간 없음(금액권)
            startedAt = createdAt;
            expiresAt = null;
            initialStatus = MEMBERSHIP_STATUS.ACTIVE;
        }
    } else {
        // agitz / family
        const todayKstStartUtc = floorToKstMidnightUtcMillis(createdAt);
        const latestExpiry = await getLatestFutureOrActiveExpiry(phoneE164, kind, childId);
        const startBase = Math.max(todayKstStartUtc, latestExpiry || 0);
        const startCandidate = Number(startedAtInput) > 0 ? Number(startedAtInput) : startBase;
        const startNorm = floorToKstMidnightUtcMillis(startCandidate);

        startedAt = startNorm;
        expiresAt = addMonthsExclusiveKstUtcMillis(startedAt, Math.max(1, Number(months) || 1));

        const now = createdAt;
        if (now < startedAt) initialStatus = MEMBERSHIP_STATUS.FUTURE;
        else if (now < expiresAt) initialStatus = MEMBERSHIP_STATUS.ACTIVE;
        else initialStatus = MEMBERSHIP_STATUS.EXPIRED;
    }

    const common = {
        kind,
        childId,
        startedAt,             // UTC millis
        expiresAt,             // UTC millis (exclusive or null)
        status: initialStatus,
        orderId,
        amountKRW,
        months: (kind === MEMBERSHIP_KIND.TIMEPASS || kind === MEMBERSHIP_KIND.CASHPASS) ? Math.max(0, Number(months) || 0) : Math.max(1, months),
        createdAt,
        updatedAt: createdAt,
    };

    const extra =
        kind === MEMBERSHIP_KIND.TIMEPASS
            ? { minutes, remainMinutes: minutes }
            : (kind === MEMBERSHIP_KIND.CASHPASS
                ? { amountKRW, remainKRW: amountKRW }
                : {});

    const docRef = doc(colRef, mid);
    await setDoc(docRef, { ...common, ...extra });
    return { mid, ...common, ...extra };
}

/* ===== Update Status ===== */
export async function updateMembershipStatus(phoneE164, mid, status) {
    if (!phoneE164 || !mid) throw new Error("updateMembershipStatus: bad args");
    assertStatus(status);
    const refDoc = doc(db, "members", phoneE164, "memberships", mid);
    await updateDoc(refDoc, { status, updatedAt: nowMs() });
}

/* ===== Extend (기간형) =====
   - agitz/family/cashpass(months>0)만 기간 연장 대상
   - timepass는 기간 연장 불가
*/
export async function extendMembership(phoneE164, mid, addMonthsCount = 1) {
    if (!(addMonthsCount > 0)) throw new Error("extendMembership: addMonthsCount must be > 0");
    const refDoc = doc(db, "members", phoneE164, "memberships", mid);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) throw new Error("extendMembership: not found");
    const data = snap.data();

    if (data.kind === MEMBERSHIP_KIND.TIMEPASS) {
        throw new Error("extendMembership: timepass has no period to extend");
    }

    const base = Math.max(
        floorToKstMidnightUtcMillis(nowMs()),
        Number(data.expiresAt || 0)
    );
    const nextExpires = addMonthsExclusiveKstUtcMillis(base, addMonthsCount);

    await updateDoc(refDoc, { expiresAt: nextExpires, updatedAt: nowMs() });
    return { nextExpires };
}

/* ===== Timepass Consumption ===== */
export async function consumeTimepass(phoneE164, mid, minutes = 0) {
    if (!(minutes > 0)) throw new Error("consumeTimepass: minutes must be > 0");
    const refDoc = doc(db, "members", phoneE164, "memberships", mid);

    return runTransaction(db, async (tx) => {
        const snap = await tx.get(refDoc);
        if (!snap.exists()) throw new Error("consumeTimepass: not found");

        const data = snap.data();
        if (data.kind !== MEMBERSHIP_KIND.TIMEPASS) {
            throw new Error("consumeTimepass: only for timepass");
        }
        const cur = Number(data.remainMinutes || 0);
        const next = Math.max(0, cur - minutes);
        const newStatus = next <= 0 ? MEMBERSHIP_STATUS.EXPIRED : (data.status || MEMBERSHIP_STATUS.ACTIVE);

        tx.update(refDoc, {
            remainMinutes: next,
            status: newStatus,
            updatedAt: nowMs(),
        });

        return { remainMinutes: next, status: newStatus };
    });
}

/* 여러 장 보유 시 오래된(createdAt ASC) 것부터 연쇄 차감 */
export async function consumeTimepassByChild(phoneE164, childId, minutes = 0) {
    if (!(minutes > 0)) throw new Error("consumeTimepassByChild: minutes must be > 0");
    await ensureChildExists(phoneE164, childId);

    const colRef = collection(db, "members", phoneE164, "memberships");
    const qy = query(
        colRef,
        where("kind", "==", MEMBERSHIP_KIND.TIMEPASS),
        where("childId", "==", childId),
        where("status", "in", [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.FUTURE]),
        orderBy("createdAt", "asc")
    );
    const snap = await getDocs(qy);
    if (snap.empty) return { consumed: 0, remain: 0, details: [] };

    let remainToConsume = minutes;
    const details = [];

    await runTransaction(db, async (tx) => {
        for (const d of snap.docs) {
            if (remainToConsume <= 0) break;
            const ref = d.ref;
            const curData = (await tx.get(ref)).data() || {};
            let curRemain = Number(curData.remainMinutes || 0);
            const consume = Math.min(curRemain, remainToConsume);
            curRemain -= consume;
            remainToConsume -= consume;

            const newStatus =
                curRemain <= 0 ? MEMBERSHIP_STATUS.EXPIRED : (curData.status || MEMBERSHIP_STATUS.ACTIVE);

            tx.update(ref, {
                remainMinutes: curRemain,
                status: newStatus,
                updatedAt: nowMs(),
            });

            details.push({ mid: d.id, consumed: consume, remainAfter: curRemain, status: newStatus });
        }
    });

    const consumed = minutes - remainToConsume;
    const remain = Math.max(0, remainToConsume);
    return { consumed, remain, details };
}

/* ===== Cashpass(정액권) Consumption ===== */
export async function consumeCashpass(phoneE164, mid, amount = 0) {
    if (!(amount > 0)) throw new Error("consumeCashpass: amount must be > 0");
    const refDoc = doc(db, "members", phoneE164, "memberships", mid);

    return runTransaction(db, async (tx) => {
        const snap = await tx.get(refDoc);
        if (!snap.exists()) throw new Error("consumeCashpass: not found");

        const data = snap.data();
        if (data.kind !== MEMBERSHIP_KIND.CASHPASS) {
            throw new Error("consumeCashpass: only for cashpass");
        }
        const cur = Number(data.remainKRW || 0);
        const next = Math.max(0, cur - amount);
        const newStatus = next <= 0 ? MEMBERSHIP_STATUS.EXPIRED : (data.status || MEMBERSHIP_STATUS.ACTIVE);

        tx.update(refDoc, {
            remainKRW: next,
            status: newStatus,
            updatedAt: nowMs(),
        });

        return { remainKRW: next, status: newStatus };
    });
}

export async function consumeCashpassByChild(phoneE164, childId, amount = 0) {
    if (!(amount > 0)) throw new Error("consumeCashpassByChild: amount must be > 0");
    await ensureChildExists(phoneE164, childId);

    const colRef = collection(db, "members", phoneE164, "memberships");
    const qy = query(
        colRef,
        where("kind", "==", MEMBERSHIP_KIND.CASHPASS),
        where("childId", "==", childId),
        where("status", "in", [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.FUTURE]),
        orderBy("createdAt", "asc")
    );
    const snap = await getDocs(qy);
    if (snap.empty) return { consumed: 0, remain: 0, details: [] };

    let remainToConsume = amount;
    const details = [];

    await runTransaction(db, async (tx) => {
        for (const d of snap.docs) {
            if (remainToConsume <= 0) break;
            const ref = d.ref;
            const curData = (await tx.get(ref)).data() || {};
            let curRemain = Number(curData.remainKRW || 0);
            const consume = Math.min(curRemain, remainToConsume);
            curRemain -= consume;
            remainToConsume -= consume;

            const newStatus =
                curRemain <= 0 ? MEMBERSHIP_STATUS.EXPIRED : (curData.status || MEMBERSHIP_STATUS.ACTIVE);

            tx.update(ref, {
                remainKRW: curRemain,
                status: newStatus,
                updatedAt: nowMs(),
            });

            details.push({ mid: d.id, consumed: consume, remainAfter: curRemain, status: newStatus });
        }
    });

    const consumed = amount - remainToConsume;
    const remain = Math.max(0, remainToConsume);
    return { consumed, remain, details };
}

/* ===== Revoke / Expire Sweep ===== */
export async function revokeMembership(phoneE164, mid) {
    return updateMembershipStatus(phoneE164, mid, MEMBERSHIP_STATUS.REVOKED);
}

/**
 * expireMemberships
 * - 기간형(agitz/family/cashpass with months>0): now > expiresAt → EXPIRED
 * - 비기간형(timepass/cashpass months==0): 잔여 0이면 EXPIRED
 */
export async function expireMemberships(phoneE164) {
    const colRef = collection(db, "members", phoneE164, "memberships");
    const snap = await getDocs(query(colRef, orderBy("createdAt", "desc"), qlimit(300)));
    const now = nowMs();
    const expired = [];

    for (const d of snap.docs) {
        const v = d.data() || {};
        const st = v.status;

        if (v.kind === MEMBERSHIP_KIND.TIMEPASS) {
            const rem = Number(v.remainMinutes || 0);
            if ((st === MEMBERSHIP_STATUS.ACTIVE || st === MEMBERSHIP_STATUS.FUTURE) && rem <= 0) {
                await updateDoc(d.ref, { status: MEMBERSHIP_STATUS.EXPIRED, updatedAt: now });
                expired.push(d.id);
            }
        } else if (v.kind === MEMBERSHIP_KIND.CASHPASS) {
            const hasPeriod = Number(v.months || 0) > 0 && Number(v.expiresAt || 0) > 0;
            if (hasPeriod) {
                if ((st === MEMBERSHIP_STATUS.ACTIVE || st === MEMBERSHIP_STATUS.FUTURE) && now > Number(v.expiresAt)) {
                    await updateDoc(d.ref, { status: MEMBERSHIP_STATUS.EXPIRED, updatedAt: now });
                    expired.push(d.id);
                }
            } else {
                const rem = Number(v.remainKRW || 0);
                if ((st === MEMBERSHIP_STATUS.ACTIVE || st === MEMBERSHIP_STATUS.FUTURE) && rem <= 0) {
                    await updateDoc(d.ref, { status: MEMBERSHIP_STATUS.EXPIRED, updatedAt: now });
                    expired.push(d.id);
                }
            }
        } else {
            // agitz / family
            const exp = Number(v.expiresAt || 0);
            if ((st === MEMBERSHIP_STATUS.ACTIVE || st === MEMBERSHIP_STATUS.FUTURE) && exp && now > exp) {
                await updateDoc(d.ref, { status: MEMBERSHIP_STATUS.EXPIRED, updatedAt: now });
                expired.push(d.id);
            }
        }
    }
    return expired;
}

/* ===== Exports ===== */
export default {
    // create / update
    createMembership,
    updateMembershipStatus,
    extendMembership,
    revokeMembership,

    // consume
    consumeTimepass,
    consumeTimepassByChild,
    consumeCashpass,
    consumeCashpassByChild,

    // list / get / sweep
    listMemberships,
    listMembershipsByChild,
    getActiveAgitzByChild,
    getActiveFamilyByChild,
    expireMemberships,
};
