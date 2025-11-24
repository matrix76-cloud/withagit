// src/pages/TopupPage.jsx
/* eslint-disable */
import React, { useState, useMemo } from "react";
import styled from "styled-components";

/* ===== Tokens ===== */
const primary = "var(--color-primary, #2F6BFF)";
const primarySoft = "var(--color-primary-soft, #EAF2FF)";
const primaryLine = "color-mix(in srgb, var(--color-primary, #2F6BFF) 35%, transparent)";
const accent = "var(--color-accent, #F07A2A)";
const navy = "#1A2B4C";
const bgSoft = "var(--color-bg-soft, #FFF5F1)";

/* ===== Layout ===== */
const Page = styled.main`
  background: linear-gradient(180deg, #fff, ${bgSoft} 120%);
  min-height: 100dvh;
`;
const Wrap = styled.div`
  max-width: 1120px; margin: 0 auto; padding: 28px 16px 120px;
  display: flex; flex-direction: column; gap: 16px;
`;

/* ===== Hero (단색 파랑) ===== */
const Hero = styled.section`
  background: ${primary};              /* ← 단색 파란 계열 */
  color:#fff; border-radius: 18px; padding: 22px 20px; position: relative;
  box-shadow: 0 16px 40px rgba(0,0,0,.08);
`;
const H1 = styled.h1`
  margin:0; font-weight: 900; letter-spacing:-0.4px;
  font-size: clamp(22px, 3.6vw, 34px);
`;
const HSub = styled.p` margin: 6px 0 0; opacity:.95; `;
const Promo = styled.div`
  position: absolute; right: 16px; bottom: 16px;
  background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.35);
  padding: 6px 10px; border-radius: 999px; font-weight: 800;
`;

/* ===== Amount tiles ===== */
const Section = styled.section``;
const Title = styled.h2` margin: 4px 0 2px; color:${navy}; font-size:18px; font-weight: 900; `;
const Grid = styled.div`
  display: grid; gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  @media (max-width: 920px){ grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 520px){ grid-template-columns: 1fr; }
`;
const Tile = styled.button`
  cursor: pointer; border:1.5px solid ${({ $on }) => $on ? primary : primaryLine};
  background:#fff; border-radius: 14px; padding: 18px;
  box-shadow: ${({ $on }) => $on ? "0 12px 30px rgba(47,107,255,.16)" : "0 10px 24px rgba(0,0,0,.05)"};
  text-align:left; display:flex; flex-direction:column; gap:6px;
  &:hover{ box-shadow: 0 14px 36px rgba(0,0,0,.08); }
`;
const Amount = styled.div` font-size: 20px; font-weight: 900; color:${navy}; `;
const Hint = styled.div` font-size: 13px; color:#6b7280; `;

/* ===== Sticky Summary Bar ===== */
const StickyBar = styled.aside`
  position: sticky; bottom: 0; z-index: 10;
  background: rgba(255,255,255,.9); backdrop-filter: blur(6px);
  border-top: 1px solid #eaeef4; box-shadow: 0 -8px 24px rgba(0,0,0,.04);
`;
const StickyInner = styled.div`
  max-width: 1120px; margin: 0 auto; padding: 10px 16px;
  display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap;
`;
const BarLeft = styled.div` display:flex; flex-direction:column; gap:4px; `;
const SumLine = styled.div` color:#374151; font-weight: 800; `;
const SubLine = styled.div` color:#6b7280; font-size: 13px; `;
const BarRight = styled.div` display:flex; gap:8px; align-items:center; `;
const Btn = styled.button`
  height: 42px; padding: 0 16px; border-radius: 10px; border: 0; cursor: pointer; font-weight: 800; color: #fff;
  background: ${({ $kind }) => $kind === "accent" ? accent : primary};
  box-shadow: 0 8px 18px rgba(0,0,0,.08);
  &:disabled{ opacity:.5; cursor:not-allowed; }
`;

/* ===== 다른 요금제 알아보기 (Membership 미리보기) ===== */
const PlansWrap = styled.section` padding-top: 8px; `;
const Sub = styled.p` margin: 6px 0 14px; color:#6b7280; `;
const CardGrid = styled.div`
  display:grid; gap: 14px; grid-template-columns: repeat(3, minmax(0, 1fr));
  @media (max-width: 980px){ grid-template-columns: 1fr; }
`;
const PlanCard = styled.div`
  --plan-cta: ${accent};
  background:#fff; border:1.5px solid ${primaryLine}; border-radius:16px; padding:18px;
  box-shadow:0 12px 28px rgba(0,0,0,.06); display:grid; gap:10px;
`;
const PTitle = styled.div` color:${primary}; font-weight:900; `;
const PFor = styled.div` color:${navy}; opacity:.7; font-size:14px; `;
const PBig = styled.div` color:${navy}; font-weight:900; font-size:22px; letter-spacing:-.2px; `;
const PList = styled.ul`
  margin:0; padding-left:16px; display:grid; gap:6px; color:#374151; font-size:14px;
`;
const LinkBtn = styled.a`
  margin-top: 2px; justify-self: end; height:40px; padding:0 14px; border-radius:10px; text-decoration:none;
  background: var(--plan-cta); color:#fff; display:inline-flex; align-items:center; font-weight:800;
`;

