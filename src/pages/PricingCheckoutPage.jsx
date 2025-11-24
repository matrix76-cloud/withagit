/* eslint-disable */
// src/pages/PricingCheckoutPage.jsx
// Withagit 결제 페이지(PC 웹) — 결제 버튼을 카드 내부(아이템 정보 바로 아래)로 이동

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bootpay } from "@bootpay/client-js";

/* 0) 임시 상품 매핑 */
const PRODUCTS = {
    agitz_m: { name: "정규 멤버십(월)", price: 59900 },
    family_add_1: { name: "패밀리 추가 1인", price: 47200 },
    family_add_2: { name: "패밀리 추가 2인", price: 94400 },
    time_2h: { name: "시간권 2시간", price: 25000 },
    time_4h: { name: "시간권 4시간", price: 45000 },
};

const fmtKRW = (n) => Number(n || 0).toLocaleString("ko-KR");
const normPhone = (s) => String(s || "").replace(/\s|-/g, "");

/* 1) 스타일 */
const Page = styled.main`
  min-height: 100dvh;
  background: #fafafa;
  color: #111827;
`;
const Head = styled.header`
  position: sticky; top: 0; z-index: 5;
  background: #fff; border-bottom: 1px solid #eef0f4;
`;
const HeadIn = styled.div`
  width: min(960px, 100%); margin: 0 auto; padding: 12px 16px;
  display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center;
`;
const BackBtn = styled.button`
  height: 36px; width: 36px; border-radius: 10px; border: 1px solid #e5e7eb;
  background: #fff; display: grid; place-items: center; cursor: pointer; font-size: 18px;
`;
const Title = styled.h1` margin: 0; font-size: 20px; `;
const Wrap = styled.section`
  width: min(960px, 100%); margin: 0 auto; padding: 16px; display: grid; gap: 12px;
`;
const Card = styled.div`
  background: #fff; border: 1px solid #eef0f4; border-radius: 14px; padding: 16px; display: grid; gap: 10px;
`;
const Row = styled.div` display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 16px; `;
const Label = styled.div` color: #6b7280; font-size: 13px; `;
const Value = styled.div` font-weight: 800; `;

const Actions = styled.div`
  margin-top: 8px;
  display: flex; gap: 8px; justify-content: flex-end; align-items: center; flex-wrap: wrap;
`;
const PayBtn = styled.button`
  height: 44px; min-width: 140px; border: 0; border-radius: 10px;
  background: #e47b2c; color: #fff; font-weight: 800; cursor: pointer;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;
const GhostBtn = styled.button`
  height: 36px; padding: 0 12px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff;
  cursor: pointer; font-weight: 700; font-size: 13px;
