/* eslint-disable */
// src/components/MembershipPlans.jsx
// 랜딩 멤버십 플랜 섹션 — 피그마 스타일 반영 버전

import React, { useMemo, useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import CheckoutConfirmDialog from "./CheckoutConfirmDialog";
import { useUser } from "../contexts/UserContext";
import { MEMBERSHIP_KIND } from "../constants/membershipDefine";

import { db } from "../services/api";
import { collection, getDocs, query, where, limit as qlimit } from "firebase/firestore";

import { createOrderDraft } from "../services/orderService";
import CheckoutTimepassDialog from "./CheckoutTimepassDialog";
import CheckoutAgitDialog from "./CheckoutAgitDialog";
import CheckoutFamilyDialog from "./CheckoutFamilyDialog";

/* ===== Tokens ===== */
const accent = "var(--color-accent, #F07A2A)";
const bgSoft = "#F7F4EE";

/* ===== Section Layout ===== */
const Section = styled.section`
  background: ${bgSoft};
  padding: 80px 16px 96px;
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
  line-height: 1.35;
  letter-spacing: -0.03em;
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
    bottom: 4px;
    height: 40%;
    background: #ffd979;
    border-radius: 999px;
    z-index: -1;
  }
`;

// 섹션 서브텍스트는 피그마 기준으로 제거 (형 요청)
/*
const Sub = styled.p`
  text-align: center;
  color: #555555;
  opacity: 0.9;
  margin: 12px 0 40px;
  font-size: 15px;
`;
*/

/* ===== Grid ===== */
const Grid = styled.div`
  display: grid;
  margin-top:60px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
  align-items: stretch;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

/* ===== Card 공통 ===== */
const Card = styled.div`
  --plan-cta: ${accent};

  background: #ffffff;
  border-radius: 28px;
  padding: 32px 30px 80px;   /* 🔥 버튼 공간 확보 */
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 360px;
  position: relative;        /* ⭐ 필수 */
  transition: transform 0.15s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
  }
`;

/* 가운데 카드만 살짝 띄우기 */
const Featured = styled(Card)`
  position: relative;
  /* 테두리 제거 + 살짝 더 강한 그림자만 유지 */
  box-shadow: 0 22px 46px rgba(0, 0, 0, 0.09);

  /* transform 없애서 세 카드 하단 라인 맞추기 */
`;


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
      ? "#FACC15"      /* 타임패스 노랑 */
      : $tone === "agit"
        ? "#FF8A2A"      /* 아지트 오렌지 */
        : $tone === "family"
          ? "#F97316"      /* 패밀리 진한 주황 */
          : "#FFB850"};    /* 기본값 */
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
  margin: 0;
  font-size: 25px;
  font-family: NanumSquareRound;
  color: #111111;
  letter-spacing: -0.02em;
  text-align: center;
  margin-top: 10px;
`;

const CardCaption = styled.p`
  margin: 0;
  font-size: 13px;
  color: #666666;
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
  gap: 6px;

  li {
    font-size: 14px;
    color: #333333;
    line-height: 1.7;
    letter-spacing: 0.01em;
  }

  li.hasCheck::before {
    content: "✓";
    color: #9ca3af; /* 체크는 연회색 */
    margin-right: 6px;
    font-weight: 700;
  }
`;


const DetailButtonWrap = styled.div`
  position: absolute;
  bottom: 24px;              /* 카드 하단에서 24px 위 */
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  justify-content: center;
`;

const DetailBody = styled.div`
  width: 100%;
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? "1600px" : "0")};
  margin-top: ${({ $open }) => ($open ? "16px" : "0")};
  padding-top: ${({ $open }) => ($open ? "10px" : "0")};
  border-top: ${({ $open }) =>
    $open ? "1px dashed rgba(0,0,0,0.08)" : "0"};
  transition: max-height 0.25s ease, margin-top 0.2s ease, padding-top 0.2s ease;
`;

const DetailInner = styled.div`
  padding: 4px 2px 2px;
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: #374151;
`;

const SecTitle = styled.div`
  font-weight: 600;
  color: #111111;
  font-size: 14px;
  margin-bottom: 4px;
`;

