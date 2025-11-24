/* eslint-disable */
// /src/services/memberService.js
// Withagit — Member Profile & Children CRUD (SSOT: phoneE164)
// ❗ 이 파일은 "프로필/자녀" 전용입니다.
//    멤버십/주문/포인트/시간권/정액권 로직은 절대 넣지 마세요
//    (membershipService.js, orderService.js 등 별도 서비스에서 처리).
// 📅 모든 날짜 필드: millis(number, UTC). serverTimestamp/Timestamp 사용 금지.

import { db, storage } from "./api";
import {
    doc, getDoc, setDoc, updateDoc, deleteDoc,
    collection, getDocs, query, orderBy, limit as qlimit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { listMemberships } from "./membershipService";

/* =========================
 * Utils
 * ========================= */
const nowMs = () => Date.now();

function assertPhone(phoneE164) {
    if (!phoneE164) throw new Error("phoneE164 required");
}

/** YYYY-MM-DD 또는 YYYYMMDD 허용 → YYYY-MM-DD로 정규화 */
function normalizeBirth(birth) {
    const raw = String(birth || "").trim();
    const d = raw.includes("-") ? raw.replace(/\D+/g, "") : raw;
    if (!/^\d{8}$/.test(d)) throw new Error("child.birth must be YYYY-MM-DD or YYYYMMDD");
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

/** childId: c_{이름_YYYYMMDD} (fallback: child_{ts}) */
function makeChildId(child) {
    const ts = nowMs();
    const name = String(child?.name || "").trim();
    const ymd = String(child?.birth || "").replace(/\D+/g, "");
    if (name && /^\d{8}$/.test(ymd)) {
        return `c_${(name + "_" + ymd).toLowerCase().replace(/\s+/g, "_")}`;
    }
    return `child_${ts}`;
}

/** 자녀 필수값 검증 */
function validateChildPayload(child = {}) {
    const name = String(child?.name || "").trim();
    const birth = String(child?.birth || "").trim();
    const school = String(child?.school || "").trim();
    const grade = String(child?.grade || "").trim();
    if (!name) throw new Error("child.name required");
    if (!birth) throw new Error("child.birth required");
    if (!school) throw new Error("child.school required");
    if (!grade) throw new Error("child.grade required");
}

/* =========================
 * Reads
 * ========================= */

/** members/{phone}/profile + consents 요약 조회 */
export async function loadMemberProfile(phoneE164) {
    assertPhone(phoneE164);

    const ref = doc(db, "members", phoneE164);
    const snap = await getDoc(ref);
    const root = snap.exists() ? (snap.data() || {}) : {};
    const prof = root.profile || {};

    return {
        phoneE164,
        // ✅ 평탄화된 프로필 필드
        displayName: typeof prof.displayName === "string" ? prof.displayName : "",
        avatarUrl: typeof prof.avatarUrl === "string" ? prof.avatarUrl : "",
        email: typeof prof.email === "string" ? prof.email : "",
        gender: typeof prof.gender === "string" ? prof.gender : "",
        // 캐시 무력화용
        updatedAt:
            typeof prof.updatedAt === "number"
                ? prof.updatedAt
                : typeof root.updatedAt === "number"
                    ? root.updatedAt
                    : undefined,
        // 동의 요약 (그대로 유지)
        consents: {
            tos: !!(root?.consents && root.consents.tos),
            privacy: !!(root?.consents && root.consents.privacy),
            ecommerce: !!(root?.consents && root.consents.ecommerce),
            marketing: !!(root?.consents && root.consents.marketing),
        },
        createdAt: typeof root.createdAt === "number" ? root.createdAt : undefined,
    };
}




/** members/{phone}/children 목록 (최신 생성 순) */
export async function listChildren(phoneE164, { limit = 100 } = {}) {
    assertPhone(phoneE164);

    const col = collection(db, "members", phoneE164, "children");
    const qy = query(col, orderBy("createdAt", "desc"), qlimit(limit));
    const snap = await getDocs(qy);

    return snap.docs.map((d) => {
        const v = d.data() || {};
        return {
            childId: d.id,
            name: v?.name || "",
            gender: v?.gender || "",
            birth: v?.birth || "",
            avatarUrl: v?.avatarUrl || "",
            school: v?.school || "",
            grade: v?.grade || "",
            classroom: v?.classroom || "",
            contactPhone: v?.contactPhone || "",  
            createdAt: typeof v?.createdAt === "number" ? v.createdAt : undefined,
            updatedAt: typeof v?.updatedAt === "number" ? v.updatedAt : undefined,
        };
    });
}

/**
 * loadMemberSnapshot
 * - 프로필 + 자녀 목록만 반환 (멤버십/주문 필드 없음)
 * - 기존 호출부 호환을 위해 shape 유지: { profile, children }
 */

export async function loadMemberSnapshot(phoneE164, opts = {}) {
    if (!phoneE164) return { profile: {}, children: [], memberships: [] };

    const source = opts.source === "server" ? "server" : "default";

    const [profile, children, memberships] = await Promise.all([
        loadMemberProfile(phoneE164, { source }),
        listChildren(phoneE164, { limit: 100, source }),
        listMemberships(phoneE164, 100, { source }),
    ]);

    return {
        profile: profile ? { ...profile } : {},         // 평탄화된 프로필 그대로
        children: Array.isArray(children) ? children.slice() : [],
        memberships: Array.isArray(memberships) ? memberships.slice() : [],
    };
}


/* =========================
 * Writes: Profile
 * ========================= */

/**
 * saveProfile
 * - 전달된 키만 업데이트 (덮어쓰기 방지)
 * - createdAt/updatedAt: millis
 */
export async function saveProfile(phoneE164, patch = {}) {
    assertPhone(phoneE164);

    const memRef = doc(db, "members", phoneE164);
    const updates = {};

    const hasProfile =
        "displayName" in patch || "avatarUrl" in patch || "email" in patch || "gender" in patch;
    
    const hasConsents = patch?.consents && typeof patch.consents === "object";

    if (hasProfile) {
        if ("displayName" in patch) updates["profile.displayName"] = patch.displayName || "";
        if ("avatarUrl" in patch) updates["profile.avatarUrl"] = patch.avatarUrl || "";
        if ("email" in patch) updates["profile.email"] = patch.email || "";
        if ("gender" in patch) updates["profile.gender"] = (patch.gender || "").toString();
    }
    if (hasConsents) {
        const c = patch.consents || {};
        if ("tos" in c) updates["consents.tos"] = !!c.tos;
        if ("privacy" in c) updates["consents.privacy"] = !!c.privacy;
        if ("ecommerce" in c) updates["consents.ecommerce"] = !!c.ecommerce;
        if ("marketing" in c) updates["consents.marketing"] = !!c.marketing;
    }

    if (!Object.keys(updates).length) return;

    const ts = nowMs();
    const snap = await getDoc(memRef);
    if (!snap.exists()) {
        await setDoc(memRef, { createdAt: ts, updatedAt: ts }, { merge: true });
    }
    updates["updatedAt"] = ts;
    await updateDoc(memRef, updates);
}

/** 파일 업로드 후 profile.avatarUrl 갱신 */
export async function setProfileAvatarFromFile(phoneE164, file) {
    const storage = getStorage();
    const r = ref(storage, `members/${encodeURIComponent(phoneE164)}/profile_${Date.now()}.jpg`);
    await uploadBytes(r, file);
    const path = r.fullPath;                           // eg. "members/%2B8210.../profile_173..."
    await setDoc(doc(db, "members", phoneE164), {
        profile: { avatarUrl: path, updatedAt: Date.now() }
    }, { merge: true });


    return path;                                       // 호출측도 경로로 받게
}
/** dataURL → Blob → File → 업로드 */
export async function setProfileAvatarFromDataUrl(phoneE164, dataUrl) {
    assertPhone(phoneE164);
    if (!dataUrl) throw new Error("dataUrl required");

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `avatar_${nowMs()}.jpg`, { type: blob.type || "image/jpeg" });
    return setProfileAvatarFromFile(phoneE164, file);
}

/* =========================
 * Writes: Children
 * ========================= */

/**
 * upsertChild
 * - 필수: name/birth/school/grade
 * - birth 정규화: YYYY-MM-DD
 * - createdAt(신규만), updatedAt(ms)
 */
export async function upsertChild(phoneE164, child) {
    assertPhone(phoneE164);
    validateChildPayload(child);

    const childId = child.childId || child.id || makeChildId(child);
    const refDoc = doc(db, "members", phoneE164, "children", childId);

    const birthNorm = normalizeBirth(child.birth);
    const snap = await getDoc(refDoc);
    const ts = nowMs();
    const base = snap.exists() ? {} : { createdAt: ts };

    await setDoc(
        refDoc,
        {
            ...base,
            name: String(child.name || "").trim(),
            gender: String(child.gender || ""),
            birth: birthNorm,
            avatarUrl: child.photo || child.avatarUrl || "",
            school: String(child.school || "").trim(),
            grade: String(child.grade || "").trim(),
            classroom: String(child.classroom || "").trim(),
            contactPhone: String(child.contactPhone || "").trim(), // ← 추가
            updatedAt: ts,
        },
        { merge: true }
    );

    return { childId };
}

/** 자녀 삭제 (참조 무결성은 멤버십/주문 서비스에서 가드) */
export async function deleteChild(phoneE164, childId) {
    assertPhone(phoneE164);
    if (!childId) throw new Error("childId required");
    await deleteDoc(doc(db, "members", phoneE164, "children", childId));
}

/* =========================
 * Etc
 * ========================= */

/** 회원 문서 존재 여부 */
export async function isMemberRegistered(phoneE164) {
    if (!phoneE164) return false;
    try {
        const refDoc = doc(db, "members", phoneE164);
        const snap = await getDoc(refDoc);
        return snap.exists();
    } catch {
        return false;
    }
}

/**
 * upsertMemberByPhone
 * - 최소 스켈레톤 생성 + patch 병합
 * - createdAt/updatedAt: millis
 */
export async function upsertMemberByPhone(phoneE164, patch = {}) {
    assertPhone(phoneE164);

    const refDoc = doc(db, "members", phoneE164);
    const snap = await getDoc(refDoc);
    const ts = nowMs();

    const skeleton = {
        phoneE164,
        profile: { displayName: "", avatarUrl: "", email: "" },
        createdAt: ts,
        updatedAt: ts,
    };

    const payload = snap.exists()
        ? { updatedAt: ts, ...patch }
        : { ...skeleton, ...patch, updatedAt: ts };

    await setDoc(refDoc, payload, { merge: true });
}

export default {
    loadMemberProfile,
    listChildren,
    loadMemberSnapshot,
    saveProfile,
    setProfileAvatarFromFile,
    setProfileAvatarFromDataUrl,
    upsertChild,
    deleteChild,
    isMemberRegistered,
    upsertMemberByPhone,
};
