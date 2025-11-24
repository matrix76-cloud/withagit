/* eslint-disable */
// /src/components/auth/TermsConsent.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import TermsModal from "../modal/TermsModal";

const Box = styled.section`
  background:#fff; border:1px solid rgba(0,0,0,.06);
  border-radius:12px; padding:16px; margin-bottom:18px;
`;
const Title = styled.h3`margin:0 0 12px; color:#1b2b3a; font-size:18px;`;
const Row = styled.label`
  display:grid; grid-template-columns:auto 1fr auto; align-items:center;
  gap:10px; padding:10px 8px; border-radius:10px;
  &:hover{ background:#fafafa; }
  & + & { border-top:1px dashed rgba(0,0,0,.06); }
`;
const AllRow = styled(Row)`
  background:#FFF8F0; border:1px solid rgba(240,122,42,.25);
  margin-bottom:8px; &:hover{ background:#FFF3E6; }
`;
const Check = styled.input.attrs({ type: "checkbox" })`
  width:18px; height:18px; accent-color:#F07A2A; cursor:pointer;
`;
const Label = styled.span`
  color:#1b2b3a; font-weight:${p => p.$bold ? 900 : 700};
`;
const Pill = styled.span`
  font-size:12px; color:#fff; background:#F07A2A; border-radius:999px;
  padding:2px 8px; font-weight:800;
`;
const LinkBtn = styled.button`
  border:0; background:transparent; color:#6b7280; font-size:12px; cursor:pointer;
  text-decoration:underline;
`;

export default function TermsConsent({
  defaultValue = {
    tos_withagit: false,  // 필수
    privacy: false,       // 필수
    ecommerce: false,     // 필수 (전자상거래)
    marketing: false,     // 선택
  },
  requiredKeys: requiredKeysProp,
  onChange,
}) {
  const [val, setVal] = useState(defaultValue);
  const [modal, setModal] = useState({ open: false, doc: "service" });

  const requiredKeys = useMemo(
    () => (requiredKeysProp && requiredKeysProp.length
      ? requiredKeysProp
      : ["tos_withagit", "privacy", "ecommerce"]),
    [requiredKeysProp]
  );

  const allRequiredChecked = useMemo(
    () => requiredKeys.every(k => !!val[k]),
    [val, requiredKeys]
  );

  const allChecked = useMemo(
    () => Object.values(val).every(Boolean),
    [val]
  );

  useEffect(() => {
    onChange?.(val, allRequiredChecked);
  }, [val, allRequiredChecked, onChange]);

  const toggle = (k) => setVal(v => ({ ...v, [k]: !v[k] }));
  const setAll = (checked) => {
    const next = Object.fromEntries(Object.keys(val).map(k => [k, checked]));
    setVal(next);
  };

  const openDoc = (doc) => setModal({ open: true, doc });
  const closeDoc = () => setModal({ open: false, doc: "service" });

  return (
    <Box>
      <Title>이용약관</Title>

      <AllRow>
        <Check checked={allChecked} onChange={e => setAll(e.target.checked)} aria-label="전체 동의" />
        <Label $bold>아래 내용을 모두 확인하고 전체 동의</Label>
        <span style={{ color: "#9aa1aa", fontSize: 12 }}>필수 항목 동의가 필요합니다.</span>
      </AllRow>

      <Row>
        <Check checked={val.tos_withagit} onChange={() => toggle("tos_withagit")} />
        <Label><Pill>필수</Pill>&nbsp; 위드아지트 이용약관 동의</Label>
        <LinkBtn onClick={() => openDoc("service")}>보기</LinkBtn>
      </Row>

      <Row>
        <Check checked={val.privacy} onChange={() => toggle("privacy")} />
        <Label><Pill>필수</Pill>&nbsp; 개인정보 수집 및 이용 동의</Label>
        <LinkBtn onClick={() => openDoc("privacy")}>보기</LinkBtn>
      </Row>

      <Row>
        <Check checked={val.ecommerce} onChange={() => toggle("ecommerce")} />
        <Label><Pill>필수</Pill>&nbsp; 전자상거래(결제/환불) 약관 동의</Label>
        <LinkBtn onClick={() => openDoc("ecommerce")}>보기</LinkBtn>
      </Row>

      <Row>
        <Check checked={val.marketing} onChange={() => toggle("marketing")} />
        <Label style={{ fontWeight: 700 }}>마케팅 정보 수신 동의(선택)</Label>
        <span />
      </Row>

      {/* 약관/개인정보/전자상거래 모달 */}
      <TermsModal
        open={modal.open}
        doc={modal.doc}
        onClose={closeDoc}
      />
    </Box>
  );
}
