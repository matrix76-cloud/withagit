/* eslint-disable */
// src/components/HomeHero.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { listBanners } from "../services/bannerService";
import fallbackBanner from "../assets/images/banner_main.png";

import icoPickup from "../assets/icons/ic_pickup.png";
import icoCharge from "../assets/icons/ic_membership.png";
import icoProgram from "../assets/icons/ic_coin.png";
import icoPass from "../assets/icons/ic_download.png";
import icoFood from "../assets/icons/ic_food.png";

import { imageDB } from "../utils/imageDB";
import CheckoutConfirmDialog from "./CheckoutConfirmDialog";

import { db } from "../services/api";
import { collection, getDocs, query, where } from "firebase/firestore";
import { createOrderDraft } from "../services/orderService";


// (선택) 주문 초안 저장 서비스가 있으면 사용 — 없으면 아래 onCreateOrder에서 임시 OK만 리턴
// import { createOrderDraft } from "../services/memberService";

const HERO_H = 'clamp(260px, 30vw, 420px)';

/* ===== theme helpers ===== */
const GRAD_HEADER_END = "#FFD04A";
const GRAD_CONTINUE_1 = "#FFD968";
const GRAD_CONTINUE_2 = "#FFE08A";
const RIGHT_COL_WIDTH = 280;
const LEFT_FR = 2.0;

const BTN_ELEVATION = `
  box-shadow: 0 14px 28px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.22);
  position: relative;
  isolation: isolate;
  &::after{
    content:""; position:absolute; inset:0; border-radius:inherit;
    background: linear-gradient(180deg, rgba(255,255,255,.24) 0%, rgba(0,0,0,0) 50%);
    pointer-events:none; mix-blend-mode: screen; opacity:.65;
  }
`;
const BTN_GRAD = {
  pickup: { start: "#57D6E3", end: "#2BB1C3", text: "#082a2f" },
  membership: { start: "#F8C56E", end: "#E89C3A", text: "#3a2608" },
  program: { start: "#FF7AAE", end: "#E04583", text: "#3a0f24" },
  pass: { start: "#8D93FF", end: "#5D68F6", text: "#12143a" },
  snack: { start: "#8FD36A", end: "#54B04A", text: "#0f2a12" },
};

/* ===== background ===== */
const Section = styled.section`
  position: relative; width: 100%; overflow: hidden;
  background: linear-gradient(180deg, ${GRAD_HEADER_END} 0%, ${GRAD_CONTINUE_1} 38%, ${GRAD_CONTINUE_2} 100%);
`;
const drift = keyframes`0%{transform:translateX(0)}50%{transform:translateX(24px)}100%{transform:translateX(0)}`;
const Clouds = styled.div`
  pointer-events: none; position: absolute; left:0; right:0; bottom:0;
  height: clamp(120px, 24vw, 240px); z-index:1;
  background:
    radial-gradient(ellipse 140px 70px at 12% 80%, #fff 60%, transparent 61%),
    radial-gradient(ellipse 110px 60px at 28% 85%, #fff 60%, transparent 61%),
    radial-gradient(ellipse 150px 80px at 45% 88%, #fff 60%, transparent 61%),
    radial-gradient(ellipse 120px 65px at 62% 84%, #fff 60%, transparent 61%),
    radial-gradient(ellipse 150px 75px at 80% 86%, #fff 60%, transparent 61%),
    radial-gradient(ellipse 36px 18px at 20% 60%, #fff 60%, transparent 61%),
    radial-gradient(ellipse 28px 14px at 52% 58%, #fff 60%, transparent 61%),
    radial-gradient(ellipse 30px 16px at 88% 62%, #fff 60%, transparent 61%);
  animation: ${drift} 4s ease-in-out infinite;
  &::before{ content:""; position:absolute; inset:-24px -24px 0 -24px; background:linear-gradient(180deg,transparent 0,#fff 100%); filter:blur(2px); }
`;
const Horizon = styled.div`
  pointer-events:none; position:absolute; left:0; right:0; bottom:0; height:clamp(20px,4vw,40px);
  z-index:0; background:linear-gradient(180deg, rgba(255,238,170,.8) 0%, rgba(255,233,150,.95) 100%);
`;
const Container = styled.div`position:relative; z-index:2; max-width:1360px; margin:0 auto; padding:24px 28px 44px 12px;`;
const Grid = styled.div`
  display:grid; grid-template-columns:${LEFT_FR}fr ${RIGHT_COL_WIDTH}px; gap:24px; align-items:start;
  @media (max-width:980px){ grid-template-columns:1fr; }
`;

