/* eslint-disable */
// src/components/CheckoutChargeDialog.jsx
// 정액권 충전하기 — 구매 전 확인/옵션 입력용 팝업

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { MEMBERSHIP_KIND } from "../constants/membershipDefine";


/* ===== Layout ===== */

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
`;

const Dialog = styled.div`
  width: min(460px, 100vw - 24px);
  max-height: min(720px, 100vh - 24px);
  background: #ffffff;
  border-radius: 24px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  box-shadow: none;
  font-family: "NanumSquareVariable", "NanumSquare", -apple-system,
    BlinkMacSystemFont, system-ui, sans-serif;
`;

/* ===== Header ===== */

const Header = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  color: #111827;
`;

const CloseBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: #9ca3af;
`;

/* ===== Body ===== */

const Body = styled.div`
  padding: 24px 24px 24px;
  background: #ffffff;
  overflow-y: auto;
`;

const Block = styled.div`
  margin-bottom: 20px;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
`;

const SelectBox = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: ${({ $placeholder }) => ($placeholder ? "#9ca3af" : "#111827")};
  cursor: pointer;
`;

const ChevronDown = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#9ca3af" d="M7 9l5 5 5-5H7z" />
    </svg>
);

const AddChildRow = styled.div`
  margin-top: 6px;
  border-radius: 16px;
  border: 1px dashed #f97316;
  background: #fff7ed;
  padding: 12px 16px;
  font-size: 14px;
  color: #9a3412;
`;

/* FAQ / 안내 영역 */

const NoteBox = styled.div`
  margin-top: 12px;
  padding: 18px 20px;
  border-radius: 20px;
  background: #f7f7f7;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
`;

const NoteItem = styled.li`
  margin-left: 1.2em;
  margin-bottom: 4px;

  &::marker {
    font-size: 0.8em;
  }

  span {
    display: block;
  }

  strong {
    font-weight: 700;
    color: #111827;
  }
`;

/* ===== Footer ===== */

const Footer = styled.div`
  padding: 12px 24px 18px;
  background: #f5f5f5;
  border-top: 1px solid #f3f4f6;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px 0;
  border-radius: 999px;
  border: none;
  outline: none;
  background: #f97316;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.08s ease-out, box-shadow 0.1s ease-out;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 10px 20px rgba(249, 115, 22, 0.35);
  }
`;

/* ===== Component ===== */

export default function CheckoutChargeDialog({
    open,
    onClose,
    onProceed, // 상위에서 CheckoutConfirmDialog 열 때 사용할 payload 받기
}) {
    const [portalEl, setPortalEl] = useState(null);

    // 폼 선택값 (임시 상태 — 나중에 실제 드롭다운/데이터 연결)
    const [childLabel, setChildLabel] = useState("선택해주세요");
    const [amountLabel, setAmountLabel] = useState("선택해주세요");
    const [amountValue, setAmountValue] = useState(null);
    const [payLabel, setPayLabel] = useState("선택해주세요");

    useEffect(() => {
        let el = document.getElementById("modal-root");
        if (!el) {
            el = document.createElement("div");
            el.id = "modal-root";
            document.body.appendChild(el);
        }
        setPortalEl(el);
    }, []);

    useEffect(() => {
        if (!open) return;
        // 팝업 열릴 때마다 상태 초기화
        setChildLabel("선택해주세요");
        setAmountLabel("선택해주세요");
        setAmountValue(null);
        setPayLabel("선택해주세요");
    }, [open]);

    if (!open || !portalEl) return null;

    const handleSubmit = () => {
        // 간단한 검증 (나중에 실제 로직/가드로 교체)
        if (childLabel === "선택해주세요") {
            alert("자녀를 선택해 주세요.");
            return;
        }
        if (!amountValue) {
            alert("충전 금액을 선택해 주세요.");
            return;
        }
        if (payLabel === "선택해주세요") {
            alert("결제 방식을 선택해 주세요.");
            return;
        }

        // 여기서 상위로 결제용 payload 넘겨줌 (정확한 스키마는 나중에 맞추면 됨)
        onProceed?.({
            product: {
                id: `cashpass-${amountValue}`,
                name: "정액권 충전하기",
                kind: MEMBERSHIP_KIND.CASHPASS, // enum에 맞게 조정
            },
            price: { total: amountValue },
        });
    };

    return createPortal(
        <Backdrop onClick={(e) => e.target === e.currentTarget && onClose?.()}>
            <Dialog role="dialog" aria-modal="true" aria-label="정액권 충전하기">
                {/* Header */}
                <Header>
                    <HeaderTitle>정액권 충전하기</HeaderTitle>
                    <CloseBtn onClick={onClose}>✕</CloseBtn>
                </Header>

                {/* Body */}
                <Body>
                    {/* 자녀 연결 */}
                    <Block>
                        <SectionLabel>자녀 연결</SectionLabel>
                        <SelectBox
                            $placeholder={childLabel === "선택해주세요"}
                            type="button"
                            onClick={() => {
                                // TODO: 실제 자녀 선택 드롭다운 연결
                                alert("자녀 선택 드롭다운은 나중에 연결할게!");
                            }}
                        >
                            <span>{childLabel}</span>
                            <ChevronDown />
                        </SelectBox>
                        <AddChildRow>+ 자녀 추가</AddChildRow>
                    </Block>

                    {/* 충전 금액 */}
                    <Block>
                        <SectionLabel>충전 금액</SectionLabel>
                        <SelectBox
                            $placeholder={amountLabel === "선택해주세요"}
                            type="button"
                            onClick={() => {
                                // TODO: 실제 금액 선택 UI 연결
                                // 임시로 예시 값 세팅
                                const next = "₩50,000";
                                setAmountLabel(next);
                                setAmountValue(50000);
                            }}
                        >
                            <span>{amountLabel}</span>
                            <ChevronDown />
                        </SelectBox>
                    </Block>

                    {/* 결제 방식 */}
                    <Block>
                        <SectionLabel>결제 방식</SectionLabel>
                        <SelectBox
                            $placeholder={payLabel === "선택해주세요"}
                            type="button"
                            onClick={() => {
                                // TODO: 결제 수단 선택 UI 연결
                                const next = "신용/체크카드";
                                setPayLabel(next);
                            }}
                        >
                            <span>{payLabel}</span>
                            <ChevronDown />
                        </SelectBox>
                    </Block>

                    {/* 안내 영역 */}
                    <Block>
                        <SectionLabel>이용 안내</SectionLabel>
                        <NoteBox as="ul">
                            <NoteItem>
                                <span>
                                    <strong>자녀 등록 필수</strong>
                                    자녀 정보가 미등록일 경우 충전이 불가합니다.
                                </span>
                            </NoteItem>
                            <NoteItem>
                                <span>
                                    <strong>충전 금액 사용 기한</strong>
                                    충전일로부터 12개월간 사용 가능해요.
                                </span>
                            </NoteItem>
                            <NoteItem>
                                <span>
                                    <strong>환불 및 양도 불가</strong>
                                    충전된 정액권은 환불·양도가 불가합니다.
                                </span>
                            </NoteItem>
                            <NoteItem>
                                <span>
                                    <strong>다른 자녀에게 금액 이전 불가</strong>
                                    자녀별 계정으로만 사용 가능해요.
                                </span>
                            </NoteItem>
                        </NoteBox>
                    </Block>
                </Body>

                {/* Footer */}
                <Footer>
                    <SubmitButton type="button" onClick={handleSubmit}>
                        충전하러 가기
                    </SubmitButton>
                </Footer>
            </Dialog>
        </Backdrop>,
        portalEl
    );
}
