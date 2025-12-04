/* eslint-disable */
// src/pages/mobile/AccountHomePage.jsx
// Withagit — 모바일 내설정 홈 (/m/account)

import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import fallbackAvatar from "../../assets/images/avatar_default.png";
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage";

/* ===== Storage helpers (avatarUrl: storage path → 실제 URL) ===== */

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

/* ===== Layout & Tokens ===== */

const Page = styled.main`
  min-height: 100dvh;
  background: #f8f9fb;
  padding: 16px 0 24px;
  box-sizing: border-box;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont,
    system-ui, "Segoe UI", "Noto Sans KR", sans-serif;
`;

const Container = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px;
`;

/* 상단 타이틀 */
const TopBar = styled.header`
  padding: 4px 0 16px;
`;

const TopTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #111827;
`;

/* 프로필 카드 */

const ProfileCard = styled.section`
  margin-top: 12px;
  padding: 16px 18px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
`;

/* 🔸 보더 제거, 은은한 배경만 */
const AvatarBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  overflow: hidden;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  display: block;
`;

const ProfileText = styled.div`
  flex: 1;
  display: grid;
  gap: 2px;
`;

const ProfileName = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #111827;
`;

const ProfileSub = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ProfileAction = styled.button`
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;

/* 메뉴 그룹 */

const SectionGroup = styled.section`
  margin-top: 28px;
`;

const SectionLabel = styled.div`
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
`;

/* 메뉴 아이템 */

const MenuList = styled.div`
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
  overflow: hidden;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 14px 18px;
  border: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }

  &:active {
    background: #f9fafb;
  }
`;

/* 단색 아이콘 */
const MenuIcon = styled.div`
  font-size: 18px;
  color: #9ca3af;
  flex-shrink: 0;
`;

const MenuText = styled.div`
  flex: 1;
  text-align: left;
`;

const MenuTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #111827;
`;

const MenuArrow = styled.div`
  font-size: 16px;
  color: #d1d5db;
`;

/* 하단 기타 */

const DangerList = styled.div`
  margin-top: 16px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
  overflow: hidden;
`;

const DangerItem = styled.button`
  width: 100%;
  padding: 11px 16px;
  border: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  cursor: pointer;
  color: ${(p) => (p.danger ? "#b91c1c" : "#4b5563")};

  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }

  &:active {
    background: #f9fafb;
  }
`;

const SmallHint = styled.div`
  margin-top: 8px;
  font-size: 11px;
  color: #9ca3af;
  text-align: right;
`;

/* ===== Helper ===== */

const onlyDigits = (s = "") => (s || "").replace(/\D+/g, "");

function formatKRPhone(raw) {
    if (!raw) return "";
    let d = onlyDigits(raw);
    if (d.startsWith("82")) d = "0" + d.slice(2);
    if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    if (d.length === 10) {
        if (d.startsWith("02")) {
            return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
        }
        return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    }
    return d;
}

/* ===== Main Component ===== */

