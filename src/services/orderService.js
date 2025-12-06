/* eslint-disable */
// /src/services/orderService.js
// Withagit — Order/Payment Service (SSOT v5 + cashpass)
// - Path: members/{phoneE164}/orders/{orderId}
// - Fields: type, amountKRW, status(PENDING|PAID|FAILED|CANCELLED),
//           product, childId?, months?, minutes?, provider, txnId,
//           createdAt/updatedAt, appliedAt?, membershipMid?, applying?, applyError?
// - Flow: createOrderDraft -> (PG 결제) -> markOrderPaid(웹훅/콜백) -> createMembership (멱등)

import {
    doc, setDoc, getDoc, updateDoc,
    collection, getDocs, query, where, orderBy, limit as qlimit, runTransaction
} from "firebase/firestore";
import { db } from "./api";
import { MEMBERSHIP_KIND, MEMBERSHIP_STATUS } from "../constants/membershipDefine";
import { ORDER_STATUS, ORDER_TYPE } from "../constants/defs";
import * as membershipService from "./membershipService";

/* =========================
 * Utils
 * ========================= */
/* =========================
 * Utils
 * ========================= */
const nowMs = () => Date.now();
const randomId = (len = 6) =>
    Array.from({ length: len }, () => Math.floor(Math.random() * 36).toString(36)).join("");
const makeOrderId = (type) => `${String(type || "ord")}_${Date.now()}_${randomId(4)}`;

function assertPhone(phoneE164) {
    if (!phoneE164) throw new Error("phoneE164 required");
}
function assertOrderType(t) {
    const ok = [
        ORDER_TYPE.AGITZ,
        ORDER_TYPE.FAMILY,
        ORDER_TYPE.TIMEPASS,
        ORDER_TYPE.CASHPASS, // 정액권
        ORDER_TYPE.POINTS,   // 지갑 충전형
        ORDER_TYPE.PROGRAM,  // 프로그램 예약
        ORDER_TYPE.PICKUP,   // ★ 픽업 예약 (새로 추가)
    ].includes(t);
    if (!ok) throw new Error(`invalid ORDER_TYPE: ${t}`);
}
function assertAmountKRW(v) {
    const n = Number(v || 0);
    if (!(n > 0)) throw new Error("amountKRW must be > 0");
}


/* =========================
 * Public API
 * ========================= */

/**
 * createOrderDraft
 * - 결제 전 주문 초안 생성 (상태: PENDING)
 * - 클라/PG로 전달할 주문 식별자(orderId) 반환
 *
 * payload: {
 *   type: ORDER_TYPE,                // 필수
 *   childId?: string,                // AGITZ/FAMILY/TIMEPASS/CASHPASS = child-scoped → 필수
 *   months?: number,                 // AGITZ/FAMILY(+CASHPASS 기간형)
 *   minutes?: number,                // TIMEPASS
 *   amountKRW: number,               // 결제 금액
 *   product?: { id, name, variant? },// 표시용
 *   provider?: { name, sessionId? }  // PG 표시/트래킹
 * }
 */
