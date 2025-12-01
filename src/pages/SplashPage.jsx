/* eslint-disable */
// src/pages/SplashPage.jsx
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import splashImg from "../assets/splash/withagit-splash.png";
// ↑ 실제 스플래시 이미지 경로에 맞게 수정해줘

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  width: 100%;
  height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    height: 100dvh;
  }
`;

const LogoWrap = styled.div`
  width: 260px;
  max-width: 70%;
  opacity: 0;
  animation: ${fadeIn} 1.5s ease forwards;

  img {
    width: 100%;
    height: auto;
    display: block;
  }

  @media (max-width: 768px) {
    width: 220px;
    max-width: 75%;
  }
`;

export default function SplashPage() {
    const [visible, setVisible] = useState(false);
    const nav = useNavigate();

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 120); // 살짝 늦게 등장
        const t2 = setTimeout(() => {
            nav("/home", { replace: true }); // 스플래시 후 홈으로 이동
        }, 2200); // 2.2초 정도 보여주고 이동

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [nav]);

    return (
        <Page>
            {visible && (
                <LogoWrap>
                    <img src={splashImg} alt="With Agit Splash" />
                </LogoWrap>
            )}
        </Page>
    );
}
