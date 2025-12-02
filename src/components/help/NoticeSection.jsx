/* eslint-disable */
// src/components/help/NoticeSection.jsx
// Withagit — 소식/문의 FAQ 섹션
// - 상단 카테고리 콤보 + 바텀시트 팝업
// - 카드형 Q/A 아코디언
// - 하단 페이지네이션(목업)

import React, { useEffect, useMemo, useState, useRef } from "react";
import styled from "styled-components";
import { getFaqData } from "../../services/faqsService";

const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const accent = "#F35B05"; // 피그마 기준 오렌지

/* 고정 카테고리 프리셋 */
const CATS_PRESET = [
  "이용 안내",
  "멤버십 안내",
  "픽업 신청",
  "예약 방법",
  "변경 및 취소",
  "결제 및 정액권",
  "이용 당일",
  "기타 문의",
];

/* '전체' 대신 '공지' 대표 카테고리 사용 */
const CATS_WITH_ALL = ["공지", ...CATS_PRESET];

/* ===== 레이아웃 ===== */

const Wrap = styled.section`
  margin-top: 4px;
`;

/* 상단 카테고리 콤보 버튼 */

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;
`;

const CategoryBox = styled.div`
  position: relative;
`;

const CategoryButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${text};
  font-weight: 600;
  cursor: pointer;
`;

const CategoryLabel = styled.span``;

const CategoryCaret = styled.span`
  font-size: 14px;
  color: #9ca3af;
  line-height: 1;
  position: relative;
  top: 1px;
`;

/* ===== 카테고리 바텀시트 팝업 ===== */

const CategoryPanel = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  justify-content: center;
  align-items: flex-end;

  background: rgba(0, 0, 0, 0.25);
`;

const CategoryCard = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto 16px;

  background: #ffffff;
  border-radius: 24px;
  padding: 20px 22px 22px;

  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.25);
`;

/* 리스트 전체는 왼쪽 정렬 */
const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
`;

const CategoryItem = styled.li`
  width: 100%;
`;

/* 🔥 팝업 내 버튼 스타일
   - box-shadow 제거
   - 왼쪽 정렬
   - 전체 폭의 1/3 사용 */
const CategoryPill = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: 33.333%;
  min-width: 110px;
  border-radius: 15px;
  border: none;
  padding: 10px 0;

  font-size: 14px;
  font-weight: ${({ active }) => (active ? 800 : 600)};
  cursor: pointer;
  text-align: center;

  background: ${({ active }) => (active ? accent : "#ffffff")};
  color: ${({ active }) => (active ? "#ffffff" : "#666")};

  box-shadow: none;

  transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;

  &:active {
    transform: translateY(1px);
  }
`;

/* ===== 콘텐츠 영역 (FAQ 리스트 + min-height) ===== */

const ContentArea = styled.div`
  min-height: 260px;
  display: flex;
  flex-direction: column;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

/* 질문 카드 */

const QCard = styled.article`
  background: #f7f7f7;
  border-radius: 18px;
  padding: 18px 20px;
`;

/* 질문 헤더 */

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px;
  align-items: center;
  cursor: pointer;
`;

const QHead = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(243, 91, 5, 0.12);
  color: ${accent};
  font-size: 13.5px;
  font-weight: 800;
`;

const Q = styled.span`
  font-size: 17px;
  color: ${text};
  letter-spacing: -0.1px;

  @media (max-width: 860px) {
    font-size: 15px;
  }
`;

const More = styled.span`
  color: #c3cad5;
  font-size: 22px;
`;

/* 답변 텍스트 */

const A = styled.div`
  margin-top: 10px;
  padding-left: 4px;
  padding-right: 4px;
  color: ${text};
  font-size: 15px;
  line-height: 1.9;
  white-space: pre-line;
`;

/* 부드러운 아코디언 */

function Collapsible({ open, children, duration = 220 }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      requestAnimationFrame(() => setH(el.scrollHeight + 2));
    } else {
      setH(0);
    }
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

/* ===== 페이지네이션 (min-height 바로 아래) ===== */

const PaginationWrap = styled.nav`
  margin: 20px 0 0;
  display: flex;
  justify-content: center;
`;

const PaginationInner = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: ${sub};
`;

const PageArrow = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-size: 16px;
  color: #9ca3af;
`;

const PageDot = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: grid;
  place-items: center;
  background: ${({ active }) => (active ? "#ffe39b" : "transparent")};
  color: ${({ active }) => (active ? text : sub)};
`;

/* ===== 컴포넌트 ===== */

