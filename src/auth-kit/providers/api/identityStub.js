/* eslint-disable */

// PASS 시작(실제에선 redirectUrl 반환)


/* eslint-disable */
// PASS 본인확인 "시작" API 스텁
// - 프런트 단독 테스트용 (실서버 엔드포인트 없으면 로컬 스텁으로 작동)
// - REACT_APP_SMS_ENDPOINT 가 설정되면 실제 서버로 POST 시도 후, 실패 시 스텁으로 폴백

const REAL_ENDPOINT = process.env.REACT_APP_SMS_ENDPOINT || ""; // 예: https://api.example.com/pass/start
const MIN_DELAY_MS = 150; // UX용 미니멈 딜레이

/** 간단 sleep */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** 세션 단위 rate-limit (같은 탭에서 10초 이내 중복호출 방지) */
const RL_KEY = "pass_start_last_ts";
const RL_WINDOW_MS = 10_000;

/**
 * PASS 본인확인 시작
 * @param {{ returnUrl?: string }} params
 * @returns {Promise<{ok: boolean, requestId: string, via: "real"|"stub", returnUrl?: string }>}
 */
export async function startPassVerification(params = {}) {
    const startedAt = Date.now();

    // 세션 rate-limit(선택)
    try {
        const lastTs = Number(sessionStorage.getItem(RL_KEY) || 0);
        if (lastTs && startedAt - lastTs < RL_WINDOW_MS) {
            // 너무 빠른 중복 요청은 UX상 무시
            await delay(MIN_DELAY_MS);
            return {
                ok: true,
                requestId: `stub-${startedAt}`,
                via: "stub",
                returnUrl: params?.returnUrl || "",
                note: "rate_limited_same_session",
            };
        }
    } catch { }

    // 실제 엔드포인트가 지정되어 있으면 먼저 시도
    if (REAL_ENDPOINT) {
        try {
            const res = await fetch(REAL_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    returnUrl: params?.returnUrl || "",
                    // 필요한 추가 파라미터가 생기면 여기서 함께 전달
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok && json) {
                try { sessionStorage.setItem(RL_KEY, String(startedAt)); } catch { }
                // 서버가 requestId를 주면 그대로, 없으면 생성
                const requestId = json.requestId || `real-${startedAt}`;
                const payload = { ok: true, requestId, via: "real", ...json };
                const spent = Date.now() - startedAt;
                if (spent < MIN_DELAY_MS) await delay(MIN_DELAY_MS - spent);
                return payload;
            }
            // 서버 응답이 비정상이면 스텁 폴백
            console.warn("[identityStub] real endpoint responded not-ok; fallback to stub:", json);
        } catch (e) {
            console.warn("[identityStub] real endpoint failed; fallback to stub:", e);
            // 네트워크/서버 에러 시 스텁 폴백
        }
    }

    // ---- 로컬 스텁 경로 ----
    try { sessionStorage.setItem(RL_KEY, String(startedAt)); } catch { }
    const payload = {
        ok: true,
        requestId: `stub-${startedAt}`,
        via: "stub",
        returnUrl: params?.returnUrl || "",
    };
    const spent = Date.now() - startedAt;
    if (spent < MIN_DELAY_MS) await delay(MIN_DELAY_MS - spent);
    return payload;
}

/**
 * (옵션) PASS 검증 스텁 — 지금은 사용 안 하지만, 후에 서버 검증 도입 시 교체하기 쉽게 미리 제공
 * @param {{ requestId: string, code: string }} params
 * @returns {Promise<{ok: boolean, via: "real"|"stub"}>}
 */
export async function verifyPassCode(params = {}) {
    // 실제 엔드포인트가 있으면 활용 (예: REACT_APP_PASS_VERIFY_ENDPOINT)
    const VERIFY_ENDPOINT = process.env.REACT_APP_PASS_VERIFY_ENDPOINT || "";
    if (VERIFY_ENDPOINT) {
        try {
            const res = await fetch(VERIFY_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params || {}),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok && json?.ok) return { ok: true, via: "real", ...json };
        } catch (e) {
            console.warn("[identityStub] verify real endpoint failed; fallback to stub:", e);
        }
    }
    // 현재는 프런트에서만 코드 비교하므로, 스텁은 항상 ok로 반환
    return { ok: true, via: "stub" };
}



// 알림톡 OTP 발송(실제에선 발송 sid 반환)
export async function sendAlimtalkOtp({ phoneE164 }) {
    console.log("[stub] sendAlimtalkOtp →", phoneE164);
    return { ok: true, sid: crypto.randomUUID() };
}

// 알림톡 OTP 검증(실제에선 서버 검증)
// 지금은 더미로 6자리면 ok 처리
export async function verifyAlimtalkOtp({ sid, code }) {
    console.log("[stub] verifyAlimtalkOtp →", sid, code);
    const ok = typeof code === "string" && code.replace(/\D/g, "").length === 6;
    return { ok };
}
