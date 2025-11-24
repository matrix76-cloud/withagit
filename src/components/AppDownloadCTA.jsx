// src/components/AppDownloadCTA.jsx
/* eslint-disable */
import React from "react";
import styled, { css } from "styled-components";

import phone from "../assets/images/phone.png"; // PNG 로고
import phone2 from "../assets/images/phone2.png"; // PNG 로고
/* ===== Tokens ===== */
const primary = "var(--color-primary, #2F6BFF)";
const accent = "var(--color-accent,  #F07A2A)";
const bgSoft = "var(--color-bg-soft, #FFF5F1)";
const navy = "#1A2B4C";

/* ===== Layout ===== */
const Section = styled.section`
  background: ${bgSoft};
  padding: 64px 16px;
  @media (min-width: 1200px){ padding: 96px 16px; }
  margin-top: 80px;
`;
const Wrap = styled.div`
  max-width: 1200px; margin: 0 auto;
  display: grid; align-items: center; gap: 36px;
  grid-template-columns: 1fr;
  @media (min-width: 1100px){ grid-template-columns: 6.5fr 5.5fr; gap: 48px; }
`;

/* ===== Left (Text) ===== */
const Lead = styled.h3`
  margin: 0; color: ${navy};
  font-weight: 600; line-height: 1.2;
  font-size: clamp(22px, 4vw, 40px);
  letter-spacing: -0.6px;
  em { font-style: normal; color: ${accent}; }
`;
const Sub = styled.p`
  margin: 16px 0 24px; color: #6b7280;
  font-size: clamp(14px, 1.6vw, 18px);
`;
const Chips = styled.div`
  display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0 24px;
`;
const Chip = styled.button`
  height: 40px; padding: 0 16px; border-radius: 999px; border: 0;
  font-weight: 700; color: #fff; cursor: pointer;
  box-shadow: 0 10px 22px rgba(0,0,0,.08);
  transition: transform .05s, filter .15s;
  &:hover { filter: brightness(0.95); }
  &:active { transform: translateY(1px); }
  ${({ $variant }) => {
        switch ($variant) {
            case "blue": return css`background: ${primary};`;
            case "green": return css`background: #22c55e;`;
            case "purple": return css`background: #8b5cf6;`;
            case "orange": return css`background: ${accent};`;
            case "indigo": return css`background: #4f46e5;`;
            default: return css`background: #64748b;`;
        }
    }}
`;

/* ===== Store Buttons ===== */
const Stores = styled.div` display:flex; flex-wrap:wrap; gap:16px; `;
const StoreBtn = styled.a`
  display:inline-flex; align-items:center; gap:12px;
  padding:10px 16px; border-radius:12px; background:#000; color:#fff; text-decoration:none;
  font-weight:700; box-shadow:0 10px 24px rgba(0,0,0,.15);
  transition: transform .05s, filter .15s;
  &:hover{ filter:brightness(0.92); } &:active{ transform:translateY(1px); }
  svg{ width:28px; height:28px; flex-shrink:0; }
`;

/* ===== Right (Phones) ===== */
const Phones = styled.div`
  position: relative; min-height: 420px;
  @media (min-width: 1100px){ min-height: 520px; }
`;

/* 배경 타원 그라데이션 (단일/이중 공통) */
const Halo = styled.div`
  position:absolute; inset:auto 0 0 0; height: 60%;
  background: radial-gradient(60% 120% at 70% 60%, rgba(0,0,0,0.08), transparent 70%);
  filter: blur(8px);
`;

/* 단일 이미지 모드 */
const PhoneSingle = styled.img`
  position: absolute; right: 0; top: 50%; transform: translateY(-50%);
  width: min(540px, 90%); max-width: 560px;
  border-radius: 36px; background:#fff;
  box-shadow: 0 28px 72px rgba(0,0,0,.18);
  object-fit: cover; display:block;

  @media (max-width: 1099px){
    position: relative; right: auto; top: auto; transform: none;
    width: 88%; margin: 0 auto;
    box-shadow: 0 20px 48px rgba(0,0,0,.12);
  }
`;

/* 이중 이미지 모드(이전과 동일) */
const Phone = styled.img`
  position: absolute; width: 52%;
  max-width: 380px; border-radius: 32px; object-fit: cover; background:#fff;
  box-shadow: 0 24px 64px rgba(0,0,0,.18);
  &:nth-child(2){ left: 0; bottom: -4%; transform: rotate(-4deg); }
  &:nth-child(3){ right: 8%; top: 0;    transform: rotate(2deg);  }
  @media (max-width: 1099px){
    position: relative; width: 48%; transform: none !important;
    box-shadow: 0 18px 44px rgba(0,0,0,.12);
    &:nth-child(2){ left:auto; bottom:auto; margin-top:-8%; }
    &:nth-child(3){ right:auto; top:auto;  margin-left:6%; }
  }
