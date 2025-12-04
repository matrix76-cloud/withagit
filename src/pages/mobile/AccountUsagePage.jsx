/* eslint-disable */
// src/pages/mobile/AccountUsagePage.jsx
// Withagit — 모바일 이용 내역 (/m/account/usage)

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { db } from "../../services/api";
import { collection, getDocs, query, orderBy, limit as qlimit } from "firebase/firestore";
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

const UsageCard = styled.div`
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
  gap: 6px;
`;

const DateText = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const ServiceText = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
`;

const RowMid = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 6px;
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

const MemoText = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
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

export default function AccountUsagePage() {
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
                const col = collection(db, "members", phoneE164, "usemembership");
                const snap = await getDocs(
                    query(col, orderBy("createdAt", "desc"), qlimit(200))
                ).catch(() => null);

                const list = snap
                    ? snap.docs.map((d) => {
                        const x = d.data() || {};
                        const kind = String(x.kind || "").toLowerCase();
                        const service =
                            kind === "cashpass"
                                ? "정액권 사용"
                                : kind === "timepass"
                                    ? "시간권 사용"
                                    : x.kind || "이용";

                        return {
                            id: d.id,
                            when: x.createdAt,
                            service,
                            childName: x.childId || "-",
                            cost: x.amountKRW || 0,
                            memo: x.memo || "",
                        };
                    })
                    : [];

                setRows(list);
            } finally {
                setLoading(false);
            }
        };

        if (initialized && phoneE164) run();
    }, [initialized, phoneE164]);

    if (!initialized) {
        return (
            <Page>
                <Container>
                    <HeaderBar>
                        <BackButton onClick={onBack}>‹</BackButton>
                        <HeaderTitle>이용 내역</HeaderTitle>
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
                    <HeaderTitle>이용 내역</HeaderTitle>
                </HeaderBar>

                <SectionCard>
  

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {!loading && rows.length === 0 && (
                        <EmptyBox>이용 내역이 없습니다.</EmptyBox>
                    )}

                    {!loading && rows.length > 0 && (
                        <ListWrap>
                            {rows.map((r) => (
                                <UsageCard key={r.id}>
                                    <RowTop>
                                        <div>
                                            <ServiceText>{r.service}</ServiceText>
                                            <DateText>{fmtDateTime(r.when)}</DateText>
                                        </div>
                                        <Amount>{won(r.cost ?? 0)}</Amount>
                                    </RowTop>
                                    <RowMid>
                                        <ChildText>자녀: {r.childName || "-"}</ChildText>
                                    </RowMid>
                                    {r.memo ? <MemoText>{r.memo}</MemoText> : null}
                                </UsageCard>
                            ))}
                        </ListWrap>
                    )}
                </SectionCard>
            </Container>
        </Page>
    );
}
