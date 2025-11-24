/* eslint-disable */
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import icPickup from "../../assets/icons/ic_pickup.png";
import icMembership from "../../assets/icons/ic_membership.png";
import icCoin from "../../assets/icons/ic_coin.png";
import icDownload from "../../assets/icons/ic_download.png";

const Wrap = styled.section`
  width: 100%;
  background: transparent;
  margin-top: -18px; /* 히어로와 살짝 겹치게 */
`;

const Container = styled.div`width: 1200px; margin: 0 auto; padding: 0 20px 24px;`;

const Bar = styled.div`
  background: #ffffff; border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.10);
  padding: 18px 20px;
  display: grid; grid-template-columns: 140px 1fr auto;
  align-items: center; gap: 16px;

  @media (max-width: 980px){
    grid-template-columns: 1fr;
    row-gap: 12px;
  }
`;

const Label = styled.div` font-weight: 700; color: #1A2B4C; opacity: .9; `;
const Actions = styled.div` display: flex; gap: 14px; align-items: center; flex-wrap: wrap; `;

const Action = styled(Link)`
  display: inline-flex; align-items: center; gap: 10px;
  padding: 12px 18px; border-radius: 999px;
  background: #F7F9FC; color: #1A2B4C; text-decoration: none; font-weight: 700;
  border: 1px solid rgba(0,0,0,0.06);
  &:hover { background: #F1F4F9; }
`;

const Primary = styled(Action)`
  background: #E6F9FF; color: #066D89; border-color: rgba(6,109,137,.18);
  &:hover { background: #D9F3FF; }
`;

const Right = styled.div` display: inline-flex; gap: 10px; align-items: center; `;
const Icon = styled.img` width: 22px; height: 22px; object-fit: contain; display: block; `;

export default function ConsultStrip() {
  return (
    <Wrap>
      <Container>
        <Bar>
          <Label>자주 찾는 메뉴</Label>

          <Actions>
            <Action to="/pricing/charge" aria-label="정액권 충전">
              <Icon src={icCoin} alt="" />
              정액권 충전
            </Action>

            <Primary to="/pickup/request" aria-label="픽업 신청하기">
              <Icon src={icPickup} alt="" />
              픽업 신청하기
            </Primary>

            <Action to="/membership" aria-label="멤버십 알아보기">
              <Icon src={icMembership} alt="" />
              멤버십 알아보기
            </Action>

            <Action to="/snack" aria-label="간식 구매하기">
              <Icon src={icMembership} alt="" />
              간식 구매하기
            </Action>
          </Actions>

          <Right>
            <Action to="/app" aria-label="앱 다운로드">
              <Icon src={icDownload} alt="" />
              앱 다운로드
            </Action>
          </Right>
        </Bar>
      </Container>
    </Wrap>
  );
}