export default function AccountHomePage() {
    const nav = useNavigate();
    const { initialized, phoneE164, profile, bootWithPhone } = useUser() || {};
    const isLoggedIn = !!phoneE164;

    const labelName = useMemo(() => {
        const n = (profile?.displayName || "").trim();
        if (n) return n;
        const digits = (phoneE164 || "").replace(/\D+/g, "");
        const last4 = digits.slice(-4);
        return last4 ? `${last4}님` : "내 계정";
    }, [profile?.displayName, phoneE164]);

    const labelPhone = useMemo(
        () => (phoneE164 ? formatKRPhone(phoneE164) : "로그인이 필요합니다."),
        [phoneE164]
    );

    const avatarUrl = useStorageUrl(
        profile?.avatarUrl || "",
        profile?.updatedAt
    );

    const handleLogout = () => {
        if (!isLoggedIn) {
            nav("/login");
            return;
        }
        if (!window.confirm("정말 로그아웃 하시겠어요?")) return;
        try {
            localStorage.removeItem("auth_dev_session");
        } catch {
            // ignore
        }
        bootWithPhone?.("");
        nav("/login", { replace: true });
    };

    const go = (path) => () => nav(path);

    if (!initialized) {
        return (
            <Page>
                <Container>
                    <TopBar>
                        <TopTitle>내 설정</TopTitle>
                    </TopBar>
                    <div
                        style={{
                            padding: "40px 0",
                            textAlign: "center",
                            color: "#6b7280",
                            fontSize: 13,
                        }}
                    >
                        불러오는 중…
                    </div>
                </Container>
            </Page>
        );
    }

    return (
        <Page>
            <Container>
                <TopBar>
                    <TopTitle>내 설정</TopTitle>
                </TopBar>

                {/* 프로필 카드 */}
                <ProfileCard>
                    <AvatarBox>
                        <AvatarImg
                            src={avatarUrl || fallbackAvatar}
                            alt="프로필"
                            onError={(e) => {
                                e.currentTarget.src = fallbackAvatar;
                            }}
                        />
                    </AvatarBox>
                    <ProfileText>
                        <ProfileName>{labelName}</ProfileName>
                        <ProfileSub>{labelPhone}</ProfileSub>
                    </ProfileText>
                    <ProfileAction
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            go("/m/account/profile")();
                        }}
                    >
                        프로필 수정
                    </ProfileAction>
                </ProfileCard>

                {/* 내 계정 */}
                <SectionGroup>
                    <SectionLabel>내 계정</SectionLabel>
                    <MenuList>
                        <MenuItem onClick={go("/m/account/children")}>
                            
                            <MenuText>
                                <MenuTitle>자녀 정보 관리</MenuTitle>
                            </MenuText>
                            <MenuArrow>›</MenuArrow>
                        </MenuItem>

                        <MenuItem onClick={go("/m/account/memberships")}>
                       
                            <MenuText>
                                <MenuTitle>내 멤버십</MenuTitle>
                            </MenuText>
                            <MenuArrow>›</MenuArrow>
                        </MenuItem>
                    </MenuList>
                </SectionGroup>

                {/* 이용 / 예약 (위로 올림) */}
                <SectionGroup>
                    <SectionLabel>이용 · 결제 · 예약 내역</SectionLabel>
                    <MenuList>
                        <MenuItem onClick={go("/m/account/payments")}>
                          
                            <MenuText>
                                <MenuTitle>결제 내역</MenuTitle>
                            </MenuText>
                            <MenuArrow>›</MenuArrow>
                        </MenuItem>

                        <MenuItem onClick={go("/m/account/usage")}>
                          
                            <MenuText>
                                <MenuTitle>이용 내역</MenuTitle>
                            </MenuText>
                            <MenuArrow>›</MenuArrow>
                        </MenuItem>

                        <MenuItem onClick={go("/m/account/pickups")}>
                          
                            <MenuText>
                                <MenuTitle>픽업 신청 내역</MenuTitle>
                            </MenuText>
                            <MenuArrow>›</MenuArrow>
                        </MenuItem>

                        <MenuItem onClick={go("/m/account/programs")}>
                        
                            <MenuText>
                                <MenuTitle>프로그램 예약 내역</MenuTitle>
                            </MenuText>
                            <MenuArrow>›</MenuArrow>
                        </MenuItem>
                    </MenuList>
                </SectionGroup>

                {/* 서비스 안내 (아래로 내리고 FAQ 추가) */}
                <SectionGroup>
                    <SectionLabel>서비스 안내</SectionLabel>
                    <MenuList>
                        <MenuItem onClick={go("/space")}>
                         
                            <MenuText>
                                <MenuTitle>아지트 지점 소개</MenuTitle>
                            </MenuText>
                            <MenuArrow>›</MenuArrow>
                        </MenuItem>
{/* 
                        <MenuItem onClick={go("/m/faq")}>
                     
                            <MenuText>
                                <MenuTitle>아지트 FAQ</MenuTitle>
                            </MenuText>
                            <MenuArrow>›</MenuArrow>
                        </MenuItem> */}

                        <MenuItem onClick={go("/m/account/news")}>
                        
                            <MenuText>
                                <MenuTitle>아지트 소식 문의</MenuTitle>
                            </MenuText>
                            <MenuArrow>›</MenuArrow>
                        </MenuItem>
                    </MenuList>
                </SectionGroup>

                {/* 기타 / 로그아웃 */}
                <SectionGroup>
                    <SectionLabel>기타</SectionLabel>
                    <DangerList>
                        <DangerItem onClick={handleLogout} danger={isLoggedIn}>
                            <span>{isLoggedIn ? "로그아웃" : "로그인하기"}</span>
                        </DangerItem>
                        <DangerItem onClick={() => nav("/terms")}>
                            <span>이용약관 · 개인정보처리방침</span>
                        </DangerItem>
                    </DangerList>
                    <SmallHint>
                        withagit 서비스 설정은 여기에서 관리할 수 있어요.
                    </SmallHint>
                </SectionGroup>
            </Container>
        </Page>
    );
}