const Bullet = styled.div`
  color: #4b5563;
  font-size: 13px;
  line-height: 1.7;
  display: flex;
  gap: 6px;

  &::before {
    content: "•";
  }
`;

const Note = styled.div`
  margin-top: 4px;
  padding: 8px 10px;
  background: #fffdf7;
  border: 1px dashed rgba(240, 122, 42, 0.35);
  border-radius: 10px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.6;
`;

/* === 라벨(위) → 드롭다운 → 금액(콤보 밑) → CTA === */
const AmountGroup = styled.div`
  margin-top: 6px;
  display: grid;
  gap: 10px;
  justify-items: center;
`;

const AmountLabel = styled.label`
  font-size: 13px;
  color: #111111;
  opacity: 0.8;
  justify-self: flex-start;
`;

const ControlWidth = styled.div`
  width: clamp(220px, 70%, 320px);

  @media (max-width: 560px) {
    width: 100%;
  }
`;

const SelectWide = styled.select`
  width: 100%;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(240, 122, 42, 0.35);
  background: #ffffff;
  color: #111111;
  font-weight: 600;
  font-size: 14px;
  padding: 0 16px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  text-align: center;
`;

const PriceTag = styled.div`
  width: clamp(220px, 70%, 320px);
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  text-align: center;
  border: 1px solid rgba(240, 122, 42, 0.35);
  background: #ffffff;
  font-weight: 800;
  font-size: 15px;
  color: #c45b12;

  @media (max-width: 560px) {
    width: 100%;
  }
`;

const PayRow = styled.div`
  margin-top: 12px;
  display: grid;
  justify-items: center;
`;

const PayBtn = styled.button`
  width: clamp(220px, 70%, 320px);
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${accent};
  background: #ffffff;
  color: ${accent};
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.04em;
  cursor: pointer;
  outline: none;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  transition: transform 0.12s ease, box-shadow 0.15s ease, background 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
    background: #fff9f2;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;

const ToggleBtn = styled.button`
  min-width: 140px;
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

  svg {
    transition: transform 0.18s ease;
    transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
  }
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
          { text: "평일 주 5회, 하루 최대 2시간 무료" },
          { text: "인기 프로그램 우선 예약", highlight: "우선 예약" },
          { text: "실시간 알림 & 보험으로 안심 돌봄" },
          { text: "자동 결제 옵션으로 편리한 구독" },
        ],
        sections: [
          {
            title: "1. 멤버십 상세",
            items: [
              "평일 기준, 1일 최대 2시간까지 무료 이용",
              "입·퇴장, 픽업, 간식 이용 시 실시간 알림 제공",
              "공간 및 교구 기본 이용료 포함",
              "추가 결제: 픽업, 간식, 유료 프로그램 등",
            ],
          },
          {
            title: "2. 이런 분께 추천",
            items: [
              "주 3~5회 이상 규칙적으로 이용하는 가정",
              "방과 후 돌봄을 꾸준히 맡기고 싶은 가정",
            ],
          },
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
          { text: "두 번째 자녀부터 15% 할인", highlight: "15% 할인" },
          { text: "자녀별 개별 관리, 동일 혜택 제공" },
          { text: "가족 모두 함께 누리는 돌봄 서비스" },
        ],
        sections: [
          {
            title: "1. 멤버십 상세",
            items: [
              "기준 자녀 1인 + 추가 자녀에 대해 단계별 할인",
              "자녀별 학교·반·알림 설정을 각각 관리",
            ],
          },
          {
            title: "2. 혜택 포인트",
            items: [
              "두 번째 자녀부터 15% 할인 제공",
              "정규 아지트 멤버십 혜택을 동일하게 공유",
            ],
          },
          {
            title: "가격 예시",
            items: [
              "1인: 59,900원",
              "2인: 59,900원 + 50,915원(15%↓) = 110,815원",
            ],
            note: "실제 결제 금액 및 할인 폭은 이벤트/기간에 따라 달라질 수 있습니다.",
          },
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
        { text: "시간 단위로 원하는 만큼 이용" },
        { text: "단기·체험 고객에게 추천" },
        { text: "간단한 예약, 부담 없는 이용" },
      ],
      sections: [
        {
          title: "1. 멤버십 상세",
          items: [
            "평일 기준 2시간/4시간권 중 선택",
            "자녀 1인 기준, 이용 시 분 단위로 차감",
            "유효기간 1개월, 남은 시간은 언제든 조회 가능",
          ],
        },
        {
          title: "2. 이런 분께 추천",
          items: [
            "장기 등록 전, 먼저 체험해 보고 싶은 가정",
            "방학·시험 기간 등 단기간만 필요할 때",
          ],
        },
      ],
    };
  }, [kind]);
}

