/* eslint-disable */
// src/auth-kit/components/modal/LoginDialog.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import config from "../../config/auth.config";
import SnsButtons from "../auth-ui/SnsButtons";

// ← 공통 컬러 상수 (변수 금지)
const COLORS = {
  bg: "#FFFFFF",
  text: "#111111",
  muted: "#666666",
  border: "#ECE8E3",
  accent: "#5DB193",        // 메인 포인트
  accentFg: "#FFFFFF",
};

export default function LoginDialog({ open, onClose, onAuthed, onStartPhone }) {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleStartPhone = async () => {
    if (loading) return;
    try {
      setLoading(true);
      onClose?.();
      if (typeof onStartPhone === "function") onStartPhone();
      else nav("/auth/phone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Head>
        <Title>{config?.texts?.signinTitle ?? "시작하기"}</Title>
        <Close onClick={onClose} aria-label="닫기">×</Close>
      </Head>

      <Body>
        <Lead>
          전화번호 인증 한 번이면 바로 시작할 수 있어요.
          <br />
          기존 이용자는 인증 후 홈으로 이동하고,
          <br />
          처음 이용자는 약관·대화명 입력 후 완료돼요.
        </Lead>

        <Primary onClick={handleStartPhone} disabled={loading}>
          {loading ? "열고 있어요..." : "휴대전화 번호로 시작하기"}
        </Primary>

        <Minor>
          새로 오셨어도 괜찮아요. 로그인 과정에서
          <strong> 전화번호 인증</strong>을 하면 자동으로 가입돼요.
        </Minor>

        <Divider />
        <SnsTitle>또는 간편 로그인</SnsTitle>
        <SnsButtons />

        <MiniTerms>
          로그인 시{" "}
          <a href={config?.links?.tos || "#"} target="_blank" rel="noreferrer">
            이용약관
          </a>
          과{" "}
          <a href={config?.links?.privacy || "#"} target="_blank" rel="noreferrer">
            개인정보처리방침
          </a>
          에 동의한 것으로 간주됩니다.
        </MiniTerms>
      </Body>
    </Modal>
  );
}

/* styled */
const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;
const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: ${COLORS.text};
`;
const Close = styled.button`
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: ${COLORS.text};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: ${COLORS.bg};   /* 모달 내부 배경도 화이트로 명시 */
  color: ${COLORS.text};
`;

const Lead = styled.p`
  margin: 4px 0 2px;
  font-size: 13px;
  line-height: 1.45;
  color: ${COLORS.muted};
`;

const Primary = styled.button`
  height: 50px;
  border: none;
  border-radius: 14px;
  background: ${COLORS.accent};
  color: ${COLORS.accentFg};
  font-weight: 800;
  font-size: 16px;
  &:disabled { opacity: .6; }
  &:active { filter: brightness(0.96); }
`;

const Minor = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${COLORS.muted};
  text-align: center;
  & strong { color: ${COLORS.text}; }
`;

const Divider = styled.div`
  height: 1px;
  background: ${COLORS.border};
  margin: 4px 0 8px;
`;

const SnsTitle = styled.div`
  font-size: 12px;
  color: ${COLORS.muted};
  text-align: center;
`;

const MiniTerms = styled.p`
  margin: 10px 0 0;
  font-size: 11px;
  color: ${COLORS.muted};
  text-align: center;
  a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
`;
