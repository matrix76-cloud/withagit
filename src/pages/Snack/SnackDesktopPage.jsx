// src/pages/snack/SnackDesktopPage.jsx
/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { imageDB } from "../../utils/imageDB";
import { listMenuBySections, getNearestSpecialEvent } from "../../services/snackService";

/* ===== 색상 토큰 ===== */
const C = {
    bg: "#F7F8FA",
    card: "#FFFFFF",
    text: "#111827",
    sub: "#6B7280",
    border: "#E5E7EB",
    primary: "#4F8AFE",
    primarySoft: "#E9F1FF",
    accent: "#FF7A1A",
    danger: "#EF4444",
};

/* ===== 유틸 ===== */
const won = (n) => `₩${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => {
    if (!(d instanceof Date)) return d || "-";
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    const w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${y}.${String(m).padStart(2, "0")}.${String(day).padStart(2, "0")}(${w})`;
};

/* ===== 페이지 ===== */
export default function SnackDesktopPage() {
    const nav = useNavigate();
    const loc = useLocation();

    /* 탭: 메뉴 / 특별간식 */
    const [tab, setTab] = useState("menu");
    useEffect(() => {
        const q = new URLSearchParams(loc.search).get("tab");
        if (q === "special") setTab("special");
    }, [loc.search]);

    /* 데이터 로딩 */
    const [basic, setBasic] = useState([]); // [{id,title,price,imageUrl}]
    const [growth, setGrowth] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const [{ basic: b, growth: g }, evt] = await Promise.all([
                    listMenuBySections(),
                    getNearestSpecialEvent(),
                ]);
                if (!alive) return;
                setBasic(b || []);
                setGrowth(g || []);
                setEvent(evt || null);
                setErr("");
            } catch (e) {
                console.error("[SnackDesktop] load error:", e);
                if (alive) setErr("LOAD_ERROR");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    /* 장바구니(메뉴 탭) */
    const [cart, setCart] = useState([]); // [{id,title,price,imageUrl,qty}]
    const inc = (item) => setCart((prev) => {
        const i = prev.findIndex(x => x.id === item.id);
        if (i === -1) return [...prev, { ...item, qty: 1 }];
        const next = [...prev]; next[i] = { ...next[i], qty: next[i].qty + 1 }; return next;
    });
    const dec = (item) => setCart((prev) => {
        const i = prev.findIndex(x => x.id === item.id);
        if (i === -1) return prev;
        const cur = prev[i].qty - 1;
        if (cur <= 0) return prev.filter(x => x.id !== item.id);
        const next = [...prev]; next[i] = { ...next[i], qty: cur }; return next;
    });
    const qtyOf = (id) => cart.find(x => x.id === id)?.qty || 0;
    const totalQty = cart.reduce((s, x) => s + x.qty, 0);
    const totalKRW = cart.reduce((s, x) => s + x.qty * (x.price || 0), 0);

    /* 특별간식 탭 */
    const [selected, setSelected] = useState(false);
    const timeLeft = useMemo(() => {
        if (!event?.deadlineTs) return "";
        const left = event.deadlineTs.getTime() - Date.now();
        if (left <= 0) return "마감됨";
        const h = Math.floor(left / 3600000);
        const m = Math.floor((left % 3600000) / 60000);
        return `${h}시간 ${m}분 남음`;
    }, [event?.deadlineTs]);
    const canReserve = Boolean(selected && event?.deadlineTs && event.deadlineTs.getTime() > Date.now());

    const onReserve = () => {
        if (!canReserve || !event) return;
        const payload = {
            eventId: event.id,
            product: { title: event.product?.title, price: event.product?.price },
        };
        console.log("[SPECIAL_RESERVE]", payload);
        alert(`[특별간식 예약 더미]\n${JSON.stringify(payload, null, 2)}`);
    };

    /* 액션(메뉴 탭) */
    const addToCartAll = () => {
        if (cart.length === 0) return alert("담은 간식이 없습니다.");
        console.log("[SNACK_CART]", cart);
        alert(`장바구니 이동(더미)\n총 ${totalQty}개 · ${won(totalKRW)}`);
    };
    const payNow = () => {
        if (cart.length === 0) return;
        const payload = { items: cart.map(({ id, title, qty, price }) => ({ id, title, qty, price })), totalKRW };
        console.log("[SNACK_PAY]", payload);
        alert(`[결제 플로우(더미)]\n총 ${totalQty}개 · ${won(totalKRW)}`);
    };

    return (
        <Page>
        

            <Wrap>
                {/* 메뉴 안내 */}
                {tab === "menu" && (
                    <>
                        <Hero>
                            <h1>간식 구매하기</h1>
                            <p>웹에서 간단히 담고 결제까지 한 번에!</p>
                        </Hero>

        

                        {loading && <Muted>불러오는 중…</Muted>}
                        {!loading && err && <Muted>메뉴를 불러오지 못했습니다.</Muted>}

                        {!loading && !err && (
                            <>
                                {!!basic.length && (
                                    <Section>
                                        <SectionHead>
                                            <SecTitle>기본 간식</SecTitle>
                                            <SecDesc>가볍게 즐기는 데일리 간식</SecDesc>
                                        </SectionHead>
                                        <CardGrid>
                                            {basic.map((it) => (
                                                <SnackCard key={it.id}>
                                                    <CardBox>
                                                        {!!qtyOf(it.id) && <QtyBadge>×{qtyOf(it.id)}</QtyBadge>}
                                                        <Thumb style={{ backgroundImage: `url(${it.imageUrl || imageDB.food})` }} />
                                                        <Info>
                                                            <ItemTitle title={it.title}>{it.title}</ItemTitle>
                                                            <ItemPrice>{won(it.price)}</ItemPrice>
                                                            <Stepper>
                                                                <button className="btn" onClick={() => dec(it)} aria-label="빼기">−</button>
                                                                <div className="qty">{qtyOf(it.id)}</div>
                                                                <button className="btn" onClick={() => inc(it)} aria-label="담기">＋</button>
                                                            </Stepper>
                                                        </Info>
                                                    </CardBox>
                                                </SnackCard>
                                            ))}
                                        </CardGrid>
                                    </Section>
                                )}

                                {!!growth.length && (
                                    <Section>
                                        <SectionHead>
                                            <SecTitle>성장 영양 간식</SecTitle>
                                            <SecDesc>영양 균형을 생각한 구성</SecDesc>
                                        </SectionHead>
                                        <CardGrid>
                                            {growth.map((it) => (
                                                <SnackCard key={it.id}>
                                                    <CardBox>
                                                        {!!qtyOf(it.id) && <QtyBadge>×{qtyOf(it.id)}</QtyBadge>}
                                                        <Thumb style={{ backgroundImage: `url(${it.imageUrl || imageDB.food})` }} />
                                                        <Info>
                                                            <ItemTitle title={it.title}>{it.title}</ItemTitle>
                                                            <ItemPrice>{won(it.price)}</ItemPrice>
                                                            <Stepper>
                                                                <button className="btn" onClick={() => dec(it)} aria-label="빼기">−</button>
                                                                <div className="qty">{qtyOf(it.id)}</div>
                                                                <button className="btn" onClick={() => inc(it)} aria-label="담기">＋</button>
                                                            </Stepper>
                                                        </Info>
                                                    </CardBox>
                                                </SnackCard>
                                            ))}
                                        </CardGrid>
                                    </Section>
                                )}

                                {!basic.length && !growth.length && <Empty>등록된 메뉴가 없습니다.</Empty>}
                            </>
                        )}
                    </>
                )}

                {/* 특별간식 예약 */}
                {tab === "special" && (
                    <>
                        {loading && <Muted>불러오는 중…</Muted>}
                        {!loading && err && <Muted>이벤트를 불러오지 못했습니다.</Muted>}
                        {!loading && !err && !event && <Muted>예약 가능한 특별간식이 없습니다.</Muted>}

                        {!!event && (
                            <>
                                <EventCard>
                                    <div className="title">{event.title}</div>
                                    <div className="meta">
                                        <span>마감: {event.deadlineTs ? fmtDate(event.deadlineTs) : (event.deadlineDate || "—")}</span>
                                        <Deadline $danger={timeLeft === "마감됨"}>{timeLeft}</Deadline>
                                    </div>
                                    <div className="branch">지점: {event.branch}</div>
                                </EventCard>

                                <Label>특별 간식</Label>
                                <SingleWrap>
                                    <SingleCard
                                        $on={selected}
                                        onClick={() => setSelected((s) => !s)}
                                        aria-label={event.product?.title}
                                    >
                                        <SingleThumb style={{ backgroundImage: `url(${event.product?.imageUrl || imageDB.food})` }} />
                                        <SingleOverlay>
                                            <div className="t">{event.product?.title}</div>
                                            <div className="p">{won(event.product?.price || 0)}</div>
                                        </SingleOverlay>
                                    </SingleCard>
                                </SingleWrap>

                                {/* 하단 예약 바 */}
                                <BottomBar>
                                    <div className="sum">
                                        {selected
                                            ? (<><b>{event.product?.title}</b> · {won(event.product?.price || 0)}</>)
                                            : "상품을 선택해 주세요"}
                                    </div>
                                    <PrimaryBtn disabled={!canReserve} onClick={onReserve}>예약하기</PrimaryBtn>
                                </BottomBar>
                            </>
                        )}
                    </>
                )}
            </Wrap>

            {/* 메뉴 탭 하단 Sticky 합계 바 */}
            {tab === "menu" && (
                <StickyBar>
                    <StickyInner>
                        <BarLeft>
                            <div className="sum">총 {totalQty}개 · {won(totalKRW)}</div>
                            <div className="sub">담은 간식은 장바구니에서 확인/수정할 수 있어요.</div>
                        </BarLeft>
                        <BarRight>
                            <Btn $kind="accent" onClick={payNow} disabled={!cart.length}>바로 결제</Btn>
                        </BarRight>
                    </StickyInner>
                </StickyBar>
            )}
        </Page>
    );
}