/* ===== banner ===== */
const Card = styled.div`
  position: relative; height: ${HERO_H};
  border-radius: 24px; overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,.16); background: #fff;
`;
const FadeSlide = styled.img`
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transform: ${({ $active }) => ($active ? "scale(1)" : "scale(1.02)")};
  transition: opacity .6s ease, transform .8s ease;
  display: block; pointer-events: ${({ $active }) => ($active ? "auto" : "none")};
`;
const Shade = styled.div`
  position: absolute; inset:0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.28) 72%, rgba(0,0,0,.45) 100%);
  pointer-events:none;
`;
const TextWrap = styled.div`
  position:absolute; left:28px; bottom:28px; right:28px;
  color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.3);
  display:grid; gap:12px; max-width:78%;
`;
const Title = styled.h1`margin:0; font-size:44px; line-height:1.22; font-weight:900; letter-spacing:-.2px; white-space:pre-line;`;
const Subtitle = styled.p`margin:0; font-size:18px; line-height:1.6; opacity:.95; font-weight:600;`;
const Cta = styled.a`
  display:inline-flex; align-items:center; justify-content:center;
  height:52px; padding:0 24px; border-radius:12px; background:#195fd7; color:#fff; text-decoration:none; font-weight:800;
  width:fit-content; box-shadow:0 12px 24px rgba(0,87,200,.25);
`;

/* ===== side ===== */
const Side = styled.aside`display:grid; gap:12px;`;
const SideLabel = styled.div`font-size:18px; font-weight:900; letter-spacing:.4px; color:#fff; text-shadow:0 1px 0 rgba(0,0,0,.2); margin-top:6px;`;
const Stack = styled.div`display:grid; grid-auto-rows:72px; gap:6px; justify-items:start;`;
const GradientBtn = styled.a`
  width:66%; max-width:320px; min-width:240px;
  display:grid; grid-template-columns:auto 1fr; align-items:center; gap:12px;
  height:62px; padding:0 18px; border-radius:20px; text-decoration:none;
  ${({ $v = "membership" }) => {
    const p = BTN_GRAD[$v] ?? BTN_GRAD.membership;
    return css`background:linear-gradient(180deg, ${p.start} 0%, ${p.end} 100%); color:${p.text};`;
  }}
  ${BTN_ELEVATION}
  img{ width:44px; height:44px; object-fit:contain; }
  b{ font-size:18px; letter-spacing:.2px; }
  transition: transform .14s ease, filter .14s ease, box-shadow .14s ease;
  &:hover{ filter:brightness(1.05) saturate(1.02); transform:translateY(-1px); }
  &:active{ transform:translateY(0); box-shadow:0 10px 20px rgba(0,0,0,.10), 0 3px 8px rgba(0,0,0,.08); }
`;

/* ===== imageDB → banners resolve ===== */
const normalizeBanners = (arr) =>
  (arr || [])
    .map(v => (typeof v === "string" ? { imageUrl: v } : v))
    .filter(v => v && v.imageUrl);

