/* eslint-disable */
// src/pages/MyPage/index.jsx
// Withagit PC 웹 — 마이페이지 v2 (DEFINE v5 스키마 반영)

import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

/* ===== Firestore direct (usage/취소/예약 조회만 직접) ===== */
import { db } from "../../services/api";
import { collection, getDocs, query, where, orderBy, limit as qlimit } from "firebase/firestore";

/* ===== Firebase Storage (아바타/자녀사진 업로드 & URL 변환) ===== */
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";

/* ===== 공통 정의 ===== */
import { ORDER_STATUS, RESERVATION_STATUS, RESERVATION_QUERY } from "../../constants/defs";
import {
    MEMBERSHIP_KIND,
    MEMBERSHIP_STATUS,
    MEMBERSHIP_LABEL,
    MEMBERSHIP_COLOR,
    MEMBERSHIP_STATUS_LABEL,
} from "../../constants/membershipDefine";

/* ===== 서비스 ===== */
import { saveProfile, upsertChild, deleteChild, setProfileAvatarFromFile } from "../../services/memberService";
import { fmtDateTime } from "../../utils/date";
import { listMemberships } from "../../services/membershipService";
import { listMemberOrders, listProgramOrders } from "../../services/orderService";

/* ===================== Layout ===================== */
const Page = styled.main`
  min-height: 100dvh;
  background: #f8f9fb;
  color: #111827;
  padding: 24px 0 32px;
  box-sizing: border-box;
`;

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;


const Panel = styled.aside`
  display: flex;
  flex-direction: column;
  padding-top: 24px;   /* ← 탭 pill와 메인 카드 시작 라인 맞추도록 약간만 */
`;

/* Header: 아래 가로 라인 제거 */
const StickyHead = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  padding: 18px 24px 16px;
  /* border-bottom 제거 */
`;

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
`;





/* Left: nav only */
const Nav = styled.nav`
  display: grid;
  gap: 28px;
`;

const NavGroupTitle = styled.div`
  margin: 0 4px 8px;
  font-size: 13px;
  color: #b0b0b0;
  font-weight: 600;
`;

/* 피그마 톤: 활성 pill, 비활성 얇은 회색 텍스트 */
const NavBtn = styled.button`
  width: 100%;
  text-align: center;
  justify-content:center;
  padding: 12px 20px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  background: ${({ active }) => (active ? "#e86a20" : "transparent")};
  color: ${({ active }) => (active ? "#ffffff" : "#b3b3b3")};

  font-size: 15px;
  font-weight: 700;

  display: flex;
  align-items: center;
  gap: 10px;

  transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;

  &:hover {
    ${({ active }) =>
        active
            ? "background:#de5f15;"
            : "color:#909090; background:transparent;"}
  }

  &:active {
    transform: translateY(1px);
  }
`;

/* Main 카드 */
const Main = styled.section`
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  padding: 0;
  display: grid;
  grid-template-rows: auto 1fr;
`;

/* Avatar 카드(지금은 사용 안 하지만 남겨둠) */
const ProfileCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 20px 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  text-align: center;
  display: grid;
  gap: 12px;
`;

const AvatarBtn = styled.button`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 0;
  outline: none;
  cursor: pointer;
  background: #e5e7eb;
  margin: 0 auto;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #6b7280;
  font-size: 28px;
  overflow: hidden;
  transition: transform 0.08s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(0.98);
  }
  &:active {
    transform: translateY(1px);
  }
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Name = styled.div`
  font-weight: 800;
  font-size: 18px;
`;


/* Summary는 라인 없애기 위해 사용 안 함 */
const Summary = styled.section`
  display: none;
`;

/* Membership cards */
const MembershipCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;

const kindCss = {
    agitz: css`
        background: #f0fff4;          /* 연한 초록 단색 */
        border-color: #c7f9cc;
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.08);
    `,
    family: css`
        background: #fff7ed;          /* 연한 주황 단색 */
        border-color: #fbd6a8;
        box-shadow: 0 8px 20px rgba(234, 88, 12, 0.08);
    `,
    timepass: css`
        background: #eff6ff;          /* 연한 파랑 단색 */
        border-color: #bfdbfe;
        box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
    `,
    cashpass: css`
        background: #ecfeff;          /* 연한 청록 단색 */
        border-color: #a5f3fc;
        box-shadow: 0 8px 20px rgba(14, 116, 144, 0.08);
    `,
};

const MCard = styled.div`
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;

  ${({ $kind }) => $kind && kindCss[$kind]};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
    filter: brightness(1.01);
  }
`;

const MTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;
const MTitle = styled.div`
  font-weight: 800;
`;
const Tag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ color }) => color || "#374151"};
  background: ${({ bg }) => bg || "#f3f4f6"};
`;
const MLine = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
`;
const Key = styled.span`
  color: #6b7280;
`;

/* Content / Controls */
const Content = styled.div`
  padding: 20px 24px 24px;
  display: grid;
  gap: 20px;
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eef0f4;
  border-radius: 14px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;

  thead th {
    text-align: left;
    background: #fbfcff;
    color: #6b7280;
    font-weight: 700;
    padding: 12px 14px;
    border-bottom: 1px solid #eef0f4;
  }
  tbody td {
    padding: 14px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
`;

const RowBlock = styled.div`
  display: grid;
  gap: 14px;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Grid3 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 0 12px;
  font-size: 14px;
  &:focus {
    outline: 2px solid rgba(17, 24, 39, 0.12);
  }
`;

const Select = styled.select`
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 0 12px;
  font-size: 14px;
  background: #fff;
  &:focus {
    outline: 2px solid rgba(17, 24, 39, 0.12);
  }
`;

const Label = styled.label`
  font-size: 13px;
  color: #6b7280;
  font-weight: 700;
`;

const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const Bar = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
`;

const Btn = styled.button`
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${({ outline }) => (outline ? "#e5e7eb" : "transparent")};
  background: ${({ outline }) => (outline ? "#fff" : "#E47B2C")};
  color: ${({ outline }) => (outline ? "#374151" : "#fff")};
  font-weight: 800;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ThumbWrap = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  overflow: hidden;
  background: #eef2f6;
  display: grid;
  place-items: center;
  color: #6b7280;
  font-size: 12px;
  user-select: none;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const NameCell = styled.td`
  width: clamp(180px, 22vw, 240px);
`;


/* Utils */
const won = (n) => `₩${Number(n || 0).toLocaleString()}`;
const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => thisYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const daysInMonth = (y, m) => new Date(y, m, 0).getDate();

const calcAge = (y, m, d) => {
    if (!y || !m || !d) return "";
    const today = new Date();
    const birth = new Date(Number(y), Number(m) - 1, Number(d));
    let age = today.getFullYear() - birth.getFullYear();
    const mm = today.getMonth() - birth.getMonth();
    if (mm < 0 || (mm === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? `만 ${age}세` : "";
};

const pad2 = (n) => String(n).padStart(2, "0");

const normGender = (g) => {
    const s = String(g || "").trim().toLowerCase();
    if (["female", "여", "여자", "woman", "f"].includes(s)) return "여자";
    if (["male", "남", "남자", "man", "m"].includes(s)) return "남자";
    return "";
};

const fmtExclusiveEnd = (exclusiveMs) => {
    if (!exclusiveMs) return "-";
    const ms = Number(exclusiveMs);
    if (!Number.isFinite(ms)) return "-";
    return fmtDateTime(ms - 1000);
};

/* Storage helpers */
const storage = getStorage();
const isStoragePath = (v) =>
    typeof v === "string" && v && !/^https?:\/\//i.test(v) && !/^data:/i.test(v);

async function pathToUrl(path) {
    if (!path) return "";
    if (!isStoragePath(path)) return path;
    try {
        return await getDownloadURL(storageRef(storage, path));
    } catch {
        return "";
    }
}

function isDataUrl(v) {
    return typeof v === "string" && v.startsWith("data:");
}

function safeText(v) {
    if (!v) return v;
    if (typeof v === "string" && v.length > 500_000)
        throw new Error("텍스트가 너무 깁니다. 이미지 업로드로 처리해야 합니다.");
    return v;
}

async function ensureStoragePathFromDataUrl(dataUrl, { phoneE164, kind = "avatars", name = "file" }) {
    if (!isDataUrl(dataUrl)) return safeText(dataUrl);
    const ts = Date.now();
    const path = `${kind}/${encodeURIComponent(phoneE164)}/${name}_${ts}.jpg`;
    const r = storageRef(storage, path);
    await uploadString(r, dataUrl, "data_url");
    return path;
}

function ChildPhoto({ path, size = 48, alt = "" }) {
    const [url, setUrl] = React.useState("");
    React.useEffect(() => {
        let dead = false;
        (async () => {
            const u = await pathToUrl(path);
            if (!dead) setUrl(u);
        })();
        return () => {
            dead = true;
        };
    }, [path]);
    if (!url) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: 12,
                    background: "#e5e7eb",
                    border: "1px solid #e5e7eb",
                }}
            />
        );
    }
    return (
        <img
            src={url}
            alt={alt}
            width={size}
            height={size}
            style={{
                width: size,
                height: size,
                borderRadius: 12,
                objectFit: "cover",
                background: "#e5e7eb",
            }}
            onError={(e) => {
                e.currentTarget.src = "";
            }}
        />
    );
}

