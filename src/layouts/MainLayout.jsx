// src/layouts/MainLayout.jsx
/* eslint-disable */
import React from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";

import TopWaveCutSvg from "../components/TopWaveCutSvg"; // ◀︎ 추가
import Header from "../components/Header";
import Footer from "../components/Footer";

const Shell = styled.div`
  position: relative;
  min-height: 100vh;
  background: #fff; /* 본문은 흰색: 구름 컷팅 아래가 깔끔하게 보임 */
`;

const Content = styled.div`
  position: relative;
  z-index: 1; /* 컬러 레이어(0) 위에 콘텐츠 */
`;

export default function MainLayout() {
  return (
    <Shell>

      {/* 헤더: 색을 같게(#f4682d) 하거나 투명 중 택1 — 지금 구조는 둘 다 OK */}
      <Header />

      <Content>
        <Outlet />
      </Content>

      <Footer />
    </Shell>
  );
}
