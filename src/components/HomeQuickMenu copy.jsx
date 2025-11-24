/* eslint-disable */
// src/components/HomeQuickMenu.jsx
// 홈 상단 — HomeHero와 CoreValuesFigmaSection 사이에 걸쳐 떠 있는 퀵메뉴 바

import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import icoPickup from "../assets/quick/quick1.png";
import icoCharge from "../assets/quick/quick2.png";
import icoProgram from "../assets/quick/quick3.png";
import icoPass from "../assets/quick/quick4.png";
import icoFood from "../assets/quick/quick5.png";

const QUICK_MENUS = [
    {
        key: "pickup",
        label: "픽업 신청",
        icon: icoPickup,
        bg: "#FFE59E",
        to: "/pickup/apply",
    },
    {
        key: "membership",
        label: "멤버십",
        icon: icoCharge,
        bg: "#FFF1B8",
        to: "/membership",
    },
    {
        key: "program",
        label: "프로그램",
        icon: icoProgram,
        bg: "#FFE4E4",
        to: "/programs",
    },
    {
        key: "pass",
        label: "정액권",
        icon: icoPass,
        bg: "#E7F1FF",
        to: "/pass",
    },
    {
        key: "snack",
        label: "간식 신청",
        icon: icoFood,
        bg: "#FFE0E0",
        to: "/snack",
    },
];

/* 배경은 투명, 위로 당겨서 Hero와 CoreValues 사이에 걸치게 */
const Section = styled.section`
  position: relative;
  margin-top: -36px;     /* ⬅️ 바로 위 HomeHero 밑으로 파고들기 */
  margin-bottom: -16px;  /* ⬅️ 아래 노란 섹션 쪽으로도 조금 걸치게 */
  z-index: 3;            /* 배너/노란 배경보다 앞에 나오도록 */
`;

/* 실제 바 위치 */
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
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;

  @media (max-width: 960px) {
    border-radius: 24px;
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const QuickMenuTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111111;
  white-space: nowrap;
`;

const QuickMenuList = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: space-between;
  gap: 24px;

  @media (max-width: 960px) {
    width: 100%;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
`;

const QuickMenuItem = styled.button`
  border: none;
  background: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: #333333;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }
`;

const QuickMenuIcon = styled.span`
  width: 48px;
  height: 48px;
  border-radius: 18px;
  background: ${({ $bg }) => $bg || "#f5f5f5"};
  display: inline-grid;
  place-items: center;

  img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    display: block;
  }
`;

const QuickMenuLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333333;
`;

export default function HomeQuickMenu() {
    const nav = useNavigate();

    return (
        <Section>
            <QuickMenuWrap>
                <QuickMenuBar>
                    <QuickMenuTitle>자주 찾는 메뉴</QuickMenuTitle>
                    <QuickMenuList>
                        {QUICK_MENUS.map((m) => (
                            <QuickMenuItem
                                key={m.key}
                                type="button"
                                onClick={() => nav(m.to)}
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
    );
}
