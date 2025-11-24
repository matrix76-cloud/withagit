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
  background: #FFF7F2;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 48px 16px 64px;
`;
const Card = styled.div`
  width: 100%;
  max-width: 600px;
  background: #fff;
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 16px;
  box-shadow: 0 18px 48px rgba(17,24,39,.06);
  padding: 28px;
  display: grid;
  gap: 24px;
  margin: 0 auto;
`;
const H1 = styled.h1`
  margin: 0; font-size: 28px; color: #111; letter-spacing: -.2px;
`;
const Section = styled.section`
  border: 1px solid #ECEFF4; border-radius: 14px; padding: 20px;
  background: #FAFCFF;
  display: grid; gap: 16px;
`;
const SectionTitle = styled.div`
  color:#111827; font-size: 16px; letter-spacing: -.1px;
`;
const BtnRow = styled.div`
  display: flex; gap: 12px; flex-wrap: wrap;
  justify-content: center; align-items: center;
`;
const Btn = styled.button`
  --h: 52px;
  height: var(--h); min-width: 220px;
  padding: 0 18px; border-radius: 12px; border: 1px solid transparent;
  cursor: pointer; font-size: 16px; letter-spacing: .1px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: transform .08s ease, filter .12s ease, box-shadow .12s ease, border-color .12s ease;

  ${({ variant }) => {
    switch (variant) {
      case "primary":
        return `
          background: linear-gradient(180deg, #F07A2A 0%, #E56F1E 100%);
          color: #fff;
          box-shadow: 0 10px 24px rgba(240, 122, 42, .22);
          &:hover{ filter: brightness(1.02); }
          &:active{ transform: translateY(1px); box-shadow: 0 6px 16px rgba(240, 122, 42, .16); }
        `;
      case "kakao":
        return `
          background: #FEE500; color: #111;
          box-shadow: 0 10px 20px rgba(0,0,0,.06);
          &:hover{ filter: brightness(0.98); }
          &:active{ transform: translateY(1px); }
        `;
      default:
        return `
          background: #fff; color: #111; border-color: #E5E7EB;
          &:hover{ border-color: #D1D5DB; background: #FAFAFA; }
          &:active{ transform: translateY(1px); }
        `;
    }
  }}
  &:disabled{ opacity:.6; cursor:not-allowed; box-shadow: none; }
`;
const Hr = styled.div`height: 1px; background: #EDF2F7; margin: 8px 0 0;`;
const Caption = styled.div`text-align: center; color: #9CA3AF; font-size: 13px;`;

/* ===== Page ===== */
export default function LoginPage() {
  const nav = useNavigate();
  const [openPhone, setOpenPhone] = useState(false);

  const handleVerified = useCallback(async (phoneE164) => {
    // 세션 저장(통일)
    setSessionPhone(phoneE164);

    // 회원 존재 여부 확인 → 없으면 회원가입 플로우로 유도
    let exists = false;
    try { exists = await isMemberRegistered(phoneE164); } catch { }

    if (!exists) {
      // 안내 후 회원가입 페이지로 이동 (from 파라미터로 돌아올 위치 전달 가능)
      alert("아직 회원가입 정보가 없습니다. 간단한 가입을 먼저 진행해 주세요.");
      nav("/signup?from=/", { replace: true });
      return;
    }

    // 기존 회원이면 홈으로
    nav("/", { replace: true });
  }, [nav]);

  return (
    <Page>
      <Card>
        <H1>로그인</H1>

        {/* 휴대폰 인증 섹션 */}
        <Section>
          <SectionTitle>회원님 명의의 휴대폰 번호로 본인 인증을 진행합니다.</SectionTitle>
          <BtnRow>
            <Btn variant="primary" onClick={() => setOpenPhone(true)}>휴대폰 인증</Btn>
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
              onClick={() => { window.location.href = "/auth/kakao/start"; }}
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
