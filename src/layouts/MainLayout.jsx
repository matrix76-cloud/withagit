// src/layouts/MainLayout.jsx
/* eslint-disable */
import React from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";

import TopWaveCutSvg from "../components/TopWaveCutSvg";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";

const Shell = styled.div.attrs({ "data-scroll-root": "1" })`
  position: relative;
  min-height: 100vh;
  background: #fff;

  /* 🔹 실제 스크롤 주체를 여기로 통일 */
  overflow-y: auto;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
`;

export default function MainLayout() {
  return (
    <Shell>
      <Header />
      <Content>
        <Outlet />
      </Content>
      <BottomNav />
      <Footer />
    </Shell>
  );
}
