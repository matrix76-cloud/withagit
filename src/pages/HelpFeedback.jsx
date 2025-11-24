/* eslint-disable */
// src/pages/HelpFeedback.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { submitFeedback, listMyFeedbacks } from "../services/feedbackService";

/* ===== Tokens ===== */
const bg = "#FFFFFF";
const navy = "#1A2B4C";
const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const primary = "var(--color-primary, #2F6BFF)";
const HEADER_VAR = "var(--header-height, 64px)";
const line = "rgba(17,24,39,.12)";

/* ===== Layout ===== */
const Page = styled.main`
  min-height: 100dvh; background:${bg};
  padding: calc(${HEADER_VAR} + 40px) 28px 160px;
`;
const Wrap = styled.div` max-width: 1180px; margin: 0 auto; `;
const H1 = styled.h1` margin:0 0 10px; color:${navy}; font-size: clamp(22px,2.2vw,30px); font-weight: 800; `;
const Lead = styled.p` margin:0 0 16px; color:${sub}; font-size:15px; `;
const Hr = styled.hr` border:0; height:1px; background:${line}; opacity:.28; margin:0 0 16px; `;

/* ===== Form ===== */
const Card = styled.form` background:#fff; border-radius:16px; border:1px solid #eef0f4; padding:18px 16px; `;
const Row = styled.div` display:grid; gap:8px; margin-bottom:14px; `;
const Label = styled.label` font-size:13px; color:${sub}; `;
const Input = styled.input`
  height:44px; border-radius:12px; border:1px solid #e5e7eb; padding:0 12px; font-size:14px; outline:none;
  &:focus{ border-color:${primary}; box-shadow:0 0 0 3px color-mix(in srgb, ${primary} 16%, transparent); }
`;
const TextArea = styled.textarea`
  min-height: 160px; border-radius:12px; border:1px solid #e5e7eb; padding:10px 12px; font-size:14px; outline:none; resize:vertical; line-height:1.7;
  &:focus{ border-color:${primary}; box-shadow:0 0 0 3px color-mix(in srgb, ${primary} 16%, transparent); }
`;
const BtnRow = styled.div` display:flex; gap:8px; justify-content:flex-end; `;
const PrimaryBtn = styled.button`
  height:44px; padding:0 16px; border-radius:12px; border:0; background:var(--color-accent,#F07A2A); color:#fff; font-weight:800; cursor:pointer;
  &:disabled{ opacity:.5; cursor:not-allowed; }
`;
const GhostBtn = styled.button`
  height:44px; padding:0 16px; border-radius:12px; border:1px solid #e5e7eb; background:#fff; font-weight:700; cursor:pointer;
  &:hover{ background:#fafafa; }
`;

/* ===== My list ===== */
const ListWrap = styled.section` margin-top: 28px; `;
const H2 = styled.h2` margin: 0 0 10px; font-size:20px; font-weight:800; color:${navy}; `;
const Item = styled.article` border:1px solid #eef0f4; border-radius:14px; padding:14px 16px; background:#fff; `;
const Meta = styled.div` color:${sub}; font-size:12px; margin: 0 0 8px; `;
const TitleTxt = styled.div` font-weight:800; font-size:15px; color:${text}; margin: 0 0 6px; `;
const ContentTxt = styled.div` white-space: pre-line; font-size:14px; color:${text}; line-height:1.75; `;
const Answer = styled.div` margin-top:12px; padding:12px; border-radius:12px; background:#FAFAFF; border:1px solid #E8ECFF; `;
const AnswerTitle = styled.div` font-weight:800; font-size:14px; color:${primary}; margin:0 0 6px; `;

/* ===== utils ===== */
const fmt = (ts) => {
    try {
        const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : new Date(ts));
        return isNaN(d) ? "" :
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch { return ""; }
};

