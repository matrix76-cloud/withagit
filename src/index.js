import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 기존 CSS 그대로 유지
import './theme/GlobalStyle.css';
import './styles/reset.css';
import './styles/globals.css';

import App from './App';

// ⬇️ 추가: styled-components 테마
import { ThemeProvider } from 'styled-components';
import { theme } from './theme/theme';
import { GlobalStyle } from './theme/GlobalStyle';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    {/* 전역 스타일 주입 (CSS와 함께 사용 가능) */}
    <GlobalStyle />
    <BrowserRouter /* basename="/필요시-서브경로" */>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);
