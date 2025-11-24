/* eslint-disable */
// src/components/MembershipBenefitPanel.jsx
// 다크 패널 + 중앙 타이틀/설명 + 아코디언(접힘: 제목만, 펼침: 본문 전체 표시 — 잘림/밑줄 없음)
import React, { useState } from "react";
import styled, { css } from "styled-components";

/* ===== Tokens ===== */
const PANEL_BG = "#1E2A36";          // 전체 패널 배경
const ROW_BG = "#263341";          // 행 배경(접힘)
const ROW_BG_F = "#2B3B4A";          // 행 배경(펼침 내부)
const BORDER_D = "rgba(255,255,255,.08)";
const BORDER_S = "rgba(0,0,0,.25)";
const TITLE_W = "#FFFFFF";
const PARA_SOFT = "rgba(255,255,255,.75)";
const ORANGE = "#F07A2A";
const WHITE = "#FFFFFF";

/* ===== Layout ===== */
const Section = styled.section`
  background: #fff;
  padding: 32px 12px 48px;
  margin-top: 48px;
`;

const Panel = styled.div`
  max-width: 820px;
  margin: 0 auto;
  background: ${PANEL_BG};
  border: 1px solid ${BORDER_S};
  border-radius: 28px;
  box-shadow: 0 18px 44px rgba(0,0,0,.22);
  padding: clamp(20px, 4.5vw, 36px);
`;

/* ===== Header ===== */
const Head = styled.header`
  text-align: center;
  margin-bottom: clamp(16px, 3.2vw, 28px);

  h2{
    margin: 0 0 8px;
    color: ${TITLE_W};

    letter-spacing: -0.3px;
    font-size: clamp(22px, 4vw, 40px);
    line-height: 2;
  }
  p{
    margin: 0;
    color: ${PARA_SOFT};
    font-size: clamp(13px, 2vw, 16px);
    line-height: 1.7;
  }
`;

/* ===== Accordion ===== */
const List = styled.div`
  display: grid;
  gap: clamp(10px, 2vw, 54px);
`;

const Row = styled.div`
  border-radius: 18px;
  border: 1px solid ${BORDER_D};
  background: ${ROW_BG};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
  overflow: visible; /* ✅ 본문 잘림 방지 */
  transition: background .15s ease, box-shadow .15s ease, border-color .15s ease;

  ${({ $open }) => $open && css`
    box-shadow: 0 10px 28px rgba(0,0,0,.20), inset 0 0 0 1px rgba(0,0,0,.06);
  `}
`;

const RowHead = styled.button`
  position: relative; /* ✅ 겹침 방지 */
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;

  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 30px;

  padding: clamp(12px, 2.6vw, 18px) clamp(12px, 2.6vw, 18px);
  color: ${TITLE_W};
  text-align: left;

  letter-spacing: -0.2px;
  font-size: clamp(16px, 2.4vw, 18px);

  ${({ $open }) => $open && css`
    background: linear-gradient(180deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,0) 100%);
  `}

  .toggle{
    font-weight: 900;
    color: ${WHITE};
    font-size: clamp(18px, 2.4vw, 20px);
    width: 20px;
    text-align: center;
  }
`;

const RowBody = styled.div`
  position: relative;
  display: ${({ $open }) => ($open ? "block" : "none")};
  border-top: 1px solid ${BORDER_D};
  background: ${ROW_BG_F};
  padding: clamp(12px, 2.6vw, 16px) clamp(12px, 2.6vw, 16px);
  color: ${PARA_SOFT};
  overflow: visible;

  /* ✅ 전파된 말줄임/클램프 강제 해제 */
  &, * {
    white-space: normal !important;      /* 한 줄 고정 금지 */
    text-overflow: clip !important;      /* … 제거 */
    overflow: visible !important;        /* 잘림 금지 */
    -webkit-line-clamp: unset !important;
    -webkit-box-orient: unset !important;
  }

  /* ✅ 긴 단어/영문 자동 줄바꿈 */
  word-break: keep-all;
  overflow-wrap: anywhere;

  /* 본문 타이포 */
  .bodyText {
    margin: 0;
    line-height: 1.8;
    font-size: clamp(13px, 2vw, 15px);
    white-space: pre-wrap;               /* \n 유지하며 줄바꿈 */
    display: block;
  }
`;


/* ===== Component ===== */
export default function MembershipBenefitPanel({
    title = "위드아지트 멤버십으로\n더 풍성하게, 더 편리하게",
    desc = "아지트에서는 아이의 하루를 채우는 다양한 프로그램과 돌봄 서비스를 제공합니다.",
    items = [
        {
            title: "아지트 평일 이용 및 교구 무제한",
            content:
                `책, 보드게임, 미술공방 도구 등 자유롭게 이용할 수 있습니다.
숙제존, 독서존, 간식존, 플레이존 중심의 창의 멤버십 프로그램으로
숙제·독서·놀이가 함께 이루어지는 공간입니다.`
        },
        {
            title: "건강한 간식 제공",
            content:
                `정액권 충전으로 간편하게 결제하고,
"내 아이에게 먹인다는 마음"으로 직접 선정한 간식을 제공합니다.
매일 새로운 메뉴로 아이의 하루를 풍성하게 채워줍니다.`
        },
        {
            title: "다양한 주말·방학 프로그램",
            content:
                `주말에는 누구에게나 열린 키즈 공방으로 운영됩니다.
과학, 예술, 언어 등 테마 클래스가 오픈되며 아이의 호기심과 창의력을 확장합니다.
방학에는 종일 프로그램으로 운영됩니다.`
        },
    ],
    defaultOpenIndex = -1,    // 처음엔 모두 접힘(제목만)
}) {
    const [openIdx, setOpenIdx] = useState(defaultOpenIndex);

    return (
        <Section>
            <Panel>
                <Head>
                    <h2>{title}</h2>
                    <p>{desc}</p>
                </Head>

                <List>
                    {items.map((it, i) => {
                        const open = openIdx === i;
                        return (
                            <Row key={i} $open={open}>
                                <RowHead $open={open} onClick={() => setOpenIdx(open ? -1 : i)} aria-expanded={open}>
                                    {it.title}
                                    <span className="toggle">{open ? "-" : "+"}</span>
                                </RowHead>

                                <RowBody $open={open} aria-hidden={!open}>
                                    <div className="bodyText">{it.content}</div>
                                </RowBody>
                            </Row>
                        );
                    })}
                </List>
            </Panel>
        </Section>
    );
}
