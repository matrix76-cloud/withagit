/* eslint-disable */
// src/components/MembershipPlans.jsx
// 랜딩 멤버십 플랜 섹션 — PC(3컬럼 그리드) + 모바일(슬라이드)

import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { MEMBERSHIP_KIND } from "../constants/membershipDefine";

import { db } from "../services/api";
import { collection, getDocs, query, where, limit as qlimit } from "firebase/firestore";

import CheckoutTimepassDialog from "./CheckoutTimepassDialog";
import CheckoutAgitDialog from "./CheckoutAgitDialog";
import CheckoutFamilyDialog from "./CheckoutFamilyDialog";

/* ===== Tokens ===== */
const accent = "var(--color-accent, #F07A2A)";

/* ===== Section Layout ===== */
const Section = styled.section`
  background: #fff7f2; /* 크림 배경 위에 흰 카드 느낌 */
  padding: 72px 16px 88px;

  @media (max-width: 720px) {
    padding: 56px 0px 32px;
  }
`;

const Wrap = styled.div`
  max-width: 1040px;
  margin: 0 auto;
`;

/* ===== Section Title ===== */
const SectionTitle = styled.h2`
  margin: 0;
  text-align: center;
  color: #111111;
  font-family: "NanumSquareRound";
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: -0.03em;

  @media (max-width: 720px) {
    font-size: 24px;
    line-height: 1.3;
  }
`;

const Highlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 4px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    bottom: 3px;
    height: 46%;
    background: #ffd979;
    border-radius: 999px;
    z-index: -1;
  }
`;

/* ===== PC 전용 그리드 ===== */
const DesktopGrid = styled.div`
  margin-top: 48px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
  align-items: stretch;

  @media (max-width: 720px) {
    display: none;
  }
`;

/* ===== 모바일 전용 슬라이더 ===== */
const MobileSliderShell = styled.div`
  display: none;

  @media (max-width: 720px) {
    display: block;
    margin-top: 32px;
    position: relative;
    overflow: hidden;
  }
`;

const MobileSlides = styled.div`
  display: flex;
  width: 100%;
  transform: translateX(${({ $index = 0 }) => `-${$index * 100}%`});
  transition: transform 0.35s ease;
`;

const Slide = styled.div`
  flex: 0 0 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
`;

const CardBase = styled.div`
  --plan-cta: ${accent};

  background: #ffffff;
  border-radius: 32px;
  padding: 24px 24px 64px; /* PC: 버튼이 카드 밖으로 나가니까 약간 여유 */

  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 720px) {
    width: calc(100% - 10px);
    margin: 0 auto;
    border-radius: 24px;
    padding: 20px 18px 32px; /* 👈 모바일은 아래 패딩을 줄여도 됨(버튼이 카드 안으로 들어옴) */
    min-height: 0;

    &:hover {
      transform: none;
    }
  }
`;

const DetailButtonWrap = styled.div`
  position: absolute;
  bottom: 15px;        /* PC: 카드 안쪽에 살짝 띄워두기 */
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  justify-content: center;

  @media (max-width: 720px) {
    position: static;  /* 👈 모바일에서는 일반 플로우 */
    bottom: auto;
    transform: none;
    margin-top: 18px;  /* 리스트 아래 여백 */
  }
`;


const Card = styled(CardBase)``;

const Featured = styled(CardBase)``;

/* ===== Card Header ===== */
const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PillRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 720px) {
    padding-left: 20px;
  }
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;

  font-size: 13px;
  font-weight: 700;
  color: white;

  background: ${({ $tone }) =>
    $tone === "timepass"
      ? "#FACC15"
      : $tone === "agit"
        ? "#FF8A2A"
        : $tone === "family"
          ? "#F97316"
          : "#FFB850"};

  @media (max-width: 720px) {
    font-size: 11px;
    padding: 5px 12px;
  }
`;

const PillGhost = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(240, 122, 42, 0.4);
  color: #f97316;
  background: #fff8ec;
  font-size: 11px;
  font-weight: 700;
`;

const CardTitle = styled.h3`
  margin: 10px 0 0;
  font-size: 25px;
  font-family: NanumSquareRound;
  color: #111111;
  letter-spacing: -0.025em;
  text-align: center;

  @media (max-width: 720px) {
    font-size: 24px;
    margin-top: 8px;
  }
