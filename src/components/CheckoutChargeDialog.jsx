/* eslint-disable */
// src/components/CheckoutChargeDialog.jsx
// 정액권 충전하기 — 구매 전 확인/옵션 입력 + 실제 결제까지 처리

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bootpay } from "@bootpay/client-js";

import { MEMBERSHIP_KIND } from "../constants/membershipDefine";
import { ORDER_TYPE } from "../constants/defs";
import { useUser } from "../contexts/UserContext";
import { createOrderDraft, markOrderPaid } from "../services/orderService";

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
  if (k === MEMBERSHIP_KIND.CASHPASS) return ORDER_TYPE.CASHPASS;
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
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  box-shadow: none;
  font-family: "NanumSquareVariable", "NanumSquare", -apple-system,
    BlinkMacSystemFont, system-ui, sans-serif;
`;

/* ===== Header ===== */

const Header = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  color: #111827;
`;

const CloseBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: #9ca3af;
`;

/* ===== Body ===== */

const Body = styled.div`
  padding: 24px 24px 24px;
  background: #ffffff;
  overflow-y: auto;
`;

const Block = styled.div`
  margin-bottom: 20px;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
`;

/* ===== 자녀 선택 영역 (타임패스 모달과 동일 스타일) ===== */

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
  justify-content: space-between;
  gap: 6px;
  cursor: pointer;
`;

/* 자녀 드롭다운 (타임패스와 동일) */

const ChildDropdown = styled.div`
  margin-top: 8px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
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

/* ===== 금액 선택 영역 ===== */

const SelectBox = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e5e5e5;
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

/* 금액 드롭다운 */

const AmountDropdown = styled.div`
  margin-top: 8px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  max-height: 220px;
  overflow-y: auto;
`;

const AmountItemButton = styled.button`
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  text-align: left;

  &:hover {
    background: #f9fafb;
  }

  .label {
    color: #111827;
    font-weight: 700;
  }
  .sub {
    font-size: 12px;
    color: #6b7280;
  }
`;

/* FAQ / 안내 영역 */

// FAQ / 안내 영역

const NoteBox = styled.ul`
  margin-top: 12px;
  padding: 18px 22px 18px 26px;  /* 왼쪽 살짝 여유 */
  border-radius: 20px;
  background: #f7f7f7;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;

  list-style: disc;             /* ● 기본 점 사용 */
`;

const NoteItem = styled.li`
  margin-bottom: 8px;
  list-style-position: outside; /* 점을 바깥쪽에 */

  .title {
    display: block;
    font-weight: 700;
    color: #111827;
  }

  .desc {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: #9ca3af;
  }
`;


/* ===== Footer ===== */

const Footer = styled.div`
  padding: 12px 24px 18px;
  background: #f5f5f5;
  border-top: 1px solid #f3f4f6;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px 0;
  border-radius: 999px;
  border: none;
  outline: none;
  background: #f97316;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.08s ease-out, box-shadow 0.1s ease-out;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 10px 20px rgba(249, 115, 22, 0.35);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ===== 금액 옵션 ===== */
const AMOUNT_OPTIONS = [
  { value: 10000, label: "₩10,000", sub: "" },
  { value: 30000, label: "₩30,000", sub: "" },
  { value: 50000, label: "₩50,000", sub: "" },
  { value: 100000, label: "₩100,000", sub: "" },
];

/* ===== Component ===== */

