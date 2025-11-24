/* eslint-disable */
// /src/pages/HelpLanding.jsx
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import NoticeSection from "../components/help/NoticeSection";
import FaqSection from "../components/help/FaqSection";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

import { listMyFeedbacks, submitFeedbackExt } from "../services/feedbackService";
import { listMyNextAgitSuggestions, submitNextAgitSuggest } from "../services/branchSuggestService";

/* ===== Tokens ===== */
const bg = "#FFFFFF";
const navy = "#1A2B4C";
const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const HEADER_VAR = "var(--header-height, 64px)";
const line = "rgba(17,24,39,.12)";
const primary = "var(--color-primary, #2F6BFF)";
const accent = "var(--color-accent, #F07A2A)";

/* ===== Layout ===== */
const Page = styled.main`
  min-height: 100dvh; background: ${bg};
  padding: calc(${HEADER_VAR} + 40px) 28px 160px;
`;
const Wrap = styled.div`max-width:1180px;margin:0 auto;display:grid;gap:88px;`;
const SectionHead = styled.div`display:grid;gap:8px;margin-bottom:16px;`;
const H2 = styled.h2`
  margin:0;color:${navy};font-size:clamp(22px,2.2vw,30px);letter-spacing:-0.2px;font-weight:800;
`;
const Lead = styled.p`margin:10px 0 0;color:${sub};font-size:15px;`;
const Hr = styled.hr`border:0;height:1px;background:${line};opacity:.28;margin:0 0 16px;`;

/* ===== CTA Buttons ===== */
const CtaRow = styled.div`display:flex;gap:10px;justify-content:flex-end;margin:8px 0 0;flex-wrap:wrap;`;
const CtaButton = styled.button`
  height:44px;padding:0 18px;border-radius:14px;border:2px solid ${accent};
  background:#fff;color:${accent};font-weight:800;font-size:14px;cursor:pointer;
  transition:background .15s ease, box-shadow .15s ease;
  &:hover{background:#fff7f1;box-shadow:0 2px 0 rgba(0,0,0,.02);}
  &:active{transform:translateY(1px);}
`;

/* ===== My Feedback list ===== */
const MyWrap = styled.section``;
const H3 = styled.h3`margin:22px 0 8px;font-size:18px;color:${navy};font-weight:800;`;
const MyList = styled.div`display:grid;gap:10px;`;
const Card = styled.article`border:1px solid #eef0f4;border-radius:14px;background:#fff;padding:12px 14px;`;
const Meta = styled.div`font-size:12px;color:${sub};margin-bottom:6px;`;
const Title = styled.div`font-size:15px;font-weight:800;color:${text};margin-bottom:4px;`;
const Content = styled.div`font-size:14px;color:${text};line-height:1.75;white-space:pre-line;`;

/* ===== Suggest Modals: 공용 스타일 ===== */
const ModalBg = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(48px, 10vh, 120px) 16px 32px;
  overflow: auto;
  z-index: 4000;
`;
const ModalCard = styled.div`
  width: min(720px, 100%);
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: auto;
  max-height: min(80vh, 760px);
`;
const ModalHead = styled.div`
  padding:12px 16px; border-bottom:1px solid rgba(0,0,0,.06);
  display:flex; align-items:center; justify-content:space-between; gap:8px;
`;
const ModalTitle = styled.div`font-weight:900;color:${navy};`;

const ModalBody = styled.div`
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr;
  & > * { width: 100%; }
`;
const Label = styled.label`font-size:12px;color:${sub};`;
const Input = styled.input`
  width: 100%;
  height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  &:focus{ outline: none; border-color: ${primary}; box-shadow: 0 0 0 3px color-mix(in srgb, ${primary} 18%, transparent); }
`;
const Textarea = styled.textarea`
  width: 100%;
  min-height: 180px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  resize: vertical;
  &:focus{ outline: none; border-color: ${primary}; box-shadow: 0 0 0 3px color-mix(in srgb, ${primary} 18%, transparent); }
`;
const ModalFoot = styled.div`padding:12px 16px;border-top:1px solid rgba(0,0,0,.06);display:flex;gap:8px;justify-content:flex-end;`;
const Ghost = styled.button`
  height:42px;padding:0 16px;border-radius:12px;font-weight:900;cursor:pointer;border:1px solid #e5e7eb;background:#fff;color:#111;