export default function NoticeSection() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("공지"); // 기본값: 공지
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { faqs } = await getFaqData();
      if (!alive) return;

      const normalized = (faqs || []).map((it, idx) => ({
        ...it,
        id: it.id || `faq_${idx}`,
        cat: it.cat || "기타 문의",
        q: it.q || "",
        a: it.a || "",
      }));
      setItems(normalized);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    // '공지'는 전체 보여주고, 다른 값일 때만 카테고리 필터
    if (cat && cat !== "공지") {
      list = list.filter((x) => x.cat === cat);
    }
    return list;
  }, [items, cat]);

  const handleCategoryClick = () => {
    setCategoryOpen((prev) => !prev);
  };

  const handleSelectCategory = (name) => {
    setCat(name);
    setCategoryOpen(false);
    setOpenId(null);
  };

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  /* ===== 로딩 / 빈 상태 ===== */

  if (loading) {
    return (
      <Wrap>
        <HeaderRow>
          <CategoryBox>
            <CategoryButton type="button" onClick={handleCategoryClick}>
              <CategoryLabel>{cat}</CategoryLabel>
              <CategoryCaret>{categoryOpen ? "▴" : "▾"}</CategoryCaret>
            </CategoryButton>
          </CategoryBox>
        </HeaderRow>

        <div style={{ padding: 20, fontSize: 15, color: sub }}>
          불러오는 중…
        </div>
      </Wrap>
    );
  }

  if (!filtered.length) {
    return (
      <Wrap>
        <HeaderRow>
          <CategoryBox>
            <CategoryButton type="button" onClick={handleCategoryClick}>
              <CategoryLabel>{cat}</CategoryLabel>
              <CategoryCaret>{categoryOpen ? "▴" : "▾"}</CategoryCaret>
            </CategoryButton>

            {categoryOpen && (
              <CategoryPanel>
                <CategoryCard>
                  <CategoryList>
                    {CATS_WITH_ALL.map((name) => (
                      <CategoryItem key={name}>
                        <CategoryPill
                          type="button"
                          active={cat === name}
                          onClick={() => handleSelectCategory(name)}
                        >
                          {name}
                        </CategoryPill>
                      </CategoryItem>
                    ))}
                  </CategoryList>
                </CategoryCard>
              </CategoryPanel>
            )}
          </CategoryBox>
        </HeaderRow>

        <div style={{ padding: 20, fontSize: 15, color: sub }}>
          이 카테고리에 등록된 항목이 없습니다.
        </div>
      </Wrap>
    );
  }

  /* ===== 정상 렌더 ===== */

  return (
    <Wrap>
      <HeaderRow>
        <CategoryBox>
          <CategoryButton type="button" onClick={handleCategoryClick}>
            <CategoryLabel>{cat}</CategoryLabel>
            <CategoryCaret>{categoryOpen ? "▴" : "▾"}</CategoryCaret>
          </CategoryButton>

          {categoryOpen && (
            <CategoryPanel>
              <CategoryCard>
                <CategoryList>
                  {CATS_WITH_ALL.map((name) => (
                    <CategoryItem key={name}>
                      <CategoryPill
                        type="button"
                        active={cat === name}
                        onClick={() => handleSelectCategory(name)}
                      >
                        {name}
                      </CategoryPill>
                    </CategoryItem>
                  ))}
                </CategoryList>
              </CategoryCard>
            </CategoryPanel>
          )}
        </CategoryBox>
      </HeaderRow>

      {/* min-height 적용된 리스트 영역 */}
      <ContentArea>
        <List>
          {filtered.map((it) => {
            const on = openId === it.id;
            return (
              <QCard key={it.id}>
                <Row
                  role="button"
                  aria-expanded={on}
                  onClick={() => handleToggle(it.id)}
                >
                  <QHead>
                    <Badge>{it.cat}</Badge>
                    <Q>{it.q}</Q>
                  </QHead>
                  <More>{on ? "−" : "+"}</More>
                </Row>
                <Collapsible open={on}>
                  <A>{it.a}</A>
                </Collapsible>
              </QCard>
            );
          })}
        </List>
      </ContentArea>

      {/* min-height 바로 아래 페이징 (목업) */}
      <PaginationWrap aria-label="FAQ 페이지 이동">
        <PaginationInner>
          <PageArrow type="button">{"<"}</PageArrow>
          <PageDot type="button" active>
            1
          </PageDot>
          <PageDot type="button">2</PageDot>
          <PageDot type="button">3</PageDot>
          <PageArrow type="button">{">"}</PageArrow>
        </PaginationInner>
      </PaginationWrap>
    </Wrap>
  );
}
