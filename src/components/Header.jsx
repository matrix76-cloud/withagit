/* eslint-disable */
// /src/components/Header.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/images/agitlogo.png";
import fallbackAvatar from "../assets/images/avatar_default.png";
import { useUser } from "../contexts/UserContext";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";

/* ===== Palette & Layout ===== */

const HEADER_BG = "#FFFCF4";
const BORDER_COLOR = "rgba(0,0,0,0.04)";
const BRAND_COLOR = "#FF7A00";
const TEXT_MAIN = "#111111";
const TEXT_SUB = "#666666";

const GUTTER_L = "32px";
const GUTTER_R = "32px";
const HEADER_HEIGHT = "90px";

/* ===== Helpers ===== */
const onlyDigits = (s = "") => (s || "").replace(/\D+/g, "");

function formatKRPhone(raw) {
  if (!raw) return "";
  let d = onlyDigits(raw);

  if (d.startsWith("82")) d = "0" + d.slice(2);

  if (d.length >= 11) {
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
  }

  if (d.length >= 10) {
    if (d.startsWith("02")) {
      return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
    }
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
  }

  return d;
}

/* ===== Storage helpers (DB profile.avatarUrl → 표시용 URL, cache-bust) ===== */
const storage = getStorage();

const isStoragePath = (v) =>
  typeof v === "string" &&
  v &&
  !/^https?:\/\//i.test(v) &&
  !/^data:/i.test(v);

async function pathToUrl(path) {
  if (!path) return "";
  if (!isStoragePath(path)) return path;

  try {
    return await getDownloadURL(storageRef(storage, path));
  } catch {
    return "";
  }
}

/** path가 바뀌거나 bustKey가 바뀌면 즉시 교체(캐시 무력화) */
function useStorageUrl(path, bustKey) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let dead = false;

    (async () => {
      const u = await pathToUrl(path);
      if (dead) return;

      if (!u) {
        setUrl("");
        return;
      }

      const sep = u.includes("?") ? "&" : "?";
      const bust = bustKey
        ? `${sep}v=${encodeURIComponent(String(bustKey))}`
        : "";

      setUrl(u + bust);
    })();

    return () => {
      dead = true;
    };
  }, [path, bustKey]);

  return url;
}

/* ===== Styles ===== */

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: ${HEADER_BG};
  border-bottom: 1px solid ${BORDER_COLOR};
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", "Noto Sans KR", sans-serif;

  /* 🔹 헤더 높이 밖으로 튀어 나간 로고/요소는 잘라서 클릭 안 되게 */
  overflow: hidden;
`;

const Inner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 ${GUTTER_R} 0 ${GUTTER_L};
  height: ${HEADER_HEIGHT};
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 32px;

  @media (max-width: 960px) {
    padding: 0 16px;
    column-gap: 12px;
    height: 56px;
  }
`;

const BrandArea = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
`;

const Logo = styled.img`
  width: 122px;
  height: 122px;
  object-fit: contain;
  display: block;
  border-radius: 8px;

  @media (max-width: 960px) {
    width: 120px;
    height: 120px;
  }
`;

const Title = styled.span`
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: ${TEXT_MAIN};

  @media (max-width: 960px) {
    font-size: 18px;
  }
`;

const NavArea = styled.nav`
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 48px;
  gap: 28px;

  @media (max-width: 960px) {
    display: none;
  }
`;

const NavItem = styled(NavLink)`
  position: relative;
  font-size: 15px;
  font-weight: 600;
  color: ${TEXT_MAIN};
  text-decoration: none;
  padding: 4px 0;
  line-height: 1.4;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -6px;
    width: 0;
    height: 2px;
    background: ${BRAND_COLOR};
    transition: width 0.2s ease;
  }

  &:hover {
    color: ${BRAND_COLOR};
  }

  &.active {
    color: ${BRAND_COLOR};
  }

  &.active::after {
    width: 100%;
  }
`;

const Actions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 960px) {
    gap: 8px;
  }
`;

const OutlineButton = styled.button`
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${BRAND_COLOR};
  background: transparent;
  color: ${BRAND_COLOR};
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    background: rgba(255, 122, 0, 0.06);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }
`;

const Avatar = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-grid;
  place-items: center;
  background: #eceef1;
  color: #333;
  font-size: 12px;
  font-weight: 800;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ProfileIconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1.5px solid #111111;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s ease, transform 0.12s ease, box-shadow 0.12s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 960px) {
    width: 32px;
    height: 32px;
  }
`;

/* ===== Header Component ===== */
export default function Header() {
  const nav = useNavigate();
  const location = useLocation();
  const { initialized, phoneE164, profile, refresh, bootWithPhone } =
    useUser() || {};
  const isLoggedIn = !!phoneE164;
  const avatarUrl = useStorageUrl(
    profile?.avatarUrl || "",
    profile?.updatedAt
  );

  const [isInAppShell, setIsInAppShell] = useState(false);

  useEffect(() => {
    try {
      const search = window.location.search || "";
      const params = new URLSearchParams(search);
      const inappParam = params.get("inapp");

      const inWebview =
        typeof window !== "undefined" &&
        (window.ReactNativeWebView || inappParam === "1");

      setIsInAppShell(!!inWebview);
    } catch {
      setIsInAppShell(false);
    }
  }, []);

  const userLabel = useMemo(() => {
    const name = (profile?.displayName || "").trim();
    if (name) return name;

    const kr = formatKRPhone(phoneE164 || "");
    const last4 = (kr || "").replace(/\D+/g, "").slice(-4);

    return last4 ? `${last4}님` : "내정보";
  }, [profile?.displayName, phoneE164]);

  const handleLogin = useCallback(() => nav("/login"), [nav]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("auth_dev_session");
    } catch {
      // ignore
    }
    bootWithPhone?.("");
    nav("/", { replace: true });
  }, [nav, bootWithPhone]);

  const goMyPage = useCallback(() => {
    try {
      const isMobileWidth =
        typeof window !== "undefined" && window.innerWidth <= 960;
      if (isInAppShell || isMobileWidth) {
        nav("/m/account");
      } else {
        nav("/mypage");
      }
    } catch {
      nav("/mypage");
    }
  }, [nav, isInAppShell]);

  useEffect(() => {
    if (initialized && phoneE164) {
      try {
        refresh?.();
      } catch {
        // ignore
      }
    }
  }, [location.pathname, initialized, phoneE164, refresh]);

  return (
    <Bar>
      <Inner>
        {/* 좌측 로고 영역 */}
        <BrandArea>
          <Brand to="/">
            <Logo src={logo} alt="withagit" />
        
          </Brand>
        </BrandArea>

        {/* 가운데 네비게이션 — PC 전용 */}
        <NavArea>
          <NavItem to="/membership">멤버십/서비스</NavItem>
          <NavItem to="/price">구독/결제</NavItem>
          <NavItem to="/pickup/apply">픽업 신청</NavItem>
          <NavItem to="/space">아지트 지점</NavItem>
          <NavItem to="/help">소식/문의</NavItem>
        </NavArea>

        {/* 우측 액션 영역 */}
        <Actions>
          {isLoggedIn ? (
            <ProfileIconButton onClick={goMyPage} aria-label={userLabel}>
              <Avatar>
                <img src={avatarUrl || fallbackAvatar} alt="avatar" />
              </Avatar>
            </ProfileIconButton>
          ) : (
            <ProfileIconButton onClick={handleLogin} aria-label="로그인">
              <Avatar>
                <img src={fallbackAvatar} alt="login avatar" />
              </Avatar>
            </ProfileIconButton>
          )}
        </Actions>
      </Inner>
    </Bar>
  );
}