// Storage → URL 훅
function useStorageUrl(path, bustKey) {
    const [url, setUrl] = React.useState("");
    React.useEffect(() => {
        let dead = false;
        (async () => {
            try {
                const u = await pathToUrl(path);
                if (dead) return;
                if (!u) {
                    setUrl("");
                    return;
                }
                const sep = u.includes("?") ? "&" : "?";
                const bust = bustKey ? `${sep}v=${encodeURIComponent(String(bustKey))}` : "";
                setUrl(u + bust);
            } catch {
                if (!dead) setUrl(typeof path === "string" ? path : "");
            }
        })();
        return () => {
            dead = true;
        };
    }, [path, bustKey]);
    return url;
}

function AvatarPhoto({ path, size = 88, alt = "", bust }) {
    const url = useStorageUrl(path, bust);

    const [failed, setFailed] = React.useState(false);
    if (!url || failed) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: "#e5e7eb",
                    border: "1px solid #e5e7eb",
                    display: "grid",
                    placeItems: "center",
                    color: "#6b7280",
                    fontWeight: 800,
                }}
                aria-label="avatar-fallback"
            />
        );
    }
    return (
        <img
            src={url}
            alt={alt}
            width={size}
            height={size}
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                objectFit: "cover",
                background: "#e5e7eb",
            }}
            onError={() => setFailed(true)}
        />
    );
}

/* ===================== 전화번호 유틸 ===================== */

function normalizePhoneKR(e164orLocal) {
    if (!e164orLocal) return "";
    let d = String(e164orLocal).replace(/\D+/g, "");
    if (d.startsWith("82")) d = "0" + d.slice(2);
    return d;
}

function formatLocalPhone(digits) {
    if (!digits) return "";
    let d = digits.replace(/\D+/g, "");
    if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    if (d.length === 10) {
        if (d.startsWith("02")) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
        return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    }
    if (d.length > 7) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    return d;
}

/* 화면 표기용: +821062149756 → 01062149756 */
function formatPhoneNoDash(input) {
    if (!input) return "";
    let digits = String(input).replace(/\D+/g, "");
    if (digits.startsWith("82")) digits = "0" + digits.slice(2);
    return digits;
}




const EmptyInfo = ({ text }) => (
    <div
        style={{
            border: "1px dashed #e5e7eb",
            background: "#fbfcff",
            color: "#6b7280",
            borderRadius: 14,
            padding: "14px 12px",
        }}
    >
        {text}
    </div>
);





const SmallBtn = styled.button`
  height: 30px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.danger ? "#ef4444" : "#e5e7eb")};
  background: #fff;
  color: ${(p) => (p.danger ? "#b91c1c" : "#374151")};
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: ${(p) => (p.danger ? "#fee2e2" : "#f9fafb")};
  }
`;

/* ===== Menu & Tab Info ===== */
const TAB_INFO = {
    profile: { title: "내 정보" },
    child: { title: "등록된 자녀" },   // ✅ 1) 자녀 탭 타이틀 변경
    payments: { title: "결제 내역" },
    usage: { title: "이용 내역" },
    pickups: { title: "픽업 신청 내역" },
    cancels: { title: "취소 내역" },
    reserves: { title: "프로그램 예약 내역" },
};

/* ===== 자녀 정보 카드용 Info 그리드 ===== */

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  row-gap: 6px;
  column-gap: 10px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5; /* ✅ 6) line-height */
`;
const InfoKey = styled.span`
  color: #9ca3af;
`;
const InfoVal = styled.span`
  color: #111827;
  word-break: keep-all;
  white-space: nowrap;          /* ✅ 5) 연락처 한 줄 유지 */
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* ===================== 저장된 자녀 카드 그리드 ===================== */

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  position: relative;
  border-radius: 24px;
  padding: 20px 20px 18px;
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 16px;
  align-items: flex-start;
  background: #ffffff;
  border: 1px solid #f1f3f7;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  cursor: pointer;
`;

const CardMeta = styled.div`
  display: grid;
  gap: 6px;
`;

const CardName = styled.div`
  font-weight: 800;
  font-size: 15px;
  color: #111827;
`;

const CardSub = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const CardAct = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

const CardEditLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  color: #9ca3af;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    color: #111827;
  }
`;

const CardDeleteBtn = styled.button`
  border: 1px solid #ef4444;
  border-radius: 999px;
  background: #fff;
  color: #b91c1c;
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;

  &:hover {
    background: #fee2e2;
  }
`;

/**
 * onSelect(child): 카드 클릭/수정 클릭 시 호출 (수정 모드로 진입)
 */
function SavedChildrenGrid({ items = [], onDelete, onSelect }) {
    const fPhone = (v) => {
        if (!v) return "";
        let d = String(v).replace(/\D+/g, "");
        if (d.startsWith("82")) d = "0" + d.slice(2);
        if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
        if (d.length === 10) {
            if (d.startsWith("02")) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
            return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
        }
        if (d.length > 7) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
        return d;
    };

    const ageFromBirth = (birth) => {
        if (!birth) return "";
        const parts = String(birth).split("-");
        const y = parts[0];
        const m = parts[1];
        const d = parts[2];
        if (!(y && m && d)) return "";
        const today = new Date();
        const b = new Date(Number(y), Number(m) - 1, Number(d));
        let age = today.getFullYear() - b.getFullYear();
        const mm = today.getMonth() - b.getMonth();
        if (mm < 0 || (mm === 0 && today.getDate() < b.getDate())) age--;
        return age >= 0 ? `만 ${age}세` : "";
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}
            >
                <strong>등록된 자녀</strong>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{items.length}명</span>
            </div>

            <Cards>
                {items.map((c) => {
                    const contact = fPhone(c.contactPhone);
                    const gender =
                        (c.gender === "male" && "남자") ||
                        (c.gender === "female" && "여자") ||
                        "";

                    return (
                        <Card
                            key={c.childId}
                            onClick={() => {
                                onSelect && onSelect(c); // 카드 전체 클릭 → 수정 모드 진입
                            }}
                        >
                            <ChildPhoto path={c.avatarUrl || c.photo} size={64} alt={c.name} />

                            <CardMeta>
                                <CardName>{c.name || "-"}</CardName>
                                <CardSub>
                                    {gender ? `${gender} · ` : ""}
                                    {c.birth || "-"}
                                    {ageFromBirth(c.birth) ? ` · ${ageFromBirth(c.birth)}` : ""}
                                </CardSub>

                                <InfoGrid>
                                    <InfoKey>학교</InfoKey>
                                    <InfoVal>{c.school || "-"}</InfoVal>

                                    <InfoKey>학년/반</InfoKey>
                                    <InfoVal>
                                        {(c.grade || "") && (c.classroom || "")
                                            ? `${c.grade} / ${c.classroom}`
                                            : "-"}
                                    </InfoVal>

                                    <InfoKey>연락처</InfoKey>
                                    <InfoVal>{contact || "-"}</InfoVal>
                                </InfoGrid>
                            </CardMeta>

                            {/* 우측 상단 액션 영역 */}
                            <CardAct
                                onClick={(e) => {
                                    e.stopPropagation(); // 수정/삭제 클릭 시 카드 클릭 버블 막기
                                }}
                            >
                                {/* <CardEditLink type="button" onClick={() => onSelect && onSelect(c)}>
                                    수정하기 &gt;
                                </CardEditLink> */}
                                <CardDeleteBtn
                                    type="button"
                                    onClick={() => {
                                        const label = c.name || c.childId || "해당 자녀";
                                        if (
                                            window.confirm(
                                                `정말 '${label}'을(를) 삭제할까요?\n삭제 후 되돌릴 수 없습니다.`
                                            )
                                        ) {
                                            onDelete && onDelete(c);
                                        }
                                    }}
                                >
                                    삭제
                                </CardDeleteBtn>
                            </CardAct>
                        </Card>
                    );
                })}

                {items.length === 0 && (
                    <div
                        style={{
                            padding: "16px 12px",
                            borderRadius: 24,
                            border: "1px dashed #e5e7eb",
                            background: "#fbfcff",
                            color: "#6b7280",
                        }}
                    >
                        등록된 자녀가 없습니다. 아래에서 추가해 주세요.
                    </div>
                )}
            </Cards>
        </div>
    );
}


