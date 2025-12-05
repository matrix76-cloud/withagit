/* eslint-disable */
// src/pages/mobile/AccountChildrenPage.jsx
// Withagit — 모바일 자녀 정보 관리 (/m/account/children)

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { db } from "../../services/api";
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit as qlimit,
} from "firebase/firestore";
import { saveProfile, upsertChild, deleteChild } from "../../services/memberService";

/* ===== 공통 유틸 ===== */

const storage = getStorage();

const onlyDigits = (s = "") => (s || "").replace(/\D+/g, "");

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

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => thisYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
const pad2 = (n) => String(n).padStart(2, "0");

function isDataUrl(v) {
    return typeof v === "string" && v.startsWith("data:");
}

function safeText(v) {
    if (!v) return v;
    if (typeof v === "string" && v.length > 500_000)
        throw new Error("텍스트가 너무 깁니다. 이미지 업로드로 처리해야 합니다.");
    return v;
}

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

async function ensureStoragePathFromDataUrl(dataUrl, { phoneE164, kind = "children", name = "file" }) {
    if (!isDataUrl(dataUrl)) return safeText(dataUrl);
    const ts = Date.now();
    const path = `${kind}/${encodeURIComponent(phoneE164)}/${name}_${ts}.jpg`;
    const r = storageRef(storage, path);
    await uploadString(r, dataUrl, "data_url");
    return path;
}

/* Storage → URL 훅 */
function useStorageUrl(path, bustKey) {
    const [url, setUrl] = useState("");
    useEffect(() => {
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

/* ===== 아바타/사진 컴포넌트 ===== */

function ChildPhoto({ path, size = 64, alt = "" }) {
    const url = useStorageUrl(path, null);
    if (!url) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: 18,
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
                borderRadius: 18,
                objectFit: "cover",
                background: "#e5e7eb",
            }}
            onError={(e) => {
                e.currentTarget.src = "";
            }}
        />
    );
}

