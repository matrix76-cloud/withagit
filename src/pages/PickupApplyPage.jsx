/* eslint-disable */
// src/pages/PickupApplyPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchPickupPlaces } from "../services/publicPickupService"; // 지점 목록
import { db, storage } from "../services/api";


import { doc, getDoc, setDoc, updateDoc, addDoc, collection, serverTimestamp, getDocs, query, where, runTransaction, increment } from "firebase/firestore";


import { ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";



import { MEMBERSHIP_KIND } from "../constants/membershipDefine";


/* ===== Tokens ===== */
const navy = "#1A2B4C";
const gray7 = "#111827";
const gray6 = "#4b5563";
const gray5 = "#6b7280";
const gray4 = "#9aa2b1";
const bgSoft = "#FAF4EF";
const accent = "var(--color-accent, #F07A2A)";
const primary = "var(--color-primary, #2F6BFF)";
const CONTROL_H = 52;

/* ===== Layout ===== */
const Page = styled.main`background:${bgSoft};min-height:100dvh;padding:20px 12px 80px;`;
const Wrap = styled.div`max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:12px;`;
const Head = styled.header`display:flex;flex-direction:column;gap:2px;`;
const Title = styled.h1`margin:0;color:${navy};letter-spacing:-0.3px;font-size:clamp(20px,2.6vw,26px);`;
const Sub = styled.p`margin:0;color:${gray5};font-size:14px;`;
const Stepper = styled.ol`display:flex;gap:6px;align-items:center;list-style:none;padding:0;margin:8px 0 10px;flex-wrap:wrap;`;
const Step = styled.li`
  display:flex;align-items:center;gap:6px;font-size:13px;color:${({ $active }) => $active ? navy : gray4};
  &::after{content:"";width:18px;height:2px;background:#eceff3;margin-left:6px;}
  &:last-child::after{display:none;}
`;
const Card = styled.section`
  background:#fff;border:1px solid #eef1f4;border-radius:14px;box-shadow:0 8px 18px rgba(0,0,0,.04);
  padding:12px;display:flex;flex-direction:column;gap:10px;flex:1;
`;
const CardTitle = styled.h3`margin:0;color:${navy};font-size:15px;`;
const TopRow = styled.div`display:flex;flex-wrap:wrap;gap:14px;align-items:stretch;`;
const ColA = styled.div`flex:1 1 0;min-width:360px;display:flex;`;
const ColB = styled.div`flex:1 1 0;min-width:360px;display:flex;`;
const BottomRow = styled.div`display:flex;flex-direction:column;gap:14px;`;
const Row = styled.div`display:flex;flex-direction:column;gap:8px;`;
const RowInline = styled.div`display:flex;align-items:center;gap:6px;flex-wrap:nowrap;`;
const Label = styled.label`color:${gray6};font-size:12px;`;

/* 상단 안내 박스 */
const Notice = styled.section`
  background: #ece7e4;
  color: ${gray7};
  border-radius: 14px;
  padding: 14px 16px;
`;
const Ul = styled.ul`
  margin: 0; padding: 0 0 0 18px;
  display: grid; gap: 8px;
  li { line-height: 1.7; }
`;

/* Inputs */
const Select = styled.select`
  height:${CONTROL_H}px;min-height:${CONTROL_H}px;line-height:${CONTROL_H - 2}px;width:100%;
  padding:0 12px;border-radius:12px;border:1px solid #e5e7eb;box-sizing:border-box;font-size:15px;background:#fff;
  appearance:none;-webkit-appearance:none;-moz-appearance:none;
  outline:none;&:focus{border-color:${primary};box-shadow:0 0 0 3px rgba(47,107,255,.1);}
`;
const Input = styled.input`
  height:${CONTROL_H}px;min-height:${CONTROL_H}px;line-height:${CONTROL_H - 2}px;
  padding:0 12px;border-radius:12px;border:1px solid #e5e7eb;box-sizing:border-box;font-size:15px;outline:none;
  &:focus{border-color:${primary};box-shadow:0 0 0 3px rgba(47,107,255,.1);}
`;
const Textarea = styled.textarea`
  min-height:200px;border-radius:10px;padding:10px;resize:vertical;border:1px solid #e5e7eb;outline:none;font-size:14px;
  &:focus{border-color:${primary};box-shadow:0 0 0 3px rgba(47,107,255,.1);}
`;
const Mini = styled.button`
  height:36px;padding:0 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:13px;color:${gray7};white-space:nowrap;
  &:hover{background:#f8fafc;}
`;
const Btn = styled.button`
  height:42px;padding:0 16px;border-radius:10px;border:0;cursor:pointer;background:${({ $kind }) => $kind === "primary" ? primary : $kind === "accent" ? accent : "#111827"};
  color:#fff;box-shadow:0 8px 18px rgba(0,0,0,.08);&:disabled{opacity:.5;cursor:not-allowed;}
`;

/* Combo(Search) */
const ComboWrap = styled.div` position: relative; flex: 1 1 0;`;
const ComboInput = styled.input`
  height:${CONTROL_H}px;width:100%;padding:0 12px;border-radius:12px;border:1px solid #e5e7eb;box-sizing:border-box;font-size:15px;background:#fff;outline:none;
  &:focus{ border-color:${primary}; box-shadow:0 0 0 3px rgba(47,107,255,.1); }
`;
const ComboList = styled.div`
  position:absolute; top:calc(${CONTROL_H}px + 4px); left:0; right:0; max-height:240px; overflow:auto;
  background:#fff; border:1px solid #e5e7eb; border-radius:10px; z-index:20;
`;
const ComboItem = styled.button`
  display:block;width:100%; text-align:left; background:#fff; border:0; border-bottom:1px solid #f3f4f6; padding:10px 12px; cursor:pointer;
  &:hover{ background:#f8fafc; } &:last-child{ border-bottom:0; } small{ color:#6b7280; display:block; }
`;
function ComboSearch({ placeholder = "검색", points = [], onSelect, disabled }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const wrapRef = useRef(null);
    useEffect(() => {
        function onDocClick(e) { if (!wrapRef.current) return; if (!wrapRef.current.contains(e.target)) setOpen(false); }
        if (open) document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);
    const list = useMemo(() => {
        const k = (q || "").trim(); if (!k) return [];
        const lower = k.toLowerCase();
        return points.filter(p =>
            (p.name || "").toLowerCase().includes(lower) ||
            (p.address || "").toLowerCase().includes(lower)
        ).slice(0, 50);
    }, [q, points]);
    return (
        <ComboWrap ref={wrapRef}>
            <ComboInput placeholder={placeholder} value={q} onChange={e => setQ(e.target.value)} onFocus={() => !disabled && setOpen(true)} disabled={!!disabled} />
            {open && !disabled && (
                <ComboList>
                    {list.length === 0 ? <div style={{ padding: 12, color: "#6b7280" }}>검색 결과 없음</div> : list.map(p => (
                        <ComboItem key={p.id} onClick={() => { onSelect?.(p.id); setQ(""); setOpen(false); }} type="button">
                            {p.name}<small>{p.address || "주소 없음"}</small>
                        </ComboItem>
                    ))}
                </ComboList>
            )}
        </ComboWrap>
    );
}

/* Summary / Cart */
const Summary = styled.div`background:#fbfcfe;border:1px solid #eef1f4;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:10px;`;
const CartList = styled.div`display:flex;flex-direction:column;gap:8px;`;
const CartItem = styled.div`
  display:flex;gap:14px;align-items:flex-start;border:1px solid #eef1f4;border-radius:12px;padding:20px 16px;background:#fff;min-height:96px;
  .meta{flex:1 1 0;display:flex;flex-direction:column;gap:6px;font-size:15px;color:#374151;line-height:1.6;}
  .price{white-space:nowrap;color:${navy};font-size:16px;}
`;
const FareTable = styled.div`
  margin-top:6px;border-top:1px dashed #e5e7eb;padding-top:6px;display:flex;flex-direction:column;gap:4px;font-size:14px;
  .row{display:flex;justify-content:space-between;}
  .total{color:${navy};}
`;
const SubmitBar = styled.div`
  position:sticky;bottom:0;left:0;right:0;background:rgba(255,255,255,.85);backdrop-filter:blur(6px);
  border-top:1px solid #eceff3;margin-top:8px;padding:10px 0;
`;

/* Avatar / Child picker */
const ChildRow = styled.div`display:flex;gap:8px;align-items:center;`;
const Avatar = styled.div`width:36px;height:36px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#666;overflow:hidden;
  img{width:100%;height:100%;object-fit:cover;display:block;}
`;
function initialsOf(name) {
    const t = (name || "").trim().split(/\s*/).filter(Boolean).slice(0, 2).join("");
    return t || "👶";
}

/* Calendar */
const CalWrap = styled.div`border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;`;
const CalHead = styled.div`display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:#fafafa; border-bottom:1px solid #eceff3; strong{ color:${navy}; font-size:14px; }`;
const CalBtn = styled.button`width:28px; height:28px; border-radius:8px; border:1px solid #e5e7eb; background:#fff; cursor:pointer; &:hover{ background:#f8fafc; }`;
const CalWeek = styled.div` display:flex; `;
const CalRow = styled.div` display:flex; `;
const CalCell = styled.button`
  flex:1 1 0; height:40px; border:0; background:#fff; cursor:pointer; font-size:13px;
  color:${p => p.$muted ? "#c0c7d4" : "#111827"};
  &:hover{ background:#f8fafc; }
  ${p => p.$today && css`outline:1px solid ${primary}; outline-offset:-1px; border-radius:8px;`}
  ${p => p.$selected && css`background:${primary}; color:#fff; border-radius:8px;`}
`;
function Calendar({ value, onChange }) {
    const [cursor, setCursor] = useState(() => { const d = value ? new Date(value) : new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
    const y = cursor.getFullYear(); const m = cursor.getMonth();
    const first = new Date(y, m, 1).getDay(); const last = new Date(y, m + 1, 0).getDate(); const prevLast = new Date(y, m, 0).getDate();
    const days = ["일", "월", "화", "수", "목", "금", "토"]; const weeks = []; let wk = [];
    for (let i = 0; i < first; i++) wk.push({ d: prevLast - first + 1 + i, muted: true, date: null });
    for (let d = 1; d <= last; d++) { wk.push({ d, muted: false, date: new Date(y, m, d) }); if (wk.length === 7) { weeks.push(wk); wk = []; } }
    if (wk.length) { while (wk.length < 7) wk.push({ d: wk.length + 1, muted: true, date: null }); weeks.push(wk); }
    const todayStr = new Date().toISOString().slice(0, 10); const sel = value;
    return (
        <CalWrap>
            <CalHead>
                <CalBtn onClick={() => setCursor(new Date(y, m - 1, 1))}>‹</CalBtn>
                <strong>{y}년 {m + 1}월</strong>
                <CalBtn onClick={() => setCursor(new Date(y, m + 1, 1))}>›</CalBtn>
            </CalHead>
            <CalWeek>{days.map((w, i) => <div key={i} style={{ flex: "1 1 0", textAlign: 'center', padding: '6px 0', fontSize: 12, color: '#6b7280' }}>{w}</div>)}</CalWeek>
            {weeks.map((w, wi) => (
                <CalRow key={wi}>
                    {w.map((c, ci) => {
                        const ds = c.date ? c.date.toISOString().slice(0, 10) : "";
                        const today = !c.muted && ds === todayStr;
                        const selected = !c.muted && ds === sel;
                        return (<CalCell key={ci} $muted={c.muted} $today={today} $selected={selected} onClick={() => { if (c.date) onChange(ds); }}>{c.d}</CalCell>);
                    })}
                </CalRow>
            ))}
        </CalWrap>
    );
}

/* ===== 지도 모달 (리스트만/맵비활성) ===== */
const ModalBg = styled.div`position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: flex-start; justify-content: center; padding: 6vh 16px; z-index: 1000;`;
const ModalCard = styled.div`width: min(720px, 92vw); max-width: 820px; max-height: 82vh; background: #fff; border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb; display: flex; flex-direction: column;`;
const ModalHead = styled.div`padding: 10px 12px; border-bottom: 1px solid #eceff3; display: flex; align-items: center; justify-content: space-between; strong { color: ${navy}; font-size: 16px; }`;
const ModalBody = styled.div`position: relative; display: grid; grid-template-columns: 1fr; gap: 10px; padding: 10px; overflow: hidden;`;
const SideList = styled.div`min-width: 320px; max-height: calc(78vh - 60px); overflow: auto; border: 1px solid #eef1f4; border-radius: 10px; padding: 8px; background: #fff;`;
const PointItem = styled.button`text-align:left;width:100%;background:#fff;border:1px solid ${({ $active }) => ($active ? "#a3b8ff" : "#eef1f4")};border-radius:10px;padding:8px;cursor:pointer;&:hover{background:#f8fafc;} b{color:${navy};display:block;} small{color:#6b7280;display:block;}`;
const ModalFoot = styled.div`padding:10px 12px;border-top:1px solid #eceff3;display:flex;justify-content:flex-end;gap:8px;`;

function MapPickerModal({ open, title = "지도에서 선택", points = [], selectedId, onClose, onConfirm }) {
    const [current, setCurrent] = useState(selectedId || null);
    useEffect(() => setCurrent(selectedId || null), [selectedId]);
    if (!open) return null;
    const chosen = points.find(p => p.id === current) || null;
    return (
        <ModalBg onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                <ModalHead>
                    <strong>{title}</strong>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Mini onClick={onClose}>닫기</Mini>
                    </div>
                </ModalHead>
                <ModalBody>
                    <SideList>
                        {points.map(p => (
                            <PointItem key={p.id} $active={p.id === current} onClick={() => setCurrent(p.id)}>
                                <b>{p.name}</b><small>{p.address || "주소 없음"}</small>
                            </PointItem>
                        ))}
                    </SideList>
                </ModalBody>
                <ModalFoot>
                    <div style={{ flex: 1, color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                        {chosen ? `선택: ${chosen.name}` : '목록에서 선택하세요.'}
                    </div>
                    <Btn $kind="primary" onClick={() => { if (chosen) onConfirm(chosen); else alert("픽업지점 하나를 선택해주세요."); }}>
                        선택 완료
                    </Btn>
                </ModalFoot>
            </ModalCard>
        </ModalBg>
    );
}

/* ===== 거리/요금 ===== */
function haversine(a, b) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const sa = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
    return R * c;
}
function calcFare(distanceKm, hour) {
    const base = 10000, perKm = 500;
    const night = (hour >= 20 || hour < 7) ? 2000 : 0;
    const total = Math.max(0, base + Math.round(distanceKm * perKm) + night);
    const discounted = Math.max(0, total - 3000);
    return { base, distance: Math.round(distanceKm * 10) / 10, night, discount: 3000, total: discounted };
}
function useFareEstimate({ distanceKm, hour }) {
    return useMemo(() => calcFare(distanceKm, hour), [distanceKm, hour]);
}

/* ===== fee_tables 적용: simple-default 문서 기준 ===== */
async function fetchFeeTable(tableId = "simple-default") {
    const ref = doc(db, "fee_tables", tableId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() || {}) : null;
}
// rule: 아지트(AJIT_SUJI) <-> 상대 지점 name 매칭 시 items[].fee 적용, 없으면 거리 기반
function feeByTableOrDistance({ table, originPoint, destPoint, distanceKm, hour }) {
    try {
        const baseName = (p) => (p?.name || "").trim();
        const isAjit = (p) => (p?.id === "AJIT_SUJI") || /아지트/.test(baseName(p));
        const other = isAjit(originPoint) ? destPoint : isAjit(destPoint) ? originPoint : null;
        if (table && other) {
            const row = (table.items || []).find(it => baseName(other).includes(String(it.name || "").trim()));
            if (row?.fee != null) return { total: Number(row.fee) };
        }
    } catch { }
    const { total } = calcFare(distanceKm || 0, hour || 12);
    return { total };
}

/* ===== Storage 업로드(DataURL들) ===== */
async function uploadMemoImages(phoneE164, rid, images = []) {
    const out = [];
    for (const it of images) {
        if (!it?.url) continue;
        const path = `pickups/${encodeURIComponent(phoneE164)}/${rid}/${it.id || (Date.now() + "")}.jpg`;
        const r = ref(storage, path);
        await uploadString(r, it.url, "data_url");
        out.push({ id: it.id || path.split("/").pop(), url: `gs://${r.bucket}/${r.fullPath}` });
    }
    return out;
}

/* ===== Storage helpers (path → https URL) ===== */
const isStoragePath = (u) =>
    typeof u === "string" && u && !/^https?:\/\//i.test(u) && !u.startsWith("data:");

async function toHttpUrl(path) {
    if (!path) return "";
    try {
        if (!isStoragePath(path)) return path; // 이미 http(s)면 그대로
        const ref = storageRef(storage, path.replace(/^gs:\/\//, "")); // gs://... 도 허용
        return await getDownloadURL(ref);
    } catch {
        return "";
    }
}

function useStorageUrl(src) {
    const [url, setUrl] = useState("");
    useEffect(() => {
        let alive = true;
        (async () => {
            const u = await toHttpUrl(src);
            if (alive) setUrl(u || "");
        })();
        return () => { alive = false; };
    }, [src]);
    return url;
}



/* ===== 포인트 차감 ===== */
// 자녀별 정액권(cashpass)에서 필요한 금액을 차감한다.
// needsByChild: Map<childId, needKRW>
async function consumeCashpassByChild(phoneE164, needsByChild) {
    const ACTIVE = new Set(["active", "future"]);
    const results = { ok: true, shortages: [], balances: {} };

    // childId별로 순차 트랜잭션 (동시 차감 충돌 방지)
    for (const [childId, needKRWRaw] of needsByChild.entries()) {
        const needKRW = Number(needKRWRaw || 0);
        if (!(needKRW > 0)) continue;

        const memCol = collection(db, "members", phoneE164, "memberships");
        const qy = query(memCol, where("kind", "==", "cashpass"), where("childId", "==", childId));
        const snap = await getDocs(qy);
        const docs = snap.docs
            .map(d => ({ id: d.id, ref: d.ref, ...d.data() }))
            .filter(v => ACTIVE.has(String(v.status || "").toLowerCase()) && Number(v.remainKRW || 0) > 0)
            .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0)); // 오래된 것부터 소진

        const available = docs.reduce((s, v) => s + Number(v.remainKRW || 0), 0);

        if (available < needKRW) {
            results.ok = false;
            results.shortages.push({ childId, need: needKRW, have: available });
            continue;
        }

        // 멱등 보장은 상위에서 orderId로 처리됨. 여기선 단일 예약 트랜잭션 차감만.
        await runTransaction(db, async (tx) => {
            // 1) 모든 문서를 먼저 읽기
            const snaps = await Promise.all(docs.map(d => tx.get(d.ref)));
            const plan = snaps.map((snap, idx) => ({
                id: docs[idx].id,
                ref: docs[idx].ref,
                cur: snap.exists() ? Number(snap.data()?.remainKRW || 0) : 0,
            }));

            // 2) 차감 계획 수립
            let remain = needKRW;
            const uses = []; // [{id, ref, use}]
            for (const p of plan) {
                if (remain <= 0) break;
                if (p.cur <= 0) continue;
                const use = Math.min(p.cur, remain);
                uses.push({ id: p.id, ref: p.ref, use });
                remain -= use;
            }

            // 3) 쓰기(업데이트 + 사용 이력 기록) — 읽기 이후에만 수행
            for (const u of uses) {
                tx.update(u.ref, {
                    remainKRW: increment(-u.use),
                    updatedAt: serverTimestamp(),
                });

                const usageRef = doc(collection(db, "members", phoneE164, "usemembership"));
                tx.set(usageRef, {
                    mid: u.id,
                    kind: "cashpass",
                    childId,
                    amountKRW: u.use,
                    memo: "pickup_reservation",
                    createdAt: serverTimestamp(),
                });
            }
        });


        results.balances[childId] = available - needKRW;
    }

    return results;
}


/* ===== 예약/이용내역 기록 ===== */
async function createPickupReservations(phoneE164, items) {
    const col = collection(db, "members", phoneE164, "reservations");
    const rids = [];

    for (const it of items) {
        // 1) 예약 문서 생성
        const base = {
            type: "pickup",
            childId: it.childId,
            childName: it.child,
            date: it.date,
            hour: it.hour,
            minute: it.minute,
            origin: { id: it.origin.id, name: it.origin.name, address: it.origin.address || "" },
            dest: { id: it.dest.id, name: it.dest.name, address: it.dest.address || "" },
            distanceKm: it.distanceKm,
            memo: it.memo || "",
            images: [],                     // 업로드 후 채움
            fareKRW: it.fareKRW,
            status: "requested",
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(col, base);

        // 2) 메모 이미지 업로드 후 문서 업데이트(선택)
        let uploaded = [];
        if (it.images?.length) {
            try {
                uploaded = await uploadMemoImages(phoneE164, docRef.id, it.images);
                await updateDoc(doc(db, "members", phoneE164, "reservations", docRef.id), { images: uploaded });
            } catch (e) {
                console.warn("[pickup] image upload fail", e);
            }
        }

        rids.push(docRef.id);
    }

    return { rids };
}

async function createPickupOrderHistory(phoneE164, { orderId, amountKRW, rids, count }) {
    const ref = doc(db, "members", phoneE164, "orders", String(orderId));
    await setDoc(ref, {
        type: "pickup",
        amountKRW: Number(amountKRW || 0),
        count: Number(count || 0),
        items: (rids || []).map(rid => ({ rid })),
        status: "paid",
        createdAt: serverTimestamp(),
    }, { merge: true });
}

/* ===== Page ===== */
export default function PickupApplyPage() {
    const nav = useNavigate();
    const { phoneE164, memberships, children: ctxChildren } = useUser() || {};



    // memberships: 이제 리스트 형태 가정
    const membershipList = Array.isArray(memberships) ? memberships : [];
    const ACTIVE = new Set(["active", "future"]);

    // 멤버십 보유(정규/패밀리, 활성/예약) 자녀만 허용
    const eligibleChildIds = useMemo(() => {
        const s = new Set();
        for (const m of membershipList) {
            if (!m) continue;
            const status = String(m.status || "").toLowerCase();
            if (!ACTIVE.has(status)) continue;
            if ((m.kind === MEMBERSHIP_KIND.AGITZ || m.kind === MEMBERSHIP_KIND.FAMILY) && m.childId) {
                s.add(m.childId);
            }
        }
        return s;
    }, [membershipList]);

    const allChildren = Array.isArray(ctxChildren) ? ctxChildren : [];

    const children = useMemo(() => {
        return allChildren
            .filter((c) => eligibleChildIds.has(c.childId))
            .map((c) => ({ id: c.childId, name: c.name, photoUrl: c.avatarUrl || "" }));
    }, [allChildren, eligibleChildIds]);

    // 정규 멤버십 보유 여부 (활성/예약)
    const agitzActive = useMemo(
        () =>
            membershipList.some(
                (m) =>
                    m.kind === MEMBERSHIP_KIND.AGITZ &&
                    ACTIVE.has(String(m.status || "").toLowerCase())
            ),
        [membershipList]
    );



    const [childId, setChildId] = useState("");


    useEffect(() => {
        if (children.length === 0) {
            if (childId) setChildId("");
            return;
        }
        if (!children.some((c) => c.id === childId)) {
            setChildId(children[0].id);
        }
    }, [children, childId]);


    // 지점
    const [points, setPoints] = useState([]);
    const [loadingPoints, setLoadingPoints] = useState(true);
    useEffect(() => {
        (async () => {
            try {
                const list = await fetchPickupPlaces();
                let ajit = list.find(x => x.id === "AJIT_SUJI")
                    || list.find(x => (x.name || "").includes("아지트"))
                    || { id: "AJIT_SUJI", name: "아지트 수지 센터", address: "경기 용인시 수지구 문정로 123", lat: 37.3281, lng: 127.0952 };
                const seen = new Set(list.map(x => x.id));
                const merged = seen.has(ajit.id) ? list : [ajit, ...list];
                setPoints(merged);
            } catch {
                setPoints([{ id: "AJIT_SUJI", name: "아지트 수지 센터", address: "경기 용인시 수지구 문정로 123", lat: 37.3281, lng: 127.0952 }]);
            } finally { setLoadingPoints(false); }
        })();
    }, []);

    // 날짜/시간/슬롯 (자녀 포함)
    const [dateCursor, setDateCursor] = useState(() => new Date().toISOString().slice(0, 10));
    const [hour, setHour] = useState(13);
    const [minute, setMinute] = useState(0);
    const [slots, setSlots] = useState([]); // [{id, childId, childName, date, hour, minute}]

    const addSlot = () => {
        if (!childId) return alert("자녀를 먼저 선택해주세요.");
 
 
        const [yy, mm, dd] = String(dateCursor || "").split("-").map(n => parseInt(n, 10));
        const slotDate = new Date(yy, (mm || 1) - 1, dd || 1, Number.isFinite(hour) ? hour : 0, Number.isFinite(minute) ? minute : 0, 0, 0);
        const now = new Date();
        const nowFloor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
        if (slotDate.getTime() < nowFloor.getTime()) {
              alert("지나간 시간은 선택할 수 없어요.");
               return;
        }
        

        const exists = slots.some(s => s.childId === childId && s.date === dateCursor && s.hour === hour && s.minute === minute);
        if (exists) return alert("해당 자녀의 동일 시간 슬롯이 이미 추가되어 있어요.");

        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const childName = (children.find(c => c.id === childId)?.name) || "(자녀)";
        setSlots(prev => [...prev, { id, childId, childName, date: dateCursor, hour, minute }]);
    };
    const removeSlot = (id) => setSlots(prev => prev.filter(s => s.id !== id));
    const clearSlots = () => setSlots([]);

    // 메모 + 사진(미리보기)
    const [memo, setMemo] = useState("");
    const [memoImages, setMemoImages] = useState([]); // [{id,url,file?}]
    const fileRef = useRef(null);
    const addImages = (files) => {
        const arr = Array.from(files || []);
        const readers = arr.map(f => new Promise(resolve => {
            const r = new FileReader();
            r.onload = () => resolve({ id: `${f.name}_${Date.now()}`, url: r.result, file: f });
            r.readAsDataURL(f);
        }));
        Promise.all(readers).then(items => setMemoImages(prev => [...prev, ...items]));
    };
    const removeImage = (id) => setMemoImages(prev => prev.filter(it => it.id !== id));

    // 출발/도착 + 자동 고정(한쪽은 AJIT_SUJI)
    const [originId, setOriginId] = useState(null);
    const [destId, setDestId] = useState(null);
    const [lockAuto, setLockAuto] = useState(false);
    useEffect(() => {
        if (lockAuto) return;
        if (originId && !destId) { setDestId("AJIT_SUJI"); setLockAuto(true); }
        if (destId && !originId) { setOriginId("AJIT_SUJI"); setLockAuto(true); }
    }, [originId, destId, lockAuto]);
    const releaseLock = () => setLockAuto(false);

    const originPoint = useMemo(() => points.find(p => p.id === originId) || null, [points, originId]);
    const destPoint = useMemo(() => points.find(p => p.id === destId) || null, [points, destId]);

    // 지도 모달
    const [mapOpen, setMapOpen] = useState({ which: null });

    // 거리/요금(테이블 적용)
    const curDistance = useMemo(() =>
        (originPoint && destPoint && originPoint.lat && destPoint.lat ? haversine(originPoint, destPoint) : 0),
        [originPoint, destPoint]
    );
    const [feeTable, setFeeTable] = useState(null);
    useEffect(() => { (async () => { setFeeTable(await fetchFeeTable("simple-default")); })(); }, []);
    const curFare = useMemo(() => feeByTableOrDistance({
        table: feeTable, originPoint, destPoint, distanceKm: curDistance, hour,
    }), [feeTable, originPoint, destPoint, curDistance, hour]);

    // 장바구니
    const [cart, setCart] = useState([]);
    const cartTotal = useMemo(() => cart.reduce((s, it) => s + it.fareKRW, 0), [cart]);
    const readyToAdd = !!childId && slots.length > 0 && originPoint && destPoint;

    const addToCart = () => {
        if (!agitzActive) return alert("‘아지트 멤버십’ 가입 후 이용 가능합니다.");
        if (!children.length) {
            const go = window.confirm("멤버십에 연결된 자녀가 없습니다.\n자녀를 먼저 등록/연결하시겠습니까?");
            if (go) nav("/mypage");
            return;
        }
        if (!readyToAdd) return alert("자녀/시간 슬롯/출발지/도착지를 모두 선택해주세요.");


        const leadMs = 60 * 60 * 1000 *24; // 5분
        if (slotDate.getTime() < now.getTime() + leadMs) {
            alert("시작 하루전 전까지만 예약할 수 있어요.");
            return;
        }


        // 한쪽만 선택된 경우 AJIT 보정
        if (!originId && destId) setOriginId("AJIT_SUJI");
        if (!destId && originId) setDestId("AJIT_SUJI");

        const newItems = slots.map(s => {
            const fare = feeByTableOrDistance({
                table: feeTable,
                originPoint, destPoint,
                distanceKm: curDistance, hour: s.hour
            }).total;
            return {
                id: `${s.date}_${s.hour}_${s.minute}_${Math.random().toString(36).slice(2, 7)}`,
                child: s.childName,
                childId: s.childId,
                date: s.date,
                hour: s.hour,
                minute: s.minute,
                origin: originPoint,
                dest: destPoint,
                distanceKm: Math.round(curDistance * 10) / 10,
                memo,
                images: memoImages.map(m => ({ id: m.id, url: m.url })), // 업로드는 submit에서
                fareKRW: fare,
            };
        });
        setCart(prev => [...prev, ...newItems]);
        alert(`${newItems.length}건을 장바구니에 담았어요.`);
    };

    const removeItem = (id) => setCart(prev => prev.filter(x => x.id !== id));
    const clearCart = () => setCart([]);

    // 모두 예약하기
    const [submitting, setSubmitting] = useState(false);
    const submitAll = async () => {
        if (submitting) return;
        if (!agitzActive) return alert("‘아지트 멤버십’ 가입 후 이용 가능합니다.");
        if (!children.length) {
            const go = window.confirm("멤버십에 연결된 자녀가 없습니다.\n자녀를 먼저 등록/연결하시겠습니까?");
            if (go) nav("/mypage");
            return;
        }
        if (cart.length === 0) return alert("담긴 예약이 없습니다.");

        setSubmitting(true);
        try {
       
            // 자녀별 필요 금액 집계 (child-scoped)
            const needByChild = new Map();
            for (const it of cart) {
                const cur = Number(it.fareKRW || 0);
                if (!cur) continue;
                needByChild.set(it.childId, (needByChild.get(it.childId) || 0) + cur);
            }
            const total = Array.from(needByChild.values()).reduce((s, v) => s + v, 0);

            const consume = await consumeCashpassByChild(phoneE164, needByChild);
            if (!consume.ok) {
                const lines = consume.shortages.map(x =>
                    `- ${x.childId} 부족: 필요 ${x.need.toLocaleString()}원 / 보유 ${x.have.toLocaleString()}원`
                ).join("\n");
                alert(`정액권(포인트) 잔액이 부족한 자녀가 있습니다.\n${lines}`);
                setSubmitting(false);
                return;
            }



            const itemsForSave = [];
            for (const it of cart) {
                // 예약 문서 일괄 생성(이미지 업로드 포함)
                const { rids } = await createPickupReservations(phoneE164, cart);

                // 주문(묶음) 기록
                const orderId = `ord_${Date.now()}`;
                await createPickupOrderHistory(phoneE164, {
                    orderId,
                    amountKRW: total,
                    rids,
                    count: rids.length,
                });

                alert(`${rids.length}건 예약을 접수했습니다.\n정액권(포인트) 차감: ${total.toLocaleString()}원`);
                setCart([]);
                nav("/mypage");
            }

       
        } catch (e) {
            console.error(e);
            alert("예약 처리 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    // 렌더

    const childObjView = children.find(c => c.id === childId);
    const childPhotoUrl = useStorageUrl(childObjView?.photoUrl);

    return (
        <Page>
            <Wrap>
                <Head>
                    <Title>픽업 예약하기</Title>
                    <Sub>안전하고 믿을 수 있는 픽업 서비스 — 여러 건을 한 번에 신청할 수 있어요.</Sub>
                </Head>

                <Notice>
                    <Ul>
                        <li>🚗 픽업 예약 안내</li>
                        <li>매달 1일~15일에 다음 달 픽업 선예약이 오픈됩니다.</li>
                        <li>16일 이후에는 예약 현황에 따라 예약이 제한될 수 있습니다.</li>
                        <li>픽업 출발지 또는 도착지 중 한 곳은 반드시 ‘위드아지트’로 설정해야 합니다.</li>
                        <li>픽업 정류장은 목록에서 선택하거나 검색하여 설정할 수 있습니다.</li>
                        <li>(목록에 없는 장소는 위드아지트 카카오톡 채널로 문의해주세요.)</li>
                        <li>여러 날짜와 시간을 한 번에 선택하여 예약 신청이 가능합니다.</li>
                        <li>단, 신청 후 결제 완료가 확인되어야 예약이 확정됩니다.</li>
                    </Ul>
                </Notice>

                <Stepper>
                    <Step $active>1 자녀 선택</Step>
                    <Step $active>2 날짜/시간(다중)</Step>
                    <Step $active>3 장소 선택</Step>
                    <Step $active>4 옵션</Step>
                    <Step $active>5 확인</Step>
                </Stepper>

                <TopRow>
                    {/* A. 자녀 / 시간 슬롯 / 메모+사진 */}
                    <ColA>
                        <Card>
                            <CardTitle>자녀 / 날짜 · 시간</CardTitle>

                            <Row>
                                <Label htmlFor="child">자녀</Label>
                                <ChildRow>
                                    <Avatar title={childObjView?.name || ""}>
                                        {childPhotoUrl ? (
                                            <img
                                                src={childPhotoUrl}
                                                alt={childObjView?.name || "child"}
                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                            />
                                        ) : (
                                            <span>{initialsOf(childObjView?.name)}</span>
                                        )}
                                    </Avatar>

                                    <Select id="child" value={childId} onChange={e => setChildId(e.target.value)} style={{ maxWidth: 280 }}>
                                        {children.length === 0
                                            ? <option value="">멤버십에 연결된 자녀가 없습니다</option>
                                            : children.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                    </Select>
                                </ChildRow>
                            </Row>

                            <Row>
                                <Label>날짜</Label>
                                <Calendar value={dateCursor} onChange={setDateCursor} />
                            </Row>

                            <RowInline>
                                <div style={{ flex: "1 1 0", minWidth: 120 }}>
                                    <Select value={hour} onChange={(e) => setHour(Number(e.target.value))}>
                                        {Array.from({ length: 24 }).map((_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}</option>))}
                                    </Select>
                                </div>
                                <div style={{ flex: "1 1 0", minWidth: 120 }}>
                                    <Select value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
                                        {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (<option key={m} value={m}>{String(m).padStart(2, "0")}</option>))}
                                    </Select>
                                </div>
                                <Mini onClick={addSlot}>시간 추가</Mini>
                                <Mini onClick={clearSlots} disabled={slots.length === 0}>슬롯 비우기</Mini>
                            </RowInline>

                            <Row>
                                {slots.length === 0 ? (
                                    <div style={{ color: "#6b7280" }}>
                                        추가한 시간 슬롯이 없습니다. 위에서 시간을 선택 후 <b>시간 추가</b>를 눌러주세요.
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {slots.map(s => (
                                            <div key={s.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "6px 10px", background: "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontWeight: 700, color: "#111827" }}>{s.childName}</span>
                                                <span style={{ color: "#6b7280" }}>
                                                    · {s.date} {String(s.hour).padStart(2, "0")}:{String(s.minute).padStart(2, "0")}
                                                </span>
                                                <button onClick={() => removeSlot(s.id)} style={{ marginLeft: 8, border: 0, background: "transparent", cursor: "pointer", color: "#6b7280" }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Row>

                            <Row>
                                <Label>메모(선택)</Label>
                                <Textarea placeholder="픽업 시 필요한 내용을 자유롭게 남겨주세요." value={memo} onChange={e => setMemo(e.target.value)} />
                            </Row>

                            <Row>
                                <Label>사진(선택)</Label>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <Mini onClick={() => fileRef.current?.click()}>사진 추가</Mini>
                                    <input type="file" accept="image/*" multiple ref={fileRef} style={{ display: "none" }}
                                        onChange={(e) => addImages(e.target.files || [])} />
                                    {memoImages.map(img => (
                                        <div key={img.id} style={{ position: "relative" }}>
                                            <img src={img.url} alt="" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }} />
                                            <button onClick={() => removeImage(img.id)} style={{ position: "absolute", top: 2, right: 2, border: 0, background: "rgba(0,0,0,.5)", color: "#fff", borderRadius: 999, width: 22, height: 22, cursor: "pointer" }}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </Row>
                        </Card>
                    </ColA>

                    {/* B. 출발/도착 + 담기 */}
                    <ColB>
                        <Card>
                            <CardTitle>출발지/도착지 {loadingPoints && <span style={{ color: "#6b7280", fontSize: 12 }}>(지점 불러오는 중…)</span>}</CardTitle>

                            {/* 출발지 */}
                            <Row>
                                <Label>출발지</Label>
                                <RowInline>
                                    <div style={{ flex: "0 0 280px" }}>
                                        <Select value={originId || ""} onChange={(e) => setOriginId(e.target.value || null)} disabled={lockAuto && originId === "AJIT_SUJI"}>
                                            <option value="">{loadingPoints ? "불러오는 중…" : "프리셋 선택"}</option>
                                            {points.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                        </Select>
                                    </div>
                                    <ComboSearch placeholder="출발지 검색" points={points} onSelect={(id) => setOriginId(id)} disabled={lockAuto && originId === "AJIT_SUJI"} />
                                    <Mini onClick={() => setMapOpen({ which: "origin" })} disabled={lockAuto && originId === "AJIT_SUJI"}>목록</Mini>
                                </RowInline>
                                {originPoint && <small style={{ color: "#6b7280" }}>선택: {originPoint.name} — {originPoint.address || "주소 없음"}</small>}
                                {(lockAuto && originId === "AJIT_SUJI") && (
                                    <div style={{ color: "#6b7280", fontSize: 12 }}>자동 고정됨(아지트). <button onClick={releaseLock} style={{ border: 0, background: "transparent", color: primary, cursor: "pointer" }}>고정 해제</button></div>
                                )}
                            </Row>

                            {/* 도착지 */}
                            <Row>
                                <Label>도착지</Label>
                                <RowInline>
                                    <div style={{ flex: "0 0 280px" }}>
                                        <Select value={destId || ""} onChange={(e) => setDestId(e.target.value || null)} disabled={lockAuto && destId === "AJIT_SUJI"}>
                                            <option value="">{loadingPoints ? "불러오는 중…" : "프리셋 선택"}</option>
                                            {points.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                        </Select>
                                    </div>
                                    <ComboSearch placeholder="도착지 검색" points={points} onSelect={(id) => setDestId(id)} disabled={lockAuto && destId === "AJIT_SUJI"} />
                                    <Mini onClick={() => setMapOpen({ which: "dest" })} disabled={lockAuto && destId === "AJIT_SUJI"}>목록</Mini>
                                </RowInline>
                                {destPoint && <small style={{ color: "#6b7280" }}>선택: {destPoint.name} — {destPoint.address || "주소 없음"}</small>}
                                {(lockAuto && destId === "AJIT_SUJI") && (
                                    <div style={{ color: "#6b7280", fontSize: 12 }}>자동 고정됨(아지트). <button onClick={releaseLock} style={{ border: 0, background: "transparent", color: primary, cursor: "pointer" }}>고정 해제</button></div>
                                )}
                            </Row>

                            {/* 미리보기 */}
                            <Row>
                                <div style={{ fontSize: 13, color: '#6b7280' }}>
                                    현재 선택 거리: <span style={{ color: navy }}>{(curDistance || 0).toFixed(1)} km</span>
                                    {' '}· 예상 요금(최근 선택 시간 기준): <span style={{ color: navy }}>{(curFare.total || 0).toLocaleString()}원</span>
                                </div>
                            </Row>

                            {/* 담기/초기화 */}
                            <RowInline style={{ justifyContent: "flex-end" }}>
                                <Mini onClick={() => { setOriginId(null); setDestId(null); setLockAuto(false); }}>초기화</Mini>
                                <Btn $kind="primary" onClick={addToCart} disabled={!readyToAdd || !phoneE164 || children.length === 0}>담기</Btn>
                            </RowInline>
                        </Card>
                    </ColB>
                </TopRow>

                {/* 하단: 장바구니 */}
                <BottomRow>
                    <Card>
                        <CardTitle>요약(장바구니)</CardTitle>
                        <Summary>
                            {cart.length === 0 ? (
                                <div style={{ color: '#6b7280' }}>아직 담은 예약이 없습니다. 상단에서 정보를 선택 후 <b>담기</b>를 눌러 추가하세요.</div>
                            ) : (
                                <>
                                    <CartList>
                                        {cart.map((it, idx) => (
                                            <CartItem key={it.id}>
                                                <div className="meta">
                                                    <div>{idx + 1}. {it.child} — {it.date} {String(it.hour).padStart(2, "0")}:{String(it.minute).padStart(2, "0")}</div>
                                                    <div>출발: {it.origin.name} ({it.origin.address || "주소 없음"})</div>
                                                    <div>도착: {it.dest.name} ({it.dest.address || "주소 없음"})</div>
                                                    <div style={{ color: '#6b7280' }}>거리 {it.distanceKm} km</div>
                                                    {it.memo ? <div style={{ color: '#6b7280' }}>메모: {it.memo}</div> : null}
                                                    {it.images?.length ? <div style={{ color: '#6b7280' }}>사진 {it.images.length}장 첨부</div> : null}
                                                </div>
                                                <div className="price">{(it.fareKRW || 0).toLocaleString()}원</div>
                                                <Mini onClick={() => removeItem(it.id)}>삭제</Mini>
                                            </CartItem>
                                        ))}
                                    </CartList>

                                    <FareTable>
                                        <div className="row total"><span>합계({cart.length}건)</span><span>{cartTotal.toLocaleString()}원</span></div>
                                    </FareTable>
                                </>
                            )}
                        </Summary>

                        <SubmitBar>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                <Mini onClick={clearCart} disabled={cart.length === 0}>모두 비우기</Mini>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <Btn $kind="accent" onClick={submitAll} disabled={cart.length === 0 || !phoneE164 || submitting}>
                                        {submitting ? "예약 처리 중…" : "모두 예약하기"}
                                    </Btn>
                                </div>
                            </div>
                        </SubmitBar>
                    </Card>
                </BottomRow>
            </Wrap>

            {/* 지도 모달 */}
            <MapPickerModal
                open={!!mapOpen.which}
                title={mapOpen.which === "origin" ? "출발지 목록에서 선택" : "도착지 목록에서 선택"}
                points={points}
                selectedId={(mapOpen.which === "origin" ? originId : destId) || null}
                onClose={() => setMapOpen({ which: null })}
                onConfirm={(p) => { if (mapOpen.which === "origin") setOriginId(p.id); else setDestId(p.id); setMapOpen({ which: null }); }}
            />
        </Page>
    );
}
