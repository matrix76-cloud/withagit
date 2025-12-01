/* eslint-disable */
// src/pages/mobile/AccountMembershipsPage.jsx
// Withagit — 모바일 내 멤버십 / 시간권 / 정액권 (/m/account/memberships)

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { fmtDateTime } from "../../utils/date";
import { listMemberships } from "../../services/membershipService";
import {
    MEMBERSHIP_KIND,
    MEMBERSHIP_STATUS,
    MEMBERSHIP_LABEL,
    MEMBERSHIP_COLOR,
    MEMBERSHIP_STATUS_LABEL,
} from "../../constants/membershipDefine";

/* ===== 유틸 ===== */

const won = (n) => `₩${Number(n || 0).toLocaleString()}`;

const fmtExclusiveEnd = (exclusiveMs) => {
    if (!exclusiveMs) return "-";
    const ms = Number(exclusiveMs);
    if (!Number.isFinite(ms)) return "-";
    return fmtDateTime(ms - 1000);
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

/* 멤버십 카드 그리드 */

const MembershipCards = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
`;

/* kind별 느낌만 다르게 */

const kindBg = {
    agitz: "#f0fff4",
    family: "#fff7ed",
    timepass: "#eff6ff",
    cashpass: "#ecfeff",
};

const kindBorder = {
    agitz: "#c7f9cc",
    family: "#fbd6a8",
    timepass: "#bfdbfe",
    cashpass: "#a5f3fc",
};

const MCard = styled.div`
  border-radius: 16px;
  padding: 10px 12px 10px;
  display: grid;
  gap: 6px;
  background: ${({ $kind }) => kindBg[$kind] || "#ffffff"};
  border: 1px solid ${({ $kind }) => kindBorder[$kind] || "#eef0f4"};
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
`;

const MTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const MTitle = styled.div`
  font-weight: 800;
  font-size: 14px;
  color: #111827;
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

const MLine = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 6px;
  font-size: 12px;
  color: #4b5563;
`;

const Key = styled.span`
  color: #9ca3af;
`;

const EmptyBox = styled.div`
  padding: 12px 10px;
  border-radius: 14px;
  border: 1px dashed #e5e7eb;
  background: #fbfcff;
  font-size: 12px;
  color: #6b7280;
`;

/* ===== 컴포넌트 ===== */

export default function AccountMembershipsPage() {
    const nav = useNavigate();
    const { initialized, phoneE164, children } = useUser() || {};
    const [memberships, setMemberships] = useState([]);
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
                const rows = await listMemberships(phoneE164, 100);
                setMemberships(rows || []);
            } catch (e) {
                console.error("[AccountMemberships] listMemberships error:", e);
            } finally {
                setLoading(false);
            }
        };
        if (initialized && phoneE164) run();
    }, [initialized, phoneE164]);

    const childNameById = useMemo(() => {
        const m = new Map();
        (children || []).forEach((c) => m.set(c.childId, c.name || c.childId));
        return m;
    }, [children]);

    const agitzMemberships = useMemo(
        () => memberships.filter((m) => m.kind === MEMBERSHIP_KIND.AGITZ),
        [memberships]
    );
    const familyMemberships = useMemo(
        () => memberships.filter((m) => m.kind === MEMBERSHIP_KIND.FAMILY),
        [memberships]
    );
    const timepasses = useMemo(
        () => memberships.filter((m) => m.kind === MEMBERSHIP_KIND.TIMEPASS),
        [memberships]
    );
    const cashpasses = useMemo(
        () => memberships.filter((m) => m.kind === MEMBERSHIP_KIND.CASHPASS),
        [memberships]
    );

    const timepassByChild = useMemo(() => {
        const map = new Map();
        for (const t of timepasses) {
            const cid = t.childId || "__none__";
            const prev = map.get(cid) || { minutes: 0, count: 0, nearestExpire: null };
            const mins = Number(t.remainMinutes || 0);
            const exp = t.expiresAt ? Number(t.expiresAt) : null;

            prev.minutes += isNaN(mins) ? 0 : mins;
            prev.count += 1;
            if (exp) prev.nearestExpire = prev.nearestExpire ? Math.min(prev.nearestExpire, exp) : exp;

            map.set(cid, prev);
        }
        return map;
    }, [timepasses]);

    const cashpassByChild = useMemo(() => {
        const map = new Map();
        for (const cp of cashpasses) {
            const cid = cp.childId || "__none__";
            const prev = map.get(cid) || { krw: 0, count: 0, nearestExpire: null };
            const amt = Number(cp.remainKRW ?? cp.balanceKRW ?? 0);
            const exp = cp.expiresAt ? Number(cp.expiresAt) : null;

            prev.krw += isNaN(amt) ? 0 : amt;
            prev.count += 1;
            if (exp) prev.nearestExpire = prev.nearestExpire ? Math.min(prev.nearestExpire, exp) : exp;

            map.set(cid, prev);
        }
        return map;
    }, [cashpasses]);

    const statusTag = (status) => (
        <Tag
            bg={`${MEMBERSHIP_COLOR[status] || "#e5e7eb"}22`}
            color={MEMBERSHIP_COLOR[status] || "#374151"}
        >
            {MEMBERSHIP_STATUS_LABEL[status] || status}
        </Tag>
    );

    if (!initialized) {
        return (
            <Page>
                <Container>
                    <HeaderBar>
                        <BackButton onClick={onBack}>‹</BackButton>
                        <HeaderTitle>내 멤버십 / 시간권 / 정액권</HeaderTitle>
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
                    <HeaderTitle>내 멤버십 / 시간권 / 정액권</HeaderTitle>
                </HeaderBar>

                {/* 정규 멤버십 */}
                <SectionCard>
                    <SectionTitle>정규 멤버십</SectionTitle>
                    <SectionDesc>아지트 멤버십 구독 정보를 확인할 수 있어요.</SectionDesc>

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {!loading && agitzMemberships.length === 0 && (
                        <EmptyBox>정규 멤버십이 없습니다.</EmptyBox>
                    )}

                    {!loading && agitzMemberships.length > 0 && (
                        <MembershipCards>
                            {agitzMemberships.map((m) => (
                                <MCard key={m.mid} $kind="agitz">
                                    <MTop>
                                        <MTitle>{MEMBERSHIP_LABEL[MEMBERSHIP_KIND.AGITZ]}</MTitle>
                                        {statusTag(m.status || MEMBERSHIP_STATUS.ACTIVE)}
                                    </MTop>
                                    <MLine>
                                        <Key>자녀</Key>
                                        <span>{childNameById.get(m.childId) || m.childId || "-"}</span>
                                    </MLine>
                                    <MLine>
                                        <Key>기간</Key>
                                        <span>
                                            {m.startedAt ? fmtDateTime(m.startedAt) : "-"} ~{" "}
                                            {m.expiresAt ? fmtExclusiveEnd(m.expiresAt) : "-"}
                                        </span>
                                    </MLine>
                                    <MLine>
                                        <Key>주문</Key>
                                        <span>{m.orderId || "-"}</span>
                                    </MLine>
                                </MCard>
                            ))}
                        </MembershipCards>
                    )}
                </SectionCard>

                {/* 패밀리 멤버십 */}
                <SectionCard>
                    <SectionTitle>패밀리 멤버십</SectionTitle>
                    <SectionDesc>형제·자매 함께 이용하는 패밀리 멤버십이에요.</SectionDesc>

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {!loading && familyMemberships.length === 0 && (
                        <EmptyBox>패밀리 멤버십이 없습니다.</EmptyBox>
                    )}

                    {!loading && familyMemberships.length > 0 && (
                        <MembershipCards>
                            {familyMemberships.map((m) => (
                                <MCard key={m.mid} $kind="family">
                                    <MTop>
                                        <MTitle>{MEMBERSHIP_LABEL[MEMBERSHIP_KIND.FAMILY]}</MTitle>
                                        {statusTag(m.status || MEMBERSHIP_STATUS.ACTIVE)}
                                    </MTop>
                                    <MLine>
                                        <Key>자녀</Key>
                                        <span>{childNameById.get(m.childId) || m.childId || "-"}</span>
                                    </MLine>
                                    <MLine>
                                        <Key>기간</Key>
                                        <span>
                                            {m.startedAt ? fmtDateTime(m.startedAt) : "-"} ~{" "}
                                            {m.expiresAt ? fmtExclusiveEnd(m.expiresAt) : "-"}
                                        </span>
                                    </MLine>
                                    <MLine>
                                        <Key>주문</Key>
                                        <span>{m.orderId || "-"}</span>
                                    </MLine>
                                </MCard>
                            ))}
                        </MembershipCards>
                    )}
                </SectionCard>

                {/* 시간권 */}
                <SectionCard>
                    <SectionTitle>시간권</SectionTitle>
                    <SectionDesc>자녀별 남은 시간권을 합산해서 보여줘요.</SectionDesc>

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {!loading && timepasses.length === 0 && (
                        <EmptyBox>보유 중인 시간권이 없습니다.</EmptyBox>
                    )}

                    {!loading && timepasses.length > 0 && (
                        <MembershipCards>
                            {Array.from(timepassByChild.entries()).map(([cid, agg]) => {
                                const childLabel =
                                    cid === "__none__"
                                        ? "자녀 미지정"
                                        : childNameById.get(cid) || cid;

                                return (
                                    <MCard key={`timepass_${cid}`} $kind="timepass">
                                        <MTop>
                                            <MTitle>
                                                {MEMBERSHIP_LABEL[MEMBERSHIP_KIND.TIMEPASS]} (합산)
                                            </MTitle>
                                            <Tag bg="#eff6ff" color="#1d4ed8">
                                                {agg.count}건
                                            </Tag>
                                        </MTop>
                                        <MLine>
                                            <Key>자녀</Key>
                                            <span>{childLabel}</span>
                                        </MLine>
                                        <MLine>
                                            <Key>잔여</Key>
                                            <span>{agg.minutes.toLocaleString()} 분</span>
                                        </MLine>
                                        {agg.nearestExpire && (
                                            <MLine>
                                                <Key>가까운 만료</Key>
                                                <span>{fmtExclusiveEnd(agg.nearestExpire)}</span>
                                            </MLine>
                                        )}
                                    </MCard>
                                );
                            })}
                        </MembershipCards>
                    )}
                </SectionCard>

                {/* 정액권 */}
                <SectionCard>
                    <SectionTitle>내 정액권</SectionTitle>
                    <SectionDesc>정액권(포인트) 잔액과 건수를 자녀별로 확인할 수 있어요.</SectionDesc>

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {!loading && cashpasses.length === 0 && (
                        <EmptyBox>보유 중인 정액권(포인트)이 없습니다.</EmptyBox>
                    )}

                    {!loading && cashpasses.length > 0 && (
                        <MembershipCards>
                            {Array.from(cashpassByChild.entries()).map(([cid, agg]) => {
                                const childLabel =
                                    cid === "__none__"
                                        ? "자녀 미지정"
                                        : childNameById.get(cid) || cid;

                                return (
                                    <MCard key={`cashpass_${cid}`} $kind="cashpass">
                                        <MTop>
                                            <MTitle>
                                                {MEMBERSHIP_LABEL[MEMBERSHIP_KIND.CASHPASS] ||
                                                    "정액권(포인트)"}
                                            </MTitle>
                                            <Tag bg="#ecfeff" color="#0e7490">
                                                {agg.count}건
                                            </Tag>
                                        </MTop>
                                        <MLine>
                                            <Key>자녀</Key>
                                            <span>{childLabel}</span>
                                        </MLine>
                                        <MLine>
                                            <Key>잔액</Key>
                                            <span>{won(agg.krw)}</span>
                                        </MLine>
                                        {agg.nearestExpire && (
                                            <MLine>
                                                <Key>가까운 만료</Key>
                                                <span>{fmtExclusiveEnd(agg.nearestExpire)}</span>
                                            </MLine>
                                        )}
                                    </MCard>
                                );
                            })}
                        </MembershipCards>
                    )}
                </SectionCard>
            </Container>
        </Page>
    );
}
