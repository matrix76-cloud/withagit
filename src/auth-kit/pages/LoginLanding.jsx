/* eslint-disable */
import React, { useState, useMemo, useEffect, useContext } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";

import config from "../config/auth.config";
import LoginDialog from "../components/modal/LoginDialog";
import InfoDialog from "../components/modal/InfoDialog";
import useAuthUser from "auth-kit/providers/firebase/hooks/useAuthUser";
import { UserContext } from "context/UserContext";

/* 로그인 페이지 체류 중에만 html/body/#root 배경을 화이트로 강제 */
const ForceWhiteBG = createGlobalStyle`
  html, body, #root { background:#ffffff !important; color-scheme: light; }
`;

function LandingSlider({ items = [], onClickSlide }) {
  return (
    <SliderWrap>
      <SliderTrack>
        {items.map((it, i) => {
          const lines = (it.lines?.length ? it.lines : String(it.strong || "")
            .split(/[·|]/g).map(s => s.trim()).filter(Boolean));
          return (
            <Slide
              key={i}
              style={{ background: it.bg || "#FFF4E6" }}
              onClick={() => onClickSlide?.(i)}
              role="button"
              tabIndex={0}
            >
              <TextBox>
                <SlideTitle>{it.title}</SlideTitle>
                <StrongList>{lines.map((t, idx) => <li key={idx}>{t}</li>)}</StrongList>
              </TextBox>
              {it.image && <Img src={it.image} alt={it.title} />}
            </Slide>
          );
        })}
      </SliderTrack>
      <Dots>{items.map((_, i) => <Dot key={i} />)}</Dots>
    </SliderWrap>
  );
}

export default function LoginLanding() {
  const nav = useNavigate();
  const [openLogin, setOpenLogin] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  const brand = config?.brand || {};
  const landing = config?.landing || {};
  const sliderItems = useMemo(
    () => (landing?.sliderItems?.length ? landing.sliderItems : []),
    [landing?.sliderItems]
  );

  // 인증 훅(세션), 컨텍스트(역할/전화번호)
  const { user: authUser, loading } = useAuthUser();
  const { user: ctxUser } = useContext(UserContext);

  // 목적지 계산: 전문가면 /expert/schedule, 일반은 postSignInRoute || /home
  const isExpert = !!(ctxUser?.hasExpert || ctxUser?.expert);
  const defaultHome = config?.postSignInRoute || "/home";
  const dest = isExpert ? "/expert/schedule" : defaultHome;

  // 로그인 상태 되면 자동 이동
  useEffect(() => {
    if (!loading && authUser) {
      nav(dest, { replace: true });
    }
  }, [authUser, loading, dest, nav]);

  // 브라우저 상단바(모바일)도 화이트로
  useEffect(() => {
    const el = document.querySelector('meta[name="theme-color"]');
    const prev = el?.getAttribute("content");
    if (el) el.setAttribute("content", "#ffffff");
    return () => { if (el && prev) el.setAttribute("content", prev); };
  }, []);

  // 로그인 다이얼로그 내 인증 완료 콜백
  const onAuthed = () => nav(dest, { replace: true });

  return (
    <>
      <ForceWhiteBG />
      <Wrap>
        <TopSpacing />
        <Copy>
          <H1>
            {brand?.slogan}
            {brand?.appName ? (<><br />{brand.appName}</>) : null}
          </H1>
          <P>{brand?.description}</P>
        </Copy>

        <SliderBox>
          <LandingSlider items={sliderItems} onClickSlide={() => setOpenInfo(true)} />
        </SliderBox>

        <CTA onClick={() => setOpenLogin(true)}>
          {config?.texts?.signinBtn || "시작하기"}
        </CTA>
        <HelperCopy>
          처음이신가요? <strong>로그인에서 전화번호 인증</strong>을 하면 자동으로 가입돼요.
        </HelperCopy>

        <HelpRow>
          <HelpBtn type="button" onClick={() => setOpenInfo(true)}>
            {config?.texts?.whatIsBrand || `${brand?.appName || "서비스"}란?`}
          </HelpBtn>
        </HelpRow>

        <LoginDialog open={openLogin} onClose={() => setOpenLogin(false)} onAuthed={onAuthed} />
        <InfoDialog open={openInfo} onClose={() => setOpenInfo(false)} />
      </Wrap>
    </>
  );
}

/* ========== styled-components ========== */
/* 여기서도 배경은 #fff로 '직접' 고정. 변수 사용 안 함 */
const Wrap = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: #ffffff !important;
  color: #111111;
`;

const TopSpacing = styled.div` height: 8vh; `;
const Copy = styled.div` margin: 2vh 0 1vh; `;

const H1 = styled.h1`
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.28;
  color: #111111;
`;
const P = styled.p` margin: 0; color: #666666; font-size: 14px; `;

const SliderBox = styled.div`
  margin: 16px 0 8px;
  border-radius: 16px;
  overflow: hidden;
`;

/* 버튼 색도 상수로 직접 지정 */
const CTA = styled.button`
  height: 50px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 16px;
  margin-top: 10px;
  background: #5DB193;        /* accent 고정 */
  color: #ffffff;
  border: none;
  &:active { filter: brightness(0.95); }
`;

const HelperCopy = styled.p`
  margin: 8px 0 0;
  text-align: center;
  font-size: 12px;
  color: #666666;
  & strong { color: #111111; }
`;

const HelpRow = styled.div` display: flex; justify-content: center; margin-top: 12px; `;
const HelpBtn = styled.button`
  background: transparent; border: none; color: #666666;
  text-decoration: underline; text-underline-offset: 2px; font-size: 12px;
`;

/* ===== Slider styles ===== */
const SliderWrap = styled.div` background: #ffffff; `;
const SliderTrack = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`;
const Slide = styled.div`
  position: relative; min-height: 180px; scroll-snap-align: start;
  display: grid; align-items: center; gap: 8px; padding: 18px 16px; cursor: pointer;
`;
const TextBox = styled.div``;
const SlideTitle = styled.div` font-size: 14px; color: #6b6b6b; `;
const StrongList = styled.ul`
  margin: 4px 0 0; padding: 0; list-style: none; line-height: 1.28;
  & > li { font-size: 18px; font-weight: 900; letter-spacing: -0.01em; }
`;
const Strong = styled.div` margin-top: 4px; font-size: 18px; font-weight: 900; letter-spacing: -0.01em; `;
const Img = styled.img` object-fit: contain; border-radius: 12px; `;
const Dots = styled.div` display: flex; gap: 6px; justify-content: center; padding: 10px 0 12px; background: transparent; `;
const Dot = styled.span` width: 6px; height: 6px; border-radius: 50%; background: #e6e0d8; `;
