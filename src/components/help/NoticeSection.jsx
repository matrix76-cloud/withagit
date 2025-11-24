/* eslint-disable */
// /src/components/help/NoticeSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { listNotices } from "../../services/noticesService";   // posted only

const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const accent = "var(--color-accent, #F07A2A)";
const line = "rgba(17,24,39,.12)";

const List = styled.div` border-top: 1px solid ${line}; `;
const Row = styled.div`
  display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center;
  padding: 22px 6px; border-bottom: 1px solid ${line}; cursor: pointer;
  &:hover{ background: rgba(17,24,39,.03); }
`;
const Left = styled.div` display: grid; gap: 8px; `;
const Title = styled.div` font-size: 17px; color: ${text}; font-weight: 700; letter-spacing: -.1px; `;
const Meta = styled.div` font-size: 13px; color: ${sub}; display: flex; gap: 12px; align-items:center; `;
const Dot = styled.span` width:9px; height:9px; border-radius:999px; background:${accent}; display:inline-block; margin-right:8px; `;
const Pin = styled.span` font-size:13px; color:${sub}; `;
const Toggle = styled.span` color:#aeb6c3; font-size: 20px; `;

const Body = styled.div`
  padding: 12px 6px 20px 30px;
  color: ${text}; font-size: 15px; line-height: 1.9;
  border-bottom: 1px solid ${line};
`;

/* 본문 HTML 컨텐츠 기본 스타일 */
const Html = styled.div`
  /* 타이포 */
  h1,h2,h3{ margin: 12px 0 6px; line-height:1.35; }
  p{ margin: 8px 0; }
  ul,ol{ margin: 6px 0 6px 18px; }
  a{ color: ${accent}; text-decoration: underline; text-underline-offset: 2px; }

  /* 미디어 */
  img,video{ max-width: 100%; height: auto; border-radius: 8px; }
  table{ width:100%; border-collapse: collapse; font-size: 14px; }
  th,td{ border:1px solid ${line}; padding:6px 8px; }
`;

/* 날짜 포맷: Timestamp/Date/string 모두 처리 */
const fmtDate = (v) => {
    try {
        const d = v?.toDate ? v.toDate() : (v instanceof Date ? v : new Date(v));
        if (Number.isNaN(d?.getTime?.())) return "";
        return d.toISOString().slice(0, 10);
    } catch { return ""; }
};

/* 아주 간단한 Sanitizer — 서버에서도 DOMPurify 권장 */
function sanitizeHtml(html) {
    if (!html) return "";
    let s = String(html);
    s = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ""); // script 제거
    s = s.replace(/\son\w+="[^"]*"/gi, ""); // onClick 류 제거 (")
    s = s.replace(/\son\w+='[^']*'/gi, ""); // onClick 류 제거 (')
    return s;
}

export default function NoticeSection() {
    const [items, setItems] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [readSet, setReadSet] = useState(() => {
        try { return new Set(JSON.parse(localStorage.getItem("withagit.notice.readset") || "[]")); }
        catch { return new Set(); }
    });

    useEffect(() => {
        let alive = true;
        (async () => {
            const list = await listNotices();   // { id, title, bodyHtml, summary, ... }
            if (!alive) return;
            setItems(list || []);
        })();
        return () => { alive = false; };
    }, []);

    const unreadCount = useMemo(() => items.filter(x => !readSet.has(x.id)).length, [items, readSet]);

    const toggle = (id) => {
        setOpenId(prev => prev === id ? null : id);
        if (!readSet.has(id)) {
            const next = new Set(readSet); next.add(id);
            setReadSet(next);
            try { localStorage.setItem("withagit.notice.readset", JSON.stringify([...next])); } catch { }
        }
    };

    if (!items.length) return <div style={{ color: sub, fontSize: 14 }}>등록된 공지사항이 없습니다.</div>;

    return (
        <div>
            <div style={{ color: sub, fontSize: 14, margin: "0 0 12px" }}>
                총 {items.length}건 · 미열람 {unreadCount}건
            </div>
            <List>
                {items.map(it => {
                    const on = openId === it.id;
                    const read = readSet.has(it.id);
                    const html = sanitizeHtml(it.bodyHtml || it.body || ""); // ✅ bodyHtml 우선
                    return (
                        <div key={it.id} id={it.id}>
                            <Row onClick={() => toggle(it.id)} aria-expanded={on}>
                                <Left>
                                    <Title>{!read && <Dot />} {it.title}</Title>
                                    <Meta>
                                        <span>{fmtDate(it.publishedAt)}</span>
                                        {it.isPinned ? <Pin>· 상단고정</Pin> : null}
                                        {read ? <span>· 읽음</span> : <span>· 안읽음</span>}
                                    </Meta>
                                </Left>
                                <Toggle>{on ? "−" : "+"}</Toggle>
                            </Row>

                            {on && (
                                <Body>
                                    <Html dangerouslySetInnerHTML={{ __html: html }} />
                                </Body>
                            )}
                        </div>
                    );
                })}
            </List>
        </div>
    );
}