/* ================= 스타일 ================= */
const Page = styled.main`
  min-height: 100vh;
  background: ${C.bg};
  color: ${C.text};
  display: grid;
  grid-template-rows: auto auto 1fr;
`;

const Header = styled.header`
  background: ${C.card};
  border-bottom: 1px solid ${C.border};
  padding: 14px 16px;
`;
const Title = styled.h1` margin:0; font-size:22px; font-weight:900; `;

const Tabs = styled.div`
  position: sticky;
  top: 0;
  z-index: 8;
  background: ${C.bg};
  border-bottom: 1px solid ${C.border};
  padding: 10px 16px 8px;
  display: flex;
  gap: 8px;
`;
const TopTab = styled.button`
  height: 36px; padding: 0 14px; border-radius: 999px;
  cursor: pointer; font-weight: 900; font-size: 13px;
  background: ${({ $on }) => ($on ? "#F5F7FA" : "#fff")};
  color: #222;
  border: 1px solid ${({ $on }) => ($on ? "#D9DEE5" : C.border)};
  box-shadow: ${({ $on }) => ($on ? "inset 0 1px 0 rgba(255,255,255,.7)" : "none")};
  &:focus-visible { outline: 2px solid #d6d9de; outline-offset: 2px; }
`;

const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  width: 100%;
`;

const Hero = styled.section`
  background: ${C.card};
  border: 1px solid ${C.border};
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 14px;
  h1 { margin: 0; font-size: 24px; font-weight: 900; }
  p { margin: 6px 0 0; color: ${C.sub}; }