/* ===== 자녀 삭제 가드 ===== */

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

        const q2 = query(memCol, where("childId", "==", childId), qlimit(50));
        const snap2 = await getDocs(q2);
        let hasRemain = false;
        snap2.forEach((d) => {
            const v = d.data() || {};
            if (v.kind === "timepass" && Number(v.remainMinutes || 0) > 0) hasRemain = true;
            if (v.kind === "cashpass" && Number(v.remainKRW || 0) > 0) hasRemain = true;
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

/* ===== validation ===== */

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

/* ===== 스타일 (모바일 레이아웃) ===== */


const AddChildButton = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 999px;
  border: 1px dashed #facc6b;
  background: #fff9e6;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  cursor: pointer;

  &:hover {
    background: #fff4d4;
  }

  &:active {
    background: #ffeec0;
  }
`;


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

const HeaderBar = styled.header`
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const BackButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: transparent;
  display: grid;
  place-items: center;
  font-size: 18px;
  cursor: pointer;
  color: #4b5563;

  &:active {
    background: #e5e7eb;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
`;

const SectionCard = styled.section`
  margin-top: 12px;
  padding: 16px 16px 18px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
  display: grid;
  gap: 14px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #111827;
`;

const SectionDesc = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

/* 등록된 자녀 목록 카드 */

/* 등록된 자녀 목록 카드 */

const Cards = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;
const ChildCard = styled.button`
  width: 100%;
  border-radius: 18px;
  padding: 12px 12px 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    "photo close"
    "meta  meta";
  column-gap: 12px;
  row-gap: 8px;
  align-items: flex-start;
  background: #ffffff;
  border: 1px solid #f1f3f7;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  text-align: left;

  &:active {
    background: #f9fafb;
  }
`;

const CardPhotoBox = styled.div`
  grid-area: photo;
`;

const CardMeta = styled.div`
  grid-area: meta;
  width: 100%;
`;

const CardAct = styled.div`
  grid-area: close;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
`;

const DeleteIconButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;

  svg {
    width: 16px;
    height: 16px;
    display: block;
    color: #4b5563;
    transition: color 0.12s ease, transform 0.08s ease;
  }

  &:hover svg {
    color: #111827;
  }

  &:active svg {
    transform: scale(0.96);
  }
`;

const EditModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-end;   /* ✅ 아래로 붙이기 */
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
`;

const EditModalSheet = styled.div`
  width: 100%;
  max-width: 100%;
  max-height: 80dvh;
  border-radius: 32px 32px 0 0;   /* ✅ 위쪽만 라운드, 아래는 0 */
  background: #ffffff;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.35);
  padding: 20px 20px 24px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const ModalHeaderRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;   /* ✅ 제목 가운데 */
  margin-bottom: 8px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;           /* ✅ 더 크게 */
  font-weight: 800;
  color: #111827;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    display: block;
    color: #6b7280;
  }

  &:hover svg {
    color: #111827;
  }

  &:active {
    background: #f3f4f6;
  }
`;



const ModalHintText = styled.p`
  margin: 0 0 14px;
  font-size: 12px;
  color: #6b7280;

  .asterisk {
    color: #ef4444;
    margin-right: 4px;
  }
`;


const InfoTable = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  row-gap: 4px;
  column-gap: 8px;
  font-size: 12px;
  color: #6b7280;
`;

const EditRow = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
`;

const EditButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover {
    color: #111827;
  }

  span.arrow {
    font-size: 13px;
  }
`;


const InfoLabelPrimary = styled.div`
  font-weight: 800;
  color: #111827;
`;

const InfoValuePrimary = styled.div`
   text-align: right;      /* ✅ 오른쪽 정렬 */
   color: #111827;
`;

const InfoLabel = styled.div`
  color: #9ca3af;
`;

const InfoValue = styled.div`
  text-align: right;      /* ✅ 오른쪽 정렬 */
  color: #111827;
`;




const CardName = styled.div`
  font-weight: 800;
  font-size: 15px;
  color: #111827;
`;

const CardSub = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const InfoLines = styled.div`
  display: grid;
  row-gap: 2px;
  font-size: 12px;
  color: #6b7280;
`;

const InfoLine = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;


const InfoStrong = styled.span`
  color: #111827;
  font-weight: 700;
`;



const CardDeleteBtn = styled.button`
  border: 1px solid #ef4444;
  border-radius: 999px;
  background: #fff;
  color: #b91c1c;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;

  &:hover {
    background: #fee2e2;
  }
`;


const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr;
  row-gap: 4px;
  column-gap: 6px;
  font-size: 11px;
  color: #4b5563;
`;

const InfoKey = styled.span`
  color: #9ca3af;
`;

const InfoVal = styled.span`
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;


const EmptyBox = styled.div`
  padding: 12px 10px;
  border-radius: 14px;
  border: 1px dashed #e5e7eb;
  background: #fbfcff;
  font-size: 12px;
  color: #6b7280;
`;

/* 추가/수정 폼 쪽 */
const FormCard = styled.section`
  margin-top: ${(p) => (p.flat ? 10 : 18)}px;
  padding: ${(p) => (p.flat ? "0" : "16px 16px 18px")};
  border-radius: ${(p) => (p.flat ? "0" : "20px")};
  background: ${(p) => (p.flat ? "transparent" : "#ffffff")};
  box-shadow: ${(p) =>
        p.flat ? "none" : "0 10px 26px rgba(15, 23, 42, 0.05)"};
  display: grid;
  gap: 16px;
`;


const FormRow = styled.div`
  display: grid;
  gap: 10px;
`;

const FormRow2 = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 10px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const FormRow3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;


const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  display: block;
  margin-bottom: 4px;   /* 라벨 아래 여백 */
`;

const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #374151;
`;



const GenderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;







const InputBox = styled.input`
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 0 10px;
  font-size: 13px;
  box-sizing: border-box;

  &:focus {
    outline: 2px solid rgba(17, 24, 39, 0.12);
  }
`;

const SelectBox = styled.select`
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 0 10px;
  font-size: 13px;
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: 2px solid rgba(17, 24, 39, 0.12);
  }
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RequiredMark = styled.span`
  display: none;   /* ✅ 모든 * 표시 숨김 */
`;



const PhotoBox = styled.div`
  width: 100%;
  max-width: 160px;
  height: 140px;
  border-radius: 20px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Btn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.outline ? "#e5e7eb" : "#e47b2c")};
  background: ${(p) => (p.outline ? "#ffffff" : "#e47b2c")};
  color: ${(p) => (p.outline ? "#374151" : "#ffffff")};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

