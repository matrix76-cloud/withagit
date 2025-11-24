// src/pages/programs/ProgramDetailDesktop.jsx
/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronLeft, FiX } from "react-icons/fi";

/* ===== 색상 토큰 ===== */
const color = {
    bg: "#F7F8FA",
    card: "#FFFFFF",
    text: "#111827",
    sub: "#6B7280",
    border: "#E5E7EB",
    primary: "#4F8AFE",
    primarySoft: "#E9F1FF",
    accent: "#FFB020",
    danger: "#EF4444",
    success: "#10B981",
};

/* ===== 목업 프로그램 데이터 ===== */
const STORE = {
    p1: {
        id: "p1",
        title: "가을 숲 체험 교실",
        summary: "숲 해설사와 함께하는 자연놀이",
        unitPrice: 0, isFree: true,
        badges: { free: true, hot: true, lastFew: false },
        ageBand: "초1–3", region: "노원구",
        images: ["https://picsum.photos/seed/forest/1400/900", "https://picsum.photos/seed/forest2/600/400"],
        allowedDates: ["2025-10-11", "2025-10-18", "2025-10-25"],
        slots: {
            "2025-10-11": [{ slotId: "p1-1011-1", start: "10:00", end: "12:00", remaining: 7 }, { slotId: "p1-1011-2", start: "13:30", end: "15:00", remaining: 0 }],
            "2025-10-18": [{ slotId: "p1-1018-1", start: "10:00", end: "12:00", remaining: 5 }],
            "2025-10-25": [{ slotId: "p1-1025-1", start: "10:00", end: "12:00", remaining: 9 }, { slotId: "p1-1025-2", start: "14:00", end: "16:00", remaining: 4 }],
        },
    },
    p2: {
        id: "p2", title: "클레이 공방 원데이", summary: "나만의 컵 만들기(가족 동반 가능)",
        unitPrice: 25000, isFree: false, badges: { free: false, hot: false, lastFew: true },
        ageBand: "5–7세", region: "송파구",
        images: ["https://picsum.photos/seed/clay/1400/900", "https://picsum.photos/seed/clay2/600/400"],
        allowedDates: ["2025-10-12", "2025-10-19"],
        slots: {
            "2025-10-12": [{ slotId: "p2-1012-1", start: "14:00", end: "16:00", remaining: 3 }],
            "2025-10-19": [{ slotId: "p2-1019-1", start: "14:00", end: "16:00", remaining: 8 }],
        }
    },
    p3: {
        id: "p3", title: "주니어 캠프 – 자연과 친구", summary: "하룻밤 야외캠핑(안전지도 포함)",
        unitPrice: 69000, isFree: false, badges: { free: false, hot: true, lastFew: false },
        ageBand: "초4–6", region: "양평",
        images: ["https://picsum.photos/seed/camp/1400/900", "https://picsum.photos/seed/camp2/600/400"],
        allowedDates: ["2025-10-18"],
        slots: { "2025-10-18": [{ slotId: "p3-1018-1", start: "13:00", end: "익일 11:00", remaining: 15 }] }
    }
};

const CHILDREN = [{ id: "c1", name: "민준" }, { id: "c2", name: "서연" }];

