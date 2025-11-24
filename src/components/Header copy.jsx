/* eslint-disable */
// /src/components/Header.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/mainlogo2.png";
import { useUser } from "../contexts/UserContext";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";
/* ===== Palette & Layout ===== */
const HEADER_BG = "#FFF7EB";
const BORDER_COLOR = "rgba(0,0,0,0.04)";
const BRAND_COLOR = "#FF7A00";
const TEXT_MAIN = "#222222";
const TEXT_SUB = "#666666";
const GUTTER_L = "24px";
const GUTTER_R = "24px";
const HEADER_HEIGHT = "72px";

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
  if (!isStoragePath(path)) return path; // 이미 https면 그대로

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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", "Noto Sans KR", sans-serif;
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
    column-gap: 16px;
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
  gap: 10px;
  text-decoration: none;
`;

const Logo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
  border-radius: 8px;
`;

const Title = styled.span`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.1px;
  color: ${BRAND_COLOR};
`;

const NavArea = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  flex: 1;

  @media (max-width: 960px) {
    display: none;
  }
`;

const NavItem = styled(NavLink)`
  position: relative;
  font-size: 15px;
  font-weight: 500;
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
  gap: 8px;
  flex-shrink: 0;
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

const OutlineLink = styled(Link)`
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${BRAND_COLOR};
  background: transparent;
  color: ${BRAND_COLOR};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
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

const PrimaryLink = styled(Link)`
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background: ${BRAND_COLOR};
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(255, 122, 0, 0.25);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(255, 122, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(255, 122, 0, 0.22);
    opacity: 0.92;
  }
`;

const PrimaryButton = styled.button`
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background: ${BRAND_COLOR};
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(255, 122, 0, 0.25);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(255, 122, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(255, 122, 0, 0.22);
    opacity: 0.92;
  }
`;

const UserChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #ffffff;
  color: ${TEXT_MAIN};
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: background 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease;

  &:hover {
    background: #fffaf4;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
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

const UserLabel = styled.span`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SubHint = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 400;
  color: ${TEXT_SUB};
  margin-top: 2px;

  @media (max-width: 960px) {
    display: none;
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


  const userLabel = useMemo(() => {
    const name = (profile?.displayName || "").trim();
    if (name) return name;

    const kr = formatKRPhone(phoneE164 || "");
    const last4 = (kr || "").replace(/\D+/g, "").slice(-4);

    return last4 ? `${last4}님` : "내정보";
  }, [profile?.displayName, phoneE164]);



  const handleLogin = useCallback(() => nav("/login"), [nav]);
  const handleSignup = useCallback(() => nav("/signup"), [nav]);
  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("auth_dev_session");
    } catch {
      // ignore
    }
    bootWithPhone?.("");
    nav("/", { replace: true });
  }, [nav, bootWithPhone]);
  const goMyPage = useCallback(() => nav("/mypage"), [nav]);
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
        <BrandArea>
          <Brand to="/">
            <Logo src={logo} alt="withagit" />
            <div>
              <Title>withagit</Title>
            </div>
          </Brand>
        </BrandArea>
        <NavArea>
          <NavItem to="/">서비스 소개</NavItem>
          <NavItem to="/branches">지점 안내</NavItem>
          <NavItem to="/space">공간 소개</NavItem>
          <NavItem to="/mypage">내정보</NavItem>
          <NavItem to="/help">소식/문의</NavItem>
        </NavArea>

        <Actions>
          {isLoggedIn ? (
            <>
              <UserChip onClick={goMyPage} title="내정보">
                <Avatar>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" />
                  ) : (
                    <span>
                      {(formatKRPhone(phoneE164) || "").slice(-2) || "ME"}
                    </span>
                  )}
                </Avatar>
                <UserLabel>{userLabel}</UserLabel>
              </UserChip>
              <OutlineButton onClick={handleLogout}>로그아웃</OutlineButton>
            </>
          ) : (
            <>
              <OutlineLink to="/login" onClick={handleLogin}>
                로그인
              </OutlineLink>
              <PrimaryLink to="/signup" onClick={handleSignup}>
                회원가입
              </PrimaryLink>
            </>
          )}
        </Actions>
      </Inner>
    </Bar>

  );
}