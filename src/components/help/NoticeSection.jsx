/* eslint-disable */
// src/components/help/NoticeSection.jsx
// Withagit — 소식/문의 FAQ 섹션
// - 상단 카테고리 콤보 + 바텀시트 팝업
// - 카드형 Q/A 아코디언
// - 하단 페이지네이션

import React, { useEffect, useMemo, useState, useRef } from "react";
import styled from "styled-components";
import { getFaqData } from "../../services/faqsService";
import { listNotices } from "../../services/noticesService";

const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const accent = "#F35B05"; // 피그마 기준 오렌지
const PAGE_SIZE = 4;       // ✅ 한 페이지에 4개씩

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
  font-size: 14px;       /* ✅ 글씨 조금 더 크게 */
  color: ${text};
  font-weight: 700;
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

/* 팝업 내 버튼 스타일 */
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

const NoticeBody = styled.div`
  margin-top: 10px;
  padding-right: 4px;
  color: ${sub};
  font-size: 14px;
  line-height: 1.8;

  /* 공지 html 안의 기본 태그들 정리 */
  p {
    margin: 0 0 8px;
  }

  a {
    text-decoration: underline;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 8px 0;
  }
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

/* Q / A 라벨 정렬 */

const Q = styled.div`
  position: relative;
  padding-left: 22px;        /* Q./A. 공통 좌측 여백 */
  font-size: 15px;
  font-weight: 700;          /* 질문은 좀 찐하게 */
  color: ${text};
  line-height: 1.7;

  &::before {
    content: "Q.";
    position: absolute;
    left: 0;
    top: 0;
    font-weight: 800;
  }

  @media (max-width: 860px) {
    font-size: 14px;
  }
`;

const More = styled.span`
  color: #9ca3af;
  font-size: 18px;
  transform: translateY(1px);
`;

/* 답변 텍스트 */

const A = styled.div`
  margin-top: 10px;
  position: relative;
  padding-left: 22px;        /* Q와 같은 X좌표 */
  padding-right: 4px;
  color: ${sub};             /* 답변은 조금 연하게 */
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-line;

  &::before {
    content: "A.";
    position: absolute;
    left: 0;
    top: 0;
    font-weight: 700;
    color: ${sub};
  }
`;

/* 부드러운 아코디언 */

function Collapsible({ open, children, duration = 220 }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open) {
      // 여유 높이 12px 정도 더 줘서 잘림 방지
      const next = el.scrollHeight + 12;
      setH(next);
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

/* ===== 페이지네이션 ===== */

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
  font-size: 16px;
  color: ${({ disabled }) => (disabled ? "#d1d5db" : "#9ca3af")};
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
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
  // FAQ / 공지 데이터
  const [faqItems, setFaqItems] = useState([]);
  const [noticeItems, setNoticeItems] = useState([]);

  const [cat, setCat] = useState("공지"); // 기본값: 공지
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [categoryOpen, setCategoryOpen] = useState(false);

  // ✅ 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [{ faqs }, notices] = await Promise.all([
          getFaqData(),
          listNotices(),
        ]);
        if (!alive) return;

        const normalizedFaqs = (faqs || []).map((it, idx) => ({
          ...it,
          id: it.id || `faq_${idx}`,
          cat: it.cat || "기타 문의",
          q: it.q || "",
          a: it.a || "",
        }));

        const normalizedNotices = (notices || []).map((it, idx) => ({
          ...it,
          id: it.id || `notice_${idx}`,
          title: it.title || it.subject || "",
          body: it.body || it.content || "",
        }));

        setFaqItems(normalizedFaqs);
        setNoticeItems(normalizedNotices);
      } catch (e) {
        console.error("[NoticeSection] load error", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 공지 외 카테고리용 FAQ 필터
  const filteredFaqs = useMemo(() => {
    if (!faqItems.length) return [];
    if (!cat || cat === "공지") return faqItems;
    return faqItems.filter((x) => x.cat === cat);
  }, [faqItems, cat]);

  const isNoticeTab = cat === "공지";
  const sourceList = isNoticeTab ? noticeItems : filteredFaqs;

  const totalCount = sourceList.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageSlice = sourceList.slice(startIndex, startIndex + PAGE_SIZE);

  const hasList = totalCount > 0;

  const handleCategoryClick = () => {
    setCategoryOpen((prev) => !prev);
  };

  const handleSelectCategory = (name) => {
    setCat(name);
    setCategoryOpen(false);
    setOpenId(null);
    setCurrentPage(1); // ✅ 카테고리 바뀌면 페이지 1로
  };

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handlePrevPage = () => {
    setCurrentPage((p) => (p > 1 ? p - 1 : p));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => (p < pageCount ? p + 1 : p));
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

  if (!hasList) {
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
          {isNoticeTab
        ? pageSlice.map((it) => {
            const on = openId === it.id;
            return (
              <QCard key={it.id}>
                <Row
                  role="button"
                  aria-expanded={on}
                  onClick={() => handleToggle(it.id)}
                >
                  <QHead>
                    <Q>{it.title || "(제목 없음)"}</Q>
                  </QHead>
                  <More aria-hidden="true">{on ? "▴" : "▾"}</More>
                </Row>
                <Collapsible open={on}>
                  <NoticeBody
                    dangerouslySetInnerHTML={{ __html: it.bodyHtml || "" }}
                  />
                </Collapsible>
              </QCard>
            );
          })
        : pageSlice.map((it) => {
            const on = openId === it.id;
            return (
              <QCard key={it.id}>
                <Row
                  role="button"
                  aria-expanded={on}
                  onClick={() => handleToggle(it.id)}
                >
                  <QHead>
                    <Q>{it.q}</Q>
                  </QHead>
                  <More aria-hidden="true">{on ? "▴" : "▾"}</More>
                </Row>
                <Collapsible open={on}>
                  <A>{it.a}</A>
                </Collapsible>
              </QCard>
            );
          })}

        </List>
      </ContentArea>

      {/* ✅ 실제 페이징 적용된 네비게이션 */}
      <PaginationWrap aria-label="FAQ 페이지 이동">
        <PaginationInner>
          <PageArrow
            type="button"
            disabled={safePage === 1}
            onClick={handlePrevPage}
          >
            {"<"}
          </PageArrow>

          {Array.from({ length: pageCount }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <PageDot
                key={pageNum}
                type="button"
                active={pageNum === safePage}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </PageDot>
            );
          })}

          <PageArrow
            type="button"
            disabled={safePage === pageCount}
            onClick={handleNextPage}
          >
            {">"}
          </PageArrow>
        </PaginationInner>
      </PaginationWrap>
    </Wrap>
  );
}
