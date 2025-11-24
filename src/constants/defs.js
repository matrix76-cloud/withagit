/* eslint-disable */
// /src/constants/defs.js
// Withagit — Order / Reservation / Usage constants (SSOT v2025-11-11)
// ✅ 이 파일은 orderService / checkout 컴포넌트 / admin 테이블에서 공통 사용.
// ✅ 멤버십 결제 타입은 MEMBERSHIP_KIND와 1:1 매핑(AGITZ/FAMILY/TIMEPASS/CASHPASS).

/* =========================
 * ORDER (결제/주문)
 * ========================= */

/** 표준 주문 상태 (orderService와 동일) */
export const ORDER_STATUS = Object.freeze({
    PENDING: "PENDING",   // 생성(PG 호출 전/중)
    PAID: "PAID",      // 결제 완료(검증 OK, 멤버십 적용 진행/완료)
    CANCELLED: "CANCELLED", // 사용자가 결제 플로우 취소
    REFUNDED: "REFUNDED",  // 환불 완료
    FAILED: "FAILED",    // 결제/검증 실패
});

/** 표준 주문 타입 (멤버십/정산과 1:1) */
export const ORDER_TYPE = Object.freeze({
    AGITZ: "AGITZ",     // 정규 멤버십 (childId 필수, months>0)
    FAMILY: "FAMILY",    // 패밀리 멤버십 (childId 필수, months>0)
    TIMEPASS: "TIMEPASS",  // 시간권 (childId 필수, minutes>0)
    CASHPASS: "CASHPASS",  // 정액권 (childId 필수, amountKRW>0, months 옵션)
    POINTS: "POINTS",    // 계정 지갑 충전(멤버십 생성 없음)
    PICKUP: "PICKUP",    // 픽업/예약류 결제(옵션, 멤버십 아님)
});

/* ---- 레거시 호환(소문자/오탈자 → 표준 상수 변환) ----
 * - 기존 코드에서 'subscription' → AGITZ, 'family' → FAMILY 등으로 들어올 수 있음
 * - 'canceled' 철자도 허용 → CANCELLED 로 정규화
 */
const LEGACY_TYPE_MAP = {
    timepass: ORDER_TYPE.TIMEPASS,
    subscription: ORDER_TYPE.AGITZ,
    family: ORDER_TYPE.FAMILY,
    pickup: ORDER_TYPE.PICKUP,
    points: ORDER_TYPE.POINTS,
    point: ORDER_TYPE.POINTS, // 과거 오탈자
    cashpass: ORDER_TYPE.CASHPASS,
};

const LEGACY_STATUS_MAP = {
    pending: ORDER_STATUS.PENDING,
    paid: ORDER_STATUS.PAID,
    canceled: ORDER_STATUS.CANCELLED, // 미국식 철자 → 표준(CANCELLED)
    cancelled: ORDER_STATUS.CANCELLED,
    refunded: ORDER_STATUS.REFUNDED,
    failed: ORDER_STATUS.FAILED,
};

/** 주문 타입 정규화(helper) */
export function normalizeOrderType(t) {
    if (!t) return null;
    if (ORDER_TYPE[t]) return ORDER_TYPE[t];
    const k = String(t).toLowerCase();
    return LEGACY_TYPE_MAP[k] || null;
}

/** 주문 상태 정규화(helper) */
export function normalizeOrderStatus(s) {
    if (!s) return null;
    if (ORDER_STATUS[s]) return ORDER_STATUS[s];
    const k = String(s).toLowerCase();
    return LEGACY_STATUS_MAP[k] || null;
}

/** childId 필요 여부 (POINTS/PICKUP 제외) */
export function isChildIdRequired(orderType) {
    const t = normalizeOrderType(orderType);
    return (
        t === ORDER_TYPE.AGITZ ||
        t === ORDER_TYPE.FAMILY ||
        t === ORDER_TYPE.TIMEPASS ||
        t === ORDER_TYPE.CASHPASS
    );
}

/** 기간형 여부 (주문 기준)
 * - AGITZ/FAMILY: months > 0 필요
 * - CASHPASS: months > 0 일 때만 기간형(옵션)
 * - TIMEPASS/POINTS/PICKUP: 기간형 아님
 */
export function isPeriodOrder(orderType, months = 0) {
    const t = normalizeOrderType(orderType);
    if (t === ORDER_TYPE.AGITZ || t === ORDER_TYPE.FAMILY) return Number(months || 0) > 0;
    if (t === ORDER_TYPE.CASHPASS) return Number(months || 0) > 0;
    return false;
}

/* 편의 헬퍼 */
export const isOrderPaid = (st) => normalizeOrderStatus(st) === ORDER_STATUS.PAID;
export const isOrderPending = (st) => normalizeOrderStatus(st) === ORDER_STATUS.PENDING;
export const isOrderCancelled = (st) => normalizeOrderStatus(st) === ORDER_STATUS.CANCELLED;
export const isOrderFailed = (st) => normalizeOrderStatus(st) === ORDER_STATUS.FAILED;
export const isOrderRefunded = (st) => normalizeOrderStatus(st) === ORDER_STATUS.REFUNDED;

/* =========================
 * RESERVATION (예약/픽업 등)
 * ========================= */

export const RESERVATION_STATUS = Object.freeze({
    REQUESTED: "requested",   // 접수됨(검토 대기)
    SCHEDULED: "scheduled",   // 스케줄 배정됨
    CONFIRMED: "confirmed",   // 확정(배차/담당 지정)
    COMPLETED: "completed",   // 서비스 완료
    CANCELED: "canceled",    // 취소 (예약 도메인은 소문자·미국식 유지)
});

export const RESERVATION_QUERY = Object.freeze({
    UPCOMING: [ // 진행/예정
        RESERVATION_STATUS.REQUESTED,
        RESERVATION_STATUS.SCHEDULED,
        RESERVATION_STATUS.CONFIRMED,
    ],
    DONE: [     // 완료(이용내역)
        RESERVATION_STATUS.COMPLETED,
    ],
    CANCELED: [ // 취소
        RESERVATION_STATUS.CANCELED,
    ],
});

/* 편의 헬퍼 */
export const isReservationActive = (st) => RESERVATION_QUERY.UPCOMING.includes(st);
export const isReservationDone = (st) => RESERVATION_QUERY.DONE.includes(st);
export const isReservationCanceled = (st) => st === RESERVATION_STATUS.CANCELED;

/* =========================
 * USAGE (이용 기록)
 * ========================= */
export const USAGE_TYPE = Object.freeze({
    PICKUP: "pickup",
    CARE: "care",
    PROGRAM: "program",
});

/* =========================
 * Labels (UI)
 * ========================= */
export const ORDER_LABEL = {
    [ORDER_TYPE.AGITZ]: "정규 멤버십",
    [ORDER_TYPE.FAMILY]: "패밀리 멤버십",
    [ORDER_TYPE.TIMEPASS]: "시간권",
    [ORDER_TYPE.CASHPASS]: "정액권",
    [ORDER_TYPE.POINTS]: "정액권(포인트) 충전",
    [ORDER_TYPE.PICKUP]: "픽업 결제",
};
