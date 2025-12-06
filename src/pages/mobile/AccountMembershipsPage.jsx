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

// 날짜만 표현 (YYYY-MM-DD)
const fmtDateOnly = (ms) => {
    if (!ms && ms !== 0) return "-";
    const num = Number(ms);
    if (!Number.isFinite(num)) return "-";
    const d = new Date(num);
    if (!Number.isFinite(d.getTime())) return "-";

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

// exclusive end ms → 날짜 기준 종료일
const fmtExclusiveEnd = (exclusiveMs) => {
    if (!exclusiveMs) return "-";
    const ms = Number(exclusiveMs);
    if (!Number.isFinite(ms)) return "-";
    return fmtDateOnly(ms - 1000);
};

/* ===== 스타일 ===== */

const Page = styled.main`
  min-height: 100dvh;
  background: #f8f9fb;
  padding: 16px 0 24px;
  box-sizing: border-box;
  font-family: "NanumSquareRound", -apple-system, BlinkMacSystemFont, system-ui,
    "Segoe UI", "Noto Sans KR", sans-serif;
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
  margin-top: 20px;
  display: grid;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
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
  gap: 12px;
`;

/* kind별 느낌만 다르게 (필요 시 확장용, 현재는 사용 X) */

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

/* 메인 카드 스타일 — 크기/패딩/폰트 업그레이드 */

const MCard = styled.div`
  border-radius: 24px;
  padding: 20px 20px 22px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;

  background: #ffffff;
  border: none;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);

  /* 🔹 카드 높이 통일 (아지트 멤버십 기준) */
  min-height: 150px;   /* 필요하면 140~160 사이에서 살짝 조절해도 됨 */
`;


const MTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const MTitle = styled.div`
  font-weight: 800;
  font-size: 18px;
  color: #111827;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ color }) => color || "#374151"};
  background: ${({ bg }) => bg || "#f3f4f6"};
`;

/* 라벨/값 한 줄 */

const MLine = styled.div`
  display: flex;
  justify-content: space-between;   /* ⬅️ 값이 오른쪽으로 */
  align-items: center;
  font-size: 13px;
  color: #4b5563;
  margin-top: 2px;
`;

const Key = styled.span`
  color: #9ca3af;
  margin-right: 6px;
  flex-shrink: 0;                   /* 라벨은 왼쪽에 고정 */
`;
/* 빈 상태 박스 (타임패스/정액권 등에서 사용) */

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
            const prev =
                map.get(cid) || { minutes: 0, count: 0, nearestExpire: null };
            const mins = Number(t.remainMinutes || 0);
            const exp = t.expiresAt ? Number(t.expiresAt) : null;

            prev.minutes += isNaN(mins) ? 0 : mins;
            prev.count += 1;
            if (exp)
                prev.nearestExpire = prev.nearestExpire
                    ? Math.min(prev.nearestExpire, exp)
                    : exp;

            map.set(cid, prev);
        }
        return map;
    }, [timepasses]);

    const cashpassByChild = useMemo(() => {
        const map = new Map();
        for (const cp of cashpasses) {
            const cid = cp.childId || "__none__";
            const prev =
                map.get(cid) || { krw: 0, count: 0, nearestExpire: null };
            const amt = Number(cp.remainKRW ?? cp.balanceKRW ?? 0);
            const exp = cp.expiresAt ? Number(cp.expiresAt) : null;

            prev.krw += isNaN(amt) ? 0 : amt;
            prev.count += 1;
            if (exp)
                prev.nearestExpire = prev.nearestExpire
                    ? Math.min(prev.nearestExpire, exp)
                    : exp;

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
                        <HeaderTitle>내 멤버십</HeaderTitle>
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
                    <HeaderTitle>내 멤버십</HeaderTitle>
                </HeaderBar>

                {/* 시간권 */}
                <SectionCard>
                    <SectionTitle>타임패스 멤버십</SectionTitle>

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
                                                {MEMBERSHIP_LABEL[MEMBERSHIP_KIND.TIMEPASS]}
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

                {/* 아지트 멤버십 */}
                <SectionCard>
                    <SectionTitle>아지트 멤버십</SectionTitle>

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {!loading && agitzMemberships.length === 0 && (
                        <EmptyBox>아지트 멤버십이 없습니다.</EmptyBox>
                    )}

                    {!loading && agitzMemberships.length > 0 && (
                        <MembershipCards>
                            {agitzMemberships.map((m) => (
                                <MCard key={m.mid} $kind="agitz">
                                    <MTop>
                                        <MTitle>
                                            {MEMBERSHIP_LABEL[MEMBERSHIP_KIND.AGITZ]}
                                        </MTitle>
                                        {statusTag(m.status || MEMBERSHIP_STATUS.ACTIVE)}
                                    </MTop>
                                    <MLine>
                                        <Key>자녀</Key>
                                        <span>
                                            {childNameById.get(m.childId) || m.childId || "-"}
                                        </span>
                                    </MLine>
                                    <MLine>
                                        <Key>기간</Key>
                                        <span>
                                            {m.startedAt ? fmtDateOnly(m.startedAt) : "-"} ~{" "}
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

                    {loading && <EmptyBox>불러오는 중…</EmptyBox>}

                    {/* ⬇️ 멤버십 없을 때도 카드 형태로 노출 */}
                    {!loading && familyMemberships.length === 0 && (
                        <MembershipCards>
                            <MCard $kind="family">
                                <MTop>
                                    <MTitle>
                                        {MEMBERSHIP_LABEL[MEMBERSHIP_KIND.FAMILY] ||
                                            "패밀리 멤버십"}
                                    </MTitle>
                                </MTop>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: "#9ca3af",
                                        marginTop: 4,
                                    }}
                                >
                                    패밀리 멤버십이 없습니다.
                                </div>
                            </MCard>
                        </MembershipCards>
                    )}

                    {!loading && familyMemberships.length > 0 && (
                        <MembershipCards>
                            {familyMemberships.map((m) => (
                                <MCard key={m.mid} $kind="family">
                                    <MTop>
                                        <MTitle>
                                            {MEMBERSHIP_LABEL[MEMBERSHIP_KIND.FAMILY]}
                                        </MTitle>
                                        {statusTag(m.status || MEMBERSHIP_STATUS.ACTIVE)}
                                    </MTop>
                                    <MLine>
                                        <Key>자녀</Key>
                                        <span>
                                            {childNameById.get(m.childId) || m.childId || "-"}
                                        </span>
                                    </MLine>
                                    <MLine>
                                        <Key>기간</Key>
                                        <span>
                                            {m.startedAt ? fmtDateOnly(m.startedAt) : "-"} ~{" "}
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

                {/* 정액권 */}
                <SectionCard>
                    <SectionTitle>내 정액권</SectionTitle>

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
