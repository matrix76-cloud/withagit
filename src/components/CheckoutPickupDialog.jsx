/* eslint-disable */
// src/components/CheckoutPickupDialog.jsx
// 픽업 예약 장바구니 결제 — cartItems 합산 결제 + 픽업 메타까지 주문에 저장

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { Bootpay } from "@bootpay/client-js";

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

// 픽업 결제 타입 우선 사용
const ORDER_TYPE_PICKUP =
    ORDER_TYPE.PICKUP ||
    ORDER_TYPE.PICKUP_RESERVATION ||
    ORDER_TYPE.ETC ||
    "PICKUP";

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
  width: min(520px, 100vw - 24px);
  max-height: min(780px, 100vh - 24px);
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
  font-size: 22px;
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
  padding: 20px 24px 24px;
  background: #ffffff;
  overflow-y: auto;
`;

const Block = styled.div`
  margin-bottom: 18px;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const SummaryText = styled.p`
  margin: 0 0 6px;
  font-size: 13px;
  color: #4b5563;
`;

/* 예약 리스트 */

const BookingList = styled.div`
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 10px 12px;
  max-height: 280px;
  overflow-y: auto;
`;

const BookingItem = styled.div`
  padding: 10px 8px;
  border-radius: 12px;
  background: #ffffff;
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 8px;
  row-gap: 3px;

  & + & {
    margin-top: 8px;
  }
`;

const BookingMain = styled.div`
  grid-column: 1 / 2;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BookingTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
`;

const BookingMeta = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const BookingChild = styled.div`
  font-size: 11px;
  color: #4b5563;
`;

const BookingPrice = styled.div`
  grid-column: 2 / 3;
  grid-row: 1 / 3;
  align-self: center;
  font-size: 12px;
  font-weight: 700;
  color: #111827;
`;

/* 합계 박스 */

const TotalBox = styled.div`
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #fffbeb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #92400e;
`;

const TotalLabel = styled.span`
  font-weight: 600;
`;

const TotalValue = styled.span`
  font-weight: 800;
`;

/* 안내 영역 */

const NoteBox = styled.div`
  margin-top: 10px;
  padding: 14px 14px;
  border-radius: 18px;
  background: #f7f7f7;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.6;
`;

