/* eslint-disable */
// src/components/CheckoutTimepassDialog.jsx
// 타임패스 상세/구매 + 실제 결제까지 한 번에 처리하는 모달

import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bootpay } from "@bootpay/client-js";

import { MEMBERSHIP_KIND } from "../constants/membershipDefine";
import { ORDER_TYPE } from "../constants/defs";
import { useUser } from "../contexts/UserContext";
import { createOrderDraft, markOrderPaid } from "../services/orderService";

import twohourimg from "../assets/membership/twohour.png";
import fourhourimg from "../assets/membership/fourhour.png";

/* ===== 공통 유틸 ===== */
const KRW = (n = 0) => n.toLocaleString("ko-KR");

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
  if (k === MEMBERSHIP_KIND.TIMEPASS) return ORDER_TYPE.TIMEPASS;
  return null;
}

/* ===== Layout ===== */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
`;

const Dialog = styled.div`
  width: min(460px, 100vw - 24px);
  max-height: min(720px, 100vh - 24px);
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  box-shadow: none;
  font-family: "NanumSquareRound", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
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
    background: ${({ $active }) => ($active ? "#facc15" : "transparent")};
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

/* ===== 상세정보 탭 ===== */
const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  background: #facc15;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  margin: 6px auto 14px;
`;

const Title = styled.h3`
  margin: 0 0 14px;
  text-align: center;
  font-size: 24px;
  font-weight: 900;
  color: #111827;
  letter-spacing: -0.03em;
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
    color: #d1d5db;
    margin-right: 8px;
    font-weight: 700;
  }
`;

/* ===== 2시간권 / 4시간권 카드 ===== */
const PassRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 140px);
  justify-content: center;
  gap: 18px;
  margin-bottom: 24px;

  @media (max-width: 360px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const PassCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
`;

const PassImage = styled.img`
  width: 70px;
  height: auto;
  border-radius: 20px;
  object-fit: contain;
`;

const PassLabel = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #111827;
  text-align: center;
`;

const PassPrice = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  text-align: center;
`;

/* ===== 구매하기 탭 ===== */
const SectionLabel = styled.div`
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
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

/* 타임패스 컬러 자녀 추가 버튼 */
const AddChildRow = styled.button`
  width: calc(100% - 24px);
  margin: 8px 12px 10px;
  padding: 8px 14px 9px;
  border-radius: 999px;
  border: 1px dashed #facc15;
  background: #fff9e6;
  font-size: 13px;
  font-weight: 700;
  color: #b45309;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  cursor: pointer;
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

/* 자녀 드롭다운 + 배지 */
const ChildDropdown = styled.div`
  margin-top: 8px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
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
  cursor: pointer;
  font-size: 14px;
  text-align: left;

  &:hover {
    background: #f9fafb;
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

const RowBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BottomNoteWrap = styled.div`
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f3f4f6;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.7;
`;

const PurchaseWrap = styled.div`
  padding: 0 18px;
`;

/* 혜택 카드 */
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
  font-size: 13px;
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
    font-size: 13px;
    font-weight: 700;
  }
`;

const CheckList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  display: grid;
  gap: 6px;
  font-size: 13px;
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
    font-weight: 900;
  }
`;

/* Footer CTA */
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
  background: #facc15;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.04em;
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

/* ===== 멤버십 보유 안내 모달 ===== */
const NoticeOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NoticeCard = styled.div`
  width: min(360px, 90vw);
  background: #ffffff;
  border-radius: 32px;
  padding: 28px 24px 24px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
`;

const NoticeAccent = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #f97316;
  margin-bottom: 10px;
`;

const NoticeTitle = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 10px;
`;

const NoticeBody = styled.div`
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
`;

const NoticeCloseBtn = styled.button`
  margin-top: 18px;
  min-width: 120px;
  height: 40px;
  border-radius: 999px;
  border: 0;
  background: #f3f4f6;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

/* ===== 타임패스 옵션 ===== */
const TIMEPASS_OPTIONS = [
  { key: "2h", label: "2시간권 (25,000원)", minutes: 120, price: 25000 },
  { key: "4h", label: "4시간권 (45,000원)", minutes: 240, price: 45000 },
];

/* ===== 약관 모달 (본문은 기존 그대로 사용) ===== */
const TermsBg = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
`;
const TermsCard = styled.div`
  width: min(720px, 94vw);
  max-height: 86vh;
  overflow: hidden;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e9edf3;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
  display: grid;
  grid-template-rows: auto 1fr auto;
