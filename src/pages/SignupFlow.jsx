/* eslint-disable */
import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { setSessionPhone } from "../services/auth/session";
import { isMemberRegistered, upsertMemberByPhone } from "../services/memberService"; // 이미 가입 여부 체크
import PhoneVerifyDialog from "../components/PhoneVerifyDialog";
import TermsConsent from "../components/auth/TermsConsent";

/* ===== 스타일 ===== */
const Page = styled.main`
  min-height: calc(100vh - 120px);
  background: #fff7f2;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 16px 64px;

  @media (max-width: 768px) {
    min-height: calc(100dvh - 120px);
    padding: 24px 12px 32px;
    align-items: stretch;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 980px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.06);
  padding: 32px 28px;

  @media (max-width: 768px) {
    padding: 24px 18px 24px;
    border-radius: 20px;
  }
`;

const Head = styled.div`
  margin-bottom: 28px;

  h1 {
    margin: 0 0 10px;
    font-size: clamp(22px, 3.2vw, 36px);
    color: #1b2b3a;
    letter-spacing: -0.3px;
    line-height: 1.3;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;

    h1 {
      font-size: 22px;
    }

    p {
      font-size: 13px;
    }
  }
`;

/**
 * 모바일에서 약관/문구 전체 폰트 살짝 줄이는 래퍼
 * - 상단 큰 박스 레이아웃은 그대로 두고, 글자만 전체적으로 1px 정도 줄이는 느낌
 */
const ContentWrap = styled.div`
  @media (max-width: 768px) {
    font-size: 13px;

    h2,
    h3,
    h4,
    p,
    span,
    label,
    li {
      font-size: 13px;
    }

    small {
      font-size: 11px;
    }
  }
`;

const SectionBox = styled.section`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 18px;

  @media (max-width: 768px) {
    padding: 16px 14px;
    margin-bottom: 16px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px;
  color: #1b2b3a;
  font-size: 18px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;

  @media (max-width: 768px) {
    margin-top: 18px;
  }
`;

const BaseBtn = styled.button`
  width: 260px;
  height: 56px;
  border: 0;
  border-radius: 16px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: filter 0.12s, transform 0.04s;

  &:hover {
    filter: brightness(0.98);
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
    filter: none;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 320px;
    font-size: 15px;
    height: 52px;
  }
`;

const PhoneBtn = styled(BaseBtn)`
  background: linear-gradient(180deg, #f2f3f5 0%, #edeff2 100%);
  color: #111;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 22px 36px rgba(0, 0, 0, 0.1),
    0 2px 0 rgba(255, 255, 255, 0.65) inset,
    inset 0 1px 3px rgba(0, 0, 0, 0.06);
  border-radius: 18px;
`;

/* ===== 페이지 ===== */
export default function SignupFlow() {
  const { refresh } = useUser();
  const nav = useNavigate();

  const [openPhone, setOpenPhone] = useState(false);
  const [terms, setTerms] = useState({});
  const [termsOk, setTermsOk] = useState(false);

  const handleTermsChange = useCallback((val, ok) => {
    setTerms(val || {});
    setTermsOk(!!ok);
  }, []);

  const handleVerified = useCallback(
    async (phoneE164) => {
      // 0) 이미 가입 여부 확인
      try {
        const exists = await isMemberRegistered(phoneE164);
        if (exists) {
          alert("이미 가입된 전화번호입니다. 로그인 화면으로 이동합니다.");
          nav("/login?from=/", { replace: true });
          return;
        }
      } catch {
        /* 검사 실패 시 계속 진행 */
      }

      // 1) 세션 저장
      setSessionPhone(phoneE164);

      // 2) member 문서 즉시 생성/업서트 (스켈레톤 + 동의)
      const now = Date.now();
      const memberSkeleton = {
        phoneE164,
        profile: { displayName: "", avatarUrl: "", email: "" },
        memberships: {
          agitz: null,
          agitzList: [],
          family: null,
          timepass: null,
          points: null,
        },
        onboarding: { signupDone: false, childrenPrompted: false },
        consents: {
          tos: !!(terms.tos_withagit && terms.ecommerce),
          privacy: !!terms.privacy,
          ecommerce: !!terms.ecommerce,
          marketing: !!terms.marketing,
        },
        createdAt: now,
        updatedAt: now,
        lastSeenAt: now,
      };

      try {
        await upsertMemberByPhone(phoneE164, memberSkeleton);
        try {
          localStorage.setItem(
            "withagit.memberdata",
            JSON.stringify(memberSkeleton)
          );
        } catch { }
      } catch (e) {
        // 업서트 실패해도 플로우는 진행 (완료 페이지/마이페이지에서 재시도)
        console.warn(
          "[signup] upsertMemberByPhone failed (will fallback later)",
          e
        );
      }

      // 3) 컨텍스트 최신화 & 완료 페이지 이동
      try {
        await refresh?.();
      } catch { }
      nav("/signup/done", { replace: true, state: { phoneE164 } });
    },
    [nav, refresh, terms]
  );

  return (
    <Page>
      <Card>
        <Head>
          <h1>간편 회원가입</h1>
          <p>
            소중한 회원님의 정보는 개인정보보호정책에 의거하여 보호받고 있습니다.
          </p>
        </Head>

        <ContentWrap>
          {/* 이용약관 */}
          <TermsConsent onChange={handleTermsChange} />

          {/* 본인인증 */}
          <SectionBox>
            <SectionTitle>본인인증</SectionTitle>
            <p style={{ color: "#6b7280", margin: "0 0 12px" }}>
              위드아지트 회원가입을 위해서는 본인인증이 필요합니다.
              회원님 명의의 휴대폰 번호로 본인 인증을 진행합니다.
            </p>
            <ButtonRow>
              <PhoneBtn onClick={() => setOpenPhone(true)} disabled={!termsOk}>
                휴대폰 인증
              </PhoneBtn>
            </ButtonRow>
          </SectionBox>
        </ContentWrap>
      </Card>

      {/* 인증 다이얼로그 */}
      <PhoneVerifyDialog
        key={openPhone ? "open" : "closed"}
        open={openPhone}
        onClose={() => setOpenPhone(false)}
        onVerified={handleVerified}
        variant="signup"
        title="전화번호 인증"
        description="휴대폰 번호를 인증해 주세요."
      />
    </Page>
  );
}
