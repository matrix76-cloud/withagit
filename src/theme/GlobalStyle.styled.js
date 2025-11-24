import { createGlobalStyle } from 'styled-components';

const GlobalStyleStyled = createGlobalStyle`
  /* 최소 베이스만: 기존 reset.css, globals.css 그대로 둬도 됨 */
  :root { --container: ${({ theme }) => theme.sizes.container}; }

  body {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }
`;
export default GlobalStyleStyled;