function resolveImageDbBanners() {
  const cands = [];
  if (Array.isArray(imageDB?.hero?.banners)) cands.push(...imageDB.hero.banners);
  if (Array.isArray(imageDB?.home?.banners)) cands.push(...imageDB.home.banners);
  if (Array.isArray(imageDB?.HomeHeroList)) cands.push(...imageDB.HomeHeroList);
  if (Array.isArray(imageDB?.BANNERS)) cands.push(...imageDB.BANNERS);
  if (imageDB?.HomeHero) cands.push({ imageUrl: imageDB.HomeHero });
  if (imageDB?.homeHero) cands.push({ imageUrl: imageDB.homeHero }); // ✅ 오타 수정(c.add → push)
  return normalizeBanners(cands);
}

/* === 정규 멤버십 활성 여부(DB 기준) === */
function useAgitzActiveDb(phoneE164) {
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!phoneE164) { setActive(false); return; }
      setLoading(true);
      try {
        const colRef = collection(db, "members", phoneE164, "memberships");
        const qy = query(colRef, where("kind", "==", "agitz"));
        const snap = await getDocs(qy);
        let hasActive = false;
        snap.forEach(d => {
          const v = d.data() || {};
          const ok = v?.status === "active" || (v?.expiresAt ? v.expiresAt > Date.now() : false);
          if (ok) hasActive = true;
        });
        if (alive) setActive(hasActive);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [phoneE164]);

  return { loading, active };
}

/* === 자녀 존재 여부(DB 기준) === */
function useHasChildrenDb(phoneE164) {
  const [loading, setLoading] = React.useState(false);
  const [has, setHas] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!phoneE164) { setHas(false); return; }
      setLoading(true);
      try {
        const colRef = collection(db, "members", phoneE164, "children");
        const snap = await getDocs(colRef);
        if (alive) setHas(!snap.empty);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [phoneE164]);

  return { loading, has };
}


