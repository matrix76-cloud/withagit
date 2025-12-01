// src/styles/GlobalFonts.js
/* eslint-disable */
import { createGlobalStyle } from "styled-components";

export const GlobalFonts = createGlobalStyle`
  :root{
    --font-round: "NanumSquareRound", "Pretendard", "Noto Sans KR",
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Apple SD Gothic Neo", "Malgun Gothic", Arial, sans-serif;
  }

  html, body, #root { height: 100%; }
  body {
    font-family: var(--font-round);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
`;