export async function createOrderDraft(phoneE164, payload = {}) {
    assertPhone(phoneE164);

    console.group("[orderService] createOrderDraft");
    console.log("phoneE164:", phoneE164);
    console.log("payload.type:", payload?.type);
    console.log("payload.meta?.kind:", payload?.meta?.kind);
    console.log("payload:", payload);
    console.groupEnd();

    const {
        type,
        childId = null,
        months = 0,
        minutes = 0,
        amountKRW,
        product = null,
        provider = null,
        meta = null,   // 🔹 픽업용 메타( pick ups 등 )
        buyer = null,  // 🔹 구매자 정보(이메일/이름 등)
    } = payload;

    assertOrderType(type);
    assertAmountKRW(amountKRW);

    // ✅ 스코프/필수값 검증
    if ([ORDER_TYPE.AGITZ, ORDER_TYPE.FAMILY, ORDER_TYPE.TIMEPASS, ORDER_TYPE.CASHPASS].includes(type)) {
        if (!childId) throw new Error(`childId required for ${type}`);
    }

    if ([ORDER_TYPE.AGITZ, ORDER_TYPE.FAMILY].includes(type)) {
        if (!(Number(months || 0) > 0)) throw new Error("months must be > 0 for period memberships");
    }
    if (type === ORDER_TYPE.TIMEPASS) {
        if (!(Number(minutes || 0) > 0)) throw new Error("minutes must be > 0 for timepass");
    }
    // CASHPASS는 금액권이므로 months=0(무기한)도 허용.
    // PROGRAM/PICKUP 타입은 childId/months/minutes 제약 없음 (예약 메타는 meta.*에 저장).

    const orderId = makeOrderId(type);
    const createdAt = nowMs();

    const orderDoc = doc(db, "members", phoneE164, "orders", orderId);
    await setDoc(orderDoc, {
        type,                        // ORDER_TYPE.*
        amountKRW: Number(amountKRW),
        status: ORDER_STATUS.PENDING,
        product: product ? { ...product } : null,
        childId: childId || null,    // POINTS/PROGRAM/PICKUP 은 null이어도 됨
        months: Number(months || 0),
        minutes: Number(minutes || 0),
        provider: provider ? { ...provider } : null,
        buyer: buyer ? { ...buyer } : null,   // 🔹 신규: 구매자 정보 저장
        meta: meta ? { ...meta } : null,      // 🔹 신규: 픽업/프로그램 등 주문 메타 저장
        txnId: null,                 // PG 고유 거래 ID (결제 후 세팅)
        createdAt,
        updatedAt: createdAt,
        applying: false,             // 멤버십 적용 중 여부(멱등 보조)
        appliedAt: null,             // 멤버십 적용 완료 시각
        membershipMid: null,         // 적용된 멤버십 mid
        applyError: null,            // 마지막 적용 오류 메시지
    });

    return { orderId };
}