/* ===================== 자녀 추가/수정 카드 (사진 왼쪽 + 폼 오른쪽) ===================== */

const CardAdd = styled.div`
  position: relative;
  border-radius: 24px;
  border: 1px solid #f1f3f7;
  padding: 24px 24px 20px;
  background: #ffffff;
  display: grid;
  grid-template-columns: 160px 1fr;
  column-gap: 24px;
  row-gap: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const RowFlex = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const RowFlex3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const PhotoBox = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 24px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
  cursor: pointer;
`;

/**
 * mode: 'create' | 'edit'
 * model: { id, name, gender, birthYear, birthMonth, birthDay, school, grade, classroom, photo, contactPhone }
 */
function ChildAddCard({ mode, model, onChange, onPickPhoto, onRemove }) {
    const isEdit = mode === "edit";
    const maxDay =
        model.birthYear && model.birthMonth
            ? daysInMonth(Number(model.birthYear), Number(model.birthMonth))
            : 31;
    const fileId = `child-photo-${model.id}`;

    const title = isEdit ? "자녀 정보 수정하기" : "자녀 정보 입력";

    return (
        <CardAdd>
            {/* 사진 업로드 */}
            <div>
                <PhotoBox
                    onClick={() => document.getElementById(fileId)?.click()}
                    title="사진 등록하기"
                >
                    {model.photo ? (
                        <ChildPhoto path={model.photo} size={160} alt={model.name || ""} />
                    ) : (
                        <span>사진 등록하기</span>
                    )}
                </PhotoBox>
                <input
                    id={fileId}
                    type="file"
                    accept="image/*"
                    onChange={onPickPhoto}
                    style={{ display: "none" }}
                />
            </div>

            {/* 폼 영역 */}
            <div style={{ display: "grid", gap: 18 }}>
                {/* 타이틀 + (추가 모드에서만 삭제 버튼) */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                        {title}
                    </div>
                    {/* {!isEdit && (
                        <button
                            type="button"
                            onClick={onRemove}
                            style={{
                                minWidth: 56,
                                height: 32,
                                borderRadius: 999,
                                border: "1px solid #ef4444",
                                background: "#fff",
                                color: "#b91c1c",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            삭제
                        </button>
                    )} */}
                </div>

                {/* 이름 + 성별 */}
                <RowFlex>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)",
                            gap: 16,
                            alignItems: "flex-end",
                        }}
                    >
                        <Field>
                            <Label>
                                이름<span style={{ color: "#ef4444" }}>*</span>
                            </Label>
                            <Input
                                value={model.name}
                                onChange={(e) => {
                                    if (!isEdit) {
                                        onChange({ name: e.target.value });
                                    }
                                }}
                                readOnly={isEdit} // ✅ 수정 모드에서는 이름 잠금
                                placeholder="예: 김하늘"
                            />
                        </Field>

                        <Field>
                            <Label>
                                성별<span style={{ color: "#ef4444" }}>*</span>
                            </Label>
                            <div style={{ display: "flex", gap: 16, paddingTop: 10 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input
                                        type="radio"
                                        name={`gender-${model.id}`}
                                        value="male"
                                        checked={model.gender === "male"}
                                        onChange={() => onChange({ gender: "male" })}
                                    />
                                    <span>남</span>
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input
                                        type="radio"
                                        name={`gender-${model.id}`}
                                        value="female"
                                        checked={model.gender === "female"}
                                        onChange={() => onChange({ gender: "female" })}
                                    />
                                    <span>여</span>
                                </label>
                            </div>
                        </Field>
                    </div>
                </RowFlex>

                {/* 출생 년월일 */}
                <RowFlex3>
                    <Field>
                        <Label>
                            출생연도<span style={{ color: "#ef4444" }}>*</span>
                        </Label>
                        <Select
                            value={model.birthYear}
                            onChange={(e) => onChange({ birthYear: e.target.value })}
                        >
                            <option value="">연도</option>
                            {YEARS.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field>
                        <Label>
                            월<span style={{ color: "#ef4444" }}>*</span>
                        </Label>
                        <Select
                            value={model.birthMonth}
                            onChange={(e) => onChange({ birthMonth: e.target.value })}
                        >
                            <option value="">월</option>
                            {MONTHS.map((m) => (
                                <option key={m} value={pad2(m)}>
                                    {m}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field>
                        <Label>
                            일<span style={{ color: "#ef4444" }}>*</span>
                        </Label>
                        <Select
                            value={model.birthDay}
                            onChange={(e) => onChange({ birthDay: e.target.value })}
                        >
                            <option value="">일</option>
                            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                                <option key={d} value={pad2(d)}>
                                    {d}
                                </option>
                            ))}
                        </Select>
                    </Field>
                </RowFlex3>

                {/* 학교 / 학년 / 반 */}
                <RowFlex3>
                    <Field>
                        <Label>
                            학교<span style={{ color: "#ef4444" }}>*</span>
                        </Label>
                        <Input
                            value={model.school}
                            onChange={(e) => onChange({ school: e.target.value })}
                            placeholder="예: 수지초등학교"
                        />
                    </Field>
                    <Field>
                        <Label>
                            학년<span style={{ color: "#ef4444" }}>*</span>
                        </Label>
                        <Input
                            value={model.grade}
                            onChange={(e) => onChange({ grade: e.target.value })}
                            placeholder="예: 4학년"
                        />
                    </Field>
                    <Field>
                        <Label>
                            반<span style={{ color: "#ef4444" }}>*</span>
                        </Label>
                        <Input
                            value={model.classroom}
                            onChange={(e) => onChange({ classroom: e.target.value })}
                            placeholder="예: 1반"
                        />
                    </Field>
                </RowFlex3>

                {/* 자녀 연락처 */}
                <RowFlex>
                    <Field>
                        <Label>자녀 연락처 (선택)</Label>
                        <Input
                            value={formatLocalPhone(normalizePhoneKR(model.contactPhone || ""))}
                            onChange={(e) =>
                                onChange({ contactPhone: normalizePhoneKR(e.target.value) })
                            }
                            placeholder="예: 010-1234-5678"
                        />
                    </Field>
                </RowFlex>
            </div>
        </CardAdd>
    );
}
/**
 * 자녀 추가/수정 폼
 * mode: 'create' | 'edit'
 * editingChild: 수정할 자녀 객체 (SavedChildrenGrid에서 넘겨줌)
 * onSaved: 저장 후 상위에서 리프레시 + editing 상태 리셋용
 * onCancelEdit: 수정 취소 시 호출 (editingChild 초기화)
 * onSaveProfile: 저장 전 부모 프로필 저장 필요할 때 호출
 */
function ChildrenAddCards({
    phoneE164,
    mode = "create",
    editingChild = null,
    onSaved,
    onCancelEdit,
    onSaveProfile,
}) {
    const isEdit = mode === "edit";

    const makeBlank = () => ({
        id: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: "",
        gender: "male",
        birthYear: "",
        birthMonth: "",
        birthDay: "",
        school: "",
        grade: "",
        classroom: "",
        photo: "",
        contactPhone: "",
    });

    const [model, setModel] = useState(makeBlank);

    // mode / editingChild 변경될 때 폼 초기화
    useEffect(() => {
        if (isEdit && editingChild) {
            const birthStr = editingChild.birth || "";
            const parts = String(birthStr).split("-");
            const by = parts[0] || "";
            const bm = parts[1] || "";
            const bd = parts[2] || "";

            setModel({
                id: editingChild.childId || editingChild.id || `edit_${Date.now()}`,
                name: editingChild.name || "",
                gender: editingChild.gender || "male",
                birthYear: by,
                birthMonth: bm,
                birthDay: bd,
                school: editingChild.school || "",
                grade: editingChild.grade || "",
                classroom: editingChild.classroom || "",
                photo: editingChild.photo || editingChild.avatarUrl || "",
                contactPhone: editingChild.contactPhone || "",
            });
        } else {
            setModel(makeBlank());
        }
    }, [isEdit, editingChild]);

    const [saving, setSaving] = useState(false);

    const change = (patch) => {
        setModel((m) => ({ ...m, ...patch }));
    };

    const handlePickPhoto = (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const fr = new FileReader();
        fr.onload = () => {
            change({ photo: fr.result });
        };
        fr.readAsDataURL(f);
    };

    const handleSave = async () => {
        if (!phoneE164) {
            alert("로그인이 필요합니다.");
            return;
        }

        const check = validateChildRow(model);
        if (!check.ok) {
            alert(`필수 항목이 비었습니다.\n누락: ${check.missing.join(", ")}`);
            return;
        }

        setSaving(true);
        try {
            if (typeof onSaveProfile === "function") {
                await onSaveProfile();
            }

            let childPhoto = model.photo || "";
            if (isDataUrl(childPhoto)) {
                childPhoto = await ensureStoragePathFromDataUrl(childPhoto, {
                    phoneE164,
                    kind: "children",
                    name: model.name || "child",
                });
            } else {
                safeText(childPhoto);
            }

            const birth = `${model.birthYear}-${pad2(model.birthMonth)}-${model.birthDay}`;

            await upsertChild(phoneE164, {
                childId: model.id && !model.id.startsWith("tmp_") ? model.id : undefined,
                name: (model.name || "").trim(),
                gender: (model.gender || "").trim(),
                birth,
                photo: childPhoto,
                school: (model.school || "").trim(),
                grade: (model.grade || "").trim(),
                classroom: (model.classroom || "").trim(),
                contactPhone: normalizePhoneKR(model.contactPhone || ""),
            });

            if (onSaved) {
                await onSaved();
            }

            setModel(makeBlank());
            alert(isEdit ? "자녀 정보가 수정되었습니다." : "자녀 정보가 저장되었습니다.");
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <RowBlock style={{ marginTop: 24 }}>
            <Label style={{ fontSize: 14, color: "#374151", fontWeight: 800 }}>
                자녀 추가
            </Label>

            <ChildAddCard
                mode={mode}
                model={model}
                onChange={change}
                onPickPhoto={handlePickPhoto}
                onRemove={() => setModel(makeBlank())}
            />

            <Bar style={{ justifyContent: "flex-end", marginTop: 8 }}>
                {isEdit ? (
                    <>
                        <Btn type="button" outline onClick={onCancelEdit} disabled={saving}>
                            취소
                        </Btn>
                        <Btn type="button" onClick={handleSave} disabled={saving}>
                            {saving ? "수정 중…" : "수정 완료"}
                        </Btn>
                    </>
                ) : (
                    <>
                        <Btn type="button" outline onClick={() => setModel(makeBlank())}>
                            + 자녀 추가
                        </Btn>
                        <Btn
                            type="button"
                            onClick={handleSave}
                            disabled={
                                saving ||
                                !model.name ||
                                !model.gender ||
                                !model.birthYear ||
                                !model.birthMonth ||
                                !model.birthDay ||
                                !model.school ||
                                !model.grade ||
                                !model.classroom ||
                                !model.photo
                            }
                        >
                            {saving ? "저장 중…" : "저장"}
                        </Btn>
                    </>
                )}
            </Bar>
        </RowBlock>
    );
}



/* === Child delete guard === */
async function hasBlockingMembership(phoneE164, childId) {
    try {
        const memCol = collection(db, "members", phoneE164, "memberships");
        const q1 = query(
            memCol,
            where("childId", "==", childId),
            where("status", "in", ["active", "future", "pending"]),
            qlimit(1)
        );
        const snap1 = await getDocs(q1);
        if (!snap1.empty)
            return {
                block: true,
                reason: "현재 진행 중인 멤버십이 연결되어 있습니다.",
            };

        const q2 = query(
            memCol,
            where("childId", "==", childId),
            qlimit(50)
        );
        const snap2 = await getDocs(q2);
        let hasRemain = false;
        snap2.forEach((d) => {
            const v = d.data() || {};
            if (v.kind === "timepass" && Number(v.remainMinutes || 0) > 0)
                hasRemain = true;
            if (v.kind === "cashpass" && Number(v.remainKRW || 0) > 0)
                hasRemain = true;
        });
        if (hasRemain)
            return {
                block: true,
                reason: "남은 시간권/정액권이 있어 삭제할 수 없습니다.",
            };

        return { block: false };
    } catch (e) {
        console.error("[hasBlockingMembership] error:", e);
        return {
            block: true,
            reason: "연결 상태 확인 중 오류가 발생했습니다.",
        };
    }
}

/* ===================== child row validation ===================== */
function validateChildRow(c) {
    const missing = [];
    const isNonEmpty = (v) =>
        typeof v === "string" ? v.trim().length > 0 : !!v;
    if (!isNonEmpty(c.name)) missing.push("이름");
    if (!isNonEmpty(c.gender)) missing.push("성별");
    const hasBirth =
        isNonEmpty(c.birthYear) &&
        isNonEmpty(c.birthMonth) &&
        isNonEmpty(c.birthDay);
    if (!hasBirth) missing.push("생년월일");
    if (!isNonEmpty(c.school)) missing.push("학교");
    if (!isNonEmpty(c.grade)) missing.push("학년");
    if (!isNonEmpty(c.classroom)) missing.push("반");
    if (!isNonEmpty(c.photo)) missing.push("사진");

    return { ok: missing.length === 0, missing };
}

/* ===================== Profile / Child / Membership Section ===================== */

/* ===================== 프로필/자녀 + 멤버십 카드 섹션 ===================== */
function ProfileEditSection({ phoneE164, initName, ctxChildren, onRefetch, mode = "profile" }) {
    const { profile: userProfile } = useUser() || {};

    const [memberships, setMemberships] = useState([]);
    const [msLoading, setMsLoading] = useState(false);

    const [savedChildren, setSavedChildren] = useState(() => ctxChildren || []);

    useEffect(() => {
        setSavedChildren(ctxChildren || []);
    }, [ctxChildren]);

    const [form, setForm] = useState({
        firstName: initName || "",
        gender: userProfile?.gender || "male",
        phone: phoneE164 || "",
        email: userProfile?.email || "",
    });

    useEffect(() => {
        setForm((s) => ({
            ...s,
            firstName: initName || s.firstName || "",
            gender: userProfile?.gender || s.gender || "male",
            phone: phoneE164 || s.phone || "",
            email: userProfile?.email || s.email || "",
        }));
    }, [initName, userProfile?.gender, userProfile?.email, phoneE164]);


    const [editingChild, setEditingChild] = useState(null);

    const onChange = (k) => (e) =>
        setForm((s) => ({ ...s, [k]: e.target.value }));

    const refetchMemberships = async () => {
        if (!phoneE164) return;
        setMsLoading(true);
        try {
            const rows = await listMemberships(phoneE164, 100);
            setMemberships(rows);
        } finally {
            setMsLoading(false);
        }
    };

    const handleSelectChild = (child) => {
        setEditingChild(child);
        // 수정폼 보이는 위치로 스크롤 내려주기 (옵션)
        setTimeout(() => {
            const el = document.getElementById("children-edit-section");
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 0);
    };


    useEffect(() => {
        refetchMemberships();
    }, [phoneE164]);

    const cashpasses = useMemo(
        () => memberships.filter((m) => m.kind === MEMBERSHIP_KIND.CASHPASS),
        [memberships]
    );

    const cashpassByChild = useMemo(() => {
        const map = new Map();
        for (const cp of cashpasses) {
            const cid = cp.childId || "__none__";
            const prev = map.get(cid) || { krw: 0, count: 0, nearestExpire: null };
            const amt = Number(cp.remainKRW ?? cp.balanceKRW ?? 0);
            const exp = cp.expiresAt ? Number(cp.expiresAt) : null;

            prev.krw += isNaN(amt) ? 0 : amt;
            prev.count += 1;
            if (exp) prev.nearestExpire = prev.nearestExpire ? Math.min(prev.nearestExpire, exp) : exp;

            map.set(cid, prev);
        }
        return map;
    }, [cashpasses]);

    /* 이름/이메일 개별 저장 */
    const [savingName, setSavingName] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);

    const handleSaveName = async () => {
        if (!phoneE164) {
            alert("로그인이 필요합니다.");
            return;
        }
        setSavingName(true);
        try {
            await saveProfile(phoneE164, {
                displayName: (form.firstName || "").trim(),
                updatedAt: Date.now(),
            });
            await onRefetch?.();
            alert("이름이 저장되었습니다.");
        } catch (e) {
            console.error(e);
            alert("이름 저장 중 오류가 발생했습니다.");
        } finally {
            setSavingName(false);
        }
    };

    const handleSaveEmail = async () => {
        if (!phoneE164) {
            alert("로그인이 필요합니다.");
            return;
        }
        setSavingEmail(true);
        try {
            await saveProfile(phoneE164, {
                email: (form.email || "").trim(),
                updatedAt: Date.now(),
            });
            await onRefetch?.();
            alert("이메일이 저장되었습니다.");
        } catch (e) {
            console.error(e);
            alert("이메일 저장 중 오류가 발생했습니다.");
        } finally {
            setSavingEmail(false);
        }
    };

    /* 자녀 삭제 가드 */
    const handleDeleteFromCard = async (c) => {
        if (!phoneE164) {
            alert("로그인이 필요합니다.");
            return;
        }
        const childId = String(c.childId || "").trim();
        if (!childId) {
            alert("잘못된 자녀 ID입니다.");
            return;
        }

        const guard = await hasBlockingMembership(phoneE164, childId);
        if (guard.block) {
            alert(guard.reason || "연결된 멤버십/정액권 상태 때문에 삭제할 수 없습니다.");
            return;
        }

        try {
            await deleteChild(phoneE164, childId);
            setSavedChildren((prev) => prev.filter((x) => x.childId !== childId));
            await onRefetch?.();
            await refetchMemberships();
            alert("자녀가 삭제되었습니다.");
        } catch (e) {
            console.error(e);
            alert("삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    const childNameById = useMemo(() => {
        const m = new Map();
        (savedChildren || []).forEach((c) => m.set(c.childId, c.name || c.childId));
        return m;
    }, [savedChildren]);

    const agitzMemberships = useMemo(
        () => memberships.filter((m) => m.kind === MEMBERSHIP_KIND.AGITZ),
        [memberships]
    );
    const familyMemberships = useMemo(
        () => memberships.filter((m) => m.kind === MEMBERSHIP_KIND.FAMILY),
        [memberships]
    );
    const timepasses = useMemo(
        () => memberships.filter((m) => m.kind === MEMBERSHIP_KIND.TIMEPASS),
        [memberships]
    );

    const timepassByChild = useMemo(() => {
        const map = new Map();
        for (const t of timepasses) {
            const cid = t.childId || "__none__";
            const prev = map.get(cid) || { minutes: 0, count: 0, nearestExpire: null };
            const mins = Number(t.remainMinutes || 0);
            const exp = t.expiresAt ? Number(t.expiresAt) : null;

            prev.minutes += isNaN(mins) ? 0 : mins;
            prev.count += 1;
            if (exp) prev.nearestExpire = prev.nearestExpire ? Math.min(prev.nearestExpire, exp) : exp;

            map.set(cid, prev);
        }
        return map;
    }, [timepasses]);

    const statusTag = (status) => (
        <Tag
            bg={`${MEMBERSHIP_COLOR[status] || "#e5e7eb"}22`}
            color={MEMBERSHIP_COLOR[status] || "#374151"}
        >
            {MEMBERSHIP_STATUS_LABEL[status] || status}
        </Tag>
    );

    return (
        <>
            {/* === 내정보/구독정보 탭 === */}
            {mode === "profile" && (
                <>
                    {/* 내 정보 (성별 / 이름 / 이메일) — 라벨은 Title 하나만 사용 */}
                    <RowBlock>
                        <Grid3>
                            <Field>
                                <Label>성별</Label>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="pgender"
                                            value="male"
                                            checked={form.gender === "male"}
                                            onChange={onChange("gender")}
                                        />{" "}
                                        남
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="pgender"
                                            value="female"
                                            checked={form.gender === "female"}
                                            onChange={onChange("gender")}
                                        />{" "}
                                        여
                                    </label>
                                </div>
                            </Field>
                        </Grid3>

                        <Grid2>
                            <Field>
                                <Label>이름</Label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <Input
                                        value={form.firstName}
                                        onChange={onChange("firstName")}
                                        placeholder="이름"
                                    />
                                    <Btn
                                        type="button"
                                        outline
                                        style={{ height: 44, padding: "0 14px", whiteSpace: "nowrap" }}
                                        onClick={handleSaveName}
                                        disabled={savingName}
                                    >
                                        {savingName ? "저장 중…" : "저장하기"}
                                    </Btn>
                                </div>
                            </Field>

                            <Field>
                                <Label>이메일</Label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <Input
                                        value={form.email}
                                        onChange={onChange("email")}
                                        placeholder="aa@withagit.co.kr"
                                    />
                                    <Btn
                                        type="button"
                                        outline
                                        style={{ height: 44, padding: "0 14px", whiteSpace: "nowrap" }}
                                        onClick={handleSaveEmail}
                                        disabled={savingEmail}
                                    >
                                        {savingEmail ? "저장 중…" : "저장하기"}
                                    </Btn>
                                </div>
                            </Field>
                        </Grid2>
                    </RowBlock>

                    {/* 내 멤버십 섹션 (기존과 동일) */}
                    <RowBlock>
                        <Label style={{ fontSize: 14, color: "#374151", fontWeight: 800 }}>
                            내 멤버십
                        </Label>
                        {msLoading && (
                            <div style={{ padding: 12, color: "#6b7280" }}>불러오는 중…</div>
                        )}

                        {!msLoading && (
                            <>
                                {/* 정규 멤버십 */}
                                <div style={{ display: "grid", gap: 8 }}>
                                    <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
                                        정규 멤버십
                                    </div>
                                    {agitzMemberships.length > 0 ? (
                                        <MembershipCards>
                                            {agitzMemberships.map((m) => (
                                                <MCard key={m.mid} $kind="agitz">
                                                    <MTop>
                                                        <MTitle>{MEMBERSHIP_LABEL[MEMBERSHIP_KIND.AGITZ]}</MTitle>
                                                        {statusTag(m.status || MEMBERSHIP_STATUS.ACTIVE)}
                                                    </MTop>
                                                    <MLine>
                                                        <Key>자녀</Key>
                                                        <span>{childNameById.get(m.childId) || m.childId || "-"}</span>
                                                    </MLine>
                                                    <MLine>
                                                        <Key>기간</Key>
                                                        <span>
                                                            {m.startedAt ? fmtDateTime(m.startedAt) : "-"} ~{" "}
                                                            {m.expiresAt ? fmtExclusiveEnd(m.expiresAt) : "-"}
                                                        </span>
                                                    </MLine>
                                                    <MLine>
                                                        <Key>주문</Key>
                                                        <span>{m.orderId || "-"}</span>
                                                    </MLine>
                                                </MCard>
                                            ))}
                                        </MembershipCards>
                                    ) : (
                                        <EmptyInfo text="정규 멤버십이 없습니다." />
                                    )}
                                </div>

                                {/* 패밀리 멤버십 */}
                                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                                    <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
                                        패밀리 멤버십
                                    </div>
                                    {familyMemberships.length > 0 ? (
                                        <MembershipCards>
                                            {familyMemberships.map((m) => (
                                                <MCard key={m.mid} $kind="family">
                                                    <MTop>
                                                        <MTitle>{MEMBERSHIP_LABEL[MEMBERSHIP_KIND.FAMILY]}</MTitle>
                                                        {statusTag(m.status || MEMBERSHIP_STATUS.ACTIVE)}
                                                    </MTop>
                                                    <MLine>
                                                        <Key>자녀</Key>
                                                        <span>{childNameById.get(m.childId) || m.childId || "-"}</span>
                                                    </MLine>
                                                    <MLine>
                                                        <Key>기간</Key>
                                                        <span>
                                                            {m.startedAt ? fmtDateTime(m.startedAt) : "-"} ~{" "}
                                                            {m.expiresAt ? fmtExclusiveEnd(m.expiresAt) : "-"}
                                                        </span>
                                                    </MLine>
                                                    <MLine>
                                                        <Key>주문</Key>
                                                        <span>{m.orderId || "-"}</span>
                                                    </MLine>
                                                </MCard>
                                            ))}
                                        </MembershipCards>
                                    ) : (
                                        <EmptyInfo text="패밀리 멤버십이 없습니다." />
                                    )}
                                </div>

                                {/* 시간권 */}
                                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                                    <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
                                        시간권
                                    </div>

                                    {timepasses.length > 0 ? (
                                        <MembershipCards>
                                            {Array.from(timepassByChild.entries()).map(([cid, agg]) => {
                                                const childLabel =
                                                    cid === "__none__"
                                                        ? "자녀 미지정"
                                                        : childNameById.get(cid) || cid;

                                                return (
                                                    <MCard key={`timepass_${cid}`} $kind="timepass">
                                                        <MTop>
                                                            <MTitle>
                                                                {MEMBERSHIP_LABEL[MEMBERSHIP_KIND.TIMEPASS]} (합산)
                                                            </MTitle>
                                                            <Tag bg="#eff6ff" color="#1d4ed8">
                                                                {agg.count}건
                                                            </Tag>
                                                        </MTop>
                                                        <MLine>
                                                            <Key>자녀</Key>
                                                            <span>{childLabel}</span>
                                                        </MLine>
                                                        <MLine>
                                                            <Key>잔여</Key>
                                                            <span>{agg.minutes.toLocaleString()} 분</span>
                                                        </MLine>
                                                    </MCard>
                                                );
                                            })}
                                        </MembershipCards>
                                    ) : (
                                        <EmptyInfo text="보유 중인 시간권이 없습니다." />
                                    )}
                                </div>

                                {/* 내 정액권 */}
                                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                                    <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
                                        내 정액권
                                    </div>

                                    {cashpasses.length > 0 ? (
                                        <MembershipCards>
                                            {Array.from(cashpassByChild.entries()).map(([cid, agg]) => {
                                                const childLabel =
                                                    cid === "__none__"
                                                        ? "자녀 미지정"
                                                        : childNameById.get(cid) || cid;
                                                return (
                                                    <MCard key={`cashpass_${cid}`} $kind="cashpass">
                                                        <MTop>
                                                            <MTitle>
                                                                {MEMBERSHIP_LABEL[MEMBERSHIP_KIND.CASHPASS] ||
                                                                    "정액권(포인트)"}
                                                            </MTitle>
                                                            <Tag bg="#ecfeff" color="#0e7490">
                                                                {agg.count}건
                                                            </Tag>
                                                        </MTop>
                                                        <MLine>
                                                            <Key>자녀</Key>
                                                            <span>{childLabel}</span>
                                                        </MLine>
                                                        <MLine>
                                                            <Key>잔액</Key>
                                                            <span>{won(agg.krw)}</span>
                                                        </MLine>
                                                    </MCard>
                                                );
                                            })}
                                        </MembershipCards>
                                    ) : (
                                        <EmptyInfo text="보유 중인 정액권(포인트)이 없습니다." />
                                    )}
                                </div>
                            </>
                        )}
                    </RowBlock>
                </>
            )}

            {/* === 자녀 정보 탭 === */}
            {mode === "child" && (
                <>
                    <SavedChildrenGrid items={savedChildren} onDelete={handleDeleteFromCard}
                        onSelect={handleSelectChild}   // ✅ 카드 클릭 → 수정모드 진입
                    />

                    <ChildrenAddCards
                        phoneE164={phoneE164}
                        mode={editingChild ? "edit" : "create"}
                        editingChild={editingChild}
                        onSaved={async () => {
                            setEditingChild(null);
                            await onRefetch?.();
                            await /* 멤버십 갱신 필요하면 */ refetchMemberships();
                        }}
                        onCancelEdit={() => {
                            setEditingChild(null);
                        }}
                        onSaveProfile={async () => {
                            await saveProfile(phoneE164, {
                                displayName: (form.firstName || "").trim(),
                                gender: (form.gender || ""),
                                email: (form.email || ""),
                                updatedAt: Date.now(),
                            });
                            await onRefetch?.();
                        }}
                    />
                </>
            )}
        </>
    );
}

/* ===================== 결제/이용/취소/예약 섹션 ===================== */

const EmptyRow = ({ colSpan = 5, text = "내역이 없습니다." }) => (
    <tr>
        <td
            colSpan={colSpan}
            style={{ padding: 16, color: "#6b7280" }}
        >
            {text}
        </td>
    </tr>
);

function PaymentsSection({ orders = [], loading, onReload, childNameById }) {
    const itemText = (o) => {
        switch (o?.type) {
            case "timepass": {
                const mins = o?.minutes ? `${o.minutes}분` : "";
                return [o.productName || "시간권", mins]
                    .filter(Boolean)
                    .join(" · ");
            }
            case "membership": {
                const who = o?.childId
                    ? childNameById?.get(o.childId) || o.childId
                    : "";
                return [
                    o.productName ||
                    (o?.kind ? `${o.kind} 멤버십` : "멤버십"),
                    who,
                ]
                    .filter(Boolean)
                    .join(" · ");
            }
            case "points":
            case "cashpass":
                return o?.productName || "정액권(포인트)";
            default:
                return o?.productName || "-";
        }
    };

    return (
        <TableWrap>
            <Table>
                <thead>
                    <tr>
                        <th>항목</th>
                        <th style={{ width: 170 }}>결제 일시</th>
                        <th style={{ width: 140, textAlign: "right" }}>금액</th>
                        <th style={{ width: 180 }}>결제번호</th>
                        <th style={{ width: 120 }}>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <EmptyRow colSpan={5} text="불러오는 중…" />
                    )}

                    {!loading && orders.length === 0 && (
                        <EmptyRow colSpan={5} text="결제 내역이 없습니다." />
                    )}

                    {!loading &&
                        orders.map((o) => (
                            <tr key={o.id}>
                                {/* 항목 */}
                                <td>{itemText(o)}</td>

                                {/* 결제 일시 */}
                                <td>{fmtDateTime(o.createdAt)}</td>

                                {/* 금액 */}
                                <td style={{ textAlign: "right" }}>
                                    {won(o.amountKRW)}
                                </td>

                                {/* 결제번호 */}
                                <td>{String(o.id).replace(/\D+/g, "")}</td>

                                {/* 상태 */}
                                <td>
                                    {o.status === ORDER_STATUS.PAID ? (
                                        <Tag bg="#ecfdf5" color="#047857">
                                            결제완료
                                        </Tag>
                                    ) : (
                                        <Tag bg="#fee2e2" color="#991b1b">
                                            {String(o.status || "기타")}
                                        </Tag>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </TableWrap>
    );
}

function UsageSection({ rows = [], loading }) {
    return (
        <TableWrap>
            <Table>
                <thead>
                    <tr>
                        <th style={{ width: 170 }}>일시</th>
                        <th>서비스</th>
                        <th style={{ width: 160 }}>자녀</th>
                        <th style={{ width: 120, textAlign: "right" }}>비용</th>
                        <th>메모</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <EmptyRow colSpan={5} text="불러오는 중…" />
                    )}
                    {!loading && rows.length === 0 && (
                        <EmptyRow colSpan={5} text="이용 내역이 없습니다." />
                    )}
                    {!loading &&
                        rows.map((r) => (
                            <tr key={r.id}>
                                <td>
                                    {fmtDateTime(
                                        r.when ||
                                        r.createdAt ||
                                        r.dateTime ||
                                        `${r.date} ${String(
                                            r.hour ?? 0
                                        ).padStart(2, "0")}:${String(
                                            r.minute ?? 0
                                        ).padStart(2, "0")}`
                                    )}
                                </td>
                                <td>
                                    {r.service ||
                                        r.type ||
                                        r.category ||
                                        "픽업"}
                                </td>
                                <td>
                                    {r.childName ||
                                        r.child ||
                                        r.childId ||
                                        "-"}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    {won(r.cost ?? r.fareKRW ?? 0)}
                                </td>
                                <td>{r.note || r.memo || ""}</td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </TableWrap>
    );
}

function CancelsSection({ rows = [], loading }) {
    return (
        <TableWrap>
            <Table>
                <thead>
                    <tr>
                        <th style={{ width: 120 }}>번호</th>
                        <th style={{ width: 180 }}>일시</th>
                        <th>대상</th>
                        <th>사유</th>
                        <th style={{ width: 120 }}>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <EmptyRow colSpan={5} text="불러오는 중…" />
                    )}
                    {!loading && rows.length === 0 && (
                        <EmptyRow colSpan={5} text="취소 내역이 없습니다." />
                    )}
                    {!loading &&
                        rows.map((r) => (
                            <tr key={r.id}>
                                <td>{r.id}</td>
                                <td>
                                    {fmtDateTime(
                                        r.when ||
                                        r.createdAt ||
                                        r.date
                                    )}
                                </td>
                                <td>{r.target || r.type || "예약"}</td>
                                <td>{r.reason || r.memo || "-"}</td>
                                <td>
                                    <Tag
                                        bg="#eef2ff"
                                        color="#3730a3"
                                    >
                                        {r.status || "취소"}
                                    </Tag>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </TableWrap>
    );
}

function ReservesSection({ rows = [], loading }) {
    return (
        <TableWrap>
            <Table>
                <thead>
                    <tr>
                        <th style={{ width: 180 }}>예약번호</th>
                        <th style={{ width: 220 }}>일시</th>
                        <th>프로그램</th>
                        <th style={{ width: 160 }}>자녀</th>
                        <th style={{ width: 120 }}>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <EmptyRow colSpan={5} text="불러오는 중…" />
                    )}
                    {!loading && rows.length === 0 && (
                        <EmptyRow
                            colSpan={5}
                            text="프로그램 예약 내역이 없습니다."
                        />
                    )}
                    {!loading &&
                        rows.map((r) => (
                            <tr key={r.id}>
                                {/* 예약번호: orderId가 있으면 우선 표시 */}
                                <td>{r.orderId || r.id}</td>

                                {/* 일시: 숫자면 fmtDateTime, 문자열이면 그대로 */}
                                <td>
                                    {typeof r.when === "number"
                                        ? fmtDateTime(r.when)
                                        : (r.when || "-")}
                                </td>

                                {/* 프로그램 이름 (세부 프로그램 포함) */}
                                <td>{r.programTitle || "-"}</td>

                                {/* 자녀 */}
                                <td>{r.childName || r.childId || "-"}</td>

                                {/* 상태 태그 */}
                                <td>
                                    {r.status === ORDER_STATUS.PAID ? (
                                        <Tag bg="#ecfdf5" color="#047857">
                                            결제완료
                                        </Tag>
                                    ) : r.status === ORDER_STATUS.PENDING ? (
                                        <Tag bg="#fef3c7" color="#92400e">
                                            결제대기
                                        </Tag>
                                    ) : (
                                        <Tag bg="#e5e7eb" color="#4b5563">
                                            {r.statusLabel || String(r.status || "기타")}
                                        </Tag>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </TableWrap>
    );
}



/* 픽업 신청 내역 */
function PickupsSection({ rows = [], loading }) {
    return (
        <TableWrap>
            <Table>
                <thead>
                    <tr>
                        <th style={{ width: 170 }}>일시</th>
                        <th>구간</th>
                        <th style={{ width: 160 }}>자녀</th>
                        <th style={{ width: 120, textAlign: "right" }}>
                            요금
                        </th>
                        <th style={{ width: 140 }}>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <EmptyRow colSpan={5} text="불러오는 중…" />
                    )}
                    {!loading && rows.length === 0 && (
                        <EmptyRow
                            colSpan={5}
                            text="픽업 신청 내역이 없습니다."
                        />
                    )}
                    {!loading &&
                        rows.map((r) => (
                            <tr key={r.id}>
                                <td>{fmtDateTime(r.when)}</td>
                                <td>{r.route}</td>
                                <td>{r.childName}</td>
                                <td style={{ textAlign: "right" }}>
                                    {won(r.fare)}
                                </td>
                                <td>
                                    {r.statusLabel === "픽업 신청 완료" ? (
                                        <Tag
                                            bg="#ecfdf5"
                                            color="#047857"
                                        >
                                            픽업 신청 완료
                                        </Tag>
                                    ) : r.statusLabel === "취소됨" ? (
                                        <Tag
                                            bg="#fee2e2"
                                            color="#991b1b"
                                        >
                                            취소됨
                                        </Tag>
                                    ) : (
                                        <Tag
                                            bg="#eff6ff"
                                            color="#1d4ed8"
                                        >
                                            픽업 신청
                                        </Tag>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </TableWrap>
    );
}


/* ===================== Main MyPage ===================== */

export default function MyPage() {
    const nav = useNavigate();
    const { initialized, phoneE164, profile, children, refresh } =
        useUser() || {};

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const [usageRows, setUsageRows] = useState([]);
    const [usageLoading, setUsageLoading] = useState(false);

    const [cancelRows, setCancelRows] = useState([]);
    const [cancelLoading, setCancelLoading] = useState(false);

    const [reserveRows, setReserveRows] = useState([]);
    const [reserveLoading, setReserveLoading] = useState(false);

    const [pickupsRows, setPickupsRows] = useState([]);
    const [pickupsLoading, setPickupsLoading] = useState(false);

    const [tab, setTab] = useState("profile");
    const initials = useMemo(
        () => (phoneE164?.slice(-2) || "ME").toUpperCase(),
        [phoneE164]
    );

    const leftAvatarRef = useRef(null);

    useEffect(() => {
        if (initialized && phoneE164) refresh?.();
    }, [initialized, phoneE164]);

    const childNameById = useMemo(() => {
        const m = new Map();
        (children || []).forEach((c) =>
            m.set(c.childId, c.name || c.childId)
        );
        return m;
    }, [children]);

    const loadOrders = async () => {
        if (!phoneE164) return;
        setOrdersLoading(true);
        try {
            const rows = await listMemberOrders(phoneE164, { limit: 100 });
            const ALLOWED = new Set([
                "membership",
                "timepass",
                "points",
                "cashpass",
            ]);
            const filtered = rows.filter((o) =>
                ALLOWED.has(String(o.type || "").toLowerCase())
            );
            setOrders(filtered);
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadUsage = async () => {
        if (!phoneE164) return;
        setUsageLoading(true);
        try {
            const col = collection(
                db,
                "members",
                phoneE164,
                "usemembership"
            );
            const snap = await getDocs(
                query(col, orderBy("createdAt", "desc"), qlimit(200))
            ).catch(() => null);
            const rows = snap
                ? snap.docs.map((d) => {
                    const x = d.data() || {};
                    return {
                        id: d.id,
                        when: x.createdAt,
                        service:
                            x.kind === "cashpass"
                                ? "정액권 사용"
                                : x.kind === "timepass"
                                    ? "시간권 사용"
                                    : x.kind || "이용",
                        childName: x.childId || "-",
                        cost: x.amountKRW || 0,
                        memo: x.memo || "",
                    };
                })
                : [];
            setUsageRows(rows);
        } finally {
            setUsageLoading(false);
        }
    };

    const loadPickups = async () => {
        if (!phoneE164) return;
        setPickupsLoading(true);
        try {
            const col = collection(
                db,
                "members",
                phoneE164,
                "reservations"
            );
            const snap = await getDocs(
                query(col, orderBy("createdAt", "desc"), qlimit(200))
            ).catch(() => null);

            const rows = snap
                ? snap.docs.map((d) => {
                    const x = d.data() || {};
                    const dateStr =
                        x.date && x.hour != null && x.minute != null
                            ? `${x.date} ${String(x.hour).padStart(2, "0")}:${String(
                                x.minute
                            ).padStart(2, "0")}`
                            : x.createdAt;

                    const s = String(x.status || "").toLowerCase();
                    let statusLabel = "픽업 신청";
                    if (
                        s === "done" ||
                        s === "completed" ||
                        s === "complete"
                    )
                        statusLabel = "픽업 신청 완료";
                    else if (s === "canceled" || s === "cancelled")
                        statusLabel = "취소됨";
                    else if (s === "requested" || s === "request")
                        statusLabel = "픽업 신청";

                    return {
                        id: d.id,
                        when: dateStr,
                        route: `${x.origin?.name || "-"} → ${x.dest?.name || "-"
                            }`,
                        childName: x.childName || x.childId || "-",
                        fare: x.fareKRW || 0,
                        statusLabel,
                    };
                })
                : [];
            setPickupsRows(rows);
        } finally {
            setPickupsLoading(false);
        }
    };

    const loadCancels = async () => {
        if (!phoneE164) return;
        setCancelLoading(true);
        try {
            const canCol = collection(
                db,
                "members",
                phoneE164,
                "cancels"
            );
            let snap = await getDocs(
                query(canCol, orderBy("when", "desc"), qlimit(200))
            ).catch(() => null);
            let rows = snap
                ? snap.docs.map((d) => ({ id: d.id, ...d.data() }))
                : [];
            if (rows.length === 0) {
                const resCol = collection(
                    db,
                    "members",
                    phoneE164,
                    "reservations"
                );
                const snap2 = await getDocs(
                    query(
                        resCol,
                        where("status", "in", [
                            RESERVATION_STATUS.CANCELED,
                            "canceled",
                            "cancelled",
                        ]),
                        orderBy("date", "desc"),
                        qlimit(200)
                    )
                ).catch(() => null);
                rows = snap2
                    ? snap2.docs.map((d) => {
                        const x = d.data();
                        return {
                            id: d.id,
                            when: `${x.date || ""} ${String(
                                x.hour ?? 0
                            )
                                .toString()
                                .padStart(2, "0")}:${String(
                                    x.minute ?? 0
                                )
                                    .toString()
                                    .padStart(2, "0")}`,
                            target: "픽업 예약",
                            reason: x.cancelReason || x.memo || "",
                            status: "취소",
                        };
                    })
                    : [];
            }
            setCancelRows(rows);
        } finally {
            setCancelLoading(false);
        }
    };

 const loadReserves = async () => {
    if (!phoneE164) return;
    setReserveLoading(true);
    try {
        // PROGRAM 타입 주문만 가져오기
        const orders = await listProgramOrders(phoneE164, { limit: 50 });

        const rows = [];
        orders.forEach((o) => {
            const status = o.status || ORDER_STATUS.PAID;
            const statusLabel =
                status === ORDER_STATUS.PAID
                    ? "결제완료"
                    : status === ORDER_STATUS.PENDING
                    ? "결제대기"
                    : status;

            const bookings = Array.isArray(o.bookings) ? o.bookings : [];

            bookings.forEach((b, idx) => {
                rows.push({
                    id: `${o.id}_${idx}`,
                    orderId: o.id,
                    // 일시: 사람이 보기 좋게 라벨 위주로 구성
                    when: `${b.dateLabel || b.date || ""} ${b.slotLabel || ""}`.trim() ||
                        o.createdAt ||
                        "",
                    programTitle: [
                        b.programTitle || "프로그램",
                        b.slotTitle || "",
                    ]
                        .filter(Boolean)
                        .join(" · "),
                    childName: b.childName || "",
                    childId: b.childId || "",
                    status,
                    statusLabel,
                });
            });
        });

        setReserveRows(rows);
    } finally {
        setReserveLoading(false);
    }
};

    useEffect(() => {
        if (!initialized || !phoneE164) return;
        if (tab === "payments") loadOrders();
        if (tab === "usage") loadUsage();
        if (tab === "pickups") loadPickups();
        if (tab === "cancels") loadCancels();
        if (tab === "reserves") loadReserves();
    }, [initialized, phoneE164, tab]);

    const onClickLeftAvatar = () => {
        leftAvatarRef.current?.click();
    };

    const onChangeLeftAvatar = async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!phoneE164) {
            alert("로그인이 필요합니다.");
            return;
        }
        try {
            const path = await setProfileAvatarFromFile(phoneE164, f);
            await saveProfile(phoneE164, {
                avatarUrl: path,
                updatedAt: Date.now(),
            });
            await refresh?.();
        } catch (err) {
            console.error(err);
            alert("프로필 사진 저장에 실패했습니다.");
        } finally {
            e.target.value = "";
        }
    };

    const onLogout = () => {
        try {
            localStorage.removeItem("auth_dev_session");
        } catch { }
        nav("/login", { replace: true });
    };

    const current = TAB_INFO[tab] || TAB_INFO.profile;

    if (!initialized)
        return (
            <Page>
                <Container>
                    <div style={{ padding: 24 }}>불러오는 중…</div>
                </Container>
            </Page>
        );

    return (
        <Page>
            <Container>
                <Grid>
                    {/* Left panel */}
                    <Panel>
                        <Nav>
                            <NavBtn
                                active={tab === "profile"}
                                onClick={() => setTab("profile")}
                            >
                                내정보 구독정보
                            </NavBtn>
                            <NavBtn
                                active={tab === "child"}
                                onClick={() => setTab("child")}
                            >
                                자녀 정보
                            </NavBtn>
                            <NavBtn
                                active={tab === "payments"}
                                onClick={() => setTab("payments")}
                            >
                                결제 내역
                            </NavBtn>
                            <NavBtn
                                active={tab === "usage"}
                                onClick={() => setTab("usage")}
                            >
                                이용 내역
                            </NavBtn>
                            <NavBtn
                                active={tab === "pickups"}
                                onClick={() => setTab("pickups")}
                            >
                                픽업 신청 내역
                            </NavBtn>
                  
                            <NavBtn
                                active={tab === "reserves"}
                                onClick={() => setTab("reserves")}
                            >
                                프로그램 예약 내역
                            </NavBtn>
               
                        </Nav>
                    </Panel>

                    {/* Right main */}
                    <Main>
                        <StickyHead>
                            <Title>{current.title}</Title>
                        </StickyHead>

                        <Content>
                            {tab === "profile" && (
                                <ProfileEditSection
                                    phoneE164={phoneE164}
                                    initName={profile?.displayName || ""}
                                    ctxChildren={children || []}
                                    onRefetch={refresh}
                                    mode="profile"
                                />
                            )}

                            {tab === "child" && (
                                <ProfileEditSection
                                    phoneE164={phoneE164}
                                    initName={profile?.displayName || ""}
                                    ctxChildren={children || []}
                                    onRefetch={refresh}
                                    mode="child"
                                />
                            )}

                            {tab === "payments" && (
                                <PaymentsSection
                                    orders={orders}
                                    loading={ordersLoading}
                                    onReload={loadOrders}
                                    childNameById={childNameById}
                                />
                            )}

                            {tab === "pickups" && (
                                <PickupsSection
                                    rows={pickupsRows}
                                    loading={pickupsLoading}
                                />
                            )}

                            {tab === "usage" && (
                                <UsageSection
                                    rows={usageRows}
                                    loading={usageLoading}
                                />
                            )}

                            {tab === "cancels" && (
                                <CancelsSection
                                    rows={cancelRows}
                                    loading={cancelLoading}
                                />
                            )}

                            {tab === "reserves" && (
                                <ReservesSection
                                    rows={reserveRows}
                                    loading={reserveLoading}
                                />
                            )}
                        </Content>
                    </Main>
                </Grid>
            </Container>
        </Page>
    );
}