/* ===== Helpers ===== */
const toKRW = (n) => (n || 0).toLocaleString() + "원";

/* ===== Page ===== */
export default function TopupPage() {
    const PRESETS = [50000, 100000, 200000, 300000];
    const [amount, setAmount] = useState(PRESETS[1]); // 기본 10만원

    const payable = useMemo(() => amount || 0, [amount]); // 할인/보너스 없음 → 금액 그대로
    const canSubmit = !!amount;

    // 장바구니/결제(더미)
    const addToCart = () => {
        const item = { id: `topup/${amount}`, amountKRW: amount, payableKRW: payable, meta: {} };
        console.log("[TOPUP:ADD]", item);
        alert(`장바구니에 담았습니다.\n금액: ${toKRW(payable)}`);
    };
    const payNow = () => {
        if (!canSubmit) return;
        const payload = { amountKRW: amount, payableKRW: payable };
        console.log("[TOPUP:PAY]", payload);
        alert(`결제 플로우(더미)\n결제금액: ${toKRW(payable)}`);
    };

    return (
        <Page>
            {/* Sticky summary */}
            <StickyBar>
                <StickyInner>
                    <BarLeft>
                        <SumLine>선택 금액: {toKRW(amount)} · 결제 예정: {toKRW(payable)}</SumLine>
                        <SubLine>프로모션 문구는 안내용이며 결제금액에는 적용되지 않습니다.</SubLine>
                    </BarLeft>
                    <BarRight>
                        <Btn onClick={addToCart}>담기</Btn>
                        <Btn $kind="accent" onClick={payNow} disabled={!canSubmit}>바로 결제</Btn>
                    </BarRight>
                </StickyInner>
            </StickyBar>

            <Wrap>
                <Hero>
                    <H1>정액권 충전</H1>
                    <HSub>충전 후 바로 이용 가능해요. 결제 금액 = 선택 금액 (할인/보너스 없음)</HSub>
                    <Promo>프로모션 안내용 배지</Promo>
                </Hero>

                {/* 금액 선택 */}
                <Section>
                    <Title>충전 금액 선택</Title>
                    <Grid>
                        {PRESETS.map((amt) => (
                            <Tile key={amt} $on={amount === amt} onClick={() => setAmount(amt)}>
                                <Amount>{toKRW(amt)}</Amount>
                                <Hint>선택하면 요약에 반영됩니다</Hint>
                            </Tile>
                        ))}
                    </Grid>
                </Section>

                {/* 다른 요금제 알아보기 */}
                <PlansWrap>
                    <Title>다른 요금제 알아보기</Title>
                    <Sub>정기 구독/시간권 등 멤버십 상품을 확인하고 필요 시 이동해 보세요.</Sub>
                    <CardGrid>
                        <PlanPreview
                            title="정규 멤버십"
                            forwho="정기적으로 이용하시는 분들께"
                            big="월정액"
                            points={["우선 예약권", "프리미엄 돌봄", "문의 응대/알림"]}
                        />
                        <PlanPreview
                            title="패밀리 멤버십"
                            forwho="형제/자매 할인 + 충전형"
                            big="월정액"
                            points={["형제/자매 추가 할인", "선불 충전 방식", "사용 내역 관리"]}
                        />
                        <PlanPreview
                            title="라이트 멤버십"
                            forwho="가끔 이용하시는 분들께"
                            big="시간권"
                            points={["시간 단위 이용", "유연한 예약", "기본 돌봄 서비스"]}
                        />
                    </CardGrid>
                </PlansWrap>
            </Wrap>
        </Page>
    );

    /* ---- local helpers ---- */
    function PlanPreview({ title, forwho, big, points = [] }) {
        return (
            <PlanCard>
                <PTitle>{title}</PTitle>
                <PFor>{forwho}</PFor>
                <PBig>{big}</PBig>
                <PList>{points.map((t, i) => (<li key={i}>{t}</li>))}</PList>
                <LinkBtn href="/membership">자세히 보기</LinkBtn>
            </PlanCard>
        );
    }
}