/** getOrder */
export async function getOrder(phoneE164, orderId) {
    assertPhone(phoneE164);
    if (!orderId) throw new Error("orderId required");
    const ref = doc(db, "members", phoneE164, "orders", orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { orderId, ...(snap.data() || {}) };
}


export async function listMemberOrders(
    phoneE164,
    { limit = 100 } = {}
) {
    if (!phoneE164) return [];
    const colRef = collection(db, "members", phoneE164, "orders");
    // createdAt 기준 최신순 정렬. createdAt이 없으면 orderId의 타임스탬프를 보조로 사용.
    const q = query(colRef, orderBy("createdAt", "desc"), qlimit(limit));
    const snap = await getDocs(q).catch(() => null);
    const docs = snap ? snap.docs : [];

    return docs.map((doc) => {
        const v = doc.data() || {};
        const id = doc.id;
        const ts =
            (v.created && typeof v.created.toMillis === "function" ? v.created.toMillis() : undefined) ??
            (v.createdAt && typeof v.createdAt.toMillis === "function" ? v.createdAt.toMillis() : undefined) ??
            (typeof v.createdAt === "number" ? v.createdAt : undefined) ??
            // fallback: parse epoch part if orderId looked like AGITZ_169xxx_abc
            (/\d{6,}/.test(id) ? Number((id.match(/\d{6,}/) || [])[0]) : undefined);

        const rawType = String(v.type || "").toUpperCase();          // e.g. 'AGITZ' | 'FAMILY' | 'TIMEPASS' | 'CASHPASS'
        let type = rawType.toLowerCase();                             // normalize to UI tokens
        let kind = String(v.kind || v?.product?.name || "").toLowerCase();

        if (rawType === "AGITZ" || rawType === "FAMILY" || rawType === "MEMBERSHIP") {
            type = "membership";
            if (!["agitz", "family"].includes(kind)) {
                // if product has {name:"정규 멤버십"} keep as name, else default
                if (!kind) kind = rawType === "AGITZ" ? "agitz" : rawType === "FAMILY" ? "family" : "membership";
            }
        } else if (rawType === "TIME") {
            type = "timepass";
        } else if (rawType === "CASHPASS") {
            type = "points";
            if (!/포인트/i.test(kind)) kind = "cashpass";
        } else if (rawType === "PROGRAM") {
            type = "program";
        }

        const productName =
            v?.product?.name ??
            (type === "timepass"
                ? "시간권"
                : type === "points"
                    ? "정액권(포인트)"
                    : type === "program"
                        ? "프로그램 예약"
                        : (kind ? `${kind} 멤버십` : "멤버십"));

        return {
            id,
            createdAt: ts,                        // number | undefined
            type,                                 // 'membership' | 'timepass' | 'points' | 'program' | 'etc'
            kind: v.kind || (type === "membership" ? (rawType || "membership").toLowerCase() : undefined),
            productName,
            minutes: v?.minutes ?? 0,
            amountKRW: Number(v?.amountKRW ?? v?.amount ?? 0),
            status: v?.status || "paid",
            childId: v?.childId || "",
        };
    });
}


/** markOrderFailed — 결제 실패/거절/취소 */
export async function markOrderFailed(phoneE164, orderId, { reason, provider } = {}) {
    assertPhone(phoneE164);
    if (!orderId) throw new Error("orderId required");
    const ref = doc(db, "members", phoneE164, "orders", orderId);

    await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("order not found");
        const v = snap.data() || {};
        if (v.status !== ORDER_STATUS.PENDING) return; // 이미 처리됨

        tx.update(ref, {
            status: ORDER_STATUS.FAILED,
            updatedAt: nowMs(),
            failReason: reason || null,
            provider: provider ? { ...(v.provider || {}), ...provider, updatedAt: nowMs() } : (v.provider || null),
        });
    });

    return { ok: true };
}

/** cancelOrder — 결제 전 자발적 취소 */
export async function cancelOrder(phoneE164, orderId, { reason } = {}) {
    assertPhone(phoneE164);
    if (!orderId) throw new Error("orderId required");
    const ref = doc(db, "members", phoneE164, "orders", orderId);

    await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("order not found");
        const v = snap.data() || {};
        if (v.status !== ORDER_STATUS.PENDING) return;

        tx.update(ref, {
            status: ORDER_STATUS.CANCELLED,
            updatedAt: nowMs(),
            cancelReason: reason || null,
        });
    });

    return { ok: true };
}

/* =========================
 * Provider helpers (옵셔널)
 * ========================= */

/** buildCheckoutMetadata — PG 체크아웃 메타 */
export function buildCheckoutMetadata({ phoneE164, orderId, type, amountKRW, product }) {
    return {
        orderName: product?.name || String(type),
        orderId,
        amount: Number(amountKRW),
        customerKey: phoneE164, // PG 고객 식별자
        metadata: {
            phoneE164,
            type,
            productId: product?.id || null,
            variant: product?.variant || null,
        },
    };
}

