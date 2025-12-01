/* eslint-disable */
// src/pages/mobile/AccountProfilePage.jsx
// Withagit — 모바일 내 정보 / 계정 관리 (/m/account/profile)

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { saveProfile } from "../../services/memberService";

/* ===== Helpers ===== */

const onlyDigits = (s = "") => (s || "").replace(/\D+/g, "");

function formatKRPhone(raw) {
    if (!raw) return "";
    let d = onlyDigits(raw);
    if (d.startsWith("82")) d = "0" + d.slice(2);
    if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    if (d.length === 10) {
        if (d.startsWith("02")) {
            return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
        }
        return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    }
    return d;
}

/* ===== Layout ===== */

const Page = styled.main`
  min-height: 100dvh;
  background: #f8f9fb;
  padding: 16px 0 24px;
  box-sizing: border-box;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont,
    system-ui, "Segoe UI", "Noto Sans KR", sans-serif;
`;

const Container = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px;
`;

/* 상단 헤더 (뒤로가기 + 타이틀) */

const HeaderBar = styled.header`
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const BackButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: transparent;
  display: grid;
  place-items: center;
  font-size: 18px;
  cursor: pointer;
  color: #4b5563;

  &:active {
    background: #e5e7eb;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
`;

/* 본문 카드 */

const Card = styled.section`
  margin-top: 12px;
  padding: 18px 18px 20px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
  display: grid;
  gap: 18px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 800;
  color: #111827;
`;

/* 폼 공통 */

const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
`;

const Input = styled.input`
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 0 12px;
  font-size: 14px;
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: 2px solid rgba(17, 24, 39, 0.12);
  }

  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 4px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #374151;
`;

const SaveButton = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.outline ? "#e5e7eb" : "transparent")};
  background: ${(p) => (p.outline ? "#ffffff" : "#e47b2c")};
  color: ${(p) => (p.outline ? "#374151" : "#ffffff")};
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const HintText = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  color: #9ca3af;
`;

/* ===== Component ===== */

export default function AccountProfilePage() {
    const nav = useNavigate();
    const { initialized, phoneE164, profile, refresh } = useUser() || {};
    const isLoggedIn = !!phoneE164;

    useEffect(() => {
        if (initialized && !isLoggedIn) {
            nav("/login", { replace: true });
        }
    }, [initialized, isLoggedIn, nav]);

    const [gender, setGender] = useState(profile?.gender || "male");
    const [name, setName] = useState((profile?.displayName || "").trim());
    const [email, setEmail] = useState((profile?.email || "").trim());

    useEffect(() => {
        setGender(profile?.gender || "male");
        setName((profile?.displayName || "").trim());
        setEmail((profile?.email || "").trim());
    }, [profile?.gender, profile?.displayName, profile?.email]);

    const [savingGender, setSavingGender] = useState(false);
    const [savingName, setSavingName] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);

    const labelPhone = useMemo(
        () => (phoneE164 ? formatKRPhone(phoneE164) : ""),
        [phoneE164]
    );

    const onBack = () => nav(-1);

    const doSave = async (patch, setSaving, label) => {
        if (!phoneE164) {
            alert("로그인이 필요합니다.");
            return;
        }
        setSaving(true);
        try {
            await saveProfile(phoneE164, {
                ...patch,
                updatedAt: Date.now(),
            });
            await refresh?.();
            if (label) alert(`${label}이 저장되었습니다.`);
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setSaving(false);
        }
    };

    if (!initialized) {
        return (
            <Page>
                <Container>
                    <HeaderBar>
                        <BackButton onClick={onBack}>‹</BackButton>
                        <HeaderTitle>내 정보 / 계정 관리</HeaderTitle>
                    </HeaderBar>
                    <div
                        style={{
                            padding: "40px 0",
                            textAlign: "center",
                            color: "#6b7280",
                            fontSize: 13,
                        }}
                    >
                        불러오는 중…
                    </div>
                </Container>
            </Page>
        );
    }

    return (
        <Page>
            <Container>
                <HeaderBar>
                    <BackButton onClick={onBack}>‹</BackButton>
                    <HeaderTitle>내 정보 / 계정 관리</HeaderTitle>
                </HeaderBar>

                <Card>
                    <SectionTitle>기본 정보</SectionTitle>

                    {/* 연락처 (읽기 전용) */}
                    <Field>
                        <Label>연락처</Label>
                        <Input value={labelPhone} disabled />
                    </Field>

                    {/* 성별 */}
                    <Field>
                        <Label>성별</Label>
                        <RadioGroup>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === "male"}
                                    onChange={() => setGender("male")}
                                />
                                <span>남</span>
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === "female"}
                                    onChange={() => setGender("female")}
                                />
                                <span>여</span>
                            </RadioLabel>
                        </RadioGroup>
                        <Row style={{ justifyContent: "flex-end", marginTop: 6 }}>
                            <SaveButton
                                type="button"
                                onClick={() => doSave({ gender }, setSavingGender, "성별")}
                                disabled={savingGender}
                            >
                                {savingGender ? "저장 중…" : "성별 저장"}
                            </SaveButton>
                        </Row>
                    </Field>

                    {/* 이름 */}
                    <Field>
                        <Label>이름</Label>
                        <Row>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름을 입력하세요"
                            />
                            <SaveButton
                                type="button"
                                onClick={() =>
                                    doSave(
                                        { displayName: (name || "").trim() },
                                        setSavingName,
                                        "이름"
                                    )
                                }
                                disabled={savingName || !name.trim()}
                            >
                                {savingName ? "저장 중…" : "저장"}
                            </SaveButton>
                        </Row>
                    </Field>

                    {/* 이메일 */}
                    <Field>
                        <Label>이메일</Label>
                        <Row>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="aa@withagit.co.kr"
                            />
                            <SaveButton
                                type="button"
                                onClick={() =>
                                    doSave(
                                        { email: (email || "").trim() },
                                        setSavingEmail,
                                        "이메일"
                                    )
                                }
                                disabled={savingEmail || !email.trim()}
                            >
                                {savingEmail ? "저장 중…" : "저장"}
                            </SaveButton>
                        </Row>
                        <HintText>
                            예약 안내 및 결제 영수증 발송에 사용될 이메일이에요.
                        </HintText>
                    </Field>
                </Card>
            </Container>
        </Page>
    );
}
