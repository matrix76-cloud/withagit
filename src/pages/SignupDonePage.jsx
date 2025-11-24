/* eslint-disable */
// /src/pages/SignupDonePage.jsx
import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { upsertMemberByPhone } from "../services/authService";
import { getSession } from "../services/auth/session";   // ✅ 세션 통일

const Page = styled.main`
  min-height: 100vh;
  background: #fff7f2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
`;
const Card = styled.div`
  width: min(960px, 92vw);
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 64px rgba(0,0,0,.16);
  padding: clamp(24px, 4vw, 48px);
  text-align: center;
`;
const Title = styled.h1`
  font-size: clamp(20px, 2.6vw, 28px);
  font-weight: 900;
  color: #111;
  margin: 0 0 20px;
`;
const Sub = styled.p`
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
`;
const LogoWrap = styled.div`
  margin: 12px auto 40px;
  width: min(420px, 70%);
  opacity: .95;
`;
const BtnRow = styled.div`
  display: flex; gap: 12px; justify-content: center; margin-top: 8px; flex-wrap: wrap;
`;
const BaseBtn = styled.button`
  min-width: 200px; height: 52px;
  border-radius: 14px; border: 0;
  font-weight: 900; font-size: 15px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 10px 24px rgba(0,0,0,.06);
  transition: transform .05s, filter .12s, background-color .15s;
  &:hover { filter: brightness(.98); }
  &:active { transform: translateY(1px); }
`;
const GhostBtn = styled(BaseBtn)`background:#eceef1;color:#111;border:1px solid rgba(0,0,0,.12);`;
const PrimaryBtn = styled(BaseBtn)`background:#e47b2c;color:#fff;`;

export default function SignupDonePage() {
  const nav = useNavigate();
  const { state } = useLocation(); // optional: { phoneE164 }
  const { refresh } = useUser() || {};

  // ✅ 세션과 state를 합쳐 phoneE164 결정
  const phoneE164 = useMemo(() => {
    const s = getSession();
    return state?.phoneE164 || s?.phoneE164 || null;
  }, [state]);

  // ✅ 진입 시 memberdata 업서트 + 로컬 저장 + 컨텍스트 새로고침
  useEffect(() => {
    (async () => {
      if (!phoneE164) return;
      const now = Date.now();
      const memberdata = {
        phoneE164,
        onboarding: { signupDone: true, childrenPrompted: true },
        lastSignupDoneAt: now,
        lastSeenAt: now,
      };
      try { await upsertMemberByPhone(phoneE164, memberdata); } catch { }
      try { localStorage.setItem("withagit.memberdata", JSON.stringify(memberdata)); } catch { }
      try { refresh?.(); } catch { }
    })();
  }, [phoneE164, refresh]);

  return (
    <Page>
      <Card>
        <Title>가입 마지막 단계입니다.</Title>
        <Sub>이제 마이페이지에서 자녀 정보를 등록하고 서비스를 시작해 보세요.</Sub>

        <LogoWrap>

          <text x="0" y="140" fontSize="84" fontWeight="900" fill="#5b5b5b">위드아지트</text>
          {phoneE164 ? (
            <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
              가입 예정번호: {phoneE164}
            </div>
          ) : null}
        </LogoWrap>

        <BtnRow>
          <GhostBtn type="button" onClick={() => nav("/", { replace: true })}>
            홈으로
          </GhostBtn>
          <PrimaryBtn
            type="button"
            onClick={() => nav("/mypage", { replace: true })}
          >
            자녀 등록하기
          </PrimaryBtn>
        </BtnRow>
      </Card>
    </Page>
  );
}
