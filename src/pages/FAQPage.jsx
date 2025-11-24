// src/pages/FAQPage.jsx
/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

/* ===== Tokens ===== */
const navy = "#1A2B4C";
const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const bg = "var(--color-surface, #FAF4EF)";
const surface = "#fff";
const primary = "var(--color-primary, #2F6BFF)";
const HEADER_VAR = "var(--header-height, 64px)";

/* ===== Layout ===== */
const Page = styled.main`
  min-height: 100dvh;
  background: ${bg};
  padding: calc(${HEADER_VAR} + 20px) 12px 100px;
`;
const Wrap = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 28px;
  @media (max-width: 860px){ grid-template-columns: 1fr; }
`;

/* ===== Left: Category ===== */
const Side = styled.aside`
  position: sticky;
  top: calc(${HEADER_VAR} + 10px);
  align-self: start;
  padding-right: 8px;
  @media (max-width: 860px){ position: static; }
`;
const CatList = styled.ul`
  margin: 0; padding: 0; list-style: none;
  display: grid; gap: 10px;
`;
const CatBtn = styled.button`
  width: 100%; text-align: left; background: transparent; border: 0; cursor: pointer;
  padding: 8px 0 8px 10px; font-size: 15px;
  color: ${({ $on }) => ($on ? primary : sub)};
  border-left: 3px solid ${({ $on }) => ($on ? primary : "transparent")};
`;

/* ===== Right: Search + list ===== */
const Main = styled.section``;

const H1 = styled.h1`
  margin: 0 0 10px;
  color: ${navy};
  letter-spacing: -0.2px;
  font-size: clamp(20px, 2.6vw, 26px);
  font-weight: 600;
`;

const SearchBar = styled.div`
  display: flex; align-items: center; gap: 10px;
  background: ${surface};
  /* 보더 제거, 소프트 섀도만 */
  border-radius: 12px;
  padding: 0 12px; height: 52px;
  box-shadow: 0 8px 24px rgba(17,24,39,.06);
  margin-bottom: 18px;
