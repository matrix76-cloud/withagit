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

const ListWrap = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 4px;
`;

/* ==== 멤버십 카드 느낌 픽업 카드 ==== */

const PickupCard = styled.div`
  border-radius: 18px;
  padding: 14px 14px 12px;
  background: #ffffff;
  border: 1px solid #eef0f4;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* 상단: 제목(경로) + 상태 뱃지 */
const CardHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
`;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  line-height: 1.4;
`;

const StatusTagWrap = styled.div`
  flex: 0 0 auto;
`;

/* 정보 행: 라벨 | 값 */
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #4b5563;
`;

const InfoLabel = styled.div`
  flex: 0 0 auto;
  color: #9ca3af;
  font-weight: 600;
`;

const InfoValue = styled.div`
  flex: 1 1 auto;
  text-align: right;
  color: #4b5563;
  font-weight: 600;
  white-space: pre-line;
`;

const AmountValue = styled(InfoValue)`
  color: #16a34a;
  font-weight: 800;
  font-size: 13px;
`;

const Tag = styled.span`
  display: inline-block;
  padding: 4px 10px;
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

                        const createdAtText = v.createdAt ? fmtDateTime(v.createdAt) : "-";

                        if (pickups.length > 0) {
                            pickups.forEach((p, idx) => {
                                const hasDateTime = p.date && p.timeText;
                                const whenText = hasDateTime
                                    ? `${p.date} ${p.timeText}`
                                    : createdAtText;

                                list.push({
                                    id: `${docSnap.id}_${idx}`,
                                    whenText,
                                    route: `${p.startLabel || "-"} → ${p.endLabel || "-"}`,
                                    childName: p.childName || p.childId || "-",
                                    fare: p.priceKRW || v.amountKRW || 0,
                                    statusLabel: "픽업 신청 완료",
                                });
                            });
                        } else {
                            list.push({
                                id: docSnap.id,
                                whenText: createdAtText,
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
            return (
                <Tag bg="#ecfdf5" color="#047857">
                    픽업 신청 완료
                </Tag>
            );
        }
        if (label === "취소됨") {
            return (
                <Tag bg="#fee2e2" color="#991b1b">
                    취소됨
                </Tag>
            );
        }
        return (
            <Tag bg="#eff6ff" color="#1d4ed8">
                {label || "픽업 신청"}
            </Tag>
        );
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
                                    <CardHeaderRow>
                                        <CardTitle>{r.route}</CardTitle>
                                        <StatusTagWrap>{statusTag(r.statusLabel)}</StatusTagWrap>
                                    </CardHeaderRow>

                                    <InfoRow>
                                        <InfoLabel>자녀</InfoLabel>
                                        <InfoValue>{r.childName}</InfoValue>
                                    </InfoRow>
                                    <InfoRow>
                                        <InfoLabel>일시</InfoLabel>
                                        <InfoValue>{r.whenText}</InfoValue>
                                    </InfoRow>
                                    <InfoRow>
                                        <InfoLabel>금액</InfoLabel>
                                        <AmountValue>{won(r.fare)}</AmountValue>
                                    </InfoRow>
                                </PickupCard>
                            ))}
                        </ListWrap>
                    )}
                </SectionCard>
            </Container>
        </Page>
    );
}