`;

/* 2) 본문 */
export default function PricingCheckoutPage() {
    const nav = useNavigate();
    const [sp] = useSearchParams();
    const productId = (sp.get("id") || "").trim();

    // DEV 세션에서 전화 추출
    const session = useMemo(() => {
        try { return JSON.parse(localStorage.getItem("auth_dev_session") || "null"); } catch { return null; }
    }, []);
    const phoneE164 = normPhone(session?.phoneE164 || "");

    const product = PRODUCTS[productId] || null;

    const appId = useMemo(() => (process.env.REACT_APP_BOOTPAY_WEB_APP_ID || "").trim(), []);
    const BOOTPAY_PG = useMemo(() => (process.env.REACT_APP_BOOTPAY_PG || "").trim(), []);
    const BOOTPAY_METHODS = useMemo(
        () => (process.env.REACT_APP_BOOTPAY_METHODS || "").split(",").map(s => s.trim()).filter(Boolean),
        []
    );

    const [loading, setLoading] = useState(false);

    const onPay = async () => {
        if (!product) return alert("상품 선택이 필요합니다.");
        if (!phoneE164) {
            nav(`/login?from=${encodeURIComponent(location.pathname + location.search)}`);
            return;
        }
        if (!appId) {
            alert("결제 설정(App ID)이 필요합니다. REACT_APP_BOOTPAY_WEB_APP_ID를 설정하세요.");
            return;
        }

        const orderId = `wg-${productId}-${Date.now()}`;
        setLoading(true);

        try {
            const response = await Bootpay.requestPayment({
                application_id: appId,
                price: product.price,
                order_name: product.name,
                order_id: orderId,
                ...(BOOTPAY_PG ? { pg: BOOTPAY_PG } : {}),
                ...(BOOTPAY_METHODS.length ? { methods: BOOTPAY_METHODS } : {}),
                user: {
                    id: phoneE164,
                    username: `회원-${String(phoneE164).slice(-4)}`,
                    phone: phoneE164,
                    email: "",
                },
                items: [{ id: productId, name: product.name, qty: 1, price: product.price }],
                metadata: { productId },
                extra: {
                    open_type: "iframe",
                    browser_open_type: [
                        { browser: "kakaotalk", open_type: "popup" },
                        { browser: "instagram", open_type: "redirect" },
                        { browser: "facebook", open_type: "redirect" },
                        { browser: "mobile_safari", open_type: "popup" },
                        { browser: "mobile_chrome", open_type: "iframe" },
                    ],
                    redirect_url: `${window.location.origin}/pricing/checkout?id=${encodeURIComponent(productId)}`,
                },
            });

            switch (response?.event) {
                case "done":
                    // TODO: 서버 검증(/payments/bootpay/verify) 붙이기
                    alert("결제가 완료되었습니다.");
                    nav("/mypage", { replace: true });
                    break;
                case "issued":
                    alert("가상계좌가 발급되었습니다. 안내에 따라 입금해 주세요.");
                    break;
                default:
                    break;
            }
        } catch (e) {
            if (e?.event === "cancel") alert("결제가 취소되었습니다.");
            else alert(e?.message || "결제 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const onVirtualPay = async () => {
        if (!product) return alert("상품 선택이 필요합니다.");
        if (!phoneE164) {
            nav(`/login?from=${encodeURIComponent(location.pathname + location.search)}`);
            return;
        }
        const orderId = `test-${Date.now()}`;
        const rec = { orderId, productId, price: product.price, at: Date.now(), phoneE164, status: "paid", method: "virtual" };
        const raw = localStorage.getItem("withagit_payments") || "[]";
        const arr = JSON.parse(raw);
        arr.push(rec);
        localStorage.setItem("withagit_payments", JSON.stringify(arr));
        alert("테스트 결제가 완료되었습니다. (로컬 기록)");
        nav("/mypage", { replace: true });
    };

    return (
        <Page>
            <Head>
                <HeadIn>
                    <BackBtn onClick={() => nav(-1)} aria-label="뒤로가기">‹</BackBtn>
                    <Title>이용권 결제</Title>
                </HeadIn>
            </Head>

            <Wrap>
                <Card>
                    <Row>
                        <Label>상품</Label>
                        <Value>{product ? product.name : "선택된 상품 없음"}</Value>
                    </Row>
                    <Row>
                        <Label>금액</Label>
                        <Value>{product ? `${fmtKRW(product.price)}원` : "-"}</Value>
                    </Row>
                    <Row>
                        <Label>결제수단</Label>
                        <div style={{ color: "#6b7280", fontSize: 13 }}>
                            Bootpay{BOOTPAY_PG ? ` · ${BOOTPAY_PG}` : ""}{BOOTPAY_METHODS.length ? ` · ${BOOTPAY_METHODS.join("/")}` : ""}
                        </div>
                    </Row>

                    {/* 👉 여기로 결제 버튼을 올림 */}
                    <Actions>
                        <GhostBtn type="button" onClick={onVirtualPay}>가상 결제(테스트)</GhostBtn>
                        <PayBtn type="button" onClick={onPay} disabled={!product || loading}>
                            {loading ? "결제창 여는 중…" : "결제하기"}
                        </PayBtn>
                    </Actions>
                </Card>
            </Wrap>
        </Page>
    );
}