`;
const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5 6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l4.25 4.25 1.5-1.5L15.5 14zM5 9.5C5 7.01 7.01 5 9.5 5S14 7.01 14 9.5 11.99 14 9.5 14 5 11.99 5 9.5z" fill="#9aa2b1" />
  </svg>
);
const Input = styled.input`
  flex: 1 1 0; height: 100%;
  border: 0; outline: none; background: transparent;
  font-size: 16px; color: ${text};
  &::placeholder { color: #b6bdc9; }
`;

const ListWrap = styled.div`
  background: ${surface};
  border: none !important;        /* 외곽 보더 강제 제거 */
  border-radius: 14px;
  box-shadow: none !important;     /* 카드 그림자도 제거 */
  overflow: visible;               /* 내부 포커스 링 잘림 방지 */
  /* 어떤 글로벌 스타일이 outline을 강제로 넣어도 무시 */
  & *:focus, & *:focus-visible { outline: none !important; box-shadow: none !important; }
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 24px 20px;
  cursor: pointer;

  border: none !important;         /* 행 구분선/보더 제거 */
  background: transparent;
  /* hover 만 살짝 배경 */
  &:hover { background: #fafafa; }

  /* 포커스 테두리 완전 제거 (브라우저 기본 파란 링 포함) */
  &:focus, &:focus-visible { outline: none !Important; box-shadow: none !important; }
`;



const QLeft = styled.div` display: flex; align-items: center; gap: 10px; color: ${text}; `;

/* ✅ 카테고리 뱃지 */
const CatBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: ${primary};
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: .1px;
`;


const QTxt = styled.span`
  font-size: 16px;   /* 기존 15 → 16 */
  font-weight: 500;
`;
const Answer = styled.div`
  padding: 14px 20px 22px 20px;
  font-size: 15px;   /* 기존 14 → 15 */
  line-height: 1.85;
  color: ${text};
`;


const More = styled.span` color: #c0c7d4; font-size: 18px; line-height: 1; `;

/* 슬라이드다운 컨테이너 (답변만 애니메이션) */
const CollapseOuter = styled.div`
  overflow: hidden;
  will-change: max-height, opacity;
  transition: max-height .28s ease, opacity .28s ease;
  background: #fff;
`;


/* ===== Utils ===== */
const normalize = (s = "") => s.replace(/\s+/g, " ").trim().toLowerCase();

/** 링크 파서: [라벨] → pill anchor */
const LINK_MAP = {
  "멤버십 소개": "/membership",
  "프로그램 예약": "/programs",
  "픽업 신청": "/pickup/apply",
  "자녀 정보 관리하기": "/my?tab=profile",
  "멤버십 안내 보기": "/membership",
  "가입하기": "/pricing/checkout?id=agitz_m",
  "멤버십 관리하기": "/my?tab=payments",
  "멤버십 자동결제 신청": "/membership/auto",
  "멤버십 페이지": "/membership",
  "픽업 신청하기": "/pickup/apply",
  "픽업 가능 장소 보기": "/pickup/places",
  "부분 취소하기": "/my/reservations?filter=partial-cancel",
  "취소하기": "/my/reservations?cancel=all",
  "주말 아지트 이용 예약": "/weekend",
  "내 예약 확인": "/my/reservations",
  "예약 변경하기": "/my/reservations?edit=1",
  "예약 취소하기": "/my/reservations?cancel=1",
  "정액권 구매하기": "/points/buy",
  "정액권": "/points",
  "정액권 잔액 보기": "/my?tab=payments",
  "정액권 충전하기": "/points/topup",
  "회원정보 변경하기": "/my",
  "제안하기": "/support/feedback",
  "카카오톡 채널로 연결": "https://pf.kakao.com/_your_channel_", // 실제 URL로 교체
  "FAQ 페이지로 이동": "/faq",
};
const Pill = styled.a`
  display:inline-block; margin:2px 6px 2px 0; padding:6px 10px;
  border-radius:999px; background:#eef2ff; color:${primary};
  font-size:12.5px; font-weight:800; text-decoration:none;
  box-shadow: inset 0 0 0 1px rgba(17,24,39,.06);
  &:hover{ background:#e5ebff; }
`;
function renderRich(line) {
  const out = [];
  const re = /\[([^\]]+)\]/g;
  let last = 0, m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const label = m[1]; const href = LINK_MAP[label] || "#";
    out.push(<Pill key={`${label}-${m.index}`} href={href}>{label}</Pill>);
    last = re.lastIndex;
  }
  if (last < line.length) out.push(line.slice(last));
  return <>{out}</>;
}

/* ===== Categories ===== */
const CATS = [
  "이용 안내",
  "멤버십 안내",
  "픽업 신청",
  "예약 방법",
  "변경 및 취소",
  "결제 및 정액권",
  "이용 당일",
  "기타 문의",
];

