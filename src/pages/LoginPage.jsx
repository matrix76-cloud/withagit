/* eslint-disable */
// /src/pages/LoginPage.jsx
import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import PhoneVerifyDialog from "../components/PhoneVerifyDialog";
import { setSessionPhone } from "../services/auth/session";
import { isMemberRegistered } from "../services/memberService"; // ✅ 회원 존재 여부 체크 (서비스 레이어)

/* ===== Layout ===== */
const Page = styled.main`
  min-height: calc(100vh - 120px);
  background: #fff7f2;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 16px 64px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 600px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  box-shadow: 0 18px 48px rgba(17, 24, 39, 0.06);
  padding: 28px;
  display: grid;
  gap: 24px;
  margin: 0 auto;
`;

const H1 = styled.h1`
  margin: 0;
  font-size: 28px;
  color: #111;
  letter-spacing: -0.2px;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", sans-serif;
  font-weight: 800;
`;

const Section = styled.section`
  border: 1px solid #eceff4;
  border-radius: 14px;
  padding: 20px;
  background: #fafcff;
  display: grid;
  gap: 16px;
`;

const SectionTitle = styled.div`
  color: #111827;
  font-size: 15px;
  letter-spacing: -0.1px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", sans-serif;
  font-weight: 800;
`;

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const Btn = styled.button`
  --h: 52px;
  height: var(--h);
  min-width: 220px;
  padding: 0 24px;
  border-radius: 999px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 16px;
  letter-spacing: 0.02em;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", sans-serif;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.08s ease, filter 0.12s ease, box-shadow 0.12s ease,
    border-color 0.12s ease, background 0.12s ease, color 0.12s ease;

  ${({ variant }) => {
    switch (variant) {
      case "primary":
        return `
          background: #F07A2A;
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(240, 122, 42, .22);
          &:hover{ filter: brightness(1.03); }
          &:active{ transform: translateY(1px); box-shadow: 0 6px 16px rgba(240, 122, 42, .16); }
        `;
      case "kakao":
        return `
          background: #FEE500;
          color: #111827;
          border-color: transparent;
          box-shadow: 0 10px 20px rgba(0,0,0,.06);
          &:hover{ filter: brightness(0.98); }
          &:active{ transform: translateY(1px); }
        `;
      default:
        return `
          background: #ffffff;
          color: #111827;
          border-color: #e5e7eb;
          &:hover{ border-color: #d1d5db; background: #fafafa; }
          &:active{ transform: translateY(1px); }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const Hr = styled.div`
  height: 1px;
  background: #edf2f7;
  margin: 8px 0 0;
`;

const Caption = styled.div`
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", sans-serif;
  font-weight: 500;
`;

/* ===== Page ===== */
export default function LoginPage() {
  const nav = useNavigate();
  const [openPhone, setOpenPhone] = useState(false);

  const handleVerified = useCallback(
    async (phoneE164) => {
      // 세션 저장(통일)
      setSessionPhone(phoneE164);

      // 회원 존재 여부 확인 → 없으면 회원가입 플로우로 유도
      let exists = false;
      try {
        exists = await isMemberRegistered(phoneE164);
      } catch {}

      if (!exists) {
        alert(
          "아직 회원가입 정보가 없습니다. 간단한 가입을 먼저 진행해 주세요."
        );
        nav("/signup?from=/", { replace: true });
        return;
      }

      // 기존 회원이면 홈으로
      nav("/", { replace: true });
    },
    [nav]
  );

  return (
    <Page>
      <Card>
        <H1>로그인</H1>

        {/* 휴대폰 인증 섹션 */}
        <Section>
          <SectionTitle>
            회원님 명의의 휴대폰 번호로 본인 인증을 진행합니다.
          </SectionTitle>
          <BtnRow>
            <Btn variant="primary" onClick={() => setOpenPhone(true)}>
              휴대폰 인증
            </Btn>
          </BtnRow>
        </Section>

        <Hr />
        <Caption>간편 로그인</Caption>

        {/* 카카오 로그인 섹션 */}
        <Section>
          <BtnRow>
            <Btn
              type="button"
              variant="kakao"
              onClick={() => {
                window.location.href = "/auth/kakao/start";
              }}
            >
              카카오로 로그인
            </Btn>
          </BtnRow>
        </Section>
      </Card>

      {/* 휴대폰 인증 모달 */}
      <PhoneVerifyDialog
        open={openPhone}
        onClose={() => setOpenPhone(false)}
        onVerified={handleVerified}
        title="전화번호 인증"
        description="휴대폰 번호를 인증해 주세요."
      />
    </Page>
  );
}
