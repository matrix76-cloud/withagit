/* eslint-disable */
// src/pages/SuggestPage.jsx
// 위드아지트 — 다음 아지트 제안하기 페이지 (submitNextAgitSuggest 연동)

import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { submitNextAgitSuggest } from "../services/branchSuggestService"; // ⚠️ 실제 경로에 맞게 조정

const Page = styled.div`
  min-height: 100vh;
  background: #333333; /* 바깥 어두운 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
  box-sizing: border-box;
`;

const Sheet = styled.div`
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  position: relative;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f2f2f2;
  text-align: center;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #222222;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 18px;
  top: 18px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  span {
    font-size: 20px;
    line-height: 1;
    color: #666666;
  }

  &:hover {
    background: #f5f5f5;
  }
`;

const Body = styled.div`
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #333333;
`;

const OptionalMark = styled.span`
  font-size: 11px;
  color: #aaaaaa;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  border-radius: 18px;
  border: 1px solid #dddddd;
  padding: 0 16px;
  font-size: 14px;
  color: #222222;
  outline: none;

  &::placeholder {
    color: #b8b8b8;
  }

  &:focus {
    border-color: #111111;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  border-radius: 18px;
  border: 1px solid #dddddd;
  padding: 12px 16px;
  font-size: 14px;
  color: #222222;
  outline: none;
  resize: vertical;

  &::placeholder {
    color: #b8b8b8;
  }

  &:focus {
    border-color: #111111;
  }
`;

const FileInputShell = styled.div`
  position: relative;
`;

const FileFakeInput = styled.div`
  width: 100%;
  height: 48px;
  border-radius: 18px;
  border: 1px solid #dddddd;
  padding: 0 44px 0 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${({ hasFile }) => (hasFile ? "#222222" : "#b8b8b8")};
  background: #ffffff;
`;

const FileIconBox = styled.div`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;

  svg {
    width: 18px;
    height: 18px;
    color: #999999;
  }
`;

const RealFileInput = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
`;

const Footer = styled.div`
  padding: 12px 24px 20px;
  border-top: 1px solid #f2f2f2;
  display: flex;
  justify-content: center;
`;

const SubmitButton = styled.button`
  width: 100%;
  max-width: 260px;
  height: 48px;
  border-radius: 999px;
  border: none;
  background: #ff7e32;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.24);
  outline: none;

  &:hover {
    filter: brightness(1.03);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
    transform: none;
    box-shadow: none;
  }
`;

const Help = styled.p`
  margin: 0;
  font-size: 12px;
  color: #989898;
  line-height: 1.5;
`;

export default function SuggestPage() {
  const nav = useNavigate();
  const { phoneE164, profile } = useUser() || {};

  const [region, setRegion] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [activityPlaces, setActivityPlaces] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null); // UI용으로만 유지 (서비스에는 안 보냄)
  const [contactName, setContactName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    nav(-1); // 이전 화면으로
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneE164) {
      alert("로그인 후 제안하실 수 있어요.");
      return;
    }
    if (!region.trim() || !reason.trim()) {
      alert("희망지역과 제안 내용을 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      await submitNextAgitSuggest({
        userPhoneE164: (phoneE164 || "").trim(),
        region: region.trim(),
        schoolName: schoolName.trim() || null,
        activityPlaces: activityPlaces.trim() || null,
        reason: reason.trim(),
        userName: contactName.trim() || null,
        contact: contactInfo.trim() || null,
      });

      alert("제안을 보내주셔서 감사합니다! 😊");
      nav(-1);
    } catch (err) {
      console.error("[Suggest] submit error", err);
      alert("제안 제출 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Sheet>
        <Header>
          <HeaderTitle>제안하기</HeaderTitle>
          <CloseButton type="button" onClick={handleClose}>
            <span>×</span>
          </CloseButton>
        </Header>

        <form onSubmit={handleSubmit}>
          <Body>
            {/* 희망지역 */}
            <Field>
              <LabelRow>
                <Label>희망지역 (시/구/동)</Label>
              </LabelRow>
              <Input
                placeholder="예: 서울 송파구 잠실동"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </Field>

            {/* 추천 학교명 */}
            <Field>
              <LabelRow>
                <Label>추천 아지트 학교명</Label>
                <OptionalMark>(선택)</OptionalMark>
              </LabelRow>
              <Input
                placeholder="예: 잠실초등학교 (선택)"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </Field>

            {/* 주요 학원/활동 장소 */}
            <Field>
              <LabelRow>
                <Label>주요 학원/활동 장소</Label>
                <OptionalMark>(선택)</OptionalMark>
              </LabelRow>
              <Input
                placeholder="예: 학원가, 체육관 등"
                value={activityPlaces}
                onChange={(e) => setActivityPlaces(e.target.value)}
              />
            </Field>

            {/* 제안 내용 */}
            <Field>
              <LabelRow>
                <Label>제안 내용</Label>
              </LabelRow>
              <Textarea
                placeholder="왜 이 지역에 아지트가 필요하다고 생각하시나요?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>

            {/* 파일 첨부 (선택) — 현재는 UI만, 저장은 안 함 */}
            <Field>
              <LabelRow>
                <Label>파일 첨부</Label>
                <OptionalMark>(선택)</OptionalMark>
              </LabelRow>
              <FileInputShell>
                <FileFakeInput hasFile={!!file}>
                  {file ? file.name : "파일 업로드"}
                </FileFakeInput>
                <FileIconBox>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M16.5 6.5L9 14a2 2 0 1 0 2.83 2.83l5.66-5.66a3 3 0 1 0-4.24-4.24L8.4 11.8"
                    />
                  </svg>
                </FileIconBox>
                <RealFileInput type="file" onChange={handleFileChange} />
              </FileInputShell>
              <Help>이미지나 문서를 함께 보내고 싶다면 파일로 첨부해 주세요. (선택)</Help>
            </Field>

            {/* 연락처 (선택) */}
            <Field>
              <LabelRow>
                <Label>연락처</Label>
                <OptionalMark>(선택)</OptionalMark>
              </LabelRow>
              <Input
                placeholder="이름"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <Input
                placeholder="휴대폰 번호 or 이메일"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </Field>
          </Body>

          <Footer>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? "보내는 중..." : "제안 보내기"}
            </SubmitButton>
          </Footer>
        </form>
      </Sheet>
    </Page>
  );
}
