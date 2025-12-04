/* eslint-disable */
// src/pages/mobile/AccountPickupsPage.jsx
// Withagit — 모바일 픽업 신청 내역 (/m/account/pickups)

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
import { ORDER_TYPE } from "../../constants/defs";
import { fmtDateTime } from "../../utils/date";

/* ===== 유틸 ===== */

const won = (n) => `₩${Number(n || 0).toLocaleString()}`;

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

const PickupCard = styled.div`
  border-radius: 16px;
  padding: 10px 12px 10px;
  background: #ffffff;
  border: 1px solid #eef0f4;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 4px;
`;

const RowTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const DateText = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const RouteText = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
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

const Amount = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #111827;
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

export default function AccountPickupsPage() {
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
                    where("type", "==", ORDER_TYPE.PICKUP),
                    orderBy("createdAt", "desc"),
                    qlimit(50)
                );

                const snap = await getDocs(qy).catch((err) => {
                    console.error("[AccountPickups] getDocs error:", err);
                    return null;
                });

                const list = [];

                if (snap) {
                    snap.docs.forEach((docSnap) => {
                        const v = docSnap.data() || {};
                        const meta = v.meta || {};
                        const pickups = Array.isArray(meta.pickups) ? meta.pickups : [];

                        if (pickups.length > 0) {
                            pickups.forEach((p, idx) => {
                                const whenStr =
                                    p.date && p.timeText
                                        ? `${p.date} ${p.timeText}`
                                        : v.createdAt || null;

                                list.push({
                                    id: `${docSnap.id}_${idx}`,
                                    when: whenStr,
                                    route: `${p.startLabel || "-"} → ${p.endLabel || "-"}`,
                                    childName: p.childName || p.childId || "-",
                                    fare: p.priceKRW || v.amountKRW || 0,
                                    statusLabel: "픽업 신청 완료",
                                });
                            });
                        } else {
                            list.push({
                                id: docSnap.id,
                                when: v.createdAt || null,
                                route: "픽업 예약",
                                childName: "-",
                                fare: v.amountKRW || 0,
                                statusLabel: "픽업 신청 완료",
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

    const statusTag = (label) => {
        if (label === "픽업 신청 완료") {
            return <Tag bg="#ecfdf5" color="#047857">픽업 신청 완료</Tag>;
        }
        if (label === "취소됨") {
            return <Tag bg="#fee2e2" color="#991b1b">취소됨</Tag>;
        }
        return <Tag bg="#eff6ff" color="#1d4ed8">{label || "픽업 신청"}</Tag>;
    };

    if (!initialized) {
        return (
            <Page>
                <Container>
                    <HeaderBar>
                        <BackButton onClick={onBack}>‹</BackButton>
                        <HeaderTitle>픽업 신청 내역</HeaderTitle>
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
                    <HeaderTitle>픽업 신청 내역</HeaderTitle>
                </HeaderBar>

                <SectionCard>
              

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {!loading && rows.length === 0 && (
                        <EmptyBox>픽업 신청 내역이 없습니다.</EmptyBox>
                    )}

                    {!loading && rows.length > 0 && (
                        <ListWrap>
                            {rows.map((r) => (
                                <PickupCard key={r.id}>
                                    <RowTop>
                                        <div>
                                            <RouteText>{r.route}</RouteText>
                                            <DateText>{fmtDateTime(r.when)}</DateText>
                                        </div>
                                        <Amount>{won(r.fare)}</Amount>
                                    </RowTop>
                                    <RowMid>
                                        <ChildText>자녀: {r.childName}</ChildText>
                                    </RowMid>
                                    <RowBottom>{statusTag(r.statusLabel)}</RowBottom>
                                </PickupCard>
                            ))}
                        </ListWrap>
                    )}
                </SectionCard>
            </Container>
        </Page>
    );
}