export default function CheckoutChargeDialog({
  open,
  onClose,
  onProceed, // (result) => { ok, orderId, payload }
}) {
  const [portalEl, setPortalEl] = useState(null);

  const [childLabel, setChildLabel] = useState("선택해주세요");
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);

  const [amountLabel, setAmountLabel] = useState("선택해주세요");
  const [amountValue, setAmountValue] = useState(null);
  const [amountDropdownOpen, setAmountDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { phoneE164, profile, children: ctxChildren, refresh } =
    useUser() || {};

  const children = useMemo(
    () => (Array.isArray(ctxChildren) ? ctxChildren : []),
    [ctxChildren]
  );

  /* Portal 준비 */
  useEffect(() => {
    let el = document.getElementById("modal-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "modal-root";
      document.body.appendChild(el);
    }
    setPortalEl(el);
  }, []);

  /* 팝업 열릴 때 초기화 + 기본 금액 세팅 */
  useEffect(() => {
    if (!open) return;

    // 자녀 초기 선택
    if (children.length > 0) {
      const first = children[0];
      setSelectedChildId(first.childId || null);
      setChildLabel(
        first.name
          ? first.birth
            ? `${first.name} (${first.birth})`
            : first.name
          : "선택해주세요"
      );
    } else {
      setSelectedChildId(null);
      setChildLabel("선택해주세요");
    }

    // 금액 기본값: 50,000원
    const defaultOpt = AMOUNT_OPTIONS[2];
    setAmountLabel(defaultOpt.label);
    setAmountValue(defaultOpt.value);

    setChildDropdownOpen(false);
    setAmountDropdownOpen(false);
    setLoading(false);
  }, [open, children]);

  if (!open || !portalEl) return null;

  const effectivePhoneE164 = (phoneE164 || "").trim();
  const effectiveName = (profile?.displayName || "").trim();
  const effectiveEmail = (profile?.email || "").trim();
  const localPhone = toLocalDigitsFromAny(effectivePhoneE164);

  const total = Number(amountValue || 0);
  const canPay =
    !!open &&
    !loading &&
    !!effectivePhoneE164 &&
    !!selectedChildId &&
    total > 0;

  const appId = (process.env.REACT_APP_BOOTPAY_WEB_APP_ID || "").trim();
  const BOOTPAY_PG = (process.env.REACT_APP_BOOTPAY_PG || "").trim();
  const BOOTPAY_METHODS = (process.env.REACT_APP_BOOTPAY_METHODS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  /* ===== 결제 처리 ===== */

  const handleSubmit = async () => {
    if (!effectivePhoneE164) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!selectedChildId) {
      alert("자녀를 선택해 주세요.");
      return;
    }
    if (!amountValue) {
      alert("충전 금액을 선택해 주세요.");
      return;
    }

    const kind = MEMBERSHIP_KIND.CASHPASS;
    const type = mapKindToOrderType(kind);
    if (!type) {
      alert("정액권 상품 정보가 올바르지 않습니다.");
      return;
    }

    const rawE164 = effectivePhoneE164;
    const devMode = isDevTestPhoneLocal(localPhone);

    const product = {
      id: `cashpass-${amountValue}`,
      name: `정액권 충전 (${KRW(amountValue)}원)`,
      kind,
      variant: "cashpass-basic",
    };

    const payload = {
      product,
      price: { total },
      childId: selectedChildId,
      amountKRW: amountValue,
    };

    const draft = sanitizeForFirestore({
      type, // ORDER_TYPE.CASHPASS
      childId: selectedChildId,
      children: undefined,
      months: 0,
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
        amountKRW: total,
      },
    });

    console.groupCollapsed("[ChargeCheckout] draft 생성");
    console.log("phoneE164", rawE164);
    console.log("childId", selectedChildId);
    console.log("amountValue", amountValue);
    console.log("draft", draft);
    console.groupEnd();

    setLoading(true);

    try {
      const orderRes = await createOrderDraft(rawE164, draft);
      console.log("[ChargeCheckout] createOrderDraft 결과", orderRes);

      const orderId = orderRes?.orderId;
      if (!orderId) {
        console.error(
          "[ChargeCheckout] 주문 생성 실패 상세",
          orderRes
        );
        alert(orderRes?.error?.message || "주문 생성에 실패했습니다.");
        setLoading(false);
        onProceed?.({ ok: false, stage: "createOrder", error: orderRes });
        return;
      }

      // dev/test: Bootpay 생략
      if (devMode) {
        console.log("[ChargeCheckout] dev 모드, Bootpay 생략");
        await markOrderPaid({
          phoneE164: rawE164,
          orderId,
          provider: {
            name: "dev",
            payload: { dev: true, kind: "cashpass" },
          },
        });
        console.log("[ChargeCheckout] markOrderPaid(dev) 완료");

        try {
          await refresh?.();
        } catch (e) {
          console.warn("[ChargeCheckout] refresh 실패", e);
        }

        alert("테스트 충전이 완료되었습니다.");
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

      console.log("[ChargeCheckout] Bootpay.requestPayment 호출");
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
          productId: product.id,
          variant: product.variant,
          childId: selectedChildId,
          amountKRW: total,
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

      console.log("[ChargeCheckout] Bootpay 응답", response);

      if (response?.event === "cancel") {
        alert("결제가 취소되었습니다.");
        setLoading(false);
        onProceed?.({
          ok: false,
          stage: "cancel",
          orderId,
          payload,
          response,
        });
        return;
      }
      if (response?.event === "error") {
        alert(response?.message || "결제 중 오류가 발생했습니다.");
        setLoading(false);
        onProceed?.({
          ok: false,
          stage: "error",
          orderId,
          payload,
          response,
        });
        return;
      }
      if (response?.event === "issued") {
        alert("가상계좌가 발급되었습니다. 안내에 따라 입금해 주세요.");
        setLoading(false);
        onProceed?.({
          ok: true,
          stage: "issued",
          orderId,
          payload,
          response,
        });
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
          console.log("[ChargeCheckout] markOrderPaid(prod) 완료");
        } catch (err) {
          console.error(
            "[ChargeCheckout] markOrderPaid(prod) 실패",
            err
          );
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
          console.warn("[ChargeCheckout] refresh 실패", e);
        }

        alert("정액권 충전이 완료되었습니다.");
        onProceed?.({
          ok: true,
          stage: "done",
          orderId,
          payload,
          response,
        });
        onClose?.();
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (e) {
      console.error("[ChargeCheckout] 예외 발생", e);
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

  return createPortal(
    <Backdrop onClick={handleBackdrop}>
      <Dialog role="dialog" aria-modal="true" aria-label="정액권 충전하기">
        {/* Header */}
        <Header>
          <HeaderTitle>정액권 충전하기</HeaderTitle>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        {/* Body */}
        <Body>
          {/* 자녀 연결 (타임패스 모달과 동일 구조) */}
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
                      navigate("/mypage");
                    }
                    return;
                  }
                  setChildDropdownOpen((prev) => !prev);
                }}
              >
                <span>{childLabel}</span>
                <ChevronDown />
              </ChildCardHeader>

              {childDropdownOpen && children.length > 0 && (
                <>
                  <ChildDivider />
                  <ChildDropdown>
                    {children.map((c) => (
                      <ChildItemButton
                        key={c.childId}
                        type="button"
                        onClick={() => {
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
                        <span className="name">
                          {c.name || "(이름 없음)"}
                        </span>
                        {c.birth ? (
                          <span className="meta">{c.birth}</span>
                        ) : null}
                      </ChildItemButton>
                    ))}
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
                <span>+ 자녀 추가</span>
                <span style={{ fontSize: 12 }}>클릭하면 마이페이지로 이동</span>
              </AddChildRow>
            </ChildCard>
          </Block>

          {/* 충전 금액 */}
          <Block>
            <SectionLabel>충전 금액</SectionLabel>
            <SelectBox
              $placeholder={amountLabel === "선택해주세요"}
              type="button"
              onClick={() =>
                setAmountDropdownOpen((prev) => !prev)
              }
            >
              <span>{amountLabel}</span>
              <ChevronDown />
            </SelectBox>

            {amountDropdownOpen && (
              <AmountDropdown>
                {AMOUNT_OPTIONS.map((opt) => (
                  <AmountItemButton
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setAmountValue(opt.value);
                      setAmountLabel(opt.label);
                      setAmountDropdownOpen(false);
                    }}
                  >
                    <span className="label">{opt.label}</span>
                    <span className="sub">{opt.sub}</span>
                  </AmountItemButton>
                ))}
              </AmountDropdown>
            )}
          </Block>

          {/* 안내 영역 */}
          <Block>
            <SectionLabel>이용 안내</SectionLabel>
            <NoteBox as="ul">
              <NoteItem>
                <div> <strong>자녀 등록 필수</strong></div>
                <span>
                  자녀 정보가 미등록일 경우 충전이 불가합니다.
                </span>
              </NoteItem>
              <NoteItem>
                <div> <strong>충전 금액 사용 기한</strong></div>
                <span>   
                  충전일로부터 12개월간 사용 가능해요.
                </span>
              </NoteItem>
              <NoteItem>
                <div> <strong>환불 및 양도 불가</strong></div>
                <span>
                  충전된 정액권은 환불·양도가 불가합니다.
                </span>
              </NoteItem>
              <NoteItem>
                <div> <strong>다른 자녀에게 금액 이전 불가</strong></div>
                <span>
                  자녀별 계정으로만 사용 가능해요.
                </span>
              </NoteItem>
            </NoteBox>
          </Block>
        </Body>

        {/* Footer */}
        <Footer>
          <SubmitButton
            type="button"
            onClick={handleSubmit}
            disabled={!canPay}
          >
            {loading
              ? "충전 진행 중…"
              : `충전하러 가기${total > 0 ? ` (${KRW(total)}원)` : ""
              }`}
          </SubmitButton>
        </Footer>
      </Dialog>
    </Backdrop>,
    portalEl
  );
}
