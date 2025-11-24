// src/components/QuickNav.jsx
/* eslint-disable */
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import icPickup from "../assets/icons/ic_pickup.png";
import icCoin from "../assets/icons/ic_coin.png";
import icProgram from "../assets/icons/ic_program.png";
import icTicket from "../assets/icons/ic_ticket.png";

/* ✅ 포지션을 '정적'으로 변경 — 히어로 사진 위로 겹치지 않게 */
const Wrap = styled.div`
  display: grid;
  gap: 12px;
`;

const Item = styled(Link)`
  display: grid;
  grid-template-columns: 56px 1fr;
  align-items: center;
  min-width: 280px;
  padding: 7px 16px;
  gap: 12px;
  border-radius: 16px;
  color: #102030;
  text-decoration: none;
  font-weight: 900;
  font-size: 20px;
  box-shadow: 0 12px 28px rgba(0,0,0,.12);
  border: 1px solid rgba(0,0,0,.06);
  background: ${p => p.$bg || "#fff"};
`;

const IconHold = styled.div`
  width: 68px; height: 68px; border-radius: 12px;
  display: grid; place-items: center; overflow: hidden;
`;
const Icon = styled.img` width: 68px; height: 68px; object-fit: contain; display: block; `;

const Caption = styled.span`
  letter-spacing: .2px; color: #ffffff; text-shadow: 0 1px 0 rgba(0,0,0,.15);
  padding-left: 20px;
`;

export default function QuickNav() {
    return (
        <Wrap>
            <Item to="/pickup/apply" $bg="#4DCCDB">
                <IconHold><Icon src={icPickup} alt="" /></IconHold>
                <Caption>픽업 신청하기</Caption>
            </Item>
            <Item to="/membership" $bg="#FF578F">
                <IconHold><Icon src={icTicket} alt="" /></IconHold>
                <Caption>멤버십 구매</Caption>
            </Item>
            <Item to="/topup" $bg="#DBAE4D">
                <IconHold><Icon src={icCoin} alt="" /></IconHold>
                <Caption>정액권 충전</Caption>
            </Item>
            <Item to="/programs" $bg="#FF578F">
                <IconHold><Icon src={icProgram} alt="" /></IconHold>
                <Caption>프로그램 예약</Caption>
            </Item>
    
        </Wrap>
    );
}
