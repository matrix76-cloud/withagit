/* eslint-disable */
// /src/styles/membershipCardTheme.js
// Withagit — 멤버십 카드 공용 테마 (관리자/마이페이지 등 공통 사용)

import { css } from "styled-components";

export const MEMBERSHIP_CARD_KIND = Object.freeze({
    AGITZ: "agitz",
    FAMILY: "family",
    TIMEPASS: "timepass",
    CASHPASS: "cashpass",
});

/**
 * membershipCardKindCss[$kind] 으로 불러서
 * styled-components 내부에서 그대로 꽂아 쓰는 용도
 *
 * 예)
 * const Card = styled.div`
 *   ...
 *   ${({ $kind }) => $kind && membershipCardKindCss[$kind]};
 * `;
 */
export const membershipCardKindCss = {
    [MEMBERSHIP_CARD_KIND.AGITZ]: css`
    background: linear-gradient(180deg, #f0fff4 0%, #ffffff 100%);
    border-color: #c7f9cc;
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.08);
  `,
    [MEMBERSHIP_CARD_KIND.FAMILY]: css`
    background: linear-gradient(180deg, #fff7ed 0%, #ffffff 100%);
    border-color: #fbd6a8;
    box-shadow: 0 8px 20px rgba(234, 88, 12, 0.08);
  `,
    [MEMBERSHIP_CARD_KIND.TIMEPASS]: css`
    background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
    border-color: #bfdbfe;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
  `,
    [MEMBERSHIP_CARD_KIND.CASHPASS]: css`
    background: linear-gradient(180deg, #ecfeff 0%, #ffffff 100%);
    border-color: #a5f3fc;
    box-shadow: 0 8px 20px rgba(14, 116, 144, 0.08);
  `,
};