/* ===== 자녀 목록 컴포넌트 ===== */
function SavedChildrenList({ items = [], onSelect, onDelete }) {
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
        <>
            <LabelRow>
                <SectionTitle>등록된 자녀</SectionTitle>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{items.length}명</span>
            </LabelRow>

            {items.length === 0 && (
                <EmptyBox>등록된 자녀가 없습니다. 아래에서 자녀를 추가해 주세요.</EmptyBox>
            )}

            {items.length > 0 && (
                <Cards>
                    {items.map((c) => {
                        const contact = fPhone(c.contactPhone);
                        const gender =
                            (c.gender === "male" && "남자") ||
                            (c.gender === "female" && "여자") ||
                            "";
                        const ageLabel = ageFromBirth(c.birth);

                        return (
                            <ChildCard
                                key={c.childId}
                                onClick={() => onSelect && onSelect(c)}
                            >
                                {/* 사진 */}
                                <CardPhotoBox>
                                    <ChildPhoto
                                        path={c.avatarUrl || c.photo}
                                        size={64}
                                        alt={c.name}
                                    />
                                </CardPhotoBox>

                                {/* 텍스트 테이블 + 수정하기 버튼 */}
                                <CardMeta>
                                    <InfoTable>
                                        {/* 1행: 이름 | 성별 · 생일 · 나이 */}
                                        <InfoLabelPrimary>{c.name || "-"}</InfoLabelPrimary>
                                        <InfoValuePrimary>
                                            {gender && `${gender} · `}
                                            {c.birth || "-"}
                                            {ageLabel && ` · ${ageLabel}`}
                                        </InfoValuePrimary>

                                        {/* 2행: 학교 | 수지초 · 4학년 1반 */}
                                        <InfoLabel>학교</InfoLabel>
                                        <InfoValue>
                                            {c.school || "-"}
                                            {(c.grade || c.classroom) && (
                                                <>
                                                    {" · "}
                                                    {(c.grade || "").trim()}{" "}
                                                    {(c.classroom || "").trim()}
                                                </>
                                            )}
                                        </InfoValue>

                                        {/* 3행: 연락처 | 010-1234-5678 */}
                                        <InfoLabel>연락처</InfoLabel>
                                        <InfoValue>{contact || "-"}</InfoValue>
                                    </InfoTable>

                                    {/* 오른쪽 아래 수정하기 버튼 */}
                                    <EditRow>
                                        <EditButton
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect && onSelect(c);
                                            }}
                                        >
                                            <span>수정하기</span>
                                            <span className="arrow" aria-hidden="true">
                                                ›
                                            </span>
                                        </EditButton>
                                    </EditRow>
                                </CardMeta>

                                {/* 오른쪽 위 X 아이콘 */}
                                <CardAct
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <DeleteIconButton
                                        type="button"
                                        aria-label="자녀 삭제"
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
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path
                                                d="M6 6l12 12M18 6L6 18"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </DeleteIconButton>
                                </CardAct>
                            </ChildCard>
                        );
                    })}
                </Cards>
            )}
        </>
    );
}


/* ===== 자녀 추가/수정 카드 ===== */