`;
const TermsHead = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #eef1f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  h4 {
    margin: 0;
    font-size: 16px;
    color: #1a2b4c;
  }
  button {
    appearance: none;
    border: 0;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
    color: #666;
  }
`;
const TermsBody = styled.div`
  padding: 12px 16px;
  overflow: auto;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.7;
  .sep {
    height: 1px;
    background: #eef1f4;
    margin: 12px 0;
  }
  ul {
    margin: 6px 0 10px 16px;
    padding: 0;
  }
  li {
    margin: 2px 0;
  }
`;
const TermsFoot = styled.div`
  padding: 10px 16px;
  border-top: 1px solid #eef1f4;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

function PaymentTermsModal({ open, onClose }) {
  if (!open) return null;
  return createPortal(
    <TermsBg onClick={onClose}>
      <TermsCard
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="전자상거래 이용약관"
      >
        <TermsHead>
          <h4>전자상거래 이용약관 (결제·환불)</h4>
          <button onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </TermsHead>
        <TermsBody>
          {/* 기존 약관 본문 그대로 유지 */}
          {/* ... */}
        </TermsBody>
        <TermsFoot>
          <button
            onClick={onClose}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            닫기
          </button>
        </TermsFoot>
      </TermsCard>
    </TermsBg>,
    document.body
  );
}

/* ===== Component ===== */
export default function CheckoutTimepassDialog({
  open,
  onClose,
  onProceed,
}) {
  const [portalEl, setPortalEl] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");
  const [selectedKey, setSelectedKey] = useState("2h");

  const [selectedChildLabel, setSelectedChildLabel] =
    useState("선택해주세요");
  const [selectedOptionLabel, setSelectedOptionLabel] =
    useState("선택해주세요");

  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [hasMembershipOpen, setHasMembershipOpen] = useState(false);

  const navigate = useNavigate();
  const {
    children: ctxChildren,
    phoneE164,
    profile,
    refresh,
    memberships: ctxMemberships,
  } = useUser() || {};

  const children = useMemo(
    () => (Array.isArray(ctxChildren) ? ctxChildren : []),
    [ctxChildren]
  );
  const membershipList = useMemo(
    () => (Array.isArray(ctxMemberships) ? ctxMemberships : []),
    [ctxMemberships]
  );

  // 정규/패밀리 멤버십 보유 자녀 Set
  const agitzSet = useMemo(() => {
    const set = new Set(
      membershipList
        .filter((m) => (m.kind === MEMBERSHIP_KIND.AGITZ || m.kind === "agitz") && m.childId)
        .map((m) => m.childId)
    );
    return set;
  }, [membershipList]);

  const familySet = useMemo(() => {
    const set = new Set(
      membershipList
        .filter((m) => (m.kind === MEMBERSHIP_KIND.FAMILY || m.kind === "family") && m.childId)
        .map((m) => m.childId)
    );
    return set;
  }, [membershipList]);

  const handleGoToBuy = () => {
    setActiveTab("buy");
  };

  useEffect(() => {
    let el = document.getElementById("modal-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "modal-root";
      document.body.appendChild(el);
    }
    setPortalEl(el);
  }, []);

  // 모달 오픈 시 초기화
  useEffect(() => {
    if (!open) return;
    setSelectedKey("2h");
    setActiveTab("detail");
    setChildDropdownOpen(false);
    setLoading(false);
    setHasMembershipOpen(false);

    setSelectedChildId(null);
    setSelectedChildLabel("선택해주세요");

    const base = TIMEPASS_OPTIONS.find((o) => o.key === "2h");
    setSelectedOptionLabel(base ? base.label : "선택해주세요");
  }, [open, children]);

  if (!open || !portalEl) return null;

  const selected =
    TIMEPASS_OPTIONS.find((o) => o.key === selectedKey) ||
    TIMEPASS_OPTIONS[0];

  const minutes = selected.minutes || 0;
  const total = selected.price || 0;

  const effectivePhoneE164 = (phoneE164 || "").trim();
  const effectiveName = (profile?.displayName || "").trim();
  const effectiveEmail = (profile?.email || "").trim();
  const localPhone = toLocalDigitsFromAny(effectivePhoneE164);

  const canPay =
    !!open &&
    !loading &&
    !!effectivePhoneE164 &&
    !!selectedChildId &&
    minutes > 0 &&
    total > 0;

  const appId = (process.env.REACT_APP_BOOTPAY_WEB_APP_ID || "").trim();
  const BOOTPAY_PG = (process.env.REACT_APP_BOOTPAY_PG || "").trim();
  const BOOTPAY_METHODS = (process.env.REACT_APP_BOOTPAY_METHODS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleCTA = async () => {
    // 🔸 가드 1: 정규/패밀리 멤버십 보유 시 결제 막고 안내 모달 표시
    if (
      selectedChildId &&
      (agitzSet.has(selectedChildId) || familySet.has(selectedChildId))
    ) {
      setHasMembershipOpen(true);
      return;
    }

    if (!canPay) {
      if (!effectivePhoneE164) alert("로그인이 필요합니다.");
      else if (!selectedChildId) {
        alert("타임패스를 연결할 자녀를 선택해 주세요.");
        setActiveTab("buy");
      } else if (!minutes || !total) {
        alert("시간권 또는 금액 정보가 올바르지 않습니다.");
      }
      return;
    }

    const kind = MEMBERSHIP_KIND.TIMEPASS;
    const type = mapKindToOrderType(kind);
    if (!type) {
      alert("시간권 상품 정보가 올바르지 않습니다.");
      return;
    }

    const rawE164 = effectivePhoneE164;
    const devMode = isDevTestPhoneLocal(localPhone);

    const product = {
      id: `timepass-${selected.key}`,
      name:
        selected.key === "2h"
          ? "타임패스 멤버십(2시간권)"
          : "타임패스 멤버십(4시간권)",
      kind,
      variant: selected.key,
      minutes,
    };

    const payload = {
      product,
      price: { total },
      childId: selectedChildId,
    };

    const draft = sanitizeForFirestore({
      type,
      childId: selectedChildId,
      children: undefined,
      months: 0,
      minutes: Number(minutes || 0),
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
        pricing: null,
        familyMax: 0,
        calc: { kind },
      },
    });

    setLoading(true);

    try {
      const orderRes = await createOrderDraft(rawE164, draft);
      const orderId = orderRes?.orderId;
      if (!orderId) {
        alert(orderRes?.error?.message || "주문 생성에 실패했습니다.");
        setLoading(false);
        onProceed?.({ ok: false, stage: "createOrder", error: orderRes });
        return;
      }

      if (devMode) {
        await markOrderPaid({
          phoneE164: rawE164,
          orderId,
          provider: { name: "dev", payload: { dev: true, kind: "timepass" } },
        });

        try {
          await refresh?.();
        } catch { }

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
            id: product.id || "timepass",
            name: product.name,
            qty: 1,
            price: total,
          },
        ],
        metadata: sanitizeForFirestore({
          kind,
          minutes,
          productId: product.id,
          variant: product.variant,
          childId: selectedChildId,
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
        } catch (err) {
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
        } catch { }

        alert("결제가 완료되었습니다.");
        onProceed?.({ ok: true, stage: "done", orderId, payload, response });
        onClose?.();
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (e) {
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

  const renderDetail = () => (
    <>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Pill>시간권</Pill>
        <Title>타임패스 멤버십</Title>
      </div>

      <SummaryList>
        <li>분 단위로 원하는 만큼 자유롭게</li>
        <li>단기·체험 고객에게 딱 맞는 선택</li>
        <li>예약없이 언제든지 이용하세요!</li>
      </SummaryList>

      <PassRow>
        <PassCard>
          <PassImage src={twohourimg} alt="2시간권" />
          <PassLabel>2시간권</PassLabel>
          <PassPrice>{KRW(25000)}원</PassPrice>
        </PassCard>

        <PassCard>
          <PassImage src={fourhourimg} alt="4시간권" />
          <PassLabel>4시간권</PassLabel>
          <PassPrice>{KRW(45000)}원</PassPrice>
        </PassCard>
      </PassRow>

      <SectionTitle>혜택 포인트</SectionTitle>
      <BenefitCard>
        <BenefitItem>체험용/단기 이용 최적</BenefitItem>
        <BenefitItem>입장·퇴장, 간식 및 공간 이용 실시간 알림</BenefitItem>
        <BenefitItem>잔여 시간 확인 가능</BenefitItem>
      </BenefitCard>

      <SectionTitle>확인하세요!</SectionTitle>
      <BenefitCard>
        <CheckList>
          <li>필요할 때만 가볍게 이용</li>
          <li>
            평일 이용 2시간/4시간 선택, <strong>유효기간 1개월</strong>
          </li>
          <li>
            자녀 1인 기준, 잔여 시간 <strong>분 단위 차감</strong>
          </li>
          <li>
            포함 서비스: 아지트 공간 &amp; 교구 무제한 이용
            <span style={{ color: "#6b7280" }}> (픽업 서비스 이용 불가)</span>
          </li>
          <li>추가 결제 항목: 간식, 유료 교구 및 프로그램</li>
        </CheckList>
      </BenefitCard>
    </>
  );

  const renderPurchase = () => (
    <PurchaseWrap>
      <BuyTitle>타임패스 멤버십</BuyTitle>

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
                  navigate(isMobile ? "/m/account" : "/mypage");
                }
                return;
              }
              setChildDropdownOpen((prev) => !prev);
            }}
          >
            <span>{selectedChildId ? selectedChildLabel : "선택해주세요"}</span>
            <ChevronDown />
          </ChildCardHeader>

          {childDropdownOpen && children.length > 0 && (
            <>
              <ChildDivider />
              <ChildDropdown>
                {children.map((c) => {
                  const appliedAgitz = agitzSet.has(c.childId);
                  const appliedFamily = familySet.has(c.childId);

                  return (
                    <ChildItemButton
                      key={c.childId}
                      type="button"
                      onClick={() => {
                        setSelectedChildId(c.childId);
                        setSelectedChildLabel(
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

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          {appliedAgitz && (
                            <MembershipTag>정규 가입됨</MembershipTag>
                          )}
                          {appliedFamily && (
                            <MembershipTag>패밀리 가입됨</MembershipTag>
                          )}
                        </div>
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
              navigate(isMobile ? "/m/account" : "/mypage");
            }}
          >
            + 자녀 추가
          </AddChildRow>
        </ChildCard>
      </Block>

      <Block>
        <SectionLabel>옵션</SectionLabel>
        <SelectBox
          type="button"
          $placeholder={selectedOptionLabel === "선택해주세요"}
          onClick={() => {
            const nextKey = selectedKey === "2h" ? "4h" : "2h";
            setSelectedKey(nextKey);
            const next = TIMEPASS_OPTIONS.find((o) => o.key === nextKey);
            setSelectedOptionLabel(next ? next.label : "선택해주세요");
          }}
        >
          <span>{selectedOptionLabel}</span>
          <ChevronDown />
        </SelectBox>
      </Block>

      <Block>
        <RowBetween>
          <SectionLabel>확인하세요!</SectionLabel>
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
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
            이용약관/환불정책 보기
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path
                fill="#9ca3af"
                d="M9.29 6.71L13.17 10.59 9.29 14.46 10.71 15.88 15.99 10.59 10.71 5.29 9.29 6.71Z"
              />
            </svg>
          </button>
        </RowBetween>
      </Block>
    </PurchaseWrap>
  );

  return createPortal(
    <>
      <Backdrop onClick={handleBackdrop}>
        <Dialog
          role="dialog"
          aria-modal="true"
          aria-label="타임패스 멤버십 상세"
        >
          <Header>
            <HeaderTop>
              <CloseBtn type="button" aria-label="닫기" onClick={onClose}>
                ✕
              </CloseBtn>
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
                ? "타임패스 이용하기"
                : loading
                  ? "결제 진행 중…"
                  : "결제 하기"}
            </CTAButton>
          </Footer>
        </Dialog>
      </Backdrop>

      {/* 멤버십 보유 안내 모달 */}
      {hasMembershipOpen && (
        <NoticeOverlay onClick={() => setHasMembershipOpen(false)}>
          <NoticeCard onClick={(e) => e.stopPropagation()}>
            <NoticeAccent>멤버십 보유 안내</NoticeAccent>
            <NoticeTitle>이미 멤버십으로 이용 중인 자녀예요.</NoticeTitle>
            <NoticeBody>
              정규/패밀리 멤버십이 적용된 자녀는
              <br />
              타임패스 추가 구매 없이도 멤버십 기준으로
              <br />
              충분히 이용하실 수 있어요.
            </NoticeBody>
            <NoticeCloseBtn onClick={() => setHasMembershipOpen(false)}>
              확인
            </NoticeCloseBtn>
          </NoticeCard>
        </NoticeOverlay>
      )}

      <PaymentTermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
      />
    </>,
    portalEl
  );
}