export async function markOrderPaid(args = {}) {
    const { phoneE164, orderId, provider } = args;
    assertPhone(phoneE164);
    if (!orderId) throw new Error("orderId required");

    const orderRef = doc(db, "members", phoneE164, "orders", orderId);

    // 1) 상태 전이(PENDING -> PAID) + applying true (멱등 가드)
    const txResult = await runTransaction(db, async (tx) => {
        const snap = await tx.get(orderRef);
        if (!snap.exists()) throw new Error("order not found");
        const v = snap.data() || {};

        if (v.status === ORDER_STATUS.PAID && v.appliedAt) {
            return { alreadyApplied: true, order: { ...v, orderId } };
        }
        if (v.status === ORDER_STATUS.PAID && v.applying) {
            return { applying: true, order: { ...v, orderId } };
        }
        if (v.status !== ORDER_STATUS.PENDING) {
            throw new Error(`invalid order status transition: ${v.status} -> PAID`);
        }

        const updatedAt = nowMs();
        tx.update(orderRef, {
            status: ORDER_STATUS.PAID,
            applying: true,
            updatedAt,
            provider: provider ? { ...(v.provider || {}), ...provider, updatedAt } : (v.provider || null),
            txnId: provider?.txnId || v.txnId || null,
            applyError: null,
        });

        return { alreadyApplied: false, applying: true, order: { ...v, orderId, status: ORDER_STATUS.PAID } };
    });

    if (txResult?.alreadyApplied) {
        return { ok: true, ...txResult, membershipMid: (await getOrder(phoneE164, orderId))?.membershipMid || null };
    }

    // 2) 멤버십 적용 (주문 필드 → membershipService.createMembership)
    let createdMembership = null;
    let applyError = null;

    try {
        const current = await getOrder(phoneE164, orderId);
        if (!current) throw new Error("order disappeared");

        if (current.appliedAt && current.membershipMid) {
            createdMembership = { mid: current.membershipMid };
        } else {
            const { type, childId, months, minutes, amountKRW } = current;

            // 주문 타입 → 멤버십 kind 매핑
            let kind = null;
            if (type === ORDER_TYPE.AGITZ) kind = MEMBERSHIP_KIND.AGITZ;
            else if (type === ORDER_TYPE.FAMILY) kind = MEMBERSHIP_KIND.FAMILY;
            else if (type === ORDER_TYPE.TIMEPASS) kind = MEMBERSHIP_KIND.TIMEPASS;
            else if (type === ORDER_TYPE.CASHPASS) kind = MEMBERSHIP_KIND.CASHPASS;
            else if (type === ORDER_TYPE.CASHPASS || type === ORDER_TYPE.POINTS) {
                kind = MEMBERSHIP_KIND.CASHPASS;
            }
            // PROGRAM 타입은 kind=null → 멤버십 생성 스킵

            // ✅ 서버 보루 가드: FAMILY는 계정에 active agitz가 있어야 함
            if (kind === MEMBERSHIP_KIND.FAMILY) {
                const qAg = query(
                    collection(db, "members", phoneE164, "memberships"),
                    where("kind", "==", MEMBERSHIP_KIND.AGITZ),
                    where("status", "==", MEMBERSHIP_STATUS.ACTIVE),
                    qlimit(1)
                );
                const agSnap = await getDocs(qAg);
                if (agSnap.empty) throw new Error("FAMILY requires an active AGITZ membership.");
            }

            if (kind === MEMBERSHIP_KIND.FAMILY) {
                // ✅ 다자녀 선택 지원: meta.selectedChildIds 우선
                const ids = Array.isArray(current?.meta?.selectedChildIds) ? current.meta.selectedChildIds : [];
                if (!ids.length && !childId) throw new Error("FAMILY requires selectedChildIds");

                const base = Number(current?.meta?.pricing?.base ?? 50915);
                const disc = Number(current?.meta?.pricing?.discount ?? 0.15);
                const per2 = Math.round(base * (1 - disc));
                const monthsN = Number(months || 1) || 1;

                const targets = ids.length ? ids : [childId];

                const mids = [];
                for (let i = 0; i < targets.length; i++) {
                    const cid = targets[i];
                    const unitPrice = (i === 0) ? base : per2;
                    const mres = await membershipService.createMembership(phoneE164, {
                        kind: MEMBERSHIP_KIND.FAMILY,
                        childId: cid,
                        months: monthsN,
                        amountKRW: unitPrice,
                        orderId,
                    });
                    mids.push(mres.mid);
                }
                createdMembership = { mid: mids[0], mids };
            } else if (kind === MEMBERSHIP_KIND.AGITZ) {
                const cid = childId || current?.meta?.selectedChildIds?.[0];
                const m = Math.max(1, Number(months || 1));
                if (!cid) throw new Error("AGITZ requires childId");

                const res = await membershipService.createMembership(phoneE164, {
                    kind: MEMBERSHIP_KIND.AGITZ,
                    childId: cid,
                    months: m,
                    amountKRW: Number(amountKRW || 0),
                    orderId,
                });
                createdMembership = res;

            } else if (kind === MEMBERSHIP_KIND.TIMEPASS) {
                const cid = childId || current?.meta?.selectedChildIds?.[0];
                const mins = Number(minutes || 0);
                if (!cid) throw new Error("TIMEPASS requires childId");
                if (!(mins > 0)) throw new Error("TIMEPASS requires minutes>0");

                const res = await membershipService.createMembership(phoneE164, {
                    kind: MEMBERSHIP_KIND.TIMEPASS,
                    childId: cid,
                    minutes: mins,
                    amountKRW: Number(amountKRW || 0),
                    orderId,
                });
                createdMembership = res;
            } else if (kind === MEMBERSHIP_KIND.CASHPASS) {
                const expiresAt = current?.meta?.expiresAt ?? (Date.now() + 365 * 24 * 60 * 60 * 1000);
                const amt = Number(amountKRW || 0);
                const res = await membershipService.createMembership(phoneE164, {
                    kind: MEMBERSHIP_KIND.CASHPASS,
                    childId,
                    months: 0,
                    minutes: 0,
                    amountKRW: amt,
                    remainKRW: amt,
                    expiresAt,
                    orderId,
                });
                createdMembership = res;
            }
            // kind가 null(PROGRAM 등)인 경우에는 멤버십 생성 없이 통과
        }
    } catch (e) {
        applyError = e;
    }

    const finalNow = nowMs();

    // 3) 주문 문서에 적용 결과 반영
    if (applyError) {
        await updateDoc(orderRef, {
            applying: false,
            updatedAt: finalNow,
            applyError: String(applyError?.message || applyError || "apply failed"),
        });
        throw applyError;
    } else {
        await updateDoc(orderRef, {
            applying: false,
            appliedAt: finalNow,
            updatedAt: finalNow,
            membershipMid: createdMembership?.mid || null,
            membershipMids: createdMembership?.mids || null,
            applyError: null,
        });
    }

    return {
        ok: true,
        orderId,
        membershipMid: createdMembership?.mid || null,
        membershipMids: createdMembership?.mids || null,
    };
}