function ChildFormCard({
    mode,
    model,
    onChange,
    onPickPhoto,
    onSave,
    onCancel,
    saving,
    hideTitle,
}) {
    const isEdit = mode === "edit";
    const maxDay =
        model.birthYear && model.birthMonth
            ? daysInMonth(Number(model.birthYear), Number(model.birthMonth))
            : 31;

    const fileId = `child-photo-${model.id}`;

    return (
        <FormCard flat={hideTitle}>
            {/* 모달 안에서는 hideTitle=true로 들어옴 */}
            {!hideTitle && (
                <LabelRow>
                    <SectionTitle>
                        {isEdit ? "자녀 정보 수정하기" : "자녀 정보 추가"}
                    </SectionTitle>
                </LabelRow>
            )}

            {/* 사진 */}
            <FormRow>
                <PhotoBox onClick={() => document.getElementById(fileId)?.click()}>
                    {model.photo ? (
                        <ChildPhoto path={model.photo} size={140} alt={model.name || ""} />
                    ) : (
                        <span>자녀 사진 등록하기</span>
                    )}
                </PhotoBox>
                <input
                    id={fileId}
                    type="file"
                    accept="image/*"
                    onChange={onPickPhoto}
                    style={{ display: "none" }}
                />
            </FormRow>

            {/* 이름 */}
            <FormRow>
                <FieldLabel>
                    이름<RequiredMark>*</RequiredMark>
                </FieldLabel>
                <InputBox
                    value={model.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder="예: 김하늘"
                    readOnly={isEdit}
                />
            </FormRow>

            {/* 성별 */}
            <FormRow>
                <FieldLabel>
                    성별<RequiredMark>*</RequiredMark>
                </FieldLabel>
                <RadioGroup>
                    <RadioLabel>
                        <input
                            type="radio"
                            name={`gender-${model.id}`}
                            value="male"
                            checked={model.gender === "male"}
                            onChange={() => onChange({ gender: "male" })}
                        />
                        <span>남</span>
                    </RadioLabel>
                    <RadioLabel>
                        <input
                            type="radio"
                            name={`gender-${model.id}`}
                            value="female"
                            checked={model.gender === "female"}
                            onChange={() => onChange({ gender: "female" })}
                        />
                        <span>여</span>
                    </RadioLabel>
                </RadioGroup>
            </FormRow>

            {/* 출생년 / 월 / 일 */}
            <FormRow>
                <FieldLabel>
                    출생년 / 월 / 일<RequiredMark>*</RequiredMark>
                </FieldLabel>
                <FormRow3>
                    <SelectBox
                        value={model.birthYear}
                        onChange={(e) => onChange({ birthYear: e.target.value })}
                    >
                        <option value="">연도</option>
                        {YEARS.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </SelectBox>
                    <SelectBox
                        value={model.birthMonth}
                        onChange={(e) => onChange({ birthMonth: e.target.value })}
                    >
                        <option value="">월</option>
                        {MONTHS.map((m) => (
                            <option key={m} value={pad2(m)}>
                                {m}
                            </option>
                        ))}
                    </SelectBox>
                    <SelectBox
                        value={model.birthDay}
                        onChange={(e) => onChange({ birthDay: e.target.value })}
                    >
                        <option value="">일</option>
                        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={pad2(d)}>
                                {d}
                            </option>
                        ))}
                    </SelectBox>
                </FormRow3>
            </FormRow>

            {/* 학교 / 학년 / 반 */}
            <FormRow>
                <FieldLabel>
                    학교 / 학년 / 반<RequiredMark>*</RequiredMark>
                </FieldLabel>
                <FormRow3>
                    <InputBox
                        value={model.school}
                        onChange={(e) => onChange({ school: e.target.value })}
                        placeholder="예: 수지초등학교"
                    />
                    <InputBox
                        value={model.grade}
                        onChange={(e) => onChange({ grade: e.target.value })}
                        placeholder="예: 3학년"
                    />
                    <InputBox
                        value={model.classroom}
                        onChange={(e) => onChange({ classroom: e.target.value })}
                        placeholder="예: 1반"
                    />
                </FormRow3>
            </FormRow>

            {/* 자녀 연락처(선택) */}
            <FormRow>
                <FieldLabel>자녀 연락처(선택)</FieldLabel>
                <InputBox
                    value={formatLocalPhone(normalizePhoneKR(model.contactPhone || ""))}
                    onChange={(e) =>
                        onChange({ contactPhone: normalizePhoneKR(e.target.value) })
                    }
                    placeholder="예: 010-1234-5678"
                />
            </FormRow>

            <ButtonRow>
                {isEdit && (
                    <Btn type="button" outline onClick={onCancel} disabled={saving}>
                        취소
                    </Btn>
                )}
                <Btn
                    type="button"
                    onClick={onSave}
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
                    {saving ? (isEdit ? "수정 중…" : "저장 중…") : isEdit ? "수정 완료" : "저장"}
                </Btn>
            </ButtonRow>
        </FormCard>
    );
}