export default function HelpFeedback() {
    const nav = useNavigate();
    const location = useLocation();

    // ✅ UserContext 안전 추출(직접/중첩 모두 대응)
    const userCtx = useUser() || {};
    const initialized = userCtx.initialized ?? true;
    const phoneE164 =
        userCtx.phoneE164 ||
        userCtx.user?.phoneE164 ||
        userCtx.profile?.phoneE164 ||
        ""; // SSOT만 사용, 폴백 값 생성 금지(빈 문자열이면 미로그인으로 취급)

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [contact, setContact] = useState("");
    const [busy, setBusy] = useState(false);

    const [myList, setMyList] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    /* ✅ 로그인 가드: 초기화 완료 후 phoneE164 없으면 /login */
    useEffect(() => {
        if (!initialized) return;
        if (!phoneE164) {
            alert("로그인이 필요합니다. 로그인 후 이용해주세요.");
            try { nav(`/login?from=${encodeURIComponent(location.pathname + location.search)}`); } catch { }
        }
    }, [initialized, phoneE164, nav, location]);

    /* ✅ 내 제안 목록 로드 */
    const refetch = async () => {
        if (!phoneE164) { setMyList([]); setLoadingList(false); return; }
        setLoadingList(true);
        const list = await listMyFeedbacks(phoneE164);
        setMyList(list || []);
        setLoadingList(false);
    };
    useEffect(() => { refetch(); /* eslint-disable-next-line */ }, [phoneE164]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!initialized || !phoneE164) {
            alert("로그인이 필요합니다. 로그인 후 이용해주세요.");
            return;
        }
        const t = title.trim(), c = content.trim();
        if (!t || !c) return alert("제목과 내용을 입력해 주세요.");
        try {
            setBusy(true);
            await submitFeedback({
                title: t,
                content: c,
                contact: contact.trim() || null,
                userPhoneE164: phoneE164,     // ✅ SSOT 전달
            });
            setTitle(""); setContent(""); setContact("");
            await refetch();
            alert("제안이 접수되었습니다. 감사합니다!");
        } catch (err) {
            console.error("[HelpFeedback] submit error:", err);
            alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Page>
            <Wrap>
                <H1>위드아지트에 제안하기</H1>
                <Lead>서비스 개선 아이디어와 건의사항을 들려주세요.</Lead>
                <Hr />

                {/* 폼 */}
                <Card onSubmit={onSubmit} noValidate>
                    <Row>
                        <Label htmlFor="ff-title">제목</Label>
                        <Input id="ff-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예) 픽업 시간 추가 제안" />
                    </Row>
                    <Row>
                        <Label htmlFor="ff-content">내용</Label>
                        <TextArea id="ff-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="자세히 적어주실수록 반영에 도움이 됩니다." />
                    </Row>
                    <Row>
                        <Label htmlFor="ff-contact">연락처(선택)</Label>
                        <Input id="ff-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="이메일 또는 전화번호" />
                    </Row>

                    <BtnRow>
                        <GhostBtn type="button" onClick={() => { setTitle(""); setContent(""); setContact(""); }}>초기화</GhostBtn>
                        <PrimaryBtn type="submit" disabled={busy || !initialized || !phoneE164}>
                            {busy ? "제출 중..." : "제안 제출"}
                        </PrimaryBtn>
                    </BtnRow>
                </Card>

                {/* 나의 제안 목록 */}
                <ListWrap>
                    <H2>나의 제안</H2>
                    {loadingList ? (
                        <div style={{ padding: 16, color: sub, fontSize: 14 }}>불러오는 중…</div>
                    ) : myList.length === 0 ? (
                        <div style={{ padding: 16, color: sub, fontSize: 14 }}>등록된 제안이 없습니다.</div>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {myList.map(it => (
                                <Item key={it.id}>
                                    <Meta>{fmt(it.createdAt)}</Meta>
                                    <TitleTxt>{it.title || "제목 없음"}</TitleTxt>
                                    <ContentTxt>{it.content || ""}</ContentTxt>
                              
                                </Item>
                            ))}
                        </div>
                    )}
                </ListWrap>
            </Wrap>
        </Page>
    );
}