// PROGRAM 타입 주문(프로그램 예약)만 조회
export async function listProgramOrders(
    phoneE164,
    { limit = 50 } = {}
) {
    assertPhone(phoneE164);

    const colRef = collection(db, "members", phoneE164, "orders");

    // type === PROGRAM 이고 createdAt 최신순
    const q = query(
        colRef,
        where("type", "==", ORDER_TYPE.PROGRAM),
        orderBy("createdAt", "desc"),
        qlimit(limit)
    );

    const snap = await getDocs(q).catch(() => null);
    if (!snap) return [];

    return snap.docs.map((docSnap) => {
        const v = docSnap.data() || {};
        const id = docSnap.id;

        // createdAt 은 number 또는 Timestamp 인 경우 둘 다 대응
        const createdAt =
            (v.createdAt && typeof v.createdAt.toMillis === "function"
                ? v.createdAt.toMillis()
                : undefined) ??
            (typeof v.createdAt === "number" ? v.createdAt : undefined) ??
            undefined;

        const bookings = Array.isArray(v?.meta?.bookings)
            ? v.meta.bookings
            : [];

        return {
            id,
            status: v.status || ORDER_STATUS.PAID,
            amountKRW: Number(v.amountKRW || 0),
            createdAt,
            bookings,
        };
    });
}



export default {
    createOrderDraft,
    getOrder,
    listMemberOrders,
    markOrderPaid,
    markOrderFailed,
    cancelOrder,
    buildCheckoutMetadata,
    listProgramOrders
};
