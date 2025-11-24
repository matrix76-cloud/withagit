/* eslint-disable */

/**
 * AuthKit 공용 초기 설정
 * - 각 프로젝트에서 initAuth() 1회 호출
 * - Kakao / Naver / Google endpoint 설정
 * - mode: "auto" | "popup" | "redirect"
 */

let FN_BASE = process.env.REACT_APP_FN_BASE;
if (!FN_BASE) {
    throw new Error(
        "[AuthKit] 환경변수 REACT_APP_FN_BASE가 설정되어 있지 않습니다. Functions base URL은 필수입니다."
    );
}

let CONFIG = {
    mode: "auto",
    endpoints: {
        naver:
            process.env.REACT_APP_AUTH_ENDPOINT_NAVER ||
            `${FN_BASE}/naverAuth`,
        kakao:
            process.env.REACT_APP_AUTH_ENDPOINT_KAKAO ||
            `${FN_BASE}/kakaoAuth`,
    },
    onEvent: () => { },
};

/**
 * 초기 설정 (앱 시작 시 1회)
 * @param {object} options
 * @param {"auto"|"popup"|"redirect"} [options.mode="auto"]
 * @param {object} [options.endpoints]
 * @param {string} [options.endpoints.naver]
 * @param {string} [options.endpoints.kakao]
 * @param {(name:string, payload?:any)=>void} [options.onEvent]
 */
export function initAuth({ mode = "auto", endpoints = {}, onEvent } = {}) {
    CONFIG = {
        ...CONFIG,
        mode,
        endpoints: { ...CONFIG.endpoints, ...endpoints }, // 기본값 → 사용자 override
        onEvent: onEvent || CONFIG.onEvent,
    };
}

/** 현재 AuthKit 환경설정 반환 */
export const getAuthConfig = () => CONFIG;

/**
 * 이벤트 전파 유틸
 * ex) emitAuthEvent("LOGIN_SUCCESS", { provider: "kakao" });
 */
export const emitAuthEvent = (name, payload = {}) => {
    try {
        if (typeof CONFIG.onEvent === "function") {
            CONFIG.onEvent(name, payload);
        }
    } catch (e) {
        console.warn("[AuthKit:emitAuthEvent] error", e);
    }
};