/* 금액/옵션 유틸 */
const KRW = (n) => n.toLocaleString("ko-KR");
const BASE_SUB = 59900;
const FAM_DISCOUNT = 0.15;

function DetailBlock({ kind, open, onOpenDialog }) {
  const data = usePlanDetail(kind);

  const options = useMemo(() => {
    if (kind === MEMBERSHIP_KIND.TIMEPASS) {
      return [
        { key: "2h", label: "2시간권", price: 25000, minutes: 120 },
        { key: "4h", label: "4시간권", price: 45000, minutes: 240 },
      ];
    }
    if (kind === MEMBERSHIP_KIND.AGITZ) {
      return [{ key: "standard", label: "월 59,900원", price: BASE_SUB }];
    }
    const per = Math.round(BASE_SUB * (1 - FAM_DISCOUNT)); // 50,915
    return [1, 2].map((cnt) => ({
      key: String(cnt),
      label: `${cnt}인`,
      price: per * cnt,
      persons: cnt,
    }));
  }, [kind]);

  const [sel, setSel] = useState(options[0]?.key || "");
  useEffect(() => {
    setSel(options[0]?.key || "");
  }, [options]);

  const selected = options.find((o) => o.key === sel) || options[0];
  const price = selected?.price ?? 0;

  const handlePayClick = () => {
    const base = { variant: sel };

    if (kind === MEMBERSHIP_KIND.TIMEPASS) {
      onOpenDialog?.({
        product: {
          id: `timepass-${sel}`,
          name: sel === "2h" ? "타임패스 멤버십(2시간권)" : "타임패스 멤버십(4시간권)",
          kind: MEMBERSHIP_KIND.TIMEPASS,
          ...base,
          minutes: selected?.minutes || 0,
        },
        price: { total: price },
      });
      return;
    }

    if (kind === MEMBERSHIP_KIND.AGITZ) {
      onOpenDialog?.({
        product: {
          id: "agitz-basic-1m",
          name: "아지트 멤버십 (1개월)",
          kind: MEMBERSHIP_KIND.AGITZ,
          ...base,
        },
        price: { total: price },
        months: 1,
      });
      return;
    }

    onOpenDialog?.({
      product: {
        id: `family-${sel}`,
        name: `패밀리 멤버십 (${sel}인)`,
        kind: MEMBERSHIP_KIND.FAMILY,
        ...base,
        quota: selected?.persons || 1,
      },
      price: { total: price },
      months: 1,
      quota: selected?.persons || 1,
    });
  };

  return (
    <DetailBody $open={open} aria-hidden={!open}>
      <DetailInner>
        {data.sections.map((sec, idx) => (
          <div key={idx}>
            <SecTitle>{sec.title}</SecTitle>
            {sec.items.map((it, i) => (
              <Bullet key={i}>{it}</Bullet>
            ))}
            {sec.note ? <Note>{sec.note}</Note> : null}
          </div>
        ))}

        <AmountGroup>
          <AmountLabel htmlFor={`opt-${kind}`}>금액 선택</AmountLabel>

          {kind === MEMBERSHIP_KIND.AGITZ ? (
            <>
              <ControlWidth />
              <PriceTag>{KRW(price)}원</PriceTag>
            </>
          ) : (
            <>
              <ControlWidth>
                <SelectWide
                  id={`opt-${kind}`}
                  value={sel}
                  onChange={(e) => setSel(e.target.value)}
                >
                  {options.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </SelectWide>
              </ControlWidth>
              <PriceTag>{KRW(price)}원</PriceTag>
            </>
          )}
        </AmountGroup>

        <PayRow>
          <PayBtn type="button" onClick={handlePayClick}>
            결제하기
          </PayBtn>
        </PayRow>
      </DetailInner>
    </DetailBody>
  );
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
  const [open, setOpen] = useState({
    timepass: false,
    agitz: false,
    family: false,
  });
  const [dlgOpen, setDlgOpen] = useState(false);
  const [dlgPayload, setDlgPayload] = useState(null);
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


  const toggle = useCallback((key) => {
    setOpen((prev) => {
      const base = { timepass: false, agitz: false, family: false };
      return { ...base, [key]: !prev[key] };
    });
  }, []);

  // const openDialog = (payload) => {
  //   const buyerDefault = {
  //     name: (profile?.displayName || "").trim(),
  //     phoneE164: (phoneE164 || "").trim(),
  //     email: (profile?.email || "").trim(),
  //   };

  //   const k = payload?.product?.kind;
  //   if (
  //     ![
  //       MEMBERSHIP_KIND.AGITZ,
  //       MEMBERSHIP_KIND.FAMILY,
  //       MEMBERSHIP_KIND.TIMEPASS,
  //       "points",
  //     ].includes(k)
  //   ) {
  //     alert(
  //       "상품 종류가 올바르지 않습니다. (kind 필요: agitz|family|timepass|points)"
  //     );
  //     return;
  //   }

  //   if (k === MEMBERSHIP_KIND.TIMEPASS) {
  //     if (agitzLoadingDb) {
  //       alert("멤버십 상태 확인 중입니다. 잠시 후 다시 시도해 주세요.");
  //       return;
  //     }
  //     if (agitzActive) {
  //       alert("이미 ‘아지트 멤버십’이 활성화되어 있어 시간권 구매가 필요하지 않습니다.");
  //       return;
  //     }
  //   }

  //   if (k === MEMBERSHIP_KIND.FAMILY) {
  //     if (agitzLoadingDb) {
  //       alert("멤버십 상태 확인 중입니다. 잠시 후 다시 시도해 주세요.");
  //       return;
  //     }
  //     if (!agitzActive) {
  //       alert("패밀리 멤버십은 ‘아지트 멤버십’ 활성 후 이용 가능합니다.");
  //       return;
  //     }
  //   }

  //   setDlgPayload({
  //     ...payload,
  //     buyer: { ...buyerDefault, ...(payload?.buyer || {}) },
  //   });
  //   setDlgOpen(true);
  // };

  const openDialog = (payload) => {
    const buyerDefault = {
      name: (profile?.displayName || "").trim(),
      phoneE164: (phoneE164 || "").trim(),
      email: (profile?.email || "").trim(),
    };

    const k = payload?.product?.kind;
    if (
      ![
        MEMBERSHIP_KIND.AGITZ,
        MEMBERSHIP_KIND.FAMILY,
        MEMBERSHIP_KIND.TIMEPASS,
        "points",
      ].includes(k)
    ) {
      alert(
        "상품 종류가 올바르지 않습니다. (kind 필요: agitz|family|timepass|points)"
      );
      return;
    }

    // 🔸 TIMEPASS는 먼저 '정보 모달'만 열고, 최종 결제는 모달 안 CTA에서 진행
    if (k === MEMBERSHIP_KIND.TIMEPASS) {
      // if (agitzLoadingDb) {
      //   alert("멤버십 상태 확인 중입니다. 잠시 후 다시 시도해 주세요.");
      //   return;
      // }
      // if (agitzActive) {
      //   alert("이미 ‘아지트 멤버십’이 활성화되어 있어 시간권 구매가 필요하지 않습니다.");
      //   return;
      // }

      // 타임패스 모달은 가격/옵션을 자체적으로 들고 있으니 payload 저장은 생략
      setTimepassDialogOpen(true);
      return;
    }

    // 🔸 나머지(아지트/패밀리)는 기존 CheckoutConfirmDialog 바로 사용
    if (k === MEMBERSHIP_KIND.FAMILY) {
      if (agitzLoadingDb) {
        alert("멤버십 상태 확인 중입니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      if (!agitzActive) {
        alert("패밀리 멤버십은 ‘아지트 멤버십’ 활성 후 이용 가능합니다.");
        return;
      }
    }

    setDlgPayload({
      ...payload,
      buyer: { ...buyerDefault, ...(payload?.buyer || {}) },
    });
    setDlgOpen(true);
  };

  
  const toE164 = (v) => {
    if (!v) return "";
    let d = String(v).replace(/\D+/g, "");
    if (d.startsWith("82")) return `+${d}`;
    if (d.startsWith("0")) return `+82${d.slice(1)}`;
    return `+${d}`;
  };

  const handleCreateOrder = async (draft) => {
    try {
      const phoneE = toE164(draft?.buyer?.phoneE164);
      if (!phoneE)
        return { ok: false, error: new Error("buyer.phoneE164 missing") };

      const res = await createOrderDraft(phoneE, draft);
      if (!res?.orderId)
        return { ok: false, error: new Error("no orderId returned") };

      return { ok: true, orderId: res.orderId };
    } catch (e) {
      return { ok: false, error: e };
    }
  };

  const handlePrepared = async () => ({ ok: true });

  return (
    <Section>
      <Wrap>
        <SectionTitle>
          필요한 만큼, 원하는 방식으로
          <br />
          <Highlight>다양한 멤버십 플랜</Highlight>
        </SectionTitle>

        <Grid>
          {/* 타임패스 멤버십 (시간권) */}
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
                $tone="light"           // ⬅️ 추가
                $open={open.timepass}
                onClick={() => setTimepassDialogOpen(true)}   // 🔸 바로 팝업 오픈
              >
                자세히보기
           
              </ToggleBtn>
            </DetailButtonWrap>

     
          </Card>

          {/* 아지트 멤버십 (구독권 / Best) */}
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
                $tone="medium"          // ⬅️ 추가
                $open={open.agitz}
                onClick={() => setAgitDialogOpen(true)}
              >
                자세히보기
         
              </ToggleBtn>
            </DetailButtonWrap>

       
          </Featured>

          {/* 패밀리 멤버십 */}
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
                $tone="dark"            // ⬅️ 추가
                $open={open.family}
                onClick={() => setFamilyDialogOpen(true)}
              >
                자세히보기
         
              </ToggleBtn>
            </DetailButtonWrap>

      
          </Card>
        </Grid>
      </Wrap>

      

      <CheckoutTimepassDialog
        open={timepassDialogOpen}
        onClose={() => setTimepassDialogOpen(false)}
        onProceed={(payload) => {
          // 타임패스 모달에서 '타임패스 이용하기' 눌렀을 때
          const buyerDefault = {
            name: (profile?.displayName || "").trim(),
            phoneE164: (phoneE164 || "").trim(),
            email: (profile?.email || "").trim(),
          };
          setDlgPayload({
            ...payload,
            buyer: { ...buyerDefault, ...(payload?.buyer || {}) },
          });
          setTimepassDialogOpen(false);
          setDlgOpen(true);
        }}
      />

      <CheckoutAgitDialog
        open={agitDialogOpen}
        onClose={() => setAgitDialogOpen(false)}
        onProceed={(payload) => {
          const buyerDefault = {
            name: (profile?.displayName || "").trim(),
            phoneE164: (phoneE164 || "").trim(),
            email: (profile?.email || "").trim(),
          };

          setDlgPayload({
            ...payload,
            buyer: { ...buyerDefault, ...(payload?.buyer || {}) },
          });

          setAgitDialogOpen(false);
          setDlgOpen(true);
        }}
      />

      <CheckoutFamilyDialog
        open={familyDialogOpen}
        onClose={() => setFamilyDialogOpen(false)}
        onProceed={(payload) => {
          const buyerDefault = {
            name: (profile?.displayName || "").trim(),
            phoneE164: (phoneE164 || "").trim(),
            email: (profile?.email || "").trim(),
          };

          setDlgPayload({
            ...payload,
            buyer: { ...buyerDefault, ...(payload?.buyer || {}) },
          });

          setFamilyDialogOpen(false);
          setDlgOpen(true);
        }}
      />


    </Section>
  );
}
