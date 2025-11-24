import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Section = styled.section`
  background: #fff;
  padding: 56px 16px;
`;

const Box = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 0 auto;

  /* 밝은 그라데이션 (라이트 옐로우 → 소프트 피치) */
  background: ${({ gradient }) =>
        gradient ||
        "linear-gradient(90deg, #FFF8D8 0%, #FFEFC0 40%, #FFE3BE 100%)"};
  border-radius: 18px;
  padding: clamp(24px, 5vw, 40px) 24px;

  display: grid;
  place-items: center;
  text-align: center;
  color: #1A2B4C; /* 네이비 텍스트 */
  box-shadow: 0 10px 28px rgba(0,0,0,.06);
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-weight: 900;
  font-size: clamp(20px, 2.6vw, 26px);
  letter-spacing: -0.2px;
`;

const Sub = styled.p`
  margin: 0 0 18px;
  opacity: .85;
  font-size: clamp(13px, 1.6vw, 15px);
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
`;

const Btn = styled(Link)`
  height: 44px; padding: 0 16px;
  border-radius: 12px; font-weight: 800; text-decoration: none;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background-color .15s, color .15s, transform .05s, border-color .15s;
  &:active { transform: translateY(1px); }
`;

const BtnPrimary = styled(Btn)`
  background: ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  color: #fff; border: 2px solid transparent;
  &:hover { filter: brightness(.95); }
`;

const BtnGhost = styled(Btn)`
  color: ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  border: 2px solid ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  background: transparent;
  &:hover { background: rgba(255,122,0,.08); }
`;

export default function GetStartedCTA({
    title = "지금 바로 시작해보세요!",
    subtitle = "간편한 회원가입으로 안전하고 믿을 수 있는 아이 돌봄 서비스를 경험해보세요",
    signupHref = "/signup",
    pickupHref = "/branches",
    gradient, // 필요 시 다른 밝은 그라데이션 문자열로 전달
}) {
    return (
        <Section>
            <Box gradient={gradient}>
                <Title>{title}</Title>
                <Sub>{subtitle}</Sub>
                <Actions>
                    <BtnGhost to={signupHref}>무료 회원가입</BtnGhost>
                    <BtnPrimary to={pickupHref}>픽업 예약하기</BtnPrimary>
                </Actions>
            </Box>
        </Section>
    );
}