/* ===== 메인 페이지 ===== */

export default function AccountChildrenPage() {
    const nav = useNavigate();
    const { initialized, phoneE164, profile, children, refresh } = useUser() || {};
    const [savedChildren, setSavedChildren] = useState(() => children || []);
    const [editingChild, setEditingChild] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);


    const handleEditRequest = (child) => {
        setEditingChild(child);
        setEditModalOpen(true);
    };

    const handleCreateRequest = () => {
        setEditingChild(null);
        setModel(makeBlank());
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingChild(null);
        setModel(makeBlank());
        setEditModalOpen(false);
    };
    

    useEffect(() => {
        setSavedChildren(children || []);
    }, [children]);

    useEffect(() => {
        if (initialized && !phoneE164) {
            nav("/login", { replace: true });
        }
    }, [initialized, phoneE164, nav]);

    const onBack = () => nav(-1);

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

    useEffect(() => {
        if (editingChild) {
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
    }, [editingChild]);

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

    const handleSaveChild = async () => {
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
            await saveProfile(phoneE164, {
                displayName: (profile?.displayName || "").trim(),
                gender: profile?.gender || "",
                email: (profile?.email || "").trim(),
                updatedAt: Date.now(),
            });

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

            const birth = `${model.birthYear}-${model.birthMonth}-${model.birthDay}`;

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

            await refresh?.();

            setEditModalOpen(false);

            const msg = editingChild
                ? "자녀 정보가 수정되었습니다."
                : "자녀 정보가 저장되었습니다.";

            setEditingChild(null);
            setModel(makeBlank());
            alert(msg);

           
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteChild = async (c) => {
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
            await refresh?.();
            alert("자녀가 삭제되었습니다.");
        } catch (e) {
            console.error(e);
            alert("삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    if (!initialized) {
        return (
            <Page>
                <Container>
                    <HeaderBar>
                        <BackButton onClick={onBack}>‹</BackButton>
                        <HeaderTitle>자녀 정보 관리</HeaderTitle>
                    </HeaderBar>
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
                <HeaderBar>
                    <BackButton onClick={onBack}>‹</BackButton>
                    <HeaderTitle>자녀 정보 관리</HeaderTitle>
                </HeaderBar>

                <SectionCard>
                    <SavedChildrenList
                        items={savedChildren}
                        onSelect={handleEditRequest}
                        onDelete={handleDeleteChild}
                    />
                </SectionCard>

                <AddChildButton type="button" onClick={handleCreateRequest}>
                    + 자녀 추가하기
                </AddChildButton>

  
                {/* 자녀 수정 모달 */}
                {editModalOpen && (
                    <EditModalBackdrop
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                closeEditModal();
                            }
                        }}
                    >
                        <EditModalSheet onClick={(e) => e.stopPropagation()}>
                            <ModalHeaderRow>
                                <ModalTitle>{editingChild ? "자녀 수정하기" : "자녀 추가하기"}</ModalTitle>
                                <ModalCloseButton
                                    type="button"
                                    aria-label="닫기"
                                    onClick={closeEditModal}
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            d="M6 6l12 12M18 6L6 18"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </ModalCloseButton>
                            </ModalHeaderRow>

                            <ChildFormCard
                                mode={editingChild ? "edit" : "create"}
                                model={model}
                                onChange={change}
                                onPickPhoto={handlePickPhoto}
                                onSave={handleSaveChild}
                                onCancel={closeEditModal}
                                saving={saving}
                                hideTitle
                            />
                        </EditModalSheet>
                    </EditModalBackdrop>
                )}


            </Container>
        </Page>
    );
}