`;

/* ===== List ===== */

const AccentSpan = styled.span`
  color: ${accent};
  font-weight: 800;
`;

const List = styled.ul`
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: grid;

  li {
    font-size: 14px;
    color: #333333;
    line-height: 1.7;
    letter-spacing: 0.01em;
    padding-left: 25px;
  }

  li.hasCheck::before {
    content: "✓";
    color: #9ca3af;
    margin-right: 6px;
    font-weight: 700;
  }

  @media (max-width: 720px) {
    gap: 4px;

    li {
      font-size: 14px;
      line-height: 1.6;
    }
  }
`;






const ToggleBtn = styled.button`
  min-width: 200px;
  padding: 11px 22px;
  border-radius: 999px;
  border: 1.5px solid
    ${({ $tone }) =>
    $tone === "light"
      ? "#ffd15a"
      : $tone === "dark"
        ? "#f97316"
        : "#ffa94a"};
  background: #ffffff;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: ${({ $tone }) =>
    $tone === "light"
      ? "#ffb100"
      : $tone === "dark"
        ? "#f97316"
        : "#ff8a2a"};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  outline: none;

  &:hover {
    background: #fff9f2;
    border-color: ${({ $tone }) =>
    $tone === "light"
      ? "#ffc53d"
      : $tone === "dark"
        ? "#ea580c"
        : "#ff922b"};
    color: ${({ $tone }) =>
    $tone === "light"
      ? "#ffb100"
      : $tone === "dark"
        ? "#ea580c"
        : "#ff7a1a"};
  }
`;

/* ===== 모바일 전용 화살표 / 도트 ===== */

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  padding: 0;

  ${({ $side }) => ($side === "left" ? "left: 10px;" : "right: 10px;")}

  &:disabled {
    opacity: 0.35;
    cursor: default;
    box-shadow: none;
  }

  @media (max-width: 720px) {
    display: flex;
  }
`;

const ArrowIcon = styled.span`
  font-size: 18px;
  line-height: 1;
  color: #8f8f8f;
`;

const Dots = styled.div`
  display: none;

  @media (max-width: 720px) {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 14px;
  }
`;

const Dot = styled.button`
  width: ${({ $active }) => ($active ? "10px" : "6px")};
  height: 6px;
  border-radius: 999px;
  border: none;
  padding: 0;
  background: ${({ $active }) => ($active ? "#ff9d3c" : "#e2e2e2")};
  transition: all 0.2s ease;
`;

/* ===== 상세 데이터 (기획 텍스트) ===== */

function usePlanDetail(kind) {
  return useMemo(() => {
    if (kind === MEMBERSHIP_KIND.AGITZ) {
      return {
        header: {
          pill: "구독권",
          name: "아지트 멤버십",
          caption: "정규 · 매일 이용하는 패턴이라면",
        },
        summary: [
          { text: "평일 주 5회, 매일 2시간 무료 이용" },
          { text: "주밀방학 프로그램 예약 우선 혜택" },
          { text: "자동 결제 옵션으로 편리한 구독 관리" },
          { text: "픽업 서비스 이용 가능" },
        ],
      };
    }

    if (kind === MEMBERSHIP_KIND.FAMILY) {
      return {
        header: {
          pill: "형제/자매 할인",
          name: "패밀리 멤버십",
          caption: "형제·자매 함께 이용할 때",
        },
        summary: [
          { text: "두 번째 자녀부터 무제한", highlight: "15% 할인" },
          { text: "혜택은 아지트 멤버쉽과 동일하게!!" },
          { text: "가족 모두 함께 누리는 돌봄 서비스" },
        ],
      };
    }

    // TIMEPASS
    return {
      header: {
        pill: "시간권",
        name: "타임패스 멤버십",
        caption: "먼저 가볍게 체험해 보고 싶다면",
      },
      summary: [
        { text: "분 단위로 원하는 만큼 자유롭게" },
        { text: "단기·체험 고객에게 딱 맞는 선택" },
        { text: "예약없이 언제든지 이용하세요!" },
      ],
    };
  }, [kind]);
}

/* ===== 아지트 활성 여부 조회 ===== */
function useAgitzActiveDb(phoneE164) {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      const p = (phoneE164 || "").trim();
      if (!p) {
        if (alive) setActive(false);
        return;
      }

      setLoading(true);
      try {
        const colRef = collection(db, "members", p, "memberships");
        const qy = query(
          colRef,
          where("kind", "==", "agitz"),
          where("status", "==", "active"),
          qlimit(1)
        );
        const snap = await getDocs(qy);
        if (alive) setActive(!snap.empty);
      } catch {
        if (alive) setActive(false);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [phoneE164]);

  return { loading, active };
}