`;

const Callout = styled.div`
  background:#fff;
  border:1px solid ${C.border};
  border-radius:14px;
  padding:14px;
  box-shadow:0 4px 12px rgba(0,0,0,.03);
  margin-bottom:12px;
  h4{margin:0 0 6px; font-size:14px; font-weight:900;}
  p{margin:0; font-size:13px; color:${C.sub};}
  .actions{margin-top:10px;}
`;
const SmallBtn = styled.button`
  height:34px; padding:0 12px; border-radius:10px; font-weight:900; font-size:13px; cursor:pointer;
  background:#fff; color:#333; border:1px solid ${C.border};
  &:hover { background:#f9fafb; } &:active { transform: translateY(1px); }
`;

const Section = styled.section` margin-top: 10px; `;
const SectionHead = styled.div` display:grid; gap:4px; padding:6px 2px 8px; `;
const SecTitle = styled.h3` margin:0; font-size:16px; font-weight:900; color:${C.text}; `;
const SecDesc = styled.div` font-size:12px; color:${C.sub}; `;

const CardGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  @media (max-width: 1200px){ grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const SnackCard = styled.div`
  background: #fff;
  border: 1px solid ${C.border};
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,.03);
  display: grid;
`;
const CardBox = styled.div` position: relative; display: grid; `;
const Thumb = styled.div`
  aspect-ratio: 16 / 10;
  background: #f3f4f6 center/cover no-repeat;
