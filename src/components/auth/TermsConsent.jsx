/* eslint-disable */
// /src/components/auth/TermsConsent.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import TermsModal from "../modal/TermsModal";

const Box = styled.section`
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 18px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", sans-serif;

  @media (max-width: 768px) {
    padding: 12px 12px 14px;
    margin-bottom: 14px;
  }
`;

const Title = styled.h3`
  margin: 0 0 12px;
  color: #1b2b3a;
  font-size: 18px;
  font-weight: 800;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 10px;
  }
`;

const Row = styled.label`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 10px;

  &:hover {
    background: #fafafa;
  }

  & + & {
    border-top: 1px dashed rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 768px) {
    gap: 8px;
    padding: 8px 6px;
  }
`;

const AllRow = styled(Row)`
  background: #fff8f0;
  border: 1px solid rgba(240, 122, 42, 0.25);
  margin-bottom: 8px;

  &:hover {
    background: #fff3e6;
  }

  @media (max-width: 768px) {
    margin-bottom: 6px;
  }
`;

const Check = styled.input.attrs({ type: "checkbox" })`
  width: 18px;
  height: 18px;
  accent-color: #f07a2a;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
  }
`;

const Label = styled.span`
  color: #1b2b3a;
  font-weight: ${(p) => (p.$bold ? 900 : 700)};
  font-size: 15px;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const Pill = styled.span`
  font-size: 12px;
  color: #fff;
  background: #f07a2a;
  border-radius: 999px;
  padding: 2px 8px;
  font-weight: 800;

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 2px 7px;
  }
`;

const LinkBtn = styled.button`
  border: 0;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

/* 마케팅 안내 문구 */
const Helper = styled.div`
  margin: 4px 0 0 34px; /* 체크박스 오른쪽 기준으로 들여쓰기 */
  font-size: 12px;
  color: #9ca3af;

  @media (max-width: 768px) {
    margin-left: 30px;
    font-size: 11px;
  }
`;

export default function TermsConsent({
  defaultValue = {
    tos_withagit: false, // 필수
    privacy: false, // 필수
    ecommerce: false, // 필수 (전자상거래)
    marketing: false, // 선택
  },
  requiredKeys: requiredKeysProp,
  onChange,
}) {
  const [val, setVal] = useState(defaultValue);
  const [modal, setModal] = useState({ open: false, doc: "service" });

  const requiredKeys = useMemo(
    () =>
      requiredKeysProp && requiredKeysProp.length
        ? requiredKeysProp
        : ["tos_withagit", "privacy", "ecommerce"],
    [requiredKeysProp]
  );

  const allRequiredChecked = useMemo(
    () => requiredKeys.every((k) => !!val[k]),
    [val, requiredKeys]
  );

  const allChecked = useMemo(() => Object.values(val).every(Boolean), [val]);

  useEffect(() => {
    onChange?.(val, allRequiredChecked);
  }, [val, allRequiredChecked, onChange]);

  const toggle = (k) => setVal((v) => ({ ...v, [k]: !v[k] }));
  const setAll = (checked) => {
    const next = Object.fromEntries(Object.keys(val).map((k) => [k, checked]));
    setVal(next);
  };

  const openDoc = (doc) => setModal({ open: true, doc });
  const closeDoc = () => setModal({ open: false, doc: "service" });

  return (
    <Box>
      <Title>이용약관</Title>

      <AllRow>
        <Check
          checked={allChecked}
          onChange={(e) => setAll(e.target.checked)}
          aria-label="전체 동의"
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Label $bold>아래 내용을 모두 확인하고 전체 동의</Label>
          <div>
            <span style={{ color: "#9aa1aa", fontSize: 12 }}>
              필수 항목 동의가 필요합니다.
            </span>
          </div>
        </div>
      </AllRow>

      <Row>
        <Check
          checked={val.tos_withagit}
          onChange={() => toggle("tos_withagit")}
        />
        <Label>
          <Pill>필수</Pill>&nbsp; 위드아지트 이용약관동의
        </Label>
        <LinkBtn type="button" onClick={() => openDoc("service")}>
          보기
        </LinkBtn>
      </Row>

      <Row>
        <Check checked={val.privacy} onChange={() => toggle("privacy")} />
        <Label>
          <Pill>필수</Pill>&nbsp; 개인정보 수집 및 이용동의
        </Label>
        <LinkBtn type="button" onClick={() => openDoc("privacy")}>
          보기
        </LinkBtn>
      </Row>

      <Row>
        <Check checked={val.ecommerce} onChange={() => toggle("ecommerce")} />
        <Label>
          <Pill>필수</Pill>&nbsp; 전자상거래 약관동의
        </Label>
        <LinkBtn type="button" onClick={() => openDoc("ecommerce")}>
          보기
        </LinkBtn>
      </Row>

      <Row>
        <Check checked={val.marketing} onChange={() => toggle("marketing")} />
        <Label style={{ fontWeight: 700 }}>마케팅 정보 수신 동의(선택)</Label>
        <span />
      </Row>
      <Helper>할인 이벤트·신규 클래스·조기예약 혜택을 놓치지 마세요!</Helper>

      {/* 약관/개인정보/전자상거래 모달 */}
      <TermsModal open={modal.open} doc={modal.doc} onClose={closeDoc} />
    </Box>
  );
}
