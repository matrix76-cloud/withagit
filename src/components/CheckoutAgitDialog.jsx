/* eslint-disable */
// src/components/CheckoutAgitDialog.jsx
// 아지트 멤버십 상세/구매 안내 모달 + 실제 결제 처리

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bootpay } from "@bootpay/client-js";

import {
  MEMBERSHIP_KIND,
  MEMBERSHIP_STATUS,
} from "../constants/membershipDefine";
import { ORDER_TYPE } from "../constants/defs";
import { useUser } from "../contexts/UserContext";
import { createOrderDraft, markOrderPaid } from "../services/orderService";
import { db } from "../services/api";
import { collection, getDocs, query, where } from "firebase/firestore";

/* ===== Layout / Colors ===== */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
`;

const AGIT_ACCENT = "#F97316";
const AGIT_ACCENT_LIGHT = "#FF8A2A";

/* ===== 공통 유틸 ===== */
const KRW = (n = 0) => (n || 0).toLocaleString("ko-KR");

const onlyDigits = (s = "") => (s || "").replace(/\D+/g, "");
function toLocalDigitsFromAny(phoneLike) {
  const d = onlyDigits(String(phoneLike || ""));
  if (!d) return "";
  if (d.startsWith("82")) return "0" + d.slice(2);
  return d;
}
function sanitizeForFirestore(obj) {
  return JSON.parse(
    JSON.stringify(obj, (k, v) => (v === undefined ? null : v))
  );
}

const DEV_TEST_START = "01062141000";
const DEV_TEST_END = "01062142000";
const DEV_TEST_EXTRA = "01039239669";
function isDevTestPhoneLocal(localDigits) {
  if (!localDigits) return false;
  return (
    (localDigits >= DEV_TEST_START && localDigits <= DEV_TEST_END) ||
    localDigits === DEV_TEST_EXTRA
  );
}

function mapKindToOrderType(k) {
  if (k === MEMBERSHIP_KIND.AGITZ) return ORDER_TYPE.AGITZ;
  return null;
}

/* ===== Dialog & 공용 스타일 ===== */
const Dialog = styled.div`
  width: min(460px, 100vw - 24px);
  max-height: min(720px, 100vh - 24px);
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  box-shadow: none;
  font-family: "NanumSquareRound", system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
`;

/* ===== Header / Tabs ===== */
const Header = styled.div`
  background: #ffffff;
  padding: 10px 18px 0;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const TabsBar = styled.div`
  display: flex;
  justify-content: center;
`;

const Tabs = styled.div`
  display: inline-flex;
  gap: 40px;
  padding-bottom: 6px;
`;

const Tab = styled.button`
  position: relative;
  min-width: 120px;
  border: 0;
  background: transparent;
  padding: 10px 0 12px;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  color: ${({ $active }) => ($active ? "#111111" : "#9ca3af")};
  cursor: pointer;
  text-align: center;

  &::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: -2px;
    height: 2px;
    border-radius: 999px;
    background: ${({ $active }) =>
    $active ? AGIT_ACCENT : "transparent"};
  }
`;

const CloseBtn = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: #9ca3af;
  padding: 8px;
`;

/* ===== Body (scroll 영역) ===== */
const Body = styled.div`
  padding: 20px 24px 24px;
  background: #ffffff;
  overflow-y: auto;
`;

/* ===== 상세정보 탭 스타일 ===== */
const BadgeRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 10px;
`;

const Pill = styled.span`
  padding: 6px 14px;
  border-radius: 999px;
  background: ${AGIT_ACCENT};
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
`;

const PillGhost = styled.span`
  padding: 6px 14px;
  border-radius: 999px;
  background: ${AGIT_ACCENT_LIGHT};
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
`;

const Title = styled.h3`
  margin: 0 0 18px;
  text-align: center;
  font-size: 24px;
  font-weight: 900;
  color: #111827;
`;

const BuyTitle = styled.h3`
  margin: 0 0 18px;
  text-align: center;
  font-size: 20px;
  font-weight: 900;
  color: #111827;
`;

const SummaryList = styled.ul`
  margin: 0 0 26px;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;

  li {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.8;
  }

  li::before {
    content: "✓";
    color: #111827;
    margin-right: 8px;
    font-weight: 900;
  }

  li.orange strong {
    color: #fb923c;
  }
`;

/* ===== 혜택 포인트 / 확인하세요! 카드 ===== */
const SectionTitle = styled.h4`
  margin: 24px 0 10px;
  font-size: 15px;
  font-weight: 900;
  color: #111827;
`;

