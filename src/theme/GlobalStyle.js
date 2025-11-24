import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root{
    --color-primary: #FF7A00;
    --color-navy: #1A2B4C;
    --color-yellow-lite: #FFE38A;
  }
  body { color: #0B0B0B; }
  a, button { outline: none; }


  h1,h2,h3,h4 { font-weight: 800; letter-spacing: -0.2px; }
  html, body, #root { height: 100%; }
`;

