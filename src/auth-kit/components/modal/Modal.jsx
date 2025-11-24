/* eslint-disable */
// src/auth-kit/components/modal/Modal.jsx
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

export default function Modal({
    open,
    onClose,
    children,
    width = 480,
    closeOnBackdrop = true,
    closeOnEsc = true,
}) {
    const cardRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const onKey = (e) => {
            if (closeOnEsc && e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", onKey);

        // 첫 포커스 카드로
        const t = setTimeout(() => cardRef.current?.focus(), 0);

        // 스크롤 잠금
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            clearTimeout(t);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, closeOnEsc, onClose]);

    if (!open) return null;
    const root = document.getElementById("modal-root");
    if (!root) throw new Error("#modal-root 가 필요합니다 (index.html에 추가).");

    return ReactDOM.createPortal(
        <Backdrop onClick={closeOnBackdrop ? onClose : undefined}>
            <Card
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                ref={cardRef}
                style={{ maxWidth: width, width: "90%" }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </Card>
        </Backdrop>,
        root
    );
}

/* ========== styles (상수 하드코딩) ========== */

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  /* 반투명 블랙 고정 */
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 모바일에서 키보드/노치 안전 여백 */
  padding: 16px;
  z-index: 1000;

  /* 약간의 페이드 인 */
  animation: fadeIn 120ms ease-out;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Card = styled.div`
  /* 화이트 배경/검정 텍스트 고정 */
  background: #ffffff;
  color: #111111;

  /* 라운드/그림자 하드코딩 */
  border-radius: 16px;
  padding: 20px 20px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);

  outline: none;
  max-height: min(86vh, 720px);
  overflow: auto; /* 내용 길면 내부 스크롤 */

  /* 모션 감소 환경 고려 */
  @media (prefers-reduced-motion: no-preference) {
    transform: translateY(4px);
    animation: popIn 140ms cubic-bezier(.19, .74, .32, 1);
    @keyframes popIn {
      from { opacity: .7; transform: translateY(10px) scale(0.98); }
      to   { opacity: 1;  transform: translateY(0)    scale(1); }
    }
  }
`;
