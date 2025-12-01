/* eslint-disable */
// src/components/BottomNav.jsx
import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

import iconHome from "../assets/bottomnav/nav_home.png";
import iconMembership from "../assets/bottomnav/nav_membership.png";
import iconSubscription from "../assets/bottomnav/nav_subscription.png";
import iconPickup from "../assets/bottomnav/nav_pickup.png";
import iconBranch from "../assets/bottomnav/nav_branch.png";
import iconNotice from "../assets/bottomnav/nav_notice.png";

const ACCENT = "#F07A2A";
const TEXT_INACTIVE = "rgba(0,0,0,0.45)";
const TEXT_ACTIVE = ACCENT;

const Shell = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  pointer-events: none;

  @media (min-width: 961px) {
    display: none; /* PC에서는 숨김 */
  }
`;

const Card = styled.div`
  pointer-events: auto;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -10px 24px rgba(0, 0, 0, 0.14);
  padding: 12px 8px 16px;
  display: flex;
  justify-content: space-around;
`;

const Item = styled(Link)`
  flex: 1 1 0;
  min-width: 0;
  padding: 4px 2px;
  text-decoration: none;
  color: ${({ $active }) => ($active ? TEXT_ACTIVE : TEXT_INACTIVE)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
`;

const IconWrap = styled.div`
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Label = styled.span`
  line-height: 1.2;
  margin-top: 1px;
`;

// ✅ key 전부 유니크하게 정리, 홈은 /home 으로
const ITEMS = [
    {
        key: "home",
        label: "홈",
        icon: iconHome,
        to: "/home",
    },
    {
        key: "membership",
        label: "멤버십",
        icon: iconMembership,
        to: "/membership",
    },
    {
        key: "pay",
        label: "구독/결제",
        icon: iconSubscription,
        to: "/price",
    },
    {
        key: "pickup",
        label: "픽업신청",
        icon: iconPickup,
        to: "/pickup/apply",
    },
    {
        key: "account",
        label: "내정보",
        icon: iconNotice,
        to: "/m/account",
    },
];

export default function BottomNav() {
    const loc = useLocation();
    const path = loc.pathname || "";

    // 필요하면 여기서 특정 경로 숨김 (스플래시, 콜백 등)
    const HIDDEN_PREFIXES = ["/auth/callback"];
    if (HIDDEN_PREFIXES.some((p) => path.startsWith(p))) {
        return null;
    }

    return (
        <Shell>
            <Card>
                {ITEMS.map((it) => {
                    const active =
                        path === it.to ||
                        (it.to !== "/" && path.startsWith(it.to + "/"));

                    return (
                        <Item key={it.key} to={it.to} $active={active}>
                            <IconWrap>
                                <IconImg src={it.icon} alt={it.label} />
                            </IconWrap>
                            <Label>{it.label}</Label>
                        </Item>
                    );
                })}
            </Card>
        </Shell>
    );
}