`;

/* ===== Component ===== */
export default function AppDownloadCTA({



    title = <>믿을수 있는 <em>돌봄</em>, 손 안에서 시작됩니다.<br />우리 아이의 하루를 지켜보세요.</>,
    subtitle = "앱스토어 또는 구글플레이스토어에서 간편하게 설치하세요.",
    chips = [
        { label: "자녀 관리", variant: "purple" },
        { label: "내 자녀 등록", variant: "blue" },
        { label: "픽업 신청하기", variant: "green" },
        { label: "정액권 충전", variant: "orange" },
        { label: "프로그램 예약", variant: "indigo" },
        { label: "이용권 구매", variant: "orange" },
    ],
    onChipClick = (label) => console.log(label),

    /* ▼ 스토어 링크 */
    appStoreUrl = "https://apps.apple.com/",
    playStoreUrl = "https://play.google.com/",
    showAppStore = true,
    showPlayStore = true,

    /* ▼ 이미지: 단일 이미지만 주면 자동으로 단일 모드 */
    phoneImg1 = phone, // ← 한 장짜리(두 폰이 포함된 합성 이미지여도 OK)
    phoneImg2 = phone2,                                    // ← 비우면 단일 모드
    phoneAlt = "앱 화면 미리보기",
}) {

  const handleStoreClick = (e) => {
    e.preventDefault();           // 링크 이동 막기
    e.stopPropagation();
    alert("앱 준비 중입니다.");
  };

    const singleMode = !phoneImg2; // phoneImg2 없으면 단일 이미지 모드
    return (
        <Section>
            <Wrap>
                {/* Left */}
                <div>
                    <Lead>{title}</Lead>
                    <Sub>{subtitle}</Sub>

                    <Chips>
                        {chips.map((c, i) => (
                            <Chip key={i} $variant={c.variant} onClick={() => onChipClick(c.label)}>
                                {c.label}
                            </Chip>
                        ))}
                    </Chips>

                    <Stores>
                        {showAppStore && (
                <StoreBtn href={appStoreUrl}
                  onClick={handleStoreClick}
                  target="_blank" rel="noreferrer">
                                {/* Apple icon */}
                                <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M16.365 1.43c.252 1.77-.517 3.16-1.42 4.16-.9 1-2.09 1.8-3.21 1.7-.3-1.63.54-3.25 1.4-4.2.91-.98 2.51-1.74 3.23-1.66zM20.6 17.19c-.58 1.36-1.27 2.7-2.29 3.89-1.06 1.24-2.32 2.64-4 2.67-1.68.03-2.22-.86-4.14-.86-1.92 0-2.51.84-4.17.89-1.66.05-2.93-1.33-3.99-2.56C-.02 19.43-.9 16.2.49 13.6c.86-1.64 2.4-2.68 4.06-2.71 1.6-.03 3.11 1.07 4.14 1.07 1.02 0 2.81-1.32 4.73-1.12.81.03 3.09.33 4.55 2.5-.12.07-2.7 1.58-2.37 4.85z" /></svg>
                                <span>Download on the&nbsp;<strong>App Store</strong></span>
                            </StoreBtn>
                        )}
                        {showPlayStore && (
                <StoreBtn href={playStoreUrl}
                  onClick={handleStoreClick}   
                  target="_blank" rel="noreferrer" style={{ background: "#121212" }}>
                                {/* Play icon */}
                                <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M3.6 1.8c-.36.21-.6.6-.6 1.02v18.36c0 .42.24.81.6 1.02l10.2-10.2L3.6 1.8zm11.34 9.18l4.89-2.85c.69-.4.69-1.44 0-1.84L17 4.74 13.29 8.45l1.65 1.53zM13.29 15.55L17 19.26l2.83-1.57c.69-.4.69-1.44 0-1.84l-4.89-2.85-1.65 1.55z" /></svg>
                                <span>Get it on&nbsp;<strong>Google Play</strong></span>
                            </StoreBtn>
                        )}
                    </Stores>
                </div>

                {/* Right */}
                <Phones>
                    <Halo />
                    {singleMode ? (
                        <PhoneSingle src={phone} alt={phoneAlt} loading="lazy" />
                    ) : (
                        <>
                            <Phone src={phone} alt={phoneAlt || "앱 화면 1"} loading="lazy" />
                            <Phone src={phone2} alt={phoneAlt || "앱 화면 1"} loading="lazy" />
                        </>
                    )}
                </Phones>
            </Wrap>
        </Section>
    );
}
