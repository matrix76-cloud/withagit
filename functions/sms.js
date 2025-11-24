/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");

// ===== 🔴 긴급용 하드코드(운영 배포 비권장) =====
// 👉 여기에 값 직접 넣어서 사용. 리포지토리/스크린샷 유출 주의!
const SMS_IDENTIFIER_LIT = "withagit";        // aligo user_id
const SMS_API_KEY_LIT = "au8jo071zpt25n8yvahnrcifbbv46q1s";     // aligo api key
const SMS_SENDER_LIT = "01039239669";     // 숫자만(대시 제거)
const SMS_TESTMODE_YN_LIT = "N";               // "Y" 테스트 / "N" 실발송

// ===== 템플릿 =====
const TEMPLATES = {
    VERIFY_CODE: "[위즈아지트] 인증번호 {{code}} (3분 내 입력 해주세요)",
    STATUS_CONFIRMED: "[위즈아지트] 예약 확정: {{date}} {{time}} / 담당자 {{therapist}}",
    STATUS_REJECTED: "[위즈아지트] 예약 거절: 사유 {{reason}}",
    MOBILITY_CODE : "[DH 모빌리티] 인증번호 {{code}} (3분 내 입력 해주세요)",
};

// ===== 유틸 =====
const onlyDigits = (s = "") => String(s).replace(/\D/g, "");
const isLikelyKRMobile = (d) => d.length >= 9 && d.length <= 12;
const maskPhone = (d) => d.replace(/(\d{3})\d+(\d{4})$/, "$1****$2");
const renderTemplate = (tpl, vars) => tpl.replace(/{{(\w+)}}/g, (_, k) => (vars[k] ?? "") + "").trim();

exports.sendSms = onRequest(
    {
        region: "asia-northeast3",
        vpcConnector: "serverless-conn-seoul",
        vpcConnectorEgressSettings: "ALL_TRAFFIC",
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        try {
            // CORS
            const ORIGIN = req.headers.origin || "*";
            res.setHeader("Access-Control-Allow-Origin", ORIGIN);
            res.setHeader("Vary", "Origin");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            if (req.method === "OPTIONS") return res.status(204).end();
            if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

            const b = req.body || {};
            const to = onlyDigits(b.to || "");
            let text = (b.text || "").trim();

            if (!to || !isLikelyKRMobile(to)) return res.status(400).json({ ok: false, error: "invalid_receiver" });

            // 템플릿 사용
            if (!text && b.templateId) {
                const tpl = TEMPLATES[b.templateId];
                if (!tpl) return res.status(400).json({ ok: false, error: "invalid_template" });
                text = renderTemplate(tpl, b.variables || {});
            }
            if (!text) return res.status(400).json({ ok: false, error: "missing_text" });

            // 🔴 하드코드 값 사용
            const user_id = SMS_IDENTIFIER_LIT;
            const key = SMS_API_KEY_LIT;
            const sender = onlyDigits(SMS_SENDER_LIT);
            const testYN = (SMS_TESTMODE_YN_LIT || "Y").toUpperCase();

            const form = new URLSearchParams({
                user_id,
                key,
                sender,
                receiver: to,
                msg: text,
                testmode_yn: testYN,
            });

            const resp = await fetch("https://apis.aligo.in/send/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: form,
            });

            let result;
            try { result = await resp.json(); }
            catch { result = { status: resp.status, text: await resp.text() }; }

            const ok = (result && (result.result_code === "1" || result.result_code === 1)) || resp.ok;
            console.log("[sendSms] to=", maskPhone(to), "ok=", ok, "test=", testYN);
            return res.status(ok ? 200 : 502).json({ ok, result });
        } catch (e) {
            console.error("[sendSms] error:", e?.message || e);
            return res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    }
);