`;
const Info = styled.div` padding: 10px; display: grid; gap: 6px; `;
const ItemTitle = styled.div` font-size: 15px; font-weight: 800; line-height: 1.3; `;
const ItemPrice = styled.div` font-size: 14px; font-weight: 800; color: ${C.accent}; `;
const Stepper = styled.div`
  margin-top: 2px;
  display: flex; gap: 8px; align-items: center; justify-content: flex-end;
  .btn {
    width: 34px; height: 34px;
    border-radius: 10px; border: 1px solid ${C.border};
    background: #fff; cursor: pointer; font-weight: 900;
    &:hover { background:#fafafa; }
    &:active { transform: translateY(1px); }
  }
  .qty { min-width: 28px; text-align: center; font-weight: 900; }
`;
const QtyBadge = styled.span`
  position: absolute;
  top: 8px; right: 8px;
  min-width: 24px; height: 24px; padding: 0 6px;
  border-radius: 999px;
  background: ${C.primary}; color: #fff;
  font-size: 12px; font-weight: 900;
  display: inline-flex; align-items: center; justify-content: center;
`;

const Muted = styled.div` padding: 12px; color: ${C.sub}; font-size: 13px; `;
const Empty = styled.div`
  display: grid; place-content: center; min-height: 200px;
  border: 1px dashed ${C.border}; border-radius: 16px; background: ${C.card}; color: ${C.sub};
`;

const EventCard = styled.div`
  background:#fff; border:1px solid ${C.border}; border-radius:14px; padding:14px;
  box-shadow:0 6px 14px rgba(0,0,0,.04); margin-bottom:12px;
  .title{font-weight:900; font-size:18px; margin-bottom:6px;}
  .meta{display:flex; justify-content:space-between; align-items:center; font-size:13px; color:${C.sub};}
  .branch{margin-top:6px; font-size:12px; color:${C.sub};}
`;
const Deadline = styled.span`
  display:inline-block; font-weight:900; padding:6px 10px; border-radius:999px; font-size:11px;
  color:${p => p.$danger ? '#fff' : '#1559d6'};
  background:${p => p.$danger ? C.danger : C.primarySoft};
`;

const Label = styled.div` font-size:12px; font-weight:800; color:#444; margin:4px 0 6px; `;
const SingleWrap = styled.div` display:grid; position:relative; `;
const SingleCard = styled.button`
  position:relative; width:100%; aspect-ratio:4/3; border-radius:14px;
  border:1px solid ${({ $on }) => $on ? "transparent" : C.border};
  overflow:hidden; background:#fff; cursor:pointer;
  box-shadow:0 6px 14px rgba(0,0,0,.04);
  outline: ${({ $on }) => $on ? `3px solid ${C.primary}` : "none"};
`;
const SingleThumb = styled.div`
  position:absolute; inset:0; background:#f3f4f6 center/cover no-repeat;
  transition: transform .25s ease; ${SingleCard}:hover & { transform: scale(1.02); }
`;
const SingleOverlay = styled.div`
  position:absolute; left:0; right:0; bottom:0; padding:10px 12px;
  background: linear-gradient(0deg, rgba(0,0,0,.65), rgba(0,0,0,0));
  color:#fff; display:flex; justify-content:space-between; align-items:center; gap:8px;
  .t{ font-weight:900; font-size:14px; text-shadow:0 2px 6px rgba(0,0,0,.35); }
  .p{ font-weight:900; font-size:13px; }
`;

const BottomBar = styled.div`
  position: fixed; left:0; right:0; bottom:0; z-index: 20;
  height: 64px; background: rgba(255,255,255,.94); backdrop-filter: blur(6px);
  border-top: 1px solid ${C.border}; padding: 10px 16px;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  .sum{ color: ${C.text}; font-size: 13px; }
  b{ font-weight: 900; }
`;
const PrimaryBtn = styled.button`
  height: 44px; padding: 0 16px; border-radius: 12px; border: 0; cursor: pointer;
  background: ${C.primary}; color: #fff; font-weight: 900;
  &:disabled { opacity: .5; cursor: default; }
`;

const StickyBar = styled.aside`
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(6px);
  border-top: 1px solid ${C.border};
`;
const StickyInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;
const BarLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  .sum { font-weight: 900; }
  .sub { color: ${C.sub}; font-size: 13px; }
`;
const BarRight = styled.div` display: flex; gap: 8px; align-items: center; `;
const Btn = styled.button`
  height: 42px; padding: 0 16px; border-radius: 10px; border: 0; cursor: pointer;
  font-weight: 900; color: #fff;
  background: ${({ $kind }) => ($kind === "accent" ? C.accent : C.primary)};
  box-shadow: 0 8px 18px rgba(0,0,0,.08);
  &:disabled { opacity: .5; cursor: default; }
`;