/* ===== 유틸 ===== */
const fmtWon = (n) => (n === 0 ? "무료" : `₩${n.toLocaleString()}`);
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const fmtDateK = (s) => { const dt = parseISO(s); return `${dt.getMonth() + 1}/${dt.getDate()}(${WEEK[dt.getDay()]})`; };
const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/* ===== 페이지 ===== */
export default function ProgramDetailDesktop() {
    const { id } = useParams();
    const program = STORE[id];
    const navigate = useNavigate();

    useEffect(() => { window.scrollTo(0, 0); }, []);
    if (!program) {
        return (
            <Page>
                <Header>
                    <BackBtn onClick={() => navigate(-1)} aria-label="뒤로가기"><FiChevronLeft /></BackBtn>
                    <H1>프로그램 상세</H1>
                </Header>
                <Empty>존재하지 않는 프로그램입니다.</Empty>
            </Page>
        );
    }

    const allowedDates = useMemo(() => [...program.allowedDates].sort(), [program]);
    const months = useMemo(() => Array.from(new Set(allowedDates.map(d => d.slice(0, 7)))), [allowedDates]);

    const [viewMonth, setViewMonth] = useState(months[0] || "");
    const [selectedDate, setSelectedDate] = useState(allowedDates[0] || "");
    const [defaultChild, setDefaultChild] = useState(CHILDREN[0]?.id || null);
    const [picks, setPicks] = useState([]); // {slotId,date,start,end,price,childId}

    const [y, m] = viewMonth ? viewMonth.split("-").map(Number) : [0, 0];
    const first = new Date(y, m - 1, 1).getDay();
    const last = new Date(y, m, 0).getDate();
    const monthCells = useMemo(() => { const c = []; for (let i = 0; i < first; i++) c.push(null); for (let d = 1; d <= last; d++) c.push(d); return c; }, [first, last]);
    const allowedSet = useMemo(() => new Set(allowedDates), [allowedDates]);

    const monthIdx = months.findIndex(mm => mm === viewMonth);
    const canPrev = monthIdx > 0, canNext = monthIdx >= 0 && monthIdx < months.length - 1;

    const slots = useMemo(() => {
        if (!selectedDate) return [];
        const arr = program.slots[selectedDate] || [];
        return [...arr].sort((a, b) => a.start.localeCompare(b.start));
    }, [program, selectedDate]);

    const isPicked = (slotId) => picks.some(p => p.slotId === slotId);
    const togglePick = (slot) => {
        setPicks(prev => {
            const has = prev.find(p => p.slotId === slot.slotId);
            if (has) return prev.filter(p => p.slotId !== slot.slotId);
            if ((slot.remaining || 0) <= 0) return prev;
            return [...prev, { slotId: slot.slotId, date: selectedDate, start: slot.start, end: slot.end, price: program.unitPrice, childId: defaultChild }];
        });
    };
    const removePick = (slotId) => setPicks(prev => prev.filter(p => p.slotId !== slotId));
    const updatePickChild = (slotId, childId) => setPicks(prev => prev.map(p => p.slotId === slotId ? { ...p, childId } : p));

    const totalCnt = picks.length;
    const totalPrice = picks.reduce((s, p) => s + (p.price || 0), 0);

    const submit = () => {
        if (!picks.length) return;
        const payload = { programId: program.id, items: picks.map(p => ({ slotId: p.slotId, childId: p.childId })) };
        alert(`[예약 요청]\n${JSON.stringify(payload, null, 2)}`);
    };

    return (
        <Page>
            <Header>
                <BackBtn onClick={() => navigate(-1)} aria-label="뒤로가기"><FiChevronLeft /></BackBtn>
                <H1>{program.title}</H1>
            </Header>

            <Shell>
                {/* 좌: 갤러리 & 설명 */}
                <Main>
                    <Gallery>
                        <HeroImg style={{ backgroundImage: `url(${program.images[0]})` }} />
                        <Thumbs>
                            {program.images.map((src, i) => (
                                <SmallThumb key={i} style={{ backgroundImage: `url(${src})` }} onClick={() => { /* 간단 프리뷰 교체 */ }} />
                            ))}
                        </Thumbs>
                    </Gallery>

                    <InfoCard>
                        <Row>
                            <BadgeRow>
                                {program.badges.free && <Badge $type="success">무료</Badge>}
                                {program.badges.hot && <Badge $type="primary">인기</Badge>}
                                {program.badges.lastFew && <Badge $type="warn">마감임박</Badge>}
                            </BadgeRow>
                            <Price>{fmtWon(program.unitPrice)}</Price>
                        </Row>
                        <Summary>{program.summary}</Summary>
                        <MetaLine>대상 <b>{program.ageBand}</b> · 지역 <b>{program.region}</b></MetaLine>
                    </InfoCard>

                    <Section>
                        <SectionTitle>상세 안내</SectionTitle>
                        <P>· 안전을 최우선으로 운영하며, 필요 시 담당자 안내 메시지가 발송됩니다.</P>
                        <P>· 준비물/복장은 추후 안내문자를 통해 별도 공지됩니다.</P>
                    </Section>
                </Main>

                {/* 우: 예약 패널 */}
                <Aside>
                    <BookCard>
                        <BookTitle>예약</BookTitle>

                        <CalWrap>
                            <CalHead>
                                <NavBtn disabled={!canPrev} onClick={() => canPrev && setViewMonth(months[monthIdx - 1])}>◀</NavBtn>
                                <strong>{y}년 {m}월</strong>
                                <NavBtn disabled={!canNext} onClick={() => canNext && setViewMonth(months[monthIdx + 1])}>▶</NavBtn>
                            </CalHead>

                            <CalGrid>
                                {WEEK.map(w => <CalWeek key={w}>{w}</CalWeek>)}
                                {monthCells.map((d, i) => {
                                    if (d === null) return <CalCell key={`x-${i}`} />;
                                    const dIso = iso(y, m, d);
                                    const ok = allowedSet.has(dIso);
                                    const sel = selectedDate === dIso;
                                    return (
                                        <CalCell key={dIso} $disabled={!ok} $selected={sel} onClick={() => ok && setSelectedDate(dIso)}>{d}</CalCell>
                                    )
                                })}
                            </CalGrid>
                        </CalWrap>

                        <SlotsBox>
                            {selectedDate && <SlotLabel>{fmtDateK(selectedDate)} 예약 가능 시간</SlotLabel>}
                            <SlotGrid>
                                {(program.slots[selectedDate] || []).map(slot => {
                                    const picked = isPicked(slot.slotId);
                                    const disabled = (slot.remaining || 0) <= 0;
                                    return (
                                        <SlotBtn key={slot.slotId} $picked={picked} disabled={disabled} onClick={() => togglePick(slot)}>
                                            <div className="t">{slot.start}–{slot.end}</div>
                                            <div className="r">{disabled ? "매진" : `잔여 ${slot.remaining}`}</div>
                                        </SlotBtn>
                                    );
                                })}
                                {(!program.slots[selectedDate] || !program.slots[selectedDate].length) && <EmptySmall>선택한 날짜는 예약 가능한 시간이 없습니다.</EmptySmall>}
                            </SlotGrid>
                        </SlotsBox>

                        <ChildBar>
                            <span>기본 자녀</span>
                            <Sel value={defaultChild || ""} onChange={e => setDefaultChild(e.target.value)}>
                                {CHILDREN.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Sel>
                        </ChildBar>

                        <PickList>
                            <PickTitle>선택한 예약</PickTitle>
                            {picks.length === 0 ? <EmptySmall>선택한 시간이 없습니다.</EmptySmall> : (
                                <ul>
                                    {picks.map(p => (
                                        <li key={p.slotId}>
                                            <div className="info">
                                                <div className="date">{fmtDateK(p.date)}</div>
                                                <div className="time">{p.start}–{p.end}</div>
                                            </div>
                                            <div className="meta">
                                                <span className="price">{fmtWon(p.price)}</span>
                                                <Sel value={p.childId} onChange={e => updatePickChild(p.slotId, e.target.value)}>
                                                    {CHILDREN.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </Sel>
                                                <IconBtn onClick={() => removePick(p.slotId)} aria-label="삭제"><FiX /></IconBtn>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </PickList>

                        <SummaryRow>
                            <div><b>{totalCnt}</b>회 선택</div>
                            <div className="sum">{fmtWon(totalPrice)}</div>
                        </SummaryRow>

                        <PrimaryBtn disabled={!picks.length} onClick={submit}>예약하기</PrimaryBtn>
                    </BookCard>
                </Aside>
            </Shell>
        </Page>
    );
}

/* ===== 스타일 ===== */
const Page = styled.main`
  min-height: 100vh;
  background: ${color.bg};
  color: ${color.text};
`;
const Header = styled.header`
  position: sticky; top: 0; z-index: 10;
  background: ${color.card};
  border-bottom: 1px solid ${color.border};
  padding: 12px 16px;
  display: flex; align-items: center; gap: 10px;
`;
const BackBtn = styled.button`
  width: 38px; height: 38px; border-radius: 10px; border:1px solid ${color.border}; background:#fff;
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  svg{width:20px;height:20px;}
  &:hover{background:#fafafa;}
`;
const H1 = styled.h1` margin:0; font-size:20px; font-weight:900; `;

const Shell = styled.div`
  max-width: 1200px; margin: 0 auto; padding: 18px 16px 80px;
  display: grid; grid-template-columns: 1.6fr 1fr; gap: 18px;
  @media (max-width: 1024px){ grid-template-columns: 1fr; }
`;
const Main = styled.div` display: grid; gap: 16px; `;
const Aside = styled.aside`
  position: sticky; top: 76px; align-self: start;
  @media (max-width: 1024px){ position: static; }
`;

const Gallery = styled.section` display: grid; gap: 8px; `;
const HeroImg = styled.div` width:100%; aspect-ratio: 16/9; border-radius: 16px; background:#eee center/cover no-repeat; `;
const Thumbs = styled.div` display: grid; grid-auto-flow: column; gap: 8px; overflow-x: auto; `;
const SmallThumb = styled.div` width: 120px; height: 72px; border-radius: 8px; background:#ddd center/cover no-repeat; cursor: pointer; `;

const InfoCard = styled.section`
  background:${color.card}; border:1px solid ${color.border}; border-radius:16px; padding:14px; display:grid; gap:8px;
`;
const Row = styled.div` display:flex; align-items:center; justify-content:space-between; `;
const BadgeRow = styled.div` display:flex; gap:6px; `;
const Badge = styled.span`
  font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 999px;
  ${({ $type }) => $type === "success" && css`background: #E9FAF3; color: ${color.success};`}
  ${({ $type }) => $type === "primary" && css`background: ${color.primarySoft}; color: ${color.primary};`}
  ${({ $type }) => $type === "warn" && css`background: #FFF5E6; color: ${color.accent};`}
`;
const Price = styled.div` font-weight: 900; `;
const Summary = styled.p` margin:0; color:${color.sub}; `;
const MetaLine = styled.div` color:${color.sub}; `;

const Section = styled.section` background:${color.card}; border:1px solid ${color.border}; border-radius:16px; padding:14px; `;
const SectionTitle = styled.h3` margin:0 0 8px; font-size:16px; font-weight:900; `;
const P = styled.p` margin:0 0 6px; color:${color.text}; `;

const BookCard = styled.section`
  background:${color.card}; border:1px solid ${color.border}; border-radius:16px; padding:14px; display:grid; gap:12px;
`;
const BookTitle = styled.h3` margin:0; font-size:16px; font-weight:900; `;

const CalWrap = styled.div``;
const CalHead = styled.div` display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; `;
const NavBtn = styled.button` height:32px; padding:0 10px; border:1px solid ${color.border}; border-radius:8px; background:#fff; cursor:pointer; &:disabled{opacity:.5;cursor:default;}`;
const CalGrid = styled.div` display:grid; grid-template-columns: repeat(7,1fr); gap:6px; `;
const CalWeek = styled.div` text-align:center; color:${color.sub}; font-size:12px; padding:4px 0; `;
const CalCell = styled.button`
  height:40px; border-radius:10px; border:1px solid ${color.border}; background:#fff; font-weight:700; cursor:pointer;
  ${({ $disabled }) => $disabled && css`opacity:.35; cursor:not-allowed; background:#fafafa;`}
  ${({ $selected }) => $selected && css`border-color:${color.primary}; box-shadow:0 0 0 3px ${color.primarySoft}; color:${color.primary};`}
`;

const SlotsBox = styled.div``;
const SlotLabel = styled.div` font-weight:700; margin:6px 0; `;
const SlotGrid = styled.div` display:grid; grid-template-columns: repeat(1,1fr); gap:8px; `;
const SlotBtn = styled.button`
  border:1px solid ${color.border}; border-radius:12px; background:#fff; height:50px; display:grid; place-content:center; cursor:pointer;
  .t{font-weight:800;} .r{font-size:12px; color:${color.sub};}
  &:disabled{opacity:.4; cursor:not-allowed; text-decoration: line-through;}
  ${({ $picked }) => $picked && css`border-color:${color.primary}; box-shadow:0 0 0 3px ${color.primarySoft}; .t{color:${color.primary};}`}
`;

const ChildBar = styled.div` display:flex; align-items:center; gap:8px; `;
const Sel = styled.select` height:34px; padding:0 10px; border:1px solid ${color.border}; border-radius:10px; `;

const PickList = styled.div`
  ul{list-style:none; padding:0; margin:0; display:grid; gap:10px;}
  li{display:flex; justify-content:space-between; align-items:center; border:1px solid ${color.border}; border-radius:12px; padding:10px; background:${color.card};}
  .info{display:grid;} .date{font-weight:800;} .time{color:${color.sub}; font-size:13px;}
  .meta{display:flex; align-items:center; gap:8px;} .price{font-weight:800;}
`;
const IconBtn = styled.button` width:34px; height:34px; border:1px solid ${color.border}; border-radius:10px; background:#fff; display:grid; place-content:center; cursor:pointer; svg{width:18px;height:18px;}`;
const SummaryRow = styled.div` display:flex; justify-content:space-between; font-weight:800; `;
const PrimaryBtn = styled.button` height:44px; border-radius:12px; background:${color.primary}; color:#fff; border:none; font-weight:800; cursor:pointer; &:disabled{opacity:.5; cursor:default;}`;
const Empty = styled.div` max-width:1200px; margin:24px auto; padding:24px; text-align:center; border:1px dashed ${color.border}; border-radius:16px; background:${color.card}; color:${color.sub}; `;

const PickTitle = styled.h4`
  margin: 8px 0 6px;
  font-size: 15px;
  font-weight: 900;
  color: ${color.text};
  display: flex;
  align-items: center;
  gap: 8px;

  /* 선택 개수 같은 보조 배지를 오른쪽에 두고 싶으면 사용 */
  .badge {
    margin-left: auto;
    padding: 2px 8px;
    border-radius: 999px;
    background: ${color.primarySoft};
    color: ${color.primary};
    font-size: 12px;
    font-weight: 800;
  }
`;

const EmptySmall = styled.div`
  color: ${color.sub};
  background: ${color.card};
  border: 1px dashed ${color.border};
  border-radius: 12px;
  padding: 12px;
  text-align: center;
`;