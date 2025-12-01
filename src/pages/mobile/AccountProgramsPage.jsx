/* eslint-disable */
// src/pages/mobile/AccountProgramsPage.jsx
// Withagit — 모바일 프로그램 예약 내역 (/m/account/programs)

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { db } from "../../services/api";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit as qlimit,
} from "firebase/firestore";
import { ORDER_TYPE, ORDER_STATUS } from "../../constants/defs";
import { fmtDateTime } from "../../utils/date";

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

const ListWrap = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 4px;
`;

const BookingCard = styled.div`
  border-radius: 16px;
  padding: 10px 12px 10px;
  background: #ffffff;
  border: 1px solid #eef0f4;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 4px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const ProgramTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
`;

const DateText = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const RowMid = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
`;

const ChildText = styled.div`
  font-size: 12px;
  color: #4b5563;
`;

const OrderIdText = styled.div`
  font-size: 11px;
  color: #9ca3af;
  text-align: right;
`;

const RowBottom = styled.div`
  margin-top: 2px;
  display: flex;
  justify-content: flex-end;
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

/* ===== 메인 ===== */

export default function AccountProgramsPage() {
    const nav = useNavigate();
    const { initialized, phoneE164 } = useUser() || {};
    const [rows, setRows] = useState([]);
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
                const col = collection(db, "members", phoneE164, "orders");
                const qy = query(
                    col,
                    where("type", "==", ORDER_TYPE.PROGRAM),
                    orderBy("createdAt", "desc"),
                    qlimit(50)
                );

                const snap = await getDocs(qy).catch((err) => {
                    console.error("[AccountPrograms] getDocs error:", err);
                    return null;
                });

                const list = [];

                if (snap) {
                    snap.docs.forEach((docSnap) => {
                        const v = docSnap.data() || {};
                        const status = v.status || ORDER_STATUS.PAID;
                        const statusLabel =
                            status === ORDER_STATUS.PAID
                                ? "결제완료"
                                : status === ORDER_STATUS.PENDING
                                    ? "결제대기"
                                    : status;

                        const meta = v.meta || {};
                        const bookings = Array.isArray(meta.bookings) ? meta.bookings : [];

                        if (bookings.length > 0) {
                            bookings.forEach((b, idx) => {
                                const whenLabel =
                                    `${b.dateLabel || b.date || ""} ${b.slotLabel || ""}`.trim() ||
                                    v.createdAt ||
                                    "";

                                list.push({
                                    id: `${docSnap.id}_${idx}`,
                                    orderId: docSnap.id,
                                    when: whenLabel,
                                    programTitle: [
                                        b.programTitle || "프로그램",
                                        b.slotTitle || "",
                                    ]
                                        .filter(Boolean)
                                        .join(" · "),
                                    childName: b.childName || "",
                                    status,
                                    statusLabel,
                                });
                            });
                        } else {
                            list.push({
                                id: docSnap.id,
                                orderId: docSnap.id,
                                when: v.createdAt || "",
                                programTitle: v.product?.name || "프로그램 예약",
                                childName: meta.childName || "",
                                status,
                                statusLabel,
                            });
                        }
                    });
                }

                setRows(list);
            } finally {
                setLoading(false);
            }
        };

        if (initialized && phoneE164) run();
    }, [initialized, phoneE164]);

    const statusTag = (status, label) => {
        if (status === ORDER_STATUS.PAID) {
            return <Tag bg="#ecfdf5" color="#047857">결제완료</Tag>;
        }
        if (status === ORDER_STATUS.PENDING) {
            return <Tag bg="#fef3c7" color="#92400e">결제대기</Tag>;
        }
        return (
            <Tag bg="#e5e7eb" color="#4b5563">
                {label || String(status || "기타")}
            </Tag>
        );
    };

    if (!initialized) {
        return (
            <Page>
                <Container>
                    <HeaderBar>
                        <BackButton onClick={onBack}>‹</BackButton>
                        <HeaderTitle>프로그램 예약 내역</HeaderTitle>
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
                    <HeaderTitle>프로그램 예약 내역</HeaderTitle>
                </HeaderBar>

                <SectionCard>
                    <SectionTitle>예약한 프로그램</SectionTitle>
                    <SectionDesc>예약한 프로그램과 진행 상태를 확인할 수 있어요.</SectionDesc>

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {!loading && rows.length === 0 && (
                        <EmptyBox>프로그램 예약 내역이 없습니다.</EmptyBox>
                    )}

                    {!loading && rows.length > 0 && (
                        <ListWrap>
                            {rows.map((r) => (
                                <BookingCard key={r.id}>
                                    <TitleRow>
                                        <ProgramTitle>{r.programTitle}</ProgramTitle>
                                    </TitleRow>
                                    <DateText>
                                        {typeof r.when === "number" ? fmtDateTime(r.when) : r.when || "-"}
                                    </DateText>
                                    <RowMid>
                                        <ChildText>자녀: {r.childName || "-"}</ChildText>
                                        <OrderIdText>주문번호 {String(r.orderId || "").slice(-8)}</OrderIdText>
                                    </RowMid>
                                    <RowBottom>
                                        {statusTag(r.status, r.statusLabel)}
                                    </RowBottom>
                                </BookingCard>
                            ))}
                        </ListWrap>
                    )}
                </SectionCard>
            </Container>
        </Page>
    );
}
