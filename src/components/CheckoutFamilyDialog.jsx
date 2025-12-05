/* eslint-disable */
// src/components/CheckoutFamilyDialog.jsx
// 패밀리 멤버십 상세/구매 팝업 + 실제 결제 처리

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

/* 이미지 */
import familyFirstImg from "../assets/membership/family-first.png";
import familySecondImg from "../assets/membership/family-second.png";

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
  if (k === MEMBERSHIP_KIND.FAMILY) return ORDER_TYPE.FAMILY;
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

  font-family: "NanumSquareRound";
  box-shadow: none;
`;

/* ===== Header / Tabs ===== */
const Header = styled.div`
  background: #ffffff;
  padding: 10px 18px 0;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CloseBtn = styled.button`
  border: 0;
  background: transparent;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  padding: 8px;
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

  &::after {
    content: "";
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: -2px;
    height: 2px;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? "#fb923c" : "transparent")};
  }
`;

/* ===== Body ===== */
const Body = styled.div`
  padding: 22px 24px 24px;
  overflow-y: auto;
  background: #ffffff;
`;

/* ===== 공통 요소 ===== */
const Pill = styled.span`
  display: inline-flex;
  padding: 6px 14px;
  border-radius: 999px;
  background: #fb923c;
  color: white;
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
    font-weight: 700;
    margin-right: 8px;
    color: #d1d5db;
  }
`;

/* ===== 이미지 카드 영역 ===== */
const FamilyRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;

  @media (max-width: 420px) {
    gap: 24px;
  }
`;

const FamilyCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
`;

const FamilyImg = styled.img`
  width: 96px;
  height: auto;
  object-fit: contain;
  border-radius: 0;
`;

const FamilyLabel = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #111827;
  text-align: center;
`;

const FamilyPrice = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  text-align: center;
`;

const DiscountTag = styled.div`
  font-size: 12px;
  background: #ffedd5;
  color: #fb923c;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
`;

/* ===== 혜택 / 확인 (회색 박스 공통) ===== */
const SectionTitle = styled.h4`
  margin: 24px 0 10px;
  font-size: 15px;
  font-weight: 900;
  color: #111827;
`;

const GreyCard = styled.div`
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
    font-weight: 400;
  }
`;

/* ===== 구매하기 탭 ===== */
const Block = styled.div`
  margin-bottom: 18px;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
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

/* 🔸 패밀리 컬러로 맞춘 자녀 추가 버튼 */
const AddChildRow = styled.button`
  width: calc(100% - 24px);
  margin: 8px 12px 10px;
  padding: 8px 14px 9px;
  border-radius: 999px;
  border: 1px dashed #fb923c;
  background: #fff4e6;
  font-size: 13px;
  font-weight: 700;
  color: #c2410c;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  cursor: pointer;
`;

/* 자녀 드롭다운 + 배지 */
const ChildDropdown = styled.div`
  margin: 0 0 8px;
  max-height: 220px;
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

/* 가격/자동갱신 */
const SelectBox = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: white;

  font-size: 14px;
  color: ${({ $placeholder }) => ($placeholder ? "#9ca3af" : "#111827")};

  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const PurchaseWrap = styled.div`
  padding: 0 18px;
`;

const BottomNote = styled.div`
  margin-top: 10px;
  padding: 12px 14px;
  background: #f3f4f6;
  border-radius: 16px;
  font-size: 12px;
  color: #4b5563;
`;

const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#9ca3af" d="M7 9l5 5 5-5H7z" />
  </svg>
);

/* ===== Footer CTA ===== */
const Footer = styled.div`
  padding: 12px 22px 18px;
  border-top: 1px solid #e5e7eb;
  background: #f5f5f5;
`;

const CTAButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 999px;
  border: 0;
  background: #fb923c;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;

  transition: transform 0.1s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(1.05);
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
export default function CheckoutFamilyDialog({
  open,
  onClose,
  onProceed,
}) {
  const [portalEl, setPortalEl] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");

  // 구매하기 탭 state
  const [selectedChildIds, setSelectedChildIds] = useState([]);
  const [childLabel, setChildLabel] = useState("선택해주세요");
  const [autoMode, setAutoMode] = useState("auto"); // "auto" | "once"
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const FAMILY_MAX = 10;
  const months = 1;
  const FAMILY_PRICE_BASE = 50915;
  const FAMILY_ADD_DISCOUNT_RATE = 0.15;

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

  /* ===== 멤버십 적용 자녀 Set 조회 (Firestore) ===== */
  const [agitzSet, setAgitzSet] = useState(() => new Set());
  const [familySet, setFamilySet] = useState(() => new Set());
  const [membershipLoading, setMembershipLoading] = useState(false);

  const readSetForKind = useCallback(async (phone, kind) => {
    const col = collection(db, "members", phone, "memberships");
    const qy = query(
      col,
      where("kind", "==", kind),
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
      const [agitz, fam] = await Promise.all([
        readSetForKind(phoneE164, MEMBERSHIP_KIND.AGITZ),
        readSetForKind(phoneE164, MEMBERSHIP_KIND.FAMILY),
      ]);
      setAgitzSet(agitz || new Set());
      setFamilySet(fam || new Set());
      console.log("[FamilyCheckout] agitzSet", Array.from(agitz || []));
      console.log("[FamilyCheckout] familySet", Array.from(fam || []));
    } catch (e) {
      console.warn("[FamilyCheckout] membership set 조회 실패", e);
    } finally {
      setMembershipLoading(false);
    }
  }, [phoneE164, readSetForKind]);

  /* ===== 모달 오픈 시 초기화 ===== */
  useEffect(() => {
    if (!open) return;

    setActiveTab("detail");
    setLoading(false);
    setAutoMode("auto");
    setChildDropdownOpen(false);
    setSelectedChildIds([]);
    setChildLabel("선택해주세요");

    if (phoneE164) {
      refreshMemberships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phoneE164, children.length]);

  /* ===== 가격 계산 ===== */
  const priceCalc = useMemo(() => {
    const n = selectedChildIds.length;
    if (n <= 0) {
      return {
        n: 0,
        subtotal: 0,
        discount: 0,
        total: 0,
      };
    }

    const base = FAMILY_PRICE_BASE;
    const subUnit = base * n;
    const discUnit = Math.round(
      base * FAMILY_ADD_DISCOUNT_RATE * Math.max(0, n - 1)
    );

    const sub = Math.round(subUnit * months);
    const disc = Math.round(discUnit * months);
    const tot = sub - disc;

    return {
      n,
      subtotal: sub,
      discount: disc,
      total: tot
    };
  }, [selectedChildIds.length, FAMILY_PRICE_BASE, FAMILY_ADD_DISCOUNT_RATE, months]);

  const { n, subtotal, discount, total } = priceCalc;

  /* ===== 자녀 레이블 계산 ===== */
  useEffect(() => {
    if (!selectedChildIds.length || !children.length) {
      setChildLabel("선택해주세요");
      return;
    }
    const selectedChildren = children.filter((c) =>
      selectedChildIds.includes(c.childId)
    );
    if (!selectedChildren.length) {
      setChildLabel("선택해주세요");
      return;
    }
    const first = selectedChildren[0];
    if (selectedChildren.length === 1) {
      setChildLabel(
        first.name
          ? first.birth
            ? `${first.name} (${first.birth})`
            : first.name
          : "선택해주세요"
      );
    } else {
      setChildLabel(
        `${first.name || "자녀"} 외 ${selectedChildren.length - 1}명`
      );
    }
  }, [selectedChildIds, children]);

  /* ===== canPay ===== */
  const effectivePhoneE164 = (phoneE164 || "").trim();
  const effectiveName = (profile?.displayName || "").trim();
  const effectiveEmail = (profile?.email || "").trim();
  const localPhone = toLocalDigitsFromAny(effectivePhoneE164);

  const canPay =
    !!open &&
    !loading &&
    !membershipLoading &&
    !!effectivePhoneE164 &&
    n > 0 &&
    n <= FAMILY_MAX &&
    total > 0 &&
    selectedChildIds.every(
      (id) => !agitzSet.has(id) && !familySet.has(id)
    );

  const appId = (process.env.REACT_APP_BOOTPAY_WEB_APP_ID || "").trim();
  const BOOTPAY_PG = (process.env.REACT_APP_BOOTPAY_PG || "").trim();
  const BOOTPAY_METHODS = (process.env.REACT_APP_BOOTPAY_METHODS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const autoLabel =
    autoMode === "auto" ? "자동 갱신" : "이번 달만 (단건 결제)";

  /* ===== CTA: 결제 처리 ===== */
  const handleCTA = async () => {
    if (!effectivePhoneE164) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!n) {
      alert("멤버십을 적용할 자녀를 선택해 주세요.");
      setActiveTab("buy");
      return;
    }
    if (n > FAMILY_MAX) {
      alert(`패밀리 멤버십은 최대 ${FAMILY_MAX}명까지 선택할 수 있습니다.`);
      setActiveTab("buy");
      return;
    }
    if (
      selectedChildIds.some(
        (id) => agitzSet.has(id) || familySet.has(id)
      )
    ) {
      alert(
        "이미 정규/패밀리 멤버십이 적용된 자녀가 포함되어 있습니다. 해당 자녀는 제외해 주세요."
      );
      setActiveTab("buy");
      return;
    }

    const kind = MEMBERSHIP_KIND.FAMILY;
    const type = mapKindToOrderType(kind);
    if (!type) {
      alert("멤버십 정보가 올바르지 않습니다.");
      return;
    }

    const rawE164 = effectivePhoneE164;
    const devMode = isDevTestPhoneLocal(localPhone);

    const product = {
      id: "family-basic-1m",
      name: "패밀리 멤버십 (1개월)",
      kind,
      variant: autoMode === "auto" ? "family-1m-auto" : "family-1m-once",
    };

    const payload = {
      product,
      price: { total },
      months,
      childIds: selectedChildIds,
      autoMode,
    };

    const draft = sanitizeForFirestore({
      type,
      childId: selectedChildIds[0] || null,
      children: selectedChildIds,
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
        n,
        familyMax: FAMILY_MAX,
        autoMode,
        autoRenew: autoMode === "auto",
        termType: autoMode === "auto" ? "AUTO" : "ONETIME",
      },
    });

    console.groupCollapsed("[FamilyCheckout] draft 생성");
    console.log("phoneE164", rawE164);
    console.log("childIds", selectedChildIds);
    console.log("autoMode", autoMode);
    console.log("draft", draft);
    console.groupEnd();

    setLoading(true);

    try {
      const orderRes = await createOrderDraft(rawE164, draft);
      console.log("[FamilyCheckout] createOrderDraft 결과", orderRes);

      const orderId = orderRes?.orderId;
      if (!orderId) {
        console.error("[FamilyCheckout] 주문 생성 실패 상세", orderRes);
        alert(orderRes?.error?.message || "주문 생성에 실패했습니다.");
        setLoading(false);
        onProceed?.({ ok: false, stage: "createOrder", error: orderRes });
        return;
      }

      if (devMode) {
        console.log("[FamilyCheckout] dev 모드, Bootpay 생략");
        await markOrderPaid({
          phoneE164: rawE164,
          orderId,
          provider: {
            name: "dev",
            payload: { dev: true, kind: "family", autoMode },
          },
        });
        console.log("[FamilyCheckout] markOrderPaid(dev) 완료");

        try {
          await refresh?.();
        } catch (e) {
          console.warn("[FamilyCheckout] refresh 실패", e);
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

      console.log("[FamilyCheckout] Bootpay.requestPayment 호출");
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
            qty: n || 1,
            price: total,
          },
        ],
        metadata: sanitizeForFirestore({
          kind,
          months,
          n,
          familyMax: FAMILY_MAX,
          productId: product.id,
          variant: product.variant,
          childIds: selectedChildIds,
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

      console.log("[FamilyCheckout] Bootpay 응답", response);

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
          console.log("[FamilyCheckout] markOrderPaid(prod) 완료");
        } catch (err) {
          console.error("[FamilyCheckout] markOrderPaid(prod) 실패", err);
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
          console.warn("[FamilyCheckout] refresh 실패", e);
        }

        alert("결제가 완료되었습니다.");
        onProceed?.({ ok: true, stage: "done", orderId, payload, response });
        onClose?.();
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (e) {
      console.error("[FamilyCheckout] 예외 발생", e);
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

  /* 상세 탭 */
  const renderDetail = () => (
    <>
      <Pill>형제/자매 할인</Pill>
      <Title>패밀리 멤버십</Title>

      <SummaryList>
        <li>
          두 번째 자녀부터{" "}
          <span style={{ color: "#fb923c", fontWeight: 900 }}>
            15% 할인
          </span>
        </li>
        <li>자녀별 개별 관리, 동일 혜택 제공</li>
        <li>가족 모두 함께 누리는 돌봄 서비스</li>
      </SummaryList>

      <FamilyRow>
        <FamilyCard>
          <FamilyImg src={familyFirstImg} alt="첫째" />
          <FamilyLabel>첫째</FamilyLabel>
          <FamilyPrice>월 59,900원</FamilyPrice>
        </FamilyCard>

        <FamilyCard>
          <FamilyImg src={familySecondImg} alt="둘째부터" />
          <FamilyLabel>둘째부터</FamilyLabel>
          <FamilyPrice>월 50,915원</FamilyPrice>
          <DiscountTag>15%↓</DiscountTag>
        </FamilyCard>
      </FamilyRow>

      <SectionTitle>확인하세요!</SectionTitle>
      <GreyCard>
        <CheckList>
          <li>두 번째 자녀부터 15% 할인 적용 (정규 멤버십 기준)</li>
          <li>자녀별 프로필·학교 정보 등록 필요</li>
          <li>정규/패밀리 멤버십 중복 가입은 불가</li>
        </CheckList>
      </GreyCard>
    </>
  );

  /* 구매 탭 */
  const renderPurchase = () => (
    <PurchaseWrap>
      <BuyTitle>패밀리 멤버십</BuyTitle>

      <Block>
        <SectionLabel>자녀 연결</SectionLabel>

        <ChildCard>
          <ChildCardHeader
            type="button"
            $placeholder={selectedChildIds.length === 0}
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
            <span>
              {selectedChildIds.length > 0 ? childLabel : "선택해주세요"}
            </span>
            <ChevronDown />
          </ChildCardHeader>

          {childDropdownOpen && children.length > 0 && (
            <>
              <ChildDivider />
              <ChildDropdown>
                {children.map((c) => {
                  const appliedAgitz = agitzSet.has(c.childId);
                  const appliedFamily = familySet.has(c.childId);
                  const disabled = appliedAgitz || appliedFamily;

                  return (
                    <ChildItemButton
                      key={c.childId}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) {
                          alert(
                            "이미 정규/패밀리 멤버십이 적용된 자녀입니다."
                          );
                          return;
                        }
                        setSelectedChildIds((prev) => {
                          const has = prev.includes(c.childId);
                          if (has) {
                            return prev.filter((id) => id !== c.childId);
                          }
                          if (prev.length >= FAMILY_MAX) {
                            alert(
                              `패밀리 멤버십은 최대 ${FAMILY_MAX}명까지 선택할 수 있습니다.`
                            );
                            return prev;
                          }
                          return [...prev, c.childId];
                        });
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
          <span>
            {n > 0
              ? `자녀 ${n}명 · 월 ${KRW(total)}원`
              : "자녀를 선택하면 가격이 계산됩니다"}
          </span>
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

      {/* 필요하면 확인 박스도 추가 가능 */}
      {/* <Block>... */}
    </PurchaseWrap>
  );

  if (!open || !portalEl) return null;

  return createPortal(
    <Backdrop onClick={handleBackdrop}>
      <Dialog>
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
              ? "패밀리 이용하기"
              : loading
                ? "결제 진행 중…"
                : "결제하기"}
          </CTAButton>
        </Footer>
      </Dialog>
    </Backdrop>,
    portalEl
  );
}