export default function HomeHero() {
  const [items, setItems] = useState([]);
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  const [openPoints, setOpenPoints] = useState(false);
  const [pointsPayload, setPointsPayload] = useState(null);

  const { initialized, memberships, children, phoneE164, profile } = useUser() || {};


  // ⬇️ DB 스냅샷 기반 상태 사용
  const { loading: agitzLoading, active: agitzActiveDb } = useAgitzActiveDb(phoneE164);
  const { loading: childLoading, has: hasChildDb } = useHasChildrenDb(phoneE164);


  // ✅ 다이얼로그에 buyer/amount를 명확히 전달 (kind 전용)
  const openPointsDialog = (amount = 10000) => {
    setPointsPayload({
      product: { id: "points.basic", name: "정액권(포인트)", kind: "points" }, // ← kind만 사용
      price: { subtotal: amount, discount: 0, total: amount },
      buyer: { name: profile?.displayName || "", phoneE164: phoneE164 || "", email: profile?.email || "" },
      amount: amount,
    });
    setOpenPoints(true);
  };

  /* 데이터 로드 */
  useEffect(() => {
    let alive = true;
    (async () => {
      let banners = resolveImageDbBanners();
      if (!banners.length) {
        try {
          const { items: fsItems } = await listBanners({ pageSize: 5 });
          banners = normalizeBanners(fsItems);
        } catch (e) {
          console.warn("[HomeHero] listBanners fallback error:", e);
        }
      }
      if (!banners.length) banners = [{ imageUrl: fallbackBanner }];

      if (alive) { setItems(banners); setCur(0); }
    })();
    return () => { alive = false; };
  }, []);

  /* 3초 자동 슬라이드 + hover 일시정지 */
  useEffect(() => {
    if (items.length <= 1) return;
    if (paused) return;
    const id = setInterval(() => setCur((prev) => (prev + 1) % items.length), 3000);
    return () => clearInterval(id);
  }, [items.length, paused]);

  const active = items[cur] || {};
  const showText = active.title || active.subtitle || active.ctaText;
  const nav = useNavigate();

  const handleBannerClick = (b) => {
    if (!b) return;
    const href = b.link || b.ctaHref;
    if (href) {
      if (/^https?:\/\//i.test(href)) { window.location.href = href; return; }
      nav(href); return;
    }
    if (b?.noticeId) { nav(`/notices#${b.noticeId}`); return; }
    nav("/notice");
  };

  const toE164 = (v) => {
    if (!v) return "";
    let d = String(v).replace(/\D+/g, "");
    // 이미 +82로 들어오면 통과, 010으로 들어오면 +82로 변환 (예시는 간단화)
    if (d.startsWith("82")) return `+${d}`;
    if (d.startsWith("0")) return `+82${d.slice(1)}`;
    return `+${d}`;
  };

  // handler
  const handleCreateOrder = async (draft) => {
    try {
      const phoneE164 = toE164(draft?.buyer?.phoneE164);
      if (!phoneE164) return { ok: false, error: new Error("buyer.phoneE164 missing") };

      // orderService 시그니처: (phoneE164, payload)
      const res = await createOrderDraft(phoneE164, draft);   // ← 문서 생성(PENDING) 보장
      if (!res?.orderId) return { ok: false, error: new Error("no orderId returned") };

      return { ok: true, orderId: res.orderId };
    } catch (e) {
      return { ok: false, error: e };
    }
  };


  return (
    <Section>
      <Clouds />
      <Horizon />

      <Container>
        <Grid>
          <Card onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {items.map((b, i) => (
              <FadeSlide
                key={b.id || i}
                src={b.imageUrl || fallbackBanner}
                alt={b.title || "배너"}
                onClick={() => handleBannerClick(b)}
                $active={i === cur}
              />
            ))}
            <Shade />
            {showText && (
              <TextWrap>
                {active.title && <Title>{String(active.title)}</Title>}
                {active.subtitle && <Subtitle>{String(active.subtitle)}</Subtitle>}
                {active.ctaText && active.ctaHref && <Cta href={String(active.ctaHref)}>{String(active.ctaText)}</Cta>}
              </TextWrap>
            )}
          </Card>

          <Side>
            <SideLabel>MAIN MENU</SideLabel>
            <Stack>
              <GradientBtn
                $v="pickup"
                href="#"
                onClick={(e) => {
                  e.preventDefault();

                  // 로딩 중 가드
                  if (!initialized || agitzLoading || childLoading) {
                    alert("계정 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
                    return;
                  }

                  if (!agitzActiveDb) {
                    alert("픽업 서비스는 ‘아지트 멤버십’ 가입 후 이용 가능합니다.");
                    return;
                  }
                  if (!hasChildDb) {
                    const go = window.confirm("등록된 자녀 정보가 없습니다.\n자녀를 먼저 등록하시겠습니까?");
                    if (go) window.location.href = "/mypage";
                    return;
                  }
                  window.location.href = "/pickup/apply";
                }}
              >
                <img src={icoPickup} alt="픽업 아이콘" />
                <b>픽업 신청하기</b>
              </GradientBtn>

              <GradientBtn $v="membership" href="/membership"><img src={icoCharge} alt="" /><b>멤버쉽 구매</b></GradientBtn>
              <GradientBtn $v="program" href="/programs"><img src={icoProgram} alt="" /><b>프로그램 예약</b></GradientBtn>

              <GradientBtn
                $v="pass"
                href="#"
                onClick={(e) => { e.preventDefault(); openPointsDialog(10000); }}
              >
                <img src={icoPass} alt="" />
                <b>정액권 구매</b>
              </GradientBtn>

              <GradientBtn $v="snack"><img src={icoFood} alt="" /><b>간식신청하기</b></GradientBtn>

              <CheckoutConfirmDialog
                open={openPoints}
                onClose={() => setOpenPoints(false)}
                payload={pointsPayload}
                // ✅ 주문 초안 저장: 서비스가 있으면 호출, 없으면 임시 OK만
                onCreateOrder={handleCreateOrder}
                onPrepared={async () => ({ ok: true })}
              />
            </Stack>
          </Side>
        </Grid>
      </Container>
    </Section>
  );
}