`;
const PrimaryBtn = styled.button`
  height:42px;padding:0 16px;border-radius:12px;font-weight:900;cursor:pointer;border:0;color:#fff;background:${accent};
  &:disabled{opacity:.6;cursor:not-allowed;}
`;
const Select = styled.select`
  width: 100%;
  height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  background: #fff;
  &:focus{ outline: none; border-color: ${primary}; box-shadow: 0 0 0 3px color-mix(in srgb, ${primary} 18%, transparent); }
`;

/* ===== utils ===== */
const fmt = (ts) => {
    try {
        const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : new Date(ts));
        const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0"), mm = String(d.getMinutes()).padStart(2, "0");
        return `${y}-${m}-${da} ${hh}:${mm}`;
    } catch { return ""; }
};

/* ===== 일반 제안 모달 ===== */
function SuggestModal({ open, onClose, onSubmitted }) {
    const { phoneE164 } = useUser() || {};
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [contact, setContact] = React.useState("");
    const [userName, setUserName] = React.useState("");
    const [category, setCategory] = React.useState("program"); // program | snack | improve | etc
    const [files, setFiles] = React.useState([]);              // File[]
    const [busy, setBusy] = React.useState(false);
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        if (!open) {
            setTitle(""); setContent(""); setContact(""); setUserName("");
            setCategory("program"); setFiles([]); setBusy(false);
        }
    }, [open]);

    const onPickFiles = (e) => {
        const picked = Array.from(e.target.files || []);
        const merged = [...files, ...picked].slice(0, 5);
        const allowed = merged.filter(f => {
            const okType = /image\/|pdf$/.test(f.type);
            const okSize = f.size <= 10 * 1024 * 1024; // 10MB
            return okType && okSize;
        });
        if (allowed.length !== merged.length) {
            alert("이미지/PDF만, 파일당 최대 10MB, 최대 5개까지 업로드할 수 있습니다.");
        }
        setFiles(allowed);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (idx) => setFiles(list => list.filter((_, i) => i !== idx));

    const submit = async () => {
        const t = title.trim(), c = content.trim();
        if (!t || !c) return alert("제목과 내용을 입력해 주세요.");
        if (!phoneE164) {
            alert("제안을 보내려면 로그인이 필요합니다.");
            try { window.location.href = `/login?from=${encodeURIComponent("/help")}`; } catch { }
            return;
        }
        try {
            setBusy(true);
            await submitFeedbackExt({
                userPhoneE164: phoneE164,
                title: t,
                content: c,
                contact: contact.trim() || null,
                category,
                userName: userName.trim() || null,
                files,
            });
            alert("제안해주셔서 감사합니다!\n모든 의견은 내부 검토 후 서비스 개선에 반영됩니다.");
            onSubmitted?.({ title: t, content: c });
            onClose?.();
        } catch (e) {
            console.error("[SuggestModal] submit failed:", e);
            alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally { setBusy(false); }
    };

    if (!open) return null;

    return (
        <ModalBg onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                <ModalHead>
                    <ModalTitle>제안하기</ModalTitle>
                    <button onClick={onClose} aria-label="닫기"
                        style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 18, color: "#6b7280" }}>✕</button>
                </ModalHead>

                <ModalBody>
                    <div>
                        <Label htmlFor="sg-cat">카테고리</Label>
                        <Select id="sg-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="program">프로그램 아이디어</option>
                            <option value="snack">간식/교구 관련</option>
                            <option value="improve">불편/개선사항</option>
                            <option value="etc">기타 의견</option>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="sg-title">제목</Label>
                        <Input id="sg-title" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="예) 픽업 예약에 주간 보기 추가 요청" autoFocus />
                    </div>

                    <div>
                        <Label htmlFor="sg-content">내용</Label>
                        <Textarea id="sg-content" value={content} onChange={e => setContent(e.target.value)}
                            placeholder="구체적인 아이디어나 불편했던 점을 작성해 주세요." />
                    </div>

                    <div>
                        <Label>파일 첨부 (선택) — 이미지/PDF, 10MB, 최대 5개</Label>
                        <input
                            ref={fileInputRef}
                            id="sg-files"
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={onPickFiles}
                            style={{ display: "none" }}
                        />
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    height: 40, padding: "0 14px", borderRadius: 12,
                                    border: "2px solid var(--color-accent, #F07A2A)",
                                    background: "#fff", color: "var(--color-accent, #F07A2A)",
                                    fontWeight: 800, cursor: "pointer"
                                }}
                            >파일 선택</button>
                            <span style={{ fontSize: 12, color: sub }}>
                                {files.length ? `${files.length}개 선택됨` : "선택된 파일 없음"}
                            </span>
                        </div>
                        {files.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                                {files.map((f, i) => (
                                    <div key={i}
                                        style={{
                                            fontSize: 12, color: "#374151", border: "1px solid #e5e7eb",
                                            borderRadius: 999, padding: "6px 10px", display: "flex", gap: 8, alignItems: "center", background: "#fff"
                                        }}>
                                        <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                                        <button type="button" onClick={() => removeFile(i)}
                                            style={{ border: 0, background: "transparent", cursor: "pointer", color: "#9ca3af", fontSize: 14 }}
                                            aria-label="첨부 제거">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="sg-name">이름 (선택)</Label>
                        <Input id="sg-name" value={userName} onChange={e => setUserName(e.target.value)} placeholder="이름(선택)" />
                    </div>

                    <div>
                        <Label htmlFor="sg-contact">연락처 (선택)</Label>
                        <Input id="sg-contact" value={contact} onChange={e => setContact(e.target.value)} placeholder="이메일/전화번호(선택)" />
                    </div>
                </ModalBody>

                <ModalFoot>
                    <Ghost type="button" onClick={onClose}>취소</Ghost>
                    <PrimaryBtn type="button" onClick={submit} disabled={busy}>
                        {busy ? "제출 중..." : "제안 보내기"}
                    </PrimaryBtn>
                </ModalFoot>
            </ModalCard>
        </ModalBg>
    );
}

/* ===== 다음 아지트 제안하기 모달 ===== */
function NextAgitModal({ open, onClose, onSubmitted }) {
    const { phoneE164 } = useUser() || {};
    const [region, setRegion] = React.useState("");
    const [schoolName, setSchoolName] = React.useState("");
    const [activityPlaces, setActivityPlaces] = React.useState("");
    const [reason, setReason] = React.useState("");
    const [userName, setUserName] = React.useState("");
    const [contact, setContact] = React.useState("");
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        if (!open) {
            setRegion(""); setSchoolName(""); setActivityPlaces(""); setReason("");
            setUserName(""); setContact(""); setBusy(false);
        }
    }, [open]);

    const submit = async () => {
        if (!phoneE164) {
            alert("제안을 보내려면 로그인이 필요합니다.");
            try { window.location.href = `/login?from=${encodeURIComponent("/help")}`; } catch { }
            return;
        }
        const r = region.trim(), s = schoolName.trim(), a = activityPlaces.trim(), rsn = reason.trim();
        if (!r || !rsn) {
            alert("희망지역과 추천 의견(이유)을 입력해 주세요.");
            return;
        }
        try {
            setBusy(true);
            await submitNextAgitSuggest({
                userPhoneE164: phoneE164,
                region: r,
                schoolName: s || null,
                activityPlaces: a || null,
                reason: rsn,
                userName: userName.trim() || null,
                contact: contact.trim() || null,
            });
            alert("제안해주셔서 감사합니다!\n모든 의견은 내부 검토 후 서비스 확장에 활용됩니다.");
            onSubmitted?.({ region: r, reason: rsn });
            onClose?.();
        } catch (e) {
            console.error("[NextAgitModal] submit failed:", e);
            alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally { setBusy(false); }
    };

    if (!open) return null;

    return (
        <ModalBg onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                <ModalHead>
                    <ModalTitle>다음 아지트 제안하기</ModalTitle>
                    <button onClick={onClose} aria-label="닫기"
                        style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 18, color: "#6b7280" }}>✕</button>
                </ModalHead>

                <ModalBody>
                    <div>
                        <Label>기본 정보 입력</Label>
                        <div style={{ display: "grid", gap: 10 }}>
                            <div>
                                <Label htmlFor="na-region">희망지역 (시/구/동까지)</Label>
                                <Input id="na-region" value={region} onChange={e => setRegion(e.target.value)}
                                    placeholder="예) 성남시 분당구 정자동" />
                            </div>
                            <div>
                                <Label htmlFor="na-school">주요 생활권</Label>
                                <Input id="na-school" value={schoolName} onChange={e => setSchoolName(e.target.value)}
                                    placeholder="추천 아지트 학교명(선택)" />
                            </div>
                            <div>
                                <Input value={activityPlaces} onChange={e => setActivityPlaces(e.target.value)}
                                    placeholder="주요 학원 및 활동 장소(선택)" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>추천 의견</Label>
                        <Textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder={`왜 이 동네에 아지트가 필요하다고 생각하시나요?\n예) 맞벌이 가정이 많고 초등학교 방과 후 돌봄이 부족해요.\n예) 근처에 사교육 시설은 많은데 아이들이 쉴 곳이 없어요.`}
                        />
                    </div>

                    <div>
                        <Label>연락처 (선택)</Label>
                        <Input value={userName} onChange={e => setUserName(e.target.value)} placeholder="이름(선택)" />
                        <div style={{ height: 6 }} />
                        <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="휴대폰 번호 또는 이메일(선택)" />
                        <div style={{ marginTop: 8, color: sub, fontSize: 12 }}>
                            * 시장 조사를 위한 인터뷰 요청을 드릴 수 있습니다. 아이들이 방과 후 안전하고 행복하게 지낼 수 있는 아지트를 찾아요.
                        </div>
                    </div>
                </ModalBody>

                <ModalFoot>
                    <Ghost type="button" onClick={onClose}>취소</Ghost>
                    <PrimaryBtn type="button" onClick={submit} disabled={busy}>
                        {busy ? "제출 중..." : "제안 보내기"}
                    </PrimaryBtn>
                </ModalFoot>
            </ModalCard>
        </ModalBg>
    );
}

/* ===== 페이지 컴포넌트 ===== */
export default function HelpLanding() {
    const nav = useNavigate();
    const { phoneE164 } = useUser() || {};

    // 일반 제안 리스트
    const [myGeneral, setMyGeneral] = useState([]);
    const [loadingGeneral, setLoadingGeneral] = useState(false);

    // 다음 아지트 제안 리스트
    const [myNext, setMyNext] = useState([]);
    const [loadingNext, setLoadingNext] = useState(false);

    // 모달
    const [openSuggest, setOpenSuggest] = useState(false);
    const [openNext, setOpenNext] = useState(false);

    // 일반 제안 불러오기
    useEffect(() => {
        let alive = true;
        (async () => {
            if (!phoneE164) { setMyGeneral([]); return; }
            setLoadingGeneral(true);
            const list = await listMyFeedbacks(phoneE164);
            if (!alive) return;
            setMyGeneral((list || []).slice(0, 5));
            setLoadingGeneral(false);
        })();
        return () => { alive = false; };
    }, [phoneE164]);

    // 다음 아지트 제안 불러오기
    useEffect(() => {
        let alive = true;
        (async () => {
            if (!phoneE164) { setMyNext([]); return; }
            setLoadingNext(true);
            const list = await listMyNextAgitSuggestions(phoneE164);
            if (!alive) return;
            setMyNext((list || []).slice(0, 5));
            setLoadingNext(false);
        })();
        return () => { alive = false; };
    }, [phoneE164]);

    // 일반 제안 낙관 반영
    const onSubmittedGeneral = useCallback((draft) => {
        if (!phoneE164) return;
        const now = new Date();
        setMyGeneral(prev => [
            { id: `temp_${now.getTime()}`, title: draft.title, content: draft.content, createdAt: now },
            ...prev
        ].slice(0, 5));
    }, [phoneE164]);

    // 다음 아지트 제안 낙관 반영
    const onSubmittedNext = useCallback((draft) => {
        if (!phoneE164) return;
        const now = new Date();
        setMyNext(prev => [
            { id: `temp_${now.getTime()}`, region: draft.region, reason: draft.reason, createdAt: now },
            ...prev
        ].slice(0, 5));
    }, [phoneE164]);

    return (
        <Page>
            <Wrap>
                {/* 공지사항 */}
                <section id="help-notices">
                    <SectionHead>
                        <H2>공지사항</H2>
                        <Lead>최신 안내와 중요한 변경사항을 확인하세요.</Lead>
                    </SectionHead>
                    <Hr />
                    <NoticeSection />
                </section>

                {/* FAQ */}
                <section id="help-faq">
                    <SectionHead>
                        <H2>자주 묻는 질문</H2>
                        <Lead>카테고리별 자주 묻는 질문을 빠르게 찾아보세요.</Lead>
                    </SectionHead>
                    <Hr />
                    <FaqSection />
                </section>

                {/* 일반 제안 섹션 */}
                <section id="help-feedback">
                    <SectionHead>
                        <H2>위드아지트에 제안하기</H2>
                        <Lead>위드아지트가 더 나아질 수 있도록 의견을 들려주세요.</Lead>
                    </SectionHead>
                    <Hr />
                    <p style={{ color: sub, fontSize: 15, margin: 0 }}>
                        제안은 내부 검토 후 순차적으로 반영됩니다.
                    </p>
                    <CtaRow>
                        <CtaButton onClick={() => setOpenSuggest(true)}>제안보내기</CtaButton>
                    </CtaRow>

                    {phoneE164 && (
                        <MyWrap>
                            <H3>나의 제안</H3>
                            {loadingGeneral ? (
                                <div style={{ padding: 8, color: sub, fontSize: 14 }}>불러오는 중…</div>
                            ) : myGeneral.length === 0 ? (
                                <div style={{ padding: 8, color: sub, fontSize: 14 }}>아직 등록한 제안이 없습니다.</div>
                            ) : (
                                <MyList>
                                    {myGeneral.map(it => (
                                        <Card key={it.id}>
                                            <Meta>{fmt(it.createdAt)}</Meta>
                                            <Title>{it.title || "제목 없음"}</Title>
                                            <Content>{it.content || ""}</Content>
                                        </Card>
                                    ))}
                                </MyList>
                            )}
                        </MyWrap>
                    )}
                </section>

                {/* 다음 아지트 제안 섹션 */}
                <section id="help-next-agit">
                    <SectionHead>
                        <H2>다음 아지트에 제안하기</H2>
                        <Lead>왜 이 동네에 아지트가 필요하다고 생각하시나요?</Lead>
                    </SectionHead>
                    <Hr />
                    <p style={{ color: sub, fontSize: 15, margin: 0 }}>
                        제안은 내부 검토 후 순차적으로 반영됩니다.
                    </p>
                    <CtaRow>
                        <CtaButton onClick={() => setOpenNext(true)}>다음 아지트 제안하기</CtaButton>
                    </CtaRow>

                    {phoneE164 && (
                        <MyWrap>
                            <H3>나의 다음 아지트 제안</H3>
                            {loadingNext ? (
                                <div style={{ padding: 8, color: sub, fontSize: 14 }}>불러오는 중…</div>
                            ) : myNext.length === 0 ? (
                                <div style={{ padding: 8, color: sub, fontSize: 14 }}>다음 아지트에 등록한 제안이 없습니다.</div>
                            ) : (
                                <MyList>
                                    {myNext.map(it => (
                                        <Card key={it.id}>
                                            <Meta>{fmt(it.createdAt)}</Meta>
                                            <Title>{it.region || "-"}</Title>
                                            <Content>{it.reason || ""}</Content>
                                        </Card>
                                    ))}
                                </MyList>
                            )}
                        </MyWrap>
                    )}
                </section>

                {/* 고객센터 */}
                <section id="help-support">
                    <SectionHead>
                        <H2>고객센터</H2>
                        <Lead>문의 채널 및 지점 연락처입니다.</Lead>
                    </SectionHead>
                    <Hr />
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, fontSize: 16 }}>
                        <li>
                            <a
                                href="http://pf.kakao.com/_qYzxkn"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: primary, textDecoration: "none", fontWeight: 800 }}
                            >
                                카카오톡 채널 열기
                            </a>
                        </li>
                        <li><a href="tel:031-548-2962" style={{ color: "var(--color-text,#111827)", textDecoration: "none" }}>대표 번호: 031-548-2962 (평일 10:00~18:00)</a></li>
                        <li><a href="mailto:withagit.biz@gmail.com" style={{ color: "var(--color-text,#111827)", textDecoration: "none" }}>이메일: withagit.biz@gmail.com</a></li>
                    </ul>
                </section>
            </Wrap>

            {/* 모달 */}
            <SuggestModal open={openSuggest} onClose={() => setOpenSuggest(false)} onSubmitted={onSubmittedGeneral} />
            <NextAgitModal open={openNext} onClose={() => setOpenNext(false)} onSubmitted={onSubmittedNext} />
        </Page>
    );
}