/* ===== FAQ Items ===== */
const ITEMS = [
  // 이용 안내
  { id: "faq_use_001", cat: "이용 안내", q: "어떤 서비스를 이용해보고 싶으세요?", a: "[멤버십 소개] [프로그램 예약][픽업 신청]" },
  { id: "faq_use_002", cat: "이용 안내", q: "자녀 정보를 추가하거나 변경하시겠어요?", a: "[자녀 정보 관리하기] 버튼을 눌러 수정 가능합니다." },
  { id: "faq_use_003", cat: "이용 안내", q: "평일 아지트는 예약이 필요한가요?", a: "아지트/패밀리 멤버십은 평일에 예약 없이 방문해주세요.\n타임패스는 [프로그램 예약]에서 신청해주세요." },
  { id: "faq_use_004", cat: "이용 안내", q: "비회원으로 예약하시나요?", a: "“비회원 예약은 주말 프로그램만 가능해요.” [프로그램 예약]" },

  // 멤버십 안내
  { id: "faq_mem_001", cat: "멤버십 안내", q: "멤버십 가입을 도와드릴까요?", a: "[멤버십 안내 보기] [가입하기] 버튼을 선택하세요." },
  { id: "faq_mem_002", cat: "멤버십 안내", q: "멤버십을 해지하거나 변경하시겠어요?", a: "[멤버십 관리하기] 메뉴로 이동합니다." },
  { id: "faq_mem_003", cat: "멤버십 안내", q: "멤버십을 자동 구독하시겠어요?", a: "[멤버십 자동결제 신청]" },
  { id: "faq_mem_004", cat: "멤버십 안내", q: "유효기간이나 혜택이 궁금하시다면", a: "“[멤버십 페이지]에서 자세히 볼 수 있어요.”" },

  // 픽업 신청
  { id: "faq_pick_001", cat: "픽업 신청", q: "픽업을 신청하시겠어요?", a: "[픽업 신청하기] 버튼을 눌러주세요." },
  { id: "faq_pick_002", cat: "픽업 신청", q: "픽업 장소가 안 나와요", a: "지점별로 등록된 픽업 장소만 노출됩니다.\n신규 픽업 장소 요청은 위드아지트로 연락 주세요!" },
  { id: "faq_pick_003", cat: "픽업 신청", q: "픽업 장소를 확인해드릴게요.", a: "[픽업 가능 장소 보기] 버튼을 눌러주세요." },
  { id: "faq_pick_004", cat: "픽업 신청", q: "픽업 시간을 변경하시나요?", a: "전체 취소 또는 부분 취소만 가능합니다.\n[부분 취소하기] / [취소하기] 중 선택해주세요." },

  // 예약 방법
  { id: "faq_resv_001", cat: "예약 방법", q: "어떤 서비스를 예약하시겠어요?", a: "[프로그램 예약] [주말 아지트 이용 예약]" },
  { id: "faq_resv_002", cat: "예약 방법", q: "예약 후 내역을 확인하시겠어요?", a: "[내 예약 확인]" },

  // 변경 및 취소
  { id: "faq_change_001", cat: "변경 및 취소", q: "프로그램 예약을 변경하시겠어요?", a: "[예약 변경하기] 버튼을 선택하세요." },
  { id: "faq_change_002", cat: "변경 및 취소", q: "프로그램 예약을 취소하시겠어요?", a: "[예약 취소하기] 버튼을 선택하세요." },
  { id: "faq_change_003", cat: "변경 및 취소", q: "프로그램 환불 규정을 알려드릴까요?", a: "“이용일 하루 전까지 전액 환불됩니다.”" },

  // 결제 및 정액권
  { id: "faq_pay_001", cat: "결제 및 정액권", q: "비회원은 정액권 사용을 못하나요?", a: "“오직 멤버십 회원만 정액권 사용이 가능합니다”" },
  { id: "faq_pay_002", cat: "결제 및 정액권", q: "정액권 결제를 도와드릴게요.", a: "[정액권 구매하기]" },
  { id: "faq_pay_003", cat: "결제 및 정액권", q: "정액권 잔액을 확인하시겠어요?", a: "[정액권 잔액 보기]" },
  { id: "faq_pay_004", cat: "결제 및 정액권", q: "충전이 필요하신가요?", a: "[정액권 충전하기]" },

  // 이용 당일
  { id: "faq_today_001", cat: "이용 당일", q: "입장 방법을 알려드릴게요", a: "“보호자 뒷번호로 입장 가능해요”" },
  { id: "faq_today_002", cat: "이용 당일", q: "당일 이용 시간을 연장하시겠어요? (2시간 무료)", a: "“예약 없이 이용 후 현장 결제 혹은 정액권 차감이 가능해요”" },

  // 기타 문의
  { id: "faq_etc_001", cat: "기타 문의", q: "회원정보를 수정하시겠어요?", a: "[회원정보 변경하기]" },
  { id: "faq_etc_002", cat: "기타 문의", q: "서비스 제안을 남기시겠어요?", a: "[제안하기]" },
  { id: "faq_etc_003", cat: "기타 문의", q: "위드아지트에 바로 연결할까요?", a: "[카카오톡 채널로 연결]" },
  { id: "faq_etc_004", cat: "기타 문의", q: "다른 질문도 궁금해요", a: "[FAQ 페이지로 이동]" },
];

