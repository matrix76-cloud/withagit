import React from "react";
import styled from "styled-components";
import Modal from "./Modal";
import config from "../../config/auth.config";

export default function InfoDialog({ open, onClose, title, message }) {
    const t = title ?? (config?.brand?.appName || "안내");
    const m = message ?? (config?.brand?.description || "내용을 입력해주세요.");
    return (
        <Modal open={open} onClose={onClose}>
            <Head>
                <Title>{t}</Title>
                <Close onClick={onClose} aria-label="닫기">×</Close>
            </Head>
            <Body>{m}</Body>
            <Footer>
                <Primary onClick={onClose}>확인</Primary>
            </Footer>
        </Modal>
    );
}

const Head = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;`;
const Title = styled.h2`margin:0;font-size:18px;font-weight:800;letter-spacing:-0.01em;`;
const Close = styled.button`border:none;background:transparent;font-size:22px;line-height:1;cursor:pointer;`;
const Body = styled.div`margin:12px 0 18px;font-size:14px;color:var(--color-text);line-height:1.5;`;
const Footer = styled.div`text-align:right;`;
const Primary = styled.button`
  padding:8px 16px;border:none;border-radius:12px;
  background: var(--color-primary, #D9A679); color:#fff; font-weight:700;
`;
