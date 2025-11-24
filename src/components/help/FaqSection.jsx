/* eslint-disable */
// src/components/help/FaqSection.jsx
// Withagit FAQ — 브랜드 톤(오렌지) + 카드형 아코디언 UI

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { getFaqData } from "../../services/faqsService";

const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const accent = "var(--color-accent, #F07A2A)";

/* 고정 카테고리 프리셋(+ 전체) */
const CATS_PRESET = [
    "전체",
    "이용 안내",
    "멤버십 안내",
    "픽업 신청",
    "예약 방법",
    "변경 및 취소",
    "결제 및 정액권",
    "이용 당일",
    "기타 문의",
];

/* 레이아웃 */
const Wrap = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 40px;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 28px;
  }
`;

const Side = styled.aside`
  padding-top: 8px;
`;

const CatList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
`;

/* 좌측 카테고리 — pill 스타일 */
const CatBtn = styled.button`
  width: 100%;
  text-align: left;
  border: 0;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 999px;

  font-size: 15px;
  font-weight: ${({ $on }) => ($on ? 800 : 600)};
  color: ${({ $on }) => ($on ? "#ffffff" : sub)};
  background: ${({ $on }) => ($on ? accent : "transparent")};

  transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;

  &:hover {
    background: ${({ $on }) => ($on ? "#e2631f" : "rgba(0,0,0,.02)")};
  }
  &:active {
    transform: translateY(1px);
  }
`;

const Main = styled.div``;

/* 검색 바 — 상단 Hero에서 쓸 수도 있고, 여기서도 옵션으로 노출 가능 */
const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  margin: 6px 0 24px;
  border-radius: 999px;
  background: #f5f5f5;
  padding: 0 20px;
`;

const SearchIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.94.94l.27.28h.79l4.5 4.5 1.41-1.41-4.5-4.5zM5 9.5C5 7.01 7.01 5 9.5 5S14 7.01 14 9.5 11.99 14 9.5 14 5 11.99 5 9.5z"
            fill="#9aa2b1"
        />
    </svg>
);

const SearchInput = styled.input`
  flex: 1;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 17px;
  color: ${text};
  &::placeholder {
    color: #b6bdc9;
  }
`;

const List = styled.div`
  margin-top: 6px;
`;

/* 질문 카드 영역 */
const QCard = styled.div`
  border-radius: 18px;
  background: #f7f7f7;
  padding: 18px 20px;
  margin-bottom: 6px;
`;

/* 질문 헤더 Row */
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px;
  align-items: center;
  cursor: pointer;
`;

const Badge = styled.span`
  display: inline-block;
  margin-right: 14px;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(240, 122, 42, 0.12);
  color: ${accent};
  font-size: 13.5px;
  font-weight: 800;
`;

const Q = styled.span`
  font-size: 17px;
  color: ${text};
  letter-spacing: -0.1px;
`;

const More = styled.span`
  color: #c3cad5;
  font-size: 22px;
`;

/* 답변 영역 */
const A = styled.div`
  margin-top: 10px;
  padding-left: 36px;
  padding-right: 4px;
  color: ${text};
  font-size: 15px;
  line-height: 1.9;
  white-space: pre-line;
`;

/* 부드러운 아코디언 */
function Collapsible({ open, children, duration = 220 }) {
    const ref = React.useRef(null);
    const [h, setH] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (open) requestAnimationFrame(() => setH(el.scrollHeight + 2));
        else setH(0);
    }, [open, children]);
    return (
        <div
            style={{
                overflow: "hidden",
                maxHeight: h,
                opacity: open ? 1 : 0,
                transition: `max-height ${duration}ms ease, opacity ${duration}ms ease`,
            }}
        >
            <div ref={ref}>{children}</div>
        </div>
    );
}

/**
 * props:
 *  - query?: string        // 외부에서 내려주는 검색어
 *  - onQueryChange?: fn    // 검색어 변경 콜백
 *  - showSearch?: boolean  // 내부 검색바 노출 여부 (기본 true)
 */
export default function FaqSection({
    query,
    onQueryChange,
    showSearch = true,
}) {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState(CATS_PRESET[0]); // "공지사항" 기본
    const [innerQ, setInnerQ] = useState("");
    const [open, setOpen] = useState(null);
    const [loading, setLoading] = useState(true);

    // 실제 사용할 검색어 = 외부 query 있으면 그걸 우선
    const effectiveQ =
        typeof query === "string" ? query : innerQ;

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            const { faqs } = await getFaqData(); // 서비스에서 전량 로드
            if (!alive) return;
            // cat 없는 항목은 "기타 문의"로 정규화
            const normalized = (faqs || []).map((it, idx) => ({
                ...it,
                id: it.id || `faq_${idx}`,
                cat: it.cat || "기타 문의",
            }));
            setItems(normalized);
            setLoading(false);
        })();
        return () => {
            alive = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const s = (effectiveQ || "").trim().toLowerCase();
        let list = items;
        if (cat && cat !== "전체") list = list.filter((x) => x.cat === cat);
        if (s) list = list.filter((x) =>
            (x.q + " " + x.a).toLowerCase().includes(s)
        );
        return list;
    }, [items, cat, effectiveQ]);

    const handleSearchChange = (val) => {
        if (onQueryChange) onQueryChange(val);
        else setInnerQ(val);
    };

    return (
        <Wrap>
            {/* 좌측 카테고리: 고정 프리셋을 항상 노출 */}
            <Side>
                <CatList>
                    {CATS_PRESET.map((c) => (
                        <li key={c}>
                            <CatBtn
                                $on={c === cat}
                                onClick={() => {
                                    setCat(c);
                                    setOpen(null);
                                }}
                            >
                                {c}
                            </CatBtn>
                        </li>
                    ))}
                </CatList>
            </Side>

            <Main>
                {/* 검색바: 상단 헤더에서 쓸 때는 showSearch=false 로 숨김 */}
                {showSearch && (
                    <SearchBar>
                        <SearchIcon />
                        <SearchInput
                            placeholder="무엇이든 찾아보세요"
                            value={effectiveQ}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </SearchBar>
                )}

                <List>
                    {loading ? (
                        <div style={{ padding: 20, fontSize: 15, color: sub }}>
                            불러오는 중…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 20, fontSize: 15, color: sub }}>
                            이 카테고리에 등록된 항목이 없습니다.
                        </div>
                    ) : (
                        filtered.map((it) => {
                            const on = open === it.id;
                            return (
                                <QCard key={it.id}>
                                    <Row
                                        role="button"
                                        aria-expanded={on}
                                        onClick={() => setOpen(on ? null : it.id)}
                                    >
                                        <div>
                                            <Badge>{it.cat}</Badge>
                                            <Q>{it.q}</Q>
                                        </div>
                                        <More>{on ? "−" : "+"}</More>
                                    </Row>
                                    <Collapsible open={on}>
                                        <A>{it.a}</A>
                                    </Collapsible>
                                </QCard>
                            );
                        })
                    )}
                </List>
            </Main>
        </Wrap>
    );
}
