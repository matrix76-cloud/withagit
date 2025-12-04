/* eslint-disable */
// src/pages/mobile/AccountPaymentsPage.jsx
// Withagit — 모바일 결제 내역 (/m/account/payments)

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { fmtDateTime } from "../../utils/date";
import { listMemberOrders } from "../../services/orderService";
import { ORDER_STATUS } from "../../constants/defs";

/* ===== 유틸 ===== */

const won = (n) => `₩${Number(n || 0).toLocaleString()}`;

/* 주문 항목 텍스트 (PC MyPage 로직 축약 버전) */
const itemText = (o) => {
    const t = String(o?.type || "").toLowerCase();
    if (t === "timepass") {
        const mins = o?.minutes ? `${o.minutes}분` : "";
        return [o.productName || "시간권", mins].filter(Boolean).join(" · ");
    }
    if (t === "membership") {
        const who = o?.childId ? o.childId : "";
        return [o.productName || "멤버십", who].filter(Boolean).join(" · ");
    }
    if (t === "points" || t === "cashpass") {
        return o?.productName || "정액권(포인트)";
    }
    return o?.productName || "-";
};

/* ORDER id 표시용 (숫자만) */
const orderIdLabel = (raw) => {
    if (!raw) return "-";
    return String(raw).replace(/\D+/g, "") || String(raw);
};

/* ===== 스타일 ===== */

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

/* 상단 헤더 */

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

/* 섹션 카드 */

const SectionCard = styled.section`
  margin-top: 12px;
  padding: 16px 16px 18px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
  display: grid;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #111827;
`;

const SectionDesc = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

/* 리스트 / 카드 */

const ListWrap = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 4px;
`;

const OrderCard = styled.div`
  border-radius: 16px;
  padding: 10px 12px 10px;
  background: #ffffff;
  border: 1px solid #eef0f4;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 6px;
`;

const RowTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const ItemTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
`;

const DateText = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const Amount = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  text-align: right;
`;

const RowBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const OrderIdText = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const Tag = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ color }) => color || "#374151"};
  background: ${({ bg }) => bg || "#f3f4f6"};
`;

/* 빈/로딩 */

const EmptyBox = styled.div`
  margin-top: 4px;
  padding: 12px 10px;
  border-radius: 14px;
  border: 1px dashed #e5e7eb;
  background: #fbfcff;
  font-size: 12px;
  color: #6b7280;
  text-align: left;
`;

/* ===== 메인 컴포넌트 ===== */

export default function AccountPaymentsPage() {
    const nav = useNavigate();
    const { initialized, phoneE164 } = useUser() || {};
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const onBack = () => nav(-1);

    useEffect(() => {
        if (initialized && !phoneE164) {
            nav("/login", { replace: true });
        }
    }, [initialized, phoneE164, nav]);

    useEffect(() => {
        const run = async () => {
            if (!phoneE164) return;
            setLoading(true);
            try {
                const rows = await listMemberOrders(phoneE164, { limit: 100 });
                const ALLOWED = new Set(["membership", "timepass", "points", "cashpass"]);
                const filtered = (rows || []).filter((o) =>
                    ALLOWED.has(String(o.type || "").toLowerCase())
                );
                setOrders(filtered);
            } catch (e) {
                console.error("[AccountPayments] listMemberOrders error:", e);
            } finally {
                setLoading(false);
            }
        };
        if (initialized && phoneE164) run();
    }, [initialized, phoneE164]);

    const list = useMemo(() => orders || [], [orders]);

    const statusTag = (status) => {
        if (status === ORDER_STATUS.PAID) {
            return <Tag bg="#ecfdf5" color="#047857">결제완료</Tag>;
        }
        if (status === ORDER_STATUS.PENDING) {
            return <Tag bg="#fef3c7" color="#92400e">결제대기</Tag>;
        }
        return (
            <Tag bg="#fee2e2" color="#991b1b">
                {String(status || "기타")}
            </Tag>
        );
    };

    if (!initialized) {
        return (
            <Page>
                <Container>
                    <HeaderBar>
                        <BackButton onClick={onBack}>‹</BackButton>
                        <HeaderTitle>결제 내역</HeaderTitle>
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
                    <HeaderTitle>결제 내역</HeaderTitle>
                </HeaderBar>

                <SectionCard>
            

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {!loading && list.length === 0 && (
                        <EmptyBox>결제 내역이 없습니다.</EmptyBox>
                    )}

                    {!loading && list.length > 0 && (
                        <ListWrap>
                            {list.map((o) => (
                                <OrderCard key={o.id}>
                                    <RowTop>
                                        <div>
                                            <ItemTitle>{itemText(o)}</ItemTitle>
                                            <DateText>{fmtDateTime(o.createdAt)}</DateText>
                                        </div>
                                        <Amount>{won(o.amountKRW)}</Amount>
                                    </RowTop>

                                    <RowBottom>
                                        <OrderIdText>결제번호 {orderIdLabel(o.id)}</OrderIdText>
                                        {statusTag(o.status)}
                                    </RowBottom>
                                </OrderCard>
                            ))}
                        </ListWrap>
                    )}
                </SectionCard>
            </Container>
        </Page>
    );
}