/* ===== Main Component ===== */
export default function MembershipPlans() {
  const nav = useNavigate();
  const { phoneE164, profile } = useUser() || {};

  const { loading: agitzLoadingDb, active: agitzActive } = useAgitzActiveDb(
    (phoneE164 || "").trim()
  );

  const timeData = usePlanDetail(MEMBERSHIP_KIND.TIMEPASS);
  const agitzData = usePlanDetail(MEMBERSHIP_KIND.AGITZ);
  const familyData = usePlanDetail(MEMBERSHIP_KIND.FAMILY);

  const [timepassDialogOpen, setTimepassDialogOpen] = useState(false);
  const [agitDialogOpen, setAgitDialogOpen] = useState(false);
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);

  // 모바일 슬라이더 인덱스
  const [index, setIndex] = useState(0); // 0번을 아지트로 변경

  const totalPlans = 3;
  const canPrev = index > 0;
  const canNext = index < totalPlans - 1;

  const handlePrev = () => {
    if (!canPrev) return;
    setIndex((v) => Math.max(0, v - 1));
  };

  const handleNext = () => {
    if (!canNext) return;
    setIndex((v) => Math.min(totalPlans - 1, v + 1));
  };

  return (
    <Section>
      <Wrap>
        <SectionTitle>
          필요한 만큼, 원하는 방식으로
          <br />
          <Highlight>다양한 멤버십 플랜</Highlight>
        </SectionTitle>

        {/* ===== PC: 3컬럼 그리드 ===== */}
        <DesktopGrid>
          {/* 1. 아지트 (먼저) */}
          <Featured>
            <CardHeader>
              <PillRow>
                <Pill $tone="agit">{agitzData.header.pill}</Pill>
                <PillGhost>Best!</PillGhost>
              </PillRow>
              <CardTitle>{agitzData.header.name}</CardTitle>
            </CardHeader>

            <List>
              {agitzData.summary.map((item, i) => {
                if (!item.highlight) {
                  return (
                    <li key={i} className="hasCheck">
                      {item.text}
                    </li>
                  );
                }
                const [before, after] = item.text.split(item.highlight);
                return (
                  <li key={i} className="hasCheck">
                    {before}
                    <AccentSpan>{item.highlight}</AccentSpan>
                    {after}
                  </li>
                );
              })}
            </List>

            <DetailButtonWrap>
              <ToggleBtn
                type="button"
                $tone="medium"
                onClick={() => setAgitDialogOpen(true)}
              >
                자세히보기
              </ToggleBtn>
            </DetailButtonWrap>
          </Featured>

          {/* 2. 타임패스 */}
          <Card>
            <CardHeader>
              <PillRow>
                <Pill $tone="timepass">{timeData.header.pill}</Pill>
              </PillRow>
              <CardTitle>{timeData.header.name}</CardTitle>
            </CardHeader>

            <List>
              {timeData.summary.map((item, i) => (
                <li key={i} className="hasCheck">
                  {item.text}
                </li>
              ))}
            </List>

            <DetailButtonWrap>
              <ToggleBtn
                type="button"
                $tone="light"
                onClick={() => setTimepassDialogOpen(true)}
              >
                자세히보기
              </ToggleBtn>
            </DetailButtonWrap>
          </Card>

          {/* 3. 패밀리 */}
          <Card>
            <CardHeader>
              <PillRow>
                <Pill $tone="family">{familyData.header.pill}</Pill>
              </PillRow>
              <CardTitle>{familyData.header.name}</CardTitle>
            </CardHeader>

            <List>
              {familyData.summary.map((item, i) => {
                if (!item.highlight) {
                  return (
                    <li key={i} className="hasCheck">
                      {item.text}
                    </li>
                  );
                }
                const [before, after] = item.text.split(item.highlight);
                return (
                  <li key={i} className="hasCheck">
                    {before}
                    <AccentSpan>{item.highlight}</AccentSpan>
                    {after}
                  </li>
                );
              })}
            </List>

            <DetailButtonWrap>
              <ToggleBtn
                type="button"
                $tone="dark"
                onClick={() => setFamilyDialogOpen(true)}
              >
                자세히보기
              </ToggleBtn>
            </DetailButtonWrap>
          </Card>
        </DesktopGrid>

        {/* ===== 모바일: 슬라이더 ===== */}
        <MobileSliderShell>
          <ArrowButton
            type="button"
            $side="left"
            onClick={handlePrev}
            disabled={!canPrev}
          >
            <ArrowIcon>{"<"}</ArrowIcon>
          </ArrowButton>
          <ArrowButton
            type="button"
            $side="right"
            onClick={handleNext}
            disabled={!canNext}
          >
            <ArrowIcon>{">"}</ArrowIcon>
          </ArrowButton>

          <MobileSlides $index={index}>
            {/* 0: 아지트 */}
            <Slide>
              <Featured>
                <CardHeader>
                  <PillRow>
                    <Pill $tone="agit">{agitzData.header.pill}</Pill>
                    <PillGhost>Best!</PillGhost>
                  </PillRow>
                  <CardTitle>{agitzData.header.name}</CardTitle>
                </CardHeader>

                <List>
                  {agitzData.summary.map((item, i) => {
                    if (!item.highlight) {
                      return (
                        <li key={i} className="hasCheck">
                          {item.text}
                        </li>
                      );
                    }
                    const [before, after] = item.text.split(item.highlight);
                    return (
                      <li key={i} className="hasCheck">
                        {before}
                        <AccentSpan>{item.highlight}</AccentSpan>
                        {after}
                      </li>
                    );
                  })}
                </List>

                <DetailButtonWrap>
                  <ToggleBtn
                    type="button"
                    $tone="medium"
                    onClick={() => setAgitDialogOpen(true)}
                  >
                    자세히보기
                  </ToggleBtn>
                </DetailButtonWrap>
              </Featured>
            </Slide>

            {/* 1: 타임패스 */}
            <Slide>
              <Card>
                <CardHeader>
                  <PillRow>
                    <Pill $tone="timepass">{timeData.header.pill}</Pill>
                  </PillRow>
                  <CardTitle>{timeData.header.name}</CardTitle>
                </CardHeader>

                <List>
                  {timeData.summary.map((item, i) => (
                    <li key={i} className="hasCheck">
                      {item.text}
                    </li>
                  ))}
                </List>

                <DetailButtonWrap>
                  <ToggleBtn
                    type="button"
                    $tone="light"
                    onClick={() => setTimepassDialogOpen(true)}
                  >
                    자세히보기
                  </ToggleBtn>
                </DetailButtonWrap>
              </Card>
            </Slide>

            {/* 2: 패밀리 */}
            <Slide>
              <Card>
                <CardHeader>
                  <PillRow>
                    <Pill $tone="family">{familyData.header.pill}</Pill>
                  </PillRow>
                  <CardTitle>{familyData.header.name}</CardTitle>
                </CardHeader>

                <List>
                  {familyData.summary.map((item, i) => {
                    if (!item.highlight) {
                      return (
                        <li key={i} className="hasCheck">
                          {item.text}
                        </li>
                      );
                    }
                    const [before, after] = item.text.split(item.highlight);
                    return (
                      <li key={i} className="hasCheck">
                        {before}
                        <AccentSpan>{item.highlight}</AccentSpan>
                        {after}
                      </li>
                    );
                  })}
                </List>

                <DetailButtonWrap>
                  <ToggleBtn
                    type="button"
                    $tone="dark"
                    onClick={() => setFamilyDialogOpen(true)}
                  >
                    자세히보기
                  </ToggleBtn>
                </DetailButtonWrap>
              </Card>
            </Slide>
          </MobileSlides>

          <Dots>
            {Array.from({ length: totalPlans }).map((_, i) => (
              <Dot
                key={i}
                type="button"
                $active={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </Dots>
        </MobileSliderShell>
      </Wrap>

      {/* ==== 모달들 (각자 내부에서 결제까지 처리) ==== */}
      <CheckoutTimepassDialog
        open={timepassDialogOpen}
        onClose={() => setTimepassDialogOpen(false)}
      />

      <CheckoutAgitDialog
        open={agitDialogOpen}
        onClose={() => setAgitDialogOpen(false)}
      />

      <CheckoutFamilyDialog
        open={familyDialogOpen}
        onClose={() => setFamilyDialogOpen(false)}
      />
    </Section>
  );
}
