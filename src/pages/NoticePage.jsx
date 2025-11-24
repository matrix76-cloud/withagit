/* eslint-disable */
// src/pages/NoticesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { listNotices, fmtDateYYYYMMDD } from "../services/noticesService";

/* Tokens */
const navy = "#1A2B4C";
const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const line = "rgba(17,24,39,.12)";
const accent = "var(--color-accent, #F07A2A)";
const HEADER_VAR = "var(--header-height, 64px)";

/* Layout */
const Page = styled.main`
  min-height: 100dvh; background:#fff;
  padding: calc(${HEADER_VAR} + 40px) 28px 140px;
`;
const Wrap = styled.div` max-width: 1180px; margin: 0 auto; `;
const H1 = styled.h1`
  margin: 0 0 8px; color: ${navy};
  font-size: clamp(22px, 2.2vw, 30px); font-weight: 800; letter-spacing:-0.2px;
`;
const Lead = styled.p` margin: 0 0 16px; color: ${sub}; font-size: 15px; `;
const Hr = styled.hr` border:0; height:1px; background:${line}; opacity:.28; margin:0 0 16px; `;

/* List */
const MetaTop = styled.div` color:${sub}; font-size:14px; margin:0 0 12px; `;
const List = styled.div` border-top:1px solid ${line}; `;
const Row = styled.div`
  display:grid; grid-template-columns: 1fr auto; gap:16px; align-items:center;
  padding: 22px 6px; border-bottom:1px solid ${line}; cursor:pointer;
  &:hover{ background: rgba(17,24,39,.03); }
`;
const Left = styled.div` display:grid; gap:8px; `;
const Title = styled.div` font-size:17px; color:${text}; font-weight:700; letter-spacing:-.1px; `;
const Meta = styled.div` font-size:13px; color:${sub}; display:flex; gap:12px; align-items:center; `;
const Dot = styled.span` width:9px; height:9px; border-radius:999px; background:${accent}; display:inline-block; margin-right:8px; `;
const Pin = styled.span` font-size:13px; color:${sub}; `;
const Toggle = styled.span` color:#aeb6c3; font-size:20px; `;
const Body = styled.div`
  padding: 12px 6px 20px 30px; white-space: pre-line; color:${text};
  font-size:15px; line-height:1.9; border-bottom:1px solid ${line};
`;

/* Storage key for read/unread */
const LS_KEY = "withagit.notice.readset";
function loadReadSet() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); } catch { return new Set(); }
}
function saveReadSet(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...s])); } catch { }
}

/* Page */
export default function NoticesPage() {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [readSet, setReadSet] = useState(loadReadSet);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await listNotices();
      if (!alive) return;
      setItems(list || []);
    })();
    return () => { alive = false; };
  }, []);

  const unreadCount = useMemo(() => items.filter(x => !readSet.has(x.id)).length, [items, readSet]);

  const toggle = (id) => {
    setOpenId(prev => prev === id ? null : id);
    if (!readSet.has(id)) {
      const next = new Set(readSet); next.add(id); setReadSet(next); saveReadSet(next);
    }
  };

  return (
    <Page>
      <Wrap>
        <H1>공지사항</H1>
        <Lead>최신 안내와 중요한 변경사항을 확인하세요.</Lead>
        <Hr />

        <MetaTop>총 {items.length}건 · 미열람 {unreadCount}건</MetaTop>

        <List>
          {items.map(it => {
            const on = openId === it.id;
            const read = readSet.has(it.id);
            return (
              <div key={it.id} id={it.id}>
                <Row onClick={() => toggle(it.id)} aria-expanded={on}>
                  <Left>
                    <Title>{!read && <Dot />} {it.title}</Title>
                    <Meta>
                      <span>{fmtDateYYYYMMDD(it.publishedAt)}</span>
                      {it.isPinned ? <Pin>· 상단고정</Pin> : null}
                      {read ? <span>· 읽음</span> : <span>· 안읽음</span>}
                    </Meta>
                  </Left>
                  <Toggle>{on ? "−" : "+"}</Toggle>
                </Row>
                {on && <Body>{it.body || ""}</Body>}
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={{ padding: 20, color: sub, fontSize: 15 }}>등록된 공지가 없습니다.</div>
          )}
        </List>
      </Wrap>
    </Page>
  );
}
