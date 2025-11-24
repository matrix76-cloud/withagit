// src/components/ContentRequestCard.jsx
import React, { useMemo, useState } from "react";
import styled from "styled-components";

/** ─────────────────────────────────────────────────────
 * 재사용 가능한 ‘콘텐츠 요청’ 카드
 * - 두 입력영역: 타이틀(한 줄) + 세부 기술 내용(여러 줄)
 * - 미리보기(조합된 메시지) + 한 번에 복사/초기화
 * - props로 라벨/플레이스홀더/기본값/가이드 숨김 등 제어
 * ──────────────────────────────────────────────────── */
export default function ContentRequestCard({
    heading = "콘텐츠 입력 요청",
    titleLabel = "페이지 타이틀",
    detailsLabel = "세부 기술 내용",
    titlePlaceholder = "예) 위드아지트 — 공간 소개",
    detailsPlaceholder = "예) 페이지 목적, 주요 섹션, 사진/영상 배치, 톤&무드, 참고 URL 등…",
    defaultTitle = "",
    defaultDetails = "",
    showGuide = true,
    onSubmit,            // (data) => void
    className,           // 외부 컨테이너 스타일 확장용
}) {
    const [title, setTitle] = useState(defaultTitle);
    const [details, setDetails] = useState(defaultDetails);

    const preview = useMemo(() => {
        const t = title?.trim();
        const d = details?.trim();
        return (
            `[${heading}]
- ${titleLabel}: ${t || "(미입력)"} 
- ${detailsLabel}:
${d || "(미입력)"}
`
        );
    }, [heading, titleLabel, detailsLabel, title, details]);

    const copy = async (text) => {
        try { await navigator.clipboard.writeText(text); alert("복사되었습니다."); }
        catch { alert("복사에 실패했어요. 브라우저 권한을 확인해주세요."); }
    };

    const handleSubmit = () => onSubmit?.({ title, details, preview });

    return (
        <Card className={className}>


            <Grid>
 

                {showGuide && (
                    <Side>
                        <GuideTitle>작성 내용</GuideTitle>

                        <GuideList>
                            <li><strong>내용</strong>: {heading}</li>
                            <li><strong>레퍼런스</strong>: 참고 URL/스크린샷</li>
                            <li><strong>자원</strong>: 제공 가능한 사진/영상, 로고, 아이콘</li>
                        </GuideList>

                 
     
                    </Side>
                )}
            </Grid>
        </Card>
    );
}

/* ── styles ───────────────────────────────────────── */

const Card = styled.div`
  border: 1px solid rgba(0,0,0,.06);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
  padding: 16px;
  margin-top:50px;

`;

const Head = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const H3 = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  font-weight: 900;
  font-size: 18px;
`;

const Actions = styled.div`
  display: inline-flex; gap: 8px; align-items: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Main = styled.div`display: grid; gap: 16px;`;
const Side = styled.aside`

  padding-left: 16px;
  @media (max-width: 900px) {
    border-left: 0; padding-left: 0; border-top: 1px dashed rgba(0,0,0,.08);
    padding-top: 12px;
  }
`;

const Field = styled.div`display: grid; gap: 8px;`;
const Label = styled.label`
  font-weight: 800;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
`;
const Meta = styled.div`
  font-size: 12px; color: rgba(0,0,0,.45); text-align: right;
`;

const Input = styled.input`
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 16px;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme?.colors?.primary || "#FF7A00"}; box-shadow: 0 0 0 3px rgba(255,122,0,.18); }
`;

const Textarea = styled.textarea`
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px; line-height: 1.55; resize: vertical;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme?.colors?.primary || "#FF7A00"}; box-shadow: 0 0 0 3px rgba(255,122,0,.18); }
`;

const Preview = styled.div`
  border: 1px dashed rgba(0,0,0,.12);
  border-radius: 12px;
  background: #F8FAFC;
  padding: 12px 14px;
  pre {
    margin: 0; white-space: pre-wrap; word-break: break-word;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 13px; color: #334155;
  }
`;

const GuideTitle = styled.div`
  font-weight: 900; color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  margin-bottom: 8px;

`;

const GuideList = styled.ul`
  margin: 0; padding-left: 18px; display: grid; gap: 6px;
  li { color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"}; opacity: .9; }
  strong { color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"}; }
`;

const Note = styled.div`
  margin-top: 10px; font-size: 12px; color: rgba(0,0,0,.55);
`;

const BtnRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

/* 버튼들 */
const Btn = styled.button`
  height: 34px; padding: 0 12px; border-radius: 10px; cursor: pointer;
  border: 1px solid ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  background: ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  color: #fff; font-weight: 800;
  &:hover { filter: brightness(.97); }
`;
const BtnPrimary = Btn;
const BtnGhost = styled.button`
  height: 34px; padding: 0 12px; border-radius: 10px; cursor: pointer;
  border: 1px solid rgba(0,0,0,.12); background: #fff; color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  font-weight: 800;
  &:hover { background: #FAFAFA; }
`;