const BenefitCard = styled.div`
  margin: 0 0 4px;
  padding: 16px 18px 14px;
  border-radius: 24px;
  background: #f3f4f6;
  display: grid;
  gap: 8px;
  font-size: 12px;
  color: #374151;
`;

const BenefitItem = styled.div`
  position: relative;
  padding-left: 18px;
  line-height: 1.8;

  &::before {
    content: "✓";
    position: absolute;
    left: 3px;
    top: 0.2em;
    color: #9ca3af;
    font-size: 12px;
    font-weight: 700;
  }

  strong {
    font-weight: 400;
  }
`;

const CheckList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  display: grid;
  gap: 6px;
  font-size: 12px;
  color: #4b5563;

  li {
    position: relative;
    padding-left: 14px;
    line-height: 1.7;
  }

  li::before {
    content: "";
    position: absolute;
    left: 3px;
    top: 0.9em;
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: #9ca3af;
  }

  li strong {
    font-weight: 400;
  }
`;

/* ===== FAQ 섹션 ===== */
const FAQSection = styled.div`
  margin-top: 28px;
`;

const FAQTitle = styled.div`
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 12px;
`;

const FAQBox = styled.div`
  padding: 16px 18px 14px;
  border-radius: 24px;
  background: #f3f4f6;
  box-shadow: none;
  border: none;
  display: grid;
  gap: 12px;
`;

const FAQItem = styled.div`
  position: relative;
  padding-left: 14px;
  line-height: 1.7;
  font-size: 13px;
  color: #374151;

  &::before {
    content: "";
    position: absolute;
    left: 3px;
    top: 0.75em;
    width: 4px;
    height: 4px;
    background: #9ca3af;
    border-radius: 999px;
  }

  & > strong {
    display: block;
    font-size: 13px;
    font-weight: 400;
    color: #111827;
    margin-bottom: 4px;
  }
`;

/* ===== 구매하기 탭 ===== */
const PurchaseWrap = styled.div`
  padding: 0 18px;
`;

const Block = styled.div`
  margin-bottom: 18px;
`;

const ChildCard = styled.div`
  margin-top: 8px;
  border-radius: 24px;
  border: 1.5px solid #111827;
  background: #ffffff;
  overflow: hidden;
`;

const ChildCardHeader = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  color: ${({ $placeholder }) => ($placeholder ? "#9ca3af" : "#111827")};
`;

const ChildDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 0 0 8px;
`;

/* 🔸 아지트 색감으로 조정된 자녀 추가 버튼 */
const AddChildRow = styled.button`
  width: calc(100% - 24px);
  margin: 8px 12px 10px;
  padding: 8px 14px 9px;
  border-radius: 999px;
  border: 1px dashed rgba(249, 115, 22, 0.7);
  background: #fff3e8;
  font-size: 13px;
  font-weight: 700;
  color: #c2410c;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  cursor: pointer;
`;

/* 자녀 드롭다운 & 배지 */
const ChildDropdown = styled.div`
  margin: 0 0 8px;
  max-height: 180px;
  overflow-y: auto;
`;

const ChildItemButton = styled.button`
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-size: 14px;
  text-align: left;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover {
    background: ${({ disabled }) => (disabled ? "transparent" : "#f9fafb")};
  }

  .name {
    color: #111827;
    font-weight: 700;
  }
  .meta {
    margin-top: 2px;
    font-size: 12px;
    color: #6b7280;
  }
`;

const MembershipTag = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  font-weight: 700;
`;

/* 기타 */
const SectionLabel = styled.div`
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
`;

const SelectBox = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
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

const BottomNoteWrap = styled.div`
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f3f4f6;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.7;
`;

const RowBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* ===== CTA ===== */
const Footer = styled.div`
  padding: 12px 22px 18px;
  background: #f5f5f5;
  border-top: 1px solid #e5e7eb;
`;

const CTAButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 999px;
  border: 0;
  background: ${AGIT_ACCENT};
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: none;
  transition: transform 0.1s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(1.03);
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ===== Component ===== */
export default function CheckoutAgitDialog({
  open,
  onClose,
  onProceed, // 결제 결과 콜백 (optional)
}) {
  const [portalEl, setPortalEl] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");

  const [childLabel, setChildLabel] = useState("선택해주세요");
  const [autoMode, setAutoMode] = useState("auto"); // "auto" | "once"
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const months = 1;
  const AGITZ_PRICE_BASE = 59900;
  const total = AGITZ_PRICE_BASE * months;

  const navigate = useNavigate();

  const handleGoToBuy = () => {
    setActiveTab("buy");
  };

  const {
    phoneE164,
    profile,
    children: ctxChildren,
    refresh,
  } = useUser() || {};

  const children = useMemo(
    () => (Array.isArray(ctxChildren) ? ctxChildren : []),
    [ctxChildren]
  );

  /* ===== Portal ===== */
  useEffect(() => {
    let el = document.getElementById("modal-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "modal-root";
      document.body.appendChild(el);
    }
    setPortalEl(el);
  }, []);

  /* ===== AGITZ 적용 자녀 Set 조회 (Firestore) ===== */
  const [agitzAppliedSet, setAgitzAppliedSet] = useState(() => new Set());
  const [membershipLoading, setMembershipLoading] = useState(false);

  const readAgitzSet = useCallback(async (phone) => {
    const col = collection(db, "members", phone, "memberships");
    const qy = query(
      col,
      where("kind", "==", MEMBERSHIP_KIND.AGITZ),
      where("status", "in", [
        MEMBERSHIP_STATUS.ACTIVE,
        MEMBERSHIP_STATUS.FUTURE,
      ])
    );
    const snap = await getDocs(qy);
    const set = new Set();
    snap.forEach((d) => {
      const v = d.data() || {};
      if (v.childId) set.add(v.childId);
    });
    return set;
  }, []);

  const refreshMemberships = useCallback(async () => {
    if (!phoneE164) return;
    setMembershipLoading(true);
    try {
      const set = await readAgitzSet(phoneE164);
      setAgitzAppliedSet(set || new Set());
      console.log("[AgitzCheckout] agitzAppliedSet", Array.from(set || []));
    } catch (e) {
      console.warn("[AgitzCheckout] agitzAppliedSet 조회 실패", e);
    } finally {
      setMembershipLoading(false);
    }
  }, [phoneE164, readAgitzSet]);

  /* ===== 모달 오픈 시 초기화 ===== */
  useEffect(() => {
    if (!open) return;
    setActiveTab("detail");
    setChildDropdownOpen(false);
    setLoading(false);
    setAutoMode("auto");

    if (phoneE164) {
      refreshMemberships();
    }

    setSelectedChildId(null);
    setChildLabel("선택해주세요");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phoneE164]);

  if (!open || !portalEl) return null;

  const effectivePhoneE164 = (phoneE164 || "").trim();
  const effectiveName = (profile?.displayName || "").trim();
  const effectiveEmail = (profile?.email || "").trim();
  const localPhone = toLocalDigitsFromAny(effectivePhoneE164);

  const autoLabel =
    autoMode === "auto" ? "자동 갱신" : "이번 달만 (단건 결제)";

  const canPay =
    !!open &&
    !loading &&
    !membershipLoading &&
    !!effectivePhoneE164 &&
    !!selectedChildId &&
    total > 0 &&
    !agitzAppliedSet.has(selectedChildId);

  const appId = (process.env.REACT_APP_BOOTPAY_WEB_APP_ID || "").trim();
  const BOOTPAY_PG = (process.env.REACT_APP_BOOTPAY_PG || "").trim();
  const BOOTPAY_METHODS = (process.env.REACT_APP_BOOTPAY_METHODS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  /* ===== CTA: 결제 처리 ===== */
  const handleCTA = async () => {
    if (!effectivePhoneE164) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!selectedChildId) {
      alert("멤버십을 연결할 자녀를 선택해 주세요.");
      setActiveTab("buy");
      return;
    }
    if (agitzAppliedSet.has(selectedChildId)) {
      alert("이미 정규 멤버십이 적용된 자녀입니다.");
      setActiveTab("buy");
      return;
    }

    const kind = MEMBERSHIP_KIND.AGITZ;
    const type = mapKindToOrderType(kind);
    if (!type) {
      alert("멤버십 정보가 올바르지 않습니다.");
      return;
    }

    const rawE164 = effectivePhoneE164;
    const devMode = isDevTestPhoneLocal(localPhone);

    const product = {
      id: "agitz-basic-1m",
      name: "아지트 멤버십 (1개월)",
      kind,
      variant: autoMode === "auto" ? "basic-1m-auto" : "basic-1m-once",
    };

    const payload = {
      product,
      price: { total },
      months,
      childId: selectedChildId,
      autoMode,
    };

    const draft = sanitizeForFirestore({
      type,
      childId: selectedChildId,
      children: undefined,
      months: Number(months || 1),
      minutes: 0,
      amountKRW: Number(total) || 0,
      product: {
        id: product.id,
        name: product.name,
        variant: product.variant,
      },
      provider: { name: "bootpay" },
      buyer: {
        name: effectiveName || rawE164?.slice(-4) || "",
        phoneE164: rawE164 || "",
        email: effectiveEmail || "",
      },
      meta: {
        kind,
        months,
        autoMode,
        autoRenew: autoMode === "auto",
        termType: autoMode === "auto" ? "AUTO" : "ONETIME",
      },
    });

    console.groupCollapsed("[AgitzCheckout] draft 생성");
    console.log("phoneE164", rawE164);
    console.log("childId", selectedChildId);
    console.log("autoMode", autoMode);
    console.log("draft", draft);
    console.groupEnd();

    setLoading(true);

    try {
      const orderRes = await createOrderDraft(rawE164, draft);
      console.log("[AgitzCheckout] createOrderDraft 결과", orderRes);

      const orderId = orderRes?.orderId;
      if (!orderId) {
        console.error("[AgitzCheckout] 주문 생성 실패 상세", orderRes);
        alert(orderRes?.error?.message || "주문 생성에 실패했습니다.");
        setLoading(false);
        onProceed?.({ ok: false, stage: "createOrder", error: orderRes });
        return;
      }

      if (devMode) {
        console.log("[AgitzCheckout] dev 모드, Bootpay 생략");
        await markOrderPaid({
          phoneE164: rawE164,
          orderId,
          provider: {
            name: "dev",
            payload: { dev: true, kind: "agitz", autoMode },
          },
        });
        console.log("[AgitzCheckout] markOrderPaid(dev) 완료");

        try {
          await refresh?.();
        } catch (e) {
          console.warn("[AgitzCheckout] refresh 실패", e);
        }

        alert("테스트 결제가 완료되었습니다.");
        onProceed?.({ ok: true, test: true, orderId, payload });
        onClose?.();
        setLoading(false);
        return;
      }

      if (!appId) {
        alert(
          "결제 설정(App ID)이 필요합니다. REACT_APP_BOOTPAY_WEB_APP_ID를 설정해 주세요."
        );
        setLoading(false);
        return;
      }

      console.log("[AgitzCheckout] Bootpay.requestPayment 호출");
      const response = await Bootpay.requestPayment({
        application_id: appId,
        price: total,
        order_name: product.name,
        order_id: orderId,
        ...(BOOTPAY_PG ? { pg: BOOTPAY_PG } : {}),
        ...(BOOTPAY_METHODS.length ? { methods: BOOTPAY_METHODS } : {}),
        user: {
          id: localPhone || "guest",
          username:
            effectiveName || `회원-${String(rawE164 || "").slice(-4)}`,
          phone: localPhone,
          email: effectiveEmail || "",
        },
        items: [
          {
            id: product.id,
            name: product.name,
            qty: 1,
            price: total,
          },
        ],
        metadata: sanitizeForFirestore({
          kind,
          months,
          productId: product.id,
          variant: product.variant,
          childId: selectedChildId,
          autoMode,
          autoRenew: autoMode === "auto",
        }),
        extra: {
          open_type: "iframe",
          browser_open_type: [
            { browser: "kakaotalk", open_type: "popup" },
            { browser: "instagram", open_type: "redirect" },
            { browser: "facebook", open_type: "redirect" },
            { browser: "mobile_safari", open_type: "popup" },
            { browser: "mobile_chrome", open_type: "iframe" },
          ],
          redirect_url: `${window.location.origin}${window.location.pathname}${window.location.search}`,
        },
      });

      console.log("[AgitzCheckout] Bootpay 응답", response);

      if (response?.event === "cancel") {
        alert("결제가 취소되었습니다.");
        setLoading(false);
        onProceed?.({ ok: false, stage: "cancel", orderId, payload, response });
        return;
      }
      if (response?.event === "error") {
        alert(response?.message || "결제 중 오류가 발생했습니다.");
        setLoading(false);
        onProceed?.({ ok: false, stage: "error", orderId, payload, response });
        return;
      }
      if (response?.event === "issued") {
        alert("가상계좌가 발급되었습니다. 안내에 따라 입금해 주세요.");
        setLoading(false);
        onProceed?.({ ok: true, stage: "issued", orderId, payload, response });
        onClose?.();
        return;
      }

      if (response?.event === "done") {
        try {
          await markOrderPaid({
            phoneE164: rawE164,
            orderId,
            provider: {
              name: "bootpay",
              txnId: response?.data?.receipt_id,
              payload: response,
            },
          });
          console.log("[AgitzCheckout] markOrderPaid(prod) 완료");
        } catch (err) {
          console.error("[AgitzCheckout] markOrderPaid(prod) 실패", err);
          alert(String(err?.message || err));
          setLoading(false);
          onProceed?.({
            ok: false,
            stage: "markOrderPaid",
            orderId,
            payload,
            error: err,
          });
          return;
        }

        try {
          await refresh?.();
        } catch (e) {
          console.warn("[AgitzCheckout] refresh 실패", e);
        }

        alert("결제가 완료되었습니다.");
        onProceed?.({ ok: true, stage: "done", orderId, payload, response });
        onClose?.();
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (e) {
      console.error("[AgitzCheckout] 예외 발생", e);
      if (e?.event === "cancel") {
        alert("결제가 취소되었습니다.");
        onProceed?.({ ok: false, stage: "cancel-ex", error: e });
      } else {
        alert(e?.message || "결제 중 오류가 발생했습니다.");
        onProceed?.({ ok: false, stage: "exception", error: e });
      }
      setLoading(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  /* ===== 상세정보 탭 ===== */
  const renderDetail = () => (
    <>
      <BadgeRow>
        <Pill>구독권</Pill>
        <PillGhost>Best!</PillGhost>
      </BadgeRow>
      <Title>아지트 멤버십</Title>

      <SummaryList>
        <li>평일 주 5회, 하루 최대 2시간 무료</li>
        <li className="orange">
          인기 프로그램 <strong>우선 예약</strong>
        </li>
        <li>실시간 알림 & 보험으로 안심 돌봄</li>
        <li>자동 결제 옵션으로 편리한 구독</li>
      </SummaryList>

      <SectionTitle>혜택 포인트</SectionTitle>
      <BenefitCard>
        <BenefitItem>우선 예약권: 인기 클래스 선오픈 시 우선 신청</BenefitItem>
        <BenefitItem>
          안전 보장: 배상책임보험, 안전 픽업 및 실시간 알림 제공
        </BenefitItem>
        <BenefitItem>자동 갱신 옵션: 결제 번거로움 최소화</BenefitItem>
      </BenefitCard>

      <SectionTitle>확인하세요!</SectionTitle>
      <BenefitCard>
        <CheckList>
          <li>
            이용 요건: 평일 매일 이용<br />
            1일 최대 2시간 무료{" "}
            <strong>(1시간 추가 시 15,000원)</strong>
          </li>
          <li>입장·퇴장, 픽업 출발·도착, 간식 및 공간 이용 실시간 알림</li>
          <li>포함 서비스: 아지트 공간 & 교구 무제한 이용</li>
          <li>추가 결제 항목: 간식, 픽업, 유료 교구 및 프로그램</li>
        </CheckList>
      </BenefitCard>

      <FAQSection>
        <FAQTitle>FAQ</FAQTitle>

        <FAQBox>
          <FAQItem>
            <strong>이용시간 초과시</strong>
            추가 이용은 현장 여석/상황에 따라 정액권 차감 또는 별도 결제
          </FAQItem>

          <FAQItem>
            <strong>당일 이용</strong>
            가능. 단, 픽업 신청은 전날 마감 원칙으로 상황에 따라
            불가할수 있습니다
          </FAQItem>

          <FAQItem>
            <strong>양도/공유</strong>
            동일 자녀 기준 사용, 타인 양도 불가
          </FAQItem>
        </FAQBox>
      </FAQSection>
    </>
  );

  /* ===== 구매하기 탭 ===== */
  const renderPurchase = () => (
    <PurchaseWrap>
      <BuyTitle>아지트 멤버십</BuyTitle>

      <Block>
        <SectionLabel>자녀 연결</SectionLabel>

        <ChildCard>
          <ChildCardHeader
            type="button"
            $placeholder={!selectedChildId}
            onClick={() => {
              if (!children.length) {
                if (
                  window.confirm(
                    "등록된 자녀가 없습니다. 마이페이지에서 자녀를 먼저 등록하시겠어요?"
                  )
                ) {
                  onClose?.();
                  const isMobile =
                    typeof window !== "undefined" &&
                    window.matchMedia &&
                    window.matchMedia("(max-width: 768px)").matches;
                  navigate(isMobile ? "/m/account/children" : "/mypage");
                }
                return;
              }
              setChildDropdownOpen((prev) => !prev);
            }}
          >
            <span>{selectedChildId ? childLabel : "선택해주세요"}</span>
            <ChevronDown />
          </ChildCardHeader>

          {childDropdownOpen && children.length > 0 && (
            <>
              <ChildDivider />
              <ChildDropdown>
                {children.map((c) => {
                  const applied = agitzAppliedSet.has(c.childId);

                  return (
                    <ChildItemButton
                      key={c.childId}
                      type="button"
                      disabled={applied}
                      onClick={() => {
                        if (applied) {
                          alert(
                            "이미 정규 멤버십이 적용된 자녀입니다. 다른 자녀를 선택해 주세요."
                          );
                          return;
                        }
                        setSelectedChildId(c.childId);
                        setChildLabel(
                          c.name
                            ? c.birth
                              ? `${c.name} (${c.birth})`
                              : c.name
                            : "선택해주세요"
                        );
                        setChildDropdownOpen(false);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          width: "100%",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <span className="name">
                            {c.name || "(이름 없음)"}
                          </span>
                          {c.birth && (
                            <span className="meta" style={{ marginTop: 0 }}>
                              {c.birth}
                            </span>
                          )}
                        </div>

                        {applied && (
                          <MembershipTag>정규 가입됨</MembershipTag>
                        )}
                      </div>
                    </ChildItemButton>
                  );
                })}
              </ChildDropdown>
            </>
          )}

          <AddChildRow
            type="button"
            onClick={() => {
              onClose?.();
              const isMobile =
                typeof window !== "undefined" &&
                window.matchMedia &&
                window.matchMedia("(max-width: 768px)").matches;
              navigate(isMobile ? "/m/account/children" : "/mypage");
            }}
          >
            <span>+</span>
            <span>자녀 추가</span>
          </AddChildRow>
        </ChildCard>
      </Block>

      <Block>
        <SectionLabel>가격</SectionLabel>
        <SelectBox $placeholder={false}>
          <span>월 {KRW(AGITZ_PRICE_BASE)}원</span>
        </SelectBox>
      </Block>

      <Block>
        <SectionLabel>자동 갱신 여부</SectionLabel>
        <SelectBox
          $placeholder={false}
          onClick={() =>
            setAutoMode((prev) => (prev === "auto" ? "once" : "auto"))
          }
        >
          <span>{autoLabel}</span>
          <ChevronDown />
        </SelectBox>
      </Block>

      <Block>
        <RowBetween>
          <SectionLabel>확인하세요!</SectionLabel>
          <button
            type="button"
            style={{
              border: "0",
              background: "transparent",
              fontSize: 12,
              color: "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            이용약관/환불정책 보기 →
          </button>
        </RowBetween>

        <BottomNoteWrap>
          자동 갱신 선택 시, 해지 전까지 매월 동일 금액이 결제됩니다.
          유효기간 내 미사용 잔여분 환불/연장 불가 (약관 기준)
        </BottomNoteWrap>
      </Block>
    </PurchaseWrap>
  );

  /* ===== Render ===== */
  return createPortal(
    <Backdrop onClick={handleBackdrop}>
      <Dialog role="dialog" aria-modal="true" aria-label="아지트 멤버십 상세">
        <Header>
          <HeaderTop>
            <CloseBtn onClick={onClose}>✕</CloseBtn>
          </HeaderTop>
          <TabsBar>
            <Tabs>
              <Tab
                $active={activeTab === "detail"}
                onClick={() => setActiveTab("detail")}
              >
                상세정보 확인
              </Tab>
              <Tab
                $active={activeTab === "buy"}
                onClick={() => setActiveTab("buy")}
              >
                구매하기
              </Tab>
            </Tabs>
          </TabsBar>
        </Header>

        <Body>
          {activeTab === "detail" ? renderDetail() : renderPurchase()}
        </Body>

        <Footer>
          <CTAButton
            type="button"
            onClick={activeTab === "detail" ? handleGoToBuy : handleCTA}
            disabled={activeTab === "buy" && !canPay}
          >
            {activeTab === "detail"
              ? "아지트 이용하기"
              : loading
                ? "결제 진행 중…"
                : "결제 하기"}
          </CTAButton>
        </Footer>
      </Dialog>
    </Backdrop>,
    portalEl
  );
}
