/* eslint-disable */
// src/pages/HelpFeedback.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { submitFeedback, listMyFeedbacks } from "../services/feedbackService";

/* ===== Tokens ===== */
const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const pageBg = "#FFFFFF";
const primary = "var(--color-primary, #2F6BFF)";
const accent = "var(--color-accent, #F07A2A)";

/* ===== Layout (AccountNewsPage 느낌) ===== */

const Page = styled.main`
  background: ${pageBg};
  padding: 16px 0 0;
  box-sizing: border-box;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", "Noto Sans KR", sans-serif;
`;

const Content = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px 32px;
  background: #ffffff;
  border-radius: 0 0 24px 24px;
  min-height: 360px;
`;

/* 상단 히어로 */

const HeroSection = styled.section`
  padding: 8px 0 18px;
`;

const HeroTitle = styled.h1`
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 800;
  color: ${text};
  text-align: center;
`;

const HeroTitleHighlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 4px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 3px;
    height: 40%;
    background: #ffe39b;
    border-radius: 999px;
    z-index: -1;
  }
`;

const HeroSub = styled.p`
  margin: 0;
  margin-bottom: 14px;
  font-size: 12px;
  color: ${sub};
  text-align: center;
`;

/* ===== Form ===== */

const FormSection = styled.section`
  padding: 12px 0 4px;
`;

const Form = styled.form`
  display: grid;
  gap: 14px;
`;

const Row = styled.div`
  display: grid;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  color: ${sub};
`;

const InputShell = styled.div`
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 10px 14px;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
`;

const TextAreaShell = styled(InputShell)`
  align-items: flex-start;
  padding: 10px 14px 12px;
`;

const TextArea = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  min-height: 140px;
  resize: vertical;
  line-height: 1.7;
`;

const BtnRow = styled.div`
  margin-top: 6px;
`;

const PrimaryBtn = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 999px;
  border: none;
  background: ${accent};
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(240, 122, 42, 0.35);

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 6px 16px rgba(240, 122, 42, 0.3);
  }
`;

/* ===== My list ===== */

const ListWrap = styled.section`
  max-width: 480px;
  margin: 0 auto;
  padding: 20px 16px 80px;
`;

const H2 = styled.h2`
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 800;
  color: ${text};
`;

const Item = styled.article`
  border-radius: 16px;
  border: 1px solid #eef0f4;
  padding: 12px 14px;
  background: #ffffff;
`;

const Meta = styled.div`
  color: ${sub};
  font-size: 11px;
  margin: 0 0 6px;
`;

const TitleTxt = styled.div`
  font-weight: 800;
  font-size: 14px;
  color: ${text};
  margin: 0 0 4px;
`;

const ContentTxt = styled.div`
  white-space: pre-line;
  font-size: 13px;
  color: ${text};
  line-height: 1.7;
`;

/* ===== utils ===== */
const fmt = (ts) => {
    try {
        const d =
            ts?.toDate?.() ??
            (ts instanceof Date ? ts : new Date(ts));
        if (isNaN(d)) return "";
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${y}-${m}-${day} ${hh}:${mm}`;
    } catch {
        return "";
    }
};

export default function HelpFeedback() {
    const nav = useNavigate();
    const location = useLocation();

    const userCtx = useUser() || {};
    const initialized = userCtx.initialized ?? true;
    const phoneE164 =
        userCtx.phoneE164 ||
        userCtx.user?.phoneE164 ||
        userCtx.profile?.phoneE164 ||
        "";

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [contact, setContact] = useState("");
    const [busy, setBusy] = useState(false);

    const [myList, setMyList] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    /* 로그인 가드 */
    useEffect(() => {
        if (!initialized) return;
        if (!phoneE164) {
            alert("로그인이 필요합니다. 로그인 후 이용해주세요.");
            try {
                nav(
                    `/login?from=${encodeURIComponent(
                        location.pathname + location.search
                    )}`
                );
            } catch { }
        }
    }, [initialized, phoneE164, nav, location]);

    /* 내 문의 목록 로드 */
    const refetch = async () => {
        if (!phoneE164) {
            setMyList([]);
            setLoadingList(false);
            return;
        }
        setLoadingList(true);
        const list = await listMyFeedbacks(phoneE164);
        setMyList(list || []);
        setLoadingList(false);
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phoneE164]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!initialized || !phoneE164) {
            alert("로그인이 필요합니다. 로그인 후 이용해주세요.");
            return;
        }
        const t = title.trim();
        const c = content.trim();
        if (!t || !c) {
            alert("제목과 내용을 입력해 주세요.");
            return;
        }
        try {
            setBusy(true);
            await submitFeedback({
                title: t,
                content: c,
                contact: contact.trim() || null,
                userPhoneE164: phoneE164,
            });
            setTitle("");
            setContent("");
            setContact("");
            await refetch();
            alert("문의가 접수되었습니다. 감사합니다!");
        } catch (err) {
            console.error("[HelpFeedback] submit error:", err);
            alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Page>
            <Content>
                <HeroSection>
                    <HeroTitle>
                        <HeroTitleHighlight>위드아지트 문의하기</HeroTitleHighlight>
                    </HeroTitle>
                    <HeroSub>
                        서비스 이용 중 궁금한 점이나 개선 제안을 자유롭게 보내주세요.
                    </HeroSub>
                </HeroSection>

                <FormSection>
                    <Form onSubmit={onSubmit} noValidate>
                        <Row>
                            <Label htmlFor="ff-title">제목</Label>
                            <InputShell>
                                <Input
                                    id="ff-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="예) 픽업 시간 추가 제안"
                                />
                            </InputShell>
                        </Row>

                        <Row>
                            <Label htmlFor="ff-content">내용</Label>
                            <TextAreaShell>
                                <TextArea
                                    id="ff-content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="자세히 적어주실수록 반영에 도움이 됩니다."
                                />
                            </TextAreaShell>
                        </Row>

                        <Row>
                            <Label htmlFor="ff-contact">연락처 (선택)</Label>
                            <InputShell>
                                <Input
                                    id="ff-contact"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="이메일 또는 전화번호"
                                />
                            </InputShell>
                        </Row>

                        <BtnRow>
                            <PrimaryBtn
                                type="submit"
                                disabled={busy || !initialized || !phoneE164}
                            >
                                {busy ? "제출 중..." : "문의하기"}
                            </PrimaryBtn>
                        </BtnRow>
                    </Form>
                </FormSection>
            </Content>

            {/* 나의 문의 리스트 */}
            <ListWrap>
                <H2>나의 문의</H2>
                {loadingList ? (
                    <div style={{ padding: 12, color: sub, fontSize: 13 }}>
                        불러오는 중…
                    </div>
                ) : myList.length === 0 ? (
                    <div style={{ padding: 12, color: sub, fontSize: 13 }}>
                        등록된 문의가 없습니다.
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                        {myList.map((it) => (
                            <Item key={it.id}>
                                <Meta>{fmt(it.createdAt)}</Meta>
                                <TitleTxt>{it.title || "제목 없음"}</TitleTxt>
                                <ContentTxt>{it.content || ""}</ContentTxt>
                            </Item>
                        ))}
                    </div>
                )}
            </ListWrap>
        </Page>
    );
}