const NoteItem = styled.li`
  margin-left: 1.2em;
  margin-bottom: 4px;

  &::marker {
    font-size: 0.8em;
  }

  span {
    display: block;
  }

  strong {
    font-weight: 700;
    color: #111827;
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

/**
 * items: PickupApplyPage의 장바구니(cartItems) 배열
 *   {
 *     id,
 *     childName,
 *     date,          // "2025-11-26"
 *     timeText,      // "오후 03:30"
 *     startLabel,    // 출발지 이름
 *     endLabel,      // 도착지 이름
 *     priceKRW,      // 1건당 금액
 *   }
 */
export default function CheckoutPickupDialog({
    open,
    onClose,
    items = [],
    onProceed, // (result) => { ok, orderId, payload, ... }
}) {
    const [portalEl, setPortalEl] = useState(null);
    const [loading, setLoading] = useState(false);

    const { phoneE164, profile, refresh } = useUser() || {};

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

    const safeItems = useMemo(
        () => (Array.isArray(items) ? items.filter(Boolean) : []),
        [items]
    );

    const total = useMemo(
        () =>
            safeItems.reduce(
                (sum, it) => sum + Number(it?.priceKRW || 0),
                0
            ),
        [safeItems]
    );

    const count = safeItems.length;

    const effectivePhoneE164 = (phoneE164 || "").trim();
    const effectiveName = (profile?.displayName || "").trim();
    const effectiveEmail = (profile?.email || "").trim();
    const localPhone = toLocalDigitsFromAny(effectivePhoneE164);

    const canPay =
        !!open &&
        !loading &&
        !!effectivePhoneE164 &&
        count > 0 &&
        total > 0;

    const appId = (process.env.REACT_APP_BOOTPAY_WEB_APP_ID || "").trim();
    const BOOTPAY_PG = (process.env.REACT_APP_BOOTPAY_PG || "").trim();
    const BOOTPAY_METHODS = (process.env.REACT_APP_BOOTPAY_METHODS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const devMode = isDevTestPhoneLocal(localPhone);

    const orderName =
        count === 1
            ? `픽업 예약 1건`
            : `픽업 예약 ${count}건`;

    if (!open || !portalEl) return null;

    /* ===== 결제 처리 ===== */

    const handleSubmit = async () => {
        if (!effectivePhoneE164) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!count) {
            alert("결제할 예약이 없습니다.");
            return;
        }
        if (!total) {
            alert("결제 금액이 올바르지 않습니다.");
            return;
        }

        const rawE164 = effectivePhoneE164;

        const product = {
            id: `pickup-${Date.now()}`,
            name: orderName,
            kind: "pickup",
            variant: count > 1 ? "pickup-multi" : "pickup-single",
        };

        const payload = {
            product,
            price: { total },
            count,
            pickups: safeItems,
        };

        const draft = sanitizeForFirestore({
            type: ORDER_TYPE_PICKUP,
            childId: null,
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
                kind: "pickup",

                totalAmountKRW: total,
                totalCount: count,
                pickups: safeItems,
            },
        });

        console.groupCollapsed("[PickupCheckout] draft 생성");
        console.log("ORDER_TYPE", ORDER_TYPE);
        console.log("ORDER_TYPE_PICKUP", ORDER_TYPE_PICKUP);
        console.log("phoneE164", rawE164);
        console.log("예약 건수", count);
        console.log("총 금액", total);
        console.log("draft", draft);
        console.groupEnd();

        setLoading(true);

        try {
            const orderRes = await createOrderDraft(rawE164, draft);
            console.log("[PickupCheckout] createOrderDraft 결과", orderRes);

            const orderId = orderRes?.orderId;
            if (!orderId) {
                console.error("[PickupCheckout] 주문 생성 실패 상세", orderRes);
                alert(orderRes?.error?.message || "주문 생성에 실패했습니다.");
                setLoading(false);
                onProceed?.({ ok: false, stage: "createOrder", error: orderRes });
                return;
            }

            // dev/test: Bootpay 생략
            if (devMode) {
                console.log("[PickupCheckout] dev 모드, Bootpay 생략");
                await markOrderPaid({
                    phoneE164: rawE164,
                    orderId,
                    provider: {
                        name: "dev",
                        payload: { dev: true, kind: "pickup" },
                    },
                });
                console.log("[PickupCheckout] markOrderPaid(dev) 완료");

                try {
                    await refresh?.();
                } catch (e) {
                    console.warn("[PickupCheckout] refresh 실패", e);
                }

                alert("테스트 픽업 결제가 완료되었습니다.");
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

            console.log("[PickupCheckout] Bootpay.requestPayment 호출");
            const response = await Bootpay.requestPayment({
                application_id: appId,
                price: total,
                order_name: orderName,
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
                    kind: "pickup",
                    productId: product.id,
                    variant: product.variant,
                    totalAmountKRW: total,
                    totalCount: count,
                    pickups: safeItems,
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

            console.log("[PickupCheckout] Bootpay 응답", response);

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
                    console.log("[PickupCheckout] markOrderPaid(prod) 완료");
                } catch (err) {
                    console.error("[PickupCheckout] markOrderPaid(prod) 실패", err);
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
                    console.warn("[PickupCheckout] refresh 실패", e);
                }

                alert("픽업 예약 결제가 완료되었습니다.");
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
            console.error("[PickupCheckout] 예외 발생", e);
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
            <Dialog
                role="dialog"
                aria-modal="true"
                aria-label="픽업 예약 결제하기"
            >
                {/* Header */}
                <Header>
                    <HeaderTitle>픽업 예약 결제하기</HeaderTitle>
                    <CloseBtn onClick={onClose}>✕</CloseBtn>
                </Header>

                {/* Body */}
                <Body>
                    <Block>
                        <SectionLabel>예약 내역 확인</SectionLabel>
                        {count === 0 ? (
                            <SummaryText>결제할 픽업 예약이 없습니다.</SummaryText>
                        ) : (
                            <>
                                <SummaryText>
                                    총 <strong>{count}건</strong>의 픽업 예약이 선택되어 있습니다.
                                </SummaryText>
                                <BookingList>
                                    {safeItems.map((it) => (
                                        <BookingItem key={it.id}>
                                            <BookingMain>
                                                <BookingTitle>
                                                    {it.childName || "자녀"} · {it.date} · {it.timeText}
                                                </BookingTitle>
                                                <BookingMeta>
                                                    출발: {it.startLabel} / 도착: {it.endLabel}
                                                </BookingMeta>
                                                {it.memo && (
                                                    <BookingChild>메모: {it.memo}</BookingChild>
                                                )}
                                            </BookingMain>
                                            <BookingPrice>₩{KRW(it.priceKRW || 0)}</BookingPrice>
                                        </BookingItem>
                                    ))}
                                </BookingList>
                                <TotalBox>
                                    <TotalLabel>총 결제 금액</TotalLabel>
                                    <TotalValue>₩{KRW(total)}</TotalValue>
                                </TotalBox>
                            </>
                        )}
                    </Block>

                    <Block>
                        <SectionLabel>이용 안내</SectionLabel>
                        <NoteBox as="ul">
                            <NoteItem>
                                <span>
                                    <strong>예약 정보 저장</strong>
                                    결제가 완료되면 선택하신 날짜·시간·자녀·출발/도착지 정보가
                                    주문 이력에 함께 저장됩니다.
                                </span>
                            </NoteItem>
                            <NoteItem>
                                <span>
                                    <strong>취소 및 변경</strong>
                                    픽업 취소 가능 시간 및 환불 규정은 추후 안내되는 정책에
                                    따릅니다.
                                </span>
                            </NoteItem>
                            <NoteItem>
                                <span>
                                    <strong>여러 건 동시 결제</strong>
                                    여러 건을 한 번에 결제하더라도, 이력 화면에서
                                    개별 예약 정보를 모두 확인하실 수 있습니다.
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
                            ? "결제 진행 중…"
                            : count > 0
                                ? `총 ${count}건 결제하기 (₩${KRW(total)}`
                                : "결제할 예약이 없습니다"}
                        {(!loading && count > 0 && ")") || ""}
                    </SubmitButton>
                </Footer>
            </Dialog>
        </Backdrop>,
        portalEl
    );
}