/* ===== Collapsible (answer only) ===== */
function Collapsible({ open, children, duration = 280 }) {
  const innerRef = React.useRef(null);
  const [maxH, setMaxH] = React.useState(0);

  // children 은 항상 렌더 → open 변화시에만 높이 측정/애니메이션
  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    if (open) {
      // 먼저 충분히 렌더 → 다음 페인트에서 높이 측정
      requestAnimationFrame(() => {
        const h = el.scrollHeight;
        setMaxH(h + 2);
      });
    } else {
      setMaxH(0);
    }
  }, [open, children]);

  return (
    <div
      style={{
        overflow: "hidden",
        maxHeight: maxH,
        opacity: open ? 1 : 0,
        transition: `max-height ${duration}ms ease, opacity ${duration}ms ease`,
        background: "#fff",
      }}
      aria-hidden={!open}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

/* ===== Component ===== */
export default function FAQPage({ items = ITEMS, categories = CATS }) {
  const [cat, setCat] = useState(categories[0]);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);

  // 초기 해시 진입 시에만 스크롤 (토글 시엔 스크롤 없음)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!id) return;
    const found = items.find(x => x.id === id);
    if (found) {
      setOpenId(found.id);
      setCat(found.cat && categories.includes(found.cat) ? found.cat : categories[0]);
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 64;
          const top = el.getBoundingClientRect().top + window.scrollY - (headerH + 12);
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    }
  }, [items, categories]);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return items.filter(it => {
      if (cat !== categories[0] && it.cat !== cat) return false;
      if (!nq) return true;
      return normalize(`${it.q} ${it.a}`).includes(nq);
    });
  }, [items, cat, q, categories]);

  const onToggle = (id) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (typeof window !== "undefined") {
      const hash = next ? `#${encodeURIComponent(id)}` : " ";
      window.history.replaceState(null, "", hash === " " ? window.location.pathname + window.location.search : hash);
    }
  };

  return (
    <Page>
      <Wrap>
        {/* Left */}
        <Side>
          <CatList>
            {categories.map((c) => (
              <li key={c}>
                <CatBtn $on={c === cat} onClick={() => { setCat(c); setOpenId(null); }}>{c}</CatBtn>
              </li>
            ))}
          </CatList>
        </Side>

        {/* Right */}
        <Main>
          <H1>자주 묻는 질문</H1>

          <SearchBar>
            <Icon />
            <Input
              placeholder="무엇이든 찾아보세요"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </SearchBar>

          <ListWrap>
            {filtered.length === 0 ? (
              <div style={{ padding: 22, color: sub, fontSize: 14 }}>검색 결과가 없어요.</div>
            ) : (
              filtered.map((it) => {
                const on = openId === it.id;
                return (
                  <div key={it.id} id={it.id}>
                    <Row
                      role="button"
                      tabIndex={0}
                      aria-expanded={on}
                      aria-controls={`${it.id}__answer`}
                      onClick={() => onToggle(it.id)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(it.id); } }}
                    >
                      <QLeft>
                        <CatBadge>{it.cat}</CatBadge>
                        <QTxt id={`${it.id}__q`}>{it.q}</QTxt>
                      </QLeft>
                      <More aria-hidden>{on ? "−" : "+"}</More>
                    </Row>

                    <Collapsible open={on}>
                      <Answer id={`${it.id}__answer`} role="region" aria-labelledby={`${it.id}__q`}>
                        {it.a.split("\n").map((line, i) => (
                          <p key={i} style={{ margin: "0 0 10px" }}>{renderRich(line)}</p>
                        ))}
                      </Answer>
                    </Collapsible>
                  </div>
                );
              })
            )}
          </ListWrap>
        </Main>
      </Wrap>
    </Page>
  );
}
