/* eslint-disable */
// src/components/HomeQuickMenu.jsx
// 홈 상단 — HomeHero와 CoreValuesFigmaSection 사이에 걸쳐 떠 있는 퀵메뉴 바

import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import icoPickup from "../assets/quick/quick1.png";
import icoCharge from "../assets/quick/quick2.png";
import icoProgram from "../assets/quick/quick3.png";
import icoPass from "../assets/quick/quick4.png";
import icoFood from "../assets/quick/quick5.png";

import CheckoutChargeDialog from "./CheckoutChargeDialog";
import CheckoutConfirmDialog from "./CheckoutConfirmDialog";
import { useUser } from "../contexts/UserContext";
import { createOrderDraft } from "../services/orderService";

const QUICK_MENUS = [
  {
    key: "pickup",
    label: "픽업 신청",
    icon: icoPickup,
    bg: "#FFE59E",
    to: "/pickup/apply",
    type: "link",
  },
  {
    key: "membership",
    label: "멤버십",
    icon: icoCharge,
    bg: "#FFF1B8",
    to: "/membership",
    type: "link",
  },
  {
    key: "program",
    label: "프로그램",
    icon: icoProgram,
    bg: "#FFE4E4",
    to: "/price",
    type: "link",
  },
  {
    key: "pass",
    label: "정액권",
    icon: icoPass,
    bg: "#E7F1FF",
    type: "charge",
  },
];

/* ===== Layout ===== */

/* PC: 위/아래 섹션 사이에 살짝 걸치는 느낌
   모바일: 독립된 흰색 영역(평평한 띠) */
const Section = styled.section`
  position: relative;
  margin-top: -36px;
  margin-bottom: -16px;
  z-index: 3;

  @media (max-width: 960px) {
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #ffffff; /* 모바일: 흰색 배경 블록 */
  }
`;

const QuickMenuWrap = styled.div`
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 32px;

  @media (max-width: 960px) {
    padding: 0 16px;
  }
`;

const QuickMenuBar = styled.div`
  width: 100%;
  border-radius: 32px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  padding: 18px 32px;
  display: flex;
  align-items: center;
  gap: 32px;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;

  @media (max-width: 960px) {
    /* 모바일: 카드 느낌 삭제 → 평평하게 */
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    padding: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const QuickMenuTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111111;
  white-space: nowrap;

  @media (max-width: 960px) {
    display: none; /* 모바일: 텍스트 제목 없음 */
  }
`;

const QuickMenuList = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: space-between;
  gap: 24px;

  @media (max-width: 960px) {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 모바일: 4개 한 줄 */
    column-gap: 0;
    row-gap: 14px;
  }
`;

const QuickMenuItem = styled.button`
  border: none;
  background: none;
  padding: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: #333333;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 960px) {
    width: 100%;
    align-items: center;
  }
`;

/* 🔥 여기: 이미지 크기는 유지, 감싸는 카드(라운드 박스)만 키움 */
const QuickMenuIcon = styled.span`
  width: 68px;
  height: 68px;
  border-radius: 24px;
  background: ${({ $bg }) => $bg || "#f5f5f5"};
  display: inline-grid;
  place-items: center;

  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    display: block;
  }

  @media (max-width: 960px) {
    width: 72px;
    height: 72px;
    border-radius: 12px;

    img {
      width: 48px;
      height: 48px; /* 이미지 크기는 그대로 */
    }
  }
`;

/* 🔥 여기: 모바일에서 글씨 2px 줄이기 */
const QuickMenuLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333333;
  text-align: center;

  @media (max-width: 960px) {
    font-size: 11px;
  }
`;

/* ===== util ===== */
const toE164 = (v) => {
  if (!v) return "";
  let d = String(v).replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) return `+82${d.slice(1)}`;
  if (d.startsWith("82")) return `+${d}`;
  return d;
};

/* ===== Component ===== */
export default function HomeQuickMenu() {
  const nav = useNavigate();
  const { phoneE164, profile } = useUser() || {};

  const [chargeOpen, setChargeOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState(null);

  const handleCreateOrder = async (draft) => {
    try {
      const phone = toE164(draft?.buyer?.phoneE164 || phoneE164);
      if (!phone) {
        return {
          ok: false,
          error: new Error("전화번호가 없어 결제를 진행할 수 없어요."),
        };
      }

      const res = await createOrderDraft(phone, {
        ...draft,
        buyer: {
          ...(draft?.buyer || {}),
          phoneE164: phone,
        },
      });

      if (!res?.orderId) {
        return {
          ok: false,
          error: new Error("주문 생성 중 오류가 발생했어요."),
        };
      }

      return { ok: true, orderId: res.orderId };
    } catch (e) {
      console.error(e);
      return { ok: false, error: e };
    }
  };

  return (
    <>
      <Section>
        <QuickMenuWrap>
          <QuickMenuBar>
            <QuickMenuTitle>자주 찾는 메뉴</QuickMenuTitle>

            <QuickMenuList>
              {QUICK_MENUS.map((m) => (
                <QuickMenuItem
                  key={m.key}
                  type="button"
                  onClick={() => {
                    if (m.key === "pass") {
                      setChargeOpen(true);
                    } else if (m.to) {
                      nav(m.to);
                    }
                  }}
                >
                  <QuickMenuIcon $bg={m.bg}>
                    <img src={m.icon} alt={m.label} />
                  </QuickMenuIcon>
                  <QuickMenuLabel>{m.label}</QuickMenuLabel>
                </QuickMenuItem>
              ))}
            </QuickMenuList>
          </QuickMenuBar>
        </QuickMenuWrap>
      </Section>

      <CheckoutChargeDialog
        open={chargeOpen}
        onClose={() => setChargeOpen(false)}
        onProceed={(payload) => {
          const buyerDefault = {
            name: profile?.name || "",
            phoneE164: toE164(phoneE164),
            email: profile?.email || "",
          };

          setCheckoutPayload({
            ...payload,
            buyer: { ...buyerDefault, ...(payload?.buyer || {}) },
          });

          setChargeOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutConfirmDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        payload={checkoutPayload}
        onCreateOrder={handleCreateOrder}
      />
    </>
  );
}
