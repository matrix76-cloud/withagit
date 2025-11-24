/* eslint-disable */

// 멤버십 종류(kind) — 전부 자녀 단위(child-scoped)
export const MEMBERSHIP_KIND = Object.freeze({
    AGITZ: "agitz",       // 정규 멤버십 (기간형)
    FAMILY: "family",     // 패밀리 멤버십 (기간형, 할인형)
    TIMEPASS: "timepass", // 시간권 (분 잔여)
    CASHPASS: "cashpass", // 정액권 (금액 잔여)
});

// 멤버십 상태(status)
export const MEMBERSHIP_STATUS = Object.freeze({
    ACTIVE: "active",     // 이용 중
    EXPIRED: "expired",   // 만료됨
    REVOKED: "revoked",   // 해지됨(관리자)
    PENDING: "pending",   // 결제 중/대기
    FUTURE: "future",     // 시작 전(예약)
});

// 멤버십 이름(화면 표기용)
export const MEMBERSHIP_LABEL = {
    [MEMBERSHIP_KIND.AGITZ]: "정규 멤버십",
    [MEMBERSHIP_KIND.FAMILY]: "패밀리 멤버십",
    [MEMBERSHIP_KIND.TIMEPASS]: "시간권",
    [MEMBERSHIP_KIND.CASHPASS]: "정액권",
};

// 상태 색상(UI 통일용)
export const MEMBERSHIP_COLOR = {
    [MEMBERSHIP_STATUS.ACTIVE]: "#16A34A",  // 초록
    [MEMBERSHIP_STATUS.EXPIRED]: "#9CA3AF", // 회색
    [MEMBERSHIP_STATUS.REVOKED]: "#DC2626", // 빨강
    [MEMBERSHIP_STATUS.PENDING]: "#F97316", // 주황
    [MEMBERSHIP_STATUS.FUTURE]: "#2563EB",  // 파랑
};

// 상태 라벨(한글)
export const MEMBERSHIP_STATUS_LABEL = {
    [MEMBERSHIP_STATUS.ACTIVE]: "이용 중",
    [MEMBERSHIP_STATUS.EXPIRED]: "만료됨",
    [MEMBERSHIP_STATUS.REVOKED]: "해지됨",
    [MEMBERSHIP_STATUS.PENDING]: "결제 대기",
    [MEMBERSHIP_STATUS.FUTURE]: "시작 예정",
};

/* =========================
 * Helpers (SSOT)
 * ========================= */

// 전 종류 child-scoped
export const CHILD_SCOPED_KINDS = new Set([
    MEMBERSHIP_KIND.AGITZ,
    MEMBERSHIP_KIND.FAMILY,
    MEMBERSHIP_KIND.TIMEPASS,
    MEMBERSHIP_KIND.CASHPASS,
]);

/** 주어진 kind가 child-scoped 인지 여부 */
export function isChildScoped(kind) {
    return CHILD_SCOPED_KINDS.has(kind);
}

/**
 * 기간형 판단:
 * - agitz / family : 항상 기간형 (months >= 1 전제)
 * - cashpass       : months > 0 일 때만 기간형으로 취급(옵션)
 * - timepass       : 기간형 아님
 */
export function isPeriodKind(kind, months = 0) {
    if (kind === MEMBERSHIP_KIND.AGITZ || kind === MEMBERSHIP_KIND.FAMILY) return true;
    if (kind === MEMBERSHIP_KIND.CASHPASS) return Number(months || 0) > 0;
    return false; // timepass
}

// Enum export (자동완성용)
export const MEMBERSHIP_ENUM = {
    KIND: MEMBERSHIP_KIND,
    STATUS: MEMBERSHIP_STATUS,
};

export default {
    MEMBERSHIP_KIND,
    MEMBERSHIP_STATUS,
    MEMBERSHIP_LABEL,
    MEMBERSHIP_STATUS_LABEL,
    MEMBERSHIP_COLOR,
    CHILD_SCOPED_KINDS,
    isChildScoped,
    isPeriodKind,
    MEMBERSHIP_ENUM,
};




// 타입별 기본 색상 (배지/아이콘/차트용)
export const MEMBERSHIP_KIND_COLOR = {
    agitz: { base: "#1D4ED8", light: "#EEF2FF", border: "#C7D2FE", text: "#1D4ED8" }, // 인디고
    family: { base: "#7C3AED", light: "#F5F3FF", border: "#DDD6FE", text: "#7C3AED" }, // 보라
    timepass: { base: "#059669", light: "#ECFDF5", border: "#A7F3D0", text: "#047857" }, // 초록
    cashpass: { base: "#EA580C", light: "#FFF7ED", border: "#FED7AA", text: "#C2410C" }, // 주황
};

// (선택) 어두운 배경용 대비 색
export const MEMBERSHIP_KIND_COLOR_ON_DARK = {
    agitz: { base: "#93C5FD", text: "#DBEAFE" },
    family: { base: "#C4B5FD", text: "#EDE9FE" },
    timepass: { base: "#6EE7B7", text: "#D1FAE5" },
    cashpass: { base: "#FDBA74", text: "#FFEDD5" },
};

// 배지 스타일 프리셋
export const MEMBERSHIP_BADGE_STYLE = {
    agitz: { bg: MEMBERSHIP_KIND_COLOR.agitz.light, color: MEMBERSHIP_KIND_COLOR.agitz.text, border: MEMBERSHIP_KIND_COLOR.agitz.border },
    family: { bg: MEMBERSHIP_KIND_COLOR.family.light, color: MEMBERSHIP_KIND_COLOR.family.text, border: MEMBERSHIP_KIND_COLOR.family.border },
    timepass: { bg: MEMBERSHIP_KIND_COLOR.timepass.light, color: MEMBERSHIP_KIND_COLOR.timepass.text, border: MEMBERSHIP_KIND_COLOR.timepass.border },
    cashpass: { bg: MEMBERSHIP_KIND_COLOR.cashpass.light, color: MEMBERSHIP_KIND_COLOR.cashpass.text, border: MEMBERSHIP_KIND_COLOR.cashpass.border },
};

// 헬퍼: kind → 색상 세트 반환
export function getKindColors(kind, { dark = false } = {}) {
    const k = String(kind || "").toLowerCase();
    if (dark) return (MEMBERSHIP_KIND_COLOR_ON_DARK[k] || MEMBERSHIP_KIND_COLOR_ON_DARK.agitz);
    return (MEMBERSHIP_KIND_COLOR[k] || MEMBERSHIP_KIND_COLOR.agitz);
}

// 헬퍼: 배지 인라인 스타일
export function getKindBadgeStyle(kind) {
    const k = String(kind || "").toLowerCase();
    return MEMBERSHIP_BADGE_STYLE[k] || MEMBERSHIP_BADGE_STYLE.agitz;
}
