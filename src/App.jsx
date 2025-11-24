import React from 'react';
import Router from './router';
import UserProvider, { useUser } from "./contexts/UserContext";

import { ThemeProvider } from 'styled-components';
import { theme } from './theme/theme';
import GlobalStyleStyled from './theme/GlobalStyle.styled';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyleStyled />
      <UserProvider>
        <Router />
      </UserProvider>

    </ThemeProvider>
  );
}
