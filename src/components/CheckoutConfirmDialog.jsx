/* eslint-disable */
// /src/components/CheckoutConfirmDialog.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { Bootpay } from "@bootpay/client-js";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

/* ==== Services & Constants ==== */
import { db } from "../services/api";
import { collection, getDocs, query, where } from "firebase/firestore";
import { createOrderDraft, markOrderPaid } from "../services/orderService";
import { MEMBERSHIP_KIND, MEMBERSHIP_STATUS } from "../constants/membershipDefine";
import { ORDER_TYPE } from "../constants/defs";

/* ===== Tokens ===== */
const accent = "var(--color-accent, #F07A2A)";
const navy = "#1A2B4C";
const line = "rgba(0,0,0,.10)";
const blueBtn = "#1236D0";
const blueBtnDark = "#0E2CAE";
const POINT_PACKS = [10000, 20000, 30000, 40000, 50000];

/* ===== Portal base ===== */
const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.35);
  display: grid; place-items: center;
`;
const Dialog = styled.div`
  width: min(880px, calc(100vw - 20px));
  max-height: calc(100vh - 20px);
  overflow: hidden;
  background: #fff; border-radius: 14px;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
  display: grid; grid-template-rows: auto 1fr auto;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "tnum" 1, "lnum" 1;
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid ${line};
  h3{ margin:0; color:#111; font-size:18px; }
  button{ appearance:none; background:transparent; border:0; cursor:pointer; font-size:18px; padding:6px; color:#555; }
`;
const Body = styled.div`
  display: grid; grid-template-columns: 1.2fr .9fr; gap: 16px;
  padding: 16px; overflow: auto;
  @media (max-width: 920px){ grid-template-columns: 1fr; }
`;
const AgreeLine = styled.label`
  display: grid; grid-auto-flow: column; justify-content: start; align-items: center; gap: 8px;
  font-size: 14px; color: #333;
  input{ width:18px; height:18px; }
`;
const Footer = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${line};
  display: grid; grid-template-columns: 1.2fr .9fr; gap: 16px; align-items: center;
  @media (max-width: 920px){ grid-template-columns: 1fr; }
`;
const PayBtn = styled.button`
  width: 100%; height: 56px; border-radius: 14px; border: 1px solid ${blueBtnDark};
  background: ${blueBtn}; color: #fff; font-size: 18px; letter-spacing: .2px;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 24px rgba(0,0,0,.08), inset 0 -2px 0 rgba(255,255,255,.08);
  transition: transform .08s ease, filter .12s ease, box-shadow .12s ease;
  &:hover{ filter: brightness(1.03); }
  &:active{ transform: translateY(1px); box-shadow: 0 8px 18px rgba(0,0,0,.08); }
  &:disabled{ opacity:.5; cursor:not-allowed; }
`;

/* ===== Cards ===== */
const Card = styled.div` background:#fff; border:1px solid ${line}; border-radius:12px; padding:14px; `;
const CardTitle = styled.div` margin-bottom:8px; color:${navy}; font-size:15px; `;
const OrderCard = styled(Card)`
  background: linear-gradient(180deg, #FFF6EE 0%, #FFF9F4 100%);
  border-color: color-mix(in srgb, ${accent} 18%, #ffffff);
  box-shadow: 0 16px 40px rgba(240, 122, 42, .10), 0 0 0 1px rgba(255,255,255,.6) inset;
  ${CardTitle}{ color: color-mix(in srgb, ${accent} 60%, #1b2b3a); }
`;
const AmountBox = styled(Card)`
  border-radius: 12px; border: 1px solid #C7CCD6; background: #fff;
  .line{ display:grid; grid-template-columns:1fr auto; align-items:center; padding:4px 0; color:#616977; font-size:14px; }
  .line .v{ color:#111; }
  .line.discount .v{ color:#10A857; }
  .sep{ height:1px; background:#C7CCD6; margin:14px 0; }
  .total{ display:grid; grid-template-columns:1fr auto; align-items:center; padding-top:6px; }
  .total .tt{ color:#111; font-size:18px; }
  .total .price{ color:#111; font-size:28px; letter-spacing:-0.4px; }
  .totalSub{ color:#8A91A1; font-size:13px; }
`;

/* 자녀 선택 리스트 */
const ChildrenWrap = styled(Card)` display: grid; gap: 12px; `;
const Badge = styled.span`
  font-size:12px; padding:2px 8px; border-radius:999px;
  background:#f3f4f6; color:#374151; border:1px solid #e5e7eb;
`;
const AddChildBox = styled.div`
  margin-top: 4px; border: 2px dashed color-mix(in srgb, ${accent} 55%, #ffd8bf);
  border-radius: 14px; padding: 14px; background: #fff;
`;
const AddChildBtn = styled.button`
  height: 44px; padding: 0 14px; border-radius: 12px;
  border: 1px solid color-mix(in srgb, ${accent} 60%, #ffffff);
  background: #fff6ee; color: color-mix(in srgb, ${accent} 75%, #1a1d21);
  cursor: pointer; &:hover{ filter: brightness(1.02); } &:active{ transform: translateY(1px); }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 8px;
  align-items: center;
  & + & { margin-top: 8px; }
  .label { color:#6b7280; font-size:13px; }
  .val   { color:#111; font-size:14px; letter-spacing:-.1px; white-space:pre; justify-self:flex-end; text-align:right; }
`;

/* ===== Utils ===== */
const KRW = (n = 0) => (n || 0).toLocaleString("ko-KR");
const onlyDigits = (s = "") => (s || "").replace(/\D+/g, "");
function toLocalDigitsFromAny(phoneLike) {
    const d = onlyDigits(String(phoneLike || ""));
    if (!d) return "";
    if (d.startsWith("82")) return "0" + d.slice(2);
    return d;
}
function resolveTimepassMinutes(product, payload) {
    const pMin = Number(payload?.minutes ?? product?.minutes ?? 0);
    if (pMin > 0) return pMin;
    const v = String(product?.variant || "").toLowerCase().trim();
    if (!v) return 0;
    const h = v.match(/^(\d+)\s*h$/); if (h) return Number(h[1]) * 60;
    const m = v.match(/^(\d+)\s*m$/); if (m) return Number(m[1]);
    const k = v.match(/(\d+)\s*시간/); if (k) return Number(k[1]) * 60;
    return 0;
}
function sanitizeForFirestore(obj) {
    return JSON.parse(JSON.stringify(obj, (k, v) => (v === undefined ? null : v)));
}

/* ===== 결제약관 팝업 (약관 전체 본문, 생략 없음) ===== */
const TermsBg = styled.div`
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,.45);
  display: grid; place-items: center;
`;
const TermsCard = styled.div`
  width: min(720px, 94vw); max-height: 86vh; overflow: hidden;
  background: #fff; border-radius: 14px; border: 1px solid #e9edf3;
  box-shadow: 0 24px 64px rgba(0,0,0,.25);
  display: grid; grid-template-rows: auto 1fr auto;
`;
const TermsHead = styled.div`
  padding: 12px 16px; border-bottom: 1px solid #eef1f4; display:flex; align-items:center; justify-content:space-between;
  h4{ margin:0; font-size:16px; color:${navy}; }
  button{ appearance:none; border:0; background:transparent; font-size:18px; cursor:pointer; color:#666; }
`;
const TermsBody = styled.div`
  padding: 12px 16px; overflow: auto; font-size:14px; color:#1f2937; line-height:1.7;
  .sep{ height:1px; background:#eef1f4; margin:12px 0; }
  ul{ margin:6px 0 10px 16px; padding:0; }
  li{ margin:2px 0; }
`;
const TermsFoot = styled.div`
  padding: 10px 16px; border-top: 1px solid #eef1f4; display:flex; justify-content:flex-end; gap:8px;
`;
const LinkBtn = styled.button`
  padding:0; border:0; background:transparent; cursor:pointer;
  color:${accent}; text-decoration:underline; text-underline-offset:3px; font-size:14px;
`;

function PaymentTermsModal({ open, onClose }) {
    if (!open) return null;
    return createPortal(
        <TermsBg onClick={onClose}>
            <TermsCard onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="전자상거래 이용약관">
                <TermsHead>
                    <h4>전자상거래 이용약관 (결제·환불)</h4>
                    <button onClick={onClose} aria-label="닫기">✕</button>
                </TermsHead>
                <TermsBody>
                    <h5>제1장 멤버십</h5>

                    <p><strong>제1조 (거래조건 안내)</strong><br />
                        멤버십의 종류, 혜택, 가격, 이용 기간, 환불 기준, 유의사항 등은 웹사이트와 안내문을 통해 사전에 고지하며, 회원은 결제 전에 이를 충분히 확인하여야 합니다.</p>

                    <div className="sep" />

                    <p><strong>제2조 (멤버십 가입)</strong><br />
                        멤버십 가입 절차는 다음과 같습니다. ① 멤버십 종류 선택 ② 회원 및 자녀 정보 확인 ③ 요금 결제 ④ 가입 완료 안내. 멤버십은 자녀 단위(child-scoped)로 관리되며, 선택된 자녀에 귀속됩니다.</p>

                    <div className="sep" />

                    <p><strong>제3조 (결제 방법)</strong><br />
                        회원은 회사가 제공하는 카드 결제, 간편결제, 가상계좌, 기타 회사가 정한 방법으로 결제할 수 있습니다. 결제 수단 제공사의 사정으로 일부 수단 이용이 제한될 수 있습니다.</p>

                    <div className="sep" />

                    <p><strong>제4조 (계약의 성립)</strong><br />
                        회사가 회원의 결제에 대해 승인한 시점에 계약이 성립합니다. 허위 정보 기재, 자격 요건 미충족 등 부정 사유가 확인될 경우 회사는 가입을 거절하거나 취소할 수 있습니다.</p>

                    <div className="sep" />

                    <p><strong>제5조 (멤버십 혜택)</strong></p>
                    <ul>
                        <li>주중 매일 2시간 돌봄 기본 이용 포함(정규/패밀리 멤버십 기준)</li>
                        <li>초과 이용 시 10분당 2,500원 추가 요금 부과</li>
                        <li>프로그램·키트 등 부가 상품 할인 제공(멤버십 종류별 상이)</li>
                        <li>픽업 서비스는 정규(아지트) 및 패밀리 멤버십 회원에 한해 신청 가능</li>
                    </ul>

                    <div className="sep" />

                    <p><strong>제6조 (만료)</strong><br />
                        멤버십 이용 기간이 종료되면 계약은 자동 종료되며 잔여 혜택(시간/금액/할인 등)은 소멸합니다. 기간형 상품의 종료 시각은 KST 자정 기준 배타(Exclusive)로 계산합니다.</p>

                    <div className="sep" />

                    <p><strong>제7조 (정규 멤버십[아지트, 패밀리] 해지 및 환불)</strong></p>
                    <p><em>① 회원의 해지 요청</em><br />
                        회원은 마이페이지의 ‘멤버십 해지’ 기능을 통해 언제든지 해지를 신청할 수 있습니다. 해지 시점에 따라 환불 가능 여부 및 이용 종료일은 아래 기준을 따릅니다.</p>
                    <p><em>② 결제일로부터 14일 이내 해지(일할 환불)</em></p>
                    <ul>
                        <li>가. 14일 이내 해지 요청 시, 이미 이용한 기간에 해당하는 금액을 공제한 후 잔여 금액을 환불합니다.</li>
                        <li>나. 환불금액 = 결제금액 − (이용일수 일할비용 × 환불 위약금 10%)</li>
                        <li>다. 해지 승인 시점부터 이용은 즉시 종료되며, 자동결제 등록분은 다음 회차부터 취소됩니다.</li>
                    </ul>
                    <p><em>③ 결제일로부터 14일 경과 후 해지(익월 적용)</em></p>
                    <ul>
                        <li>가. 14일 경과 후 해지 요청 시 환불은 불가합니다.</li>
                        <li>나. 회원은 이미 결제된 이용기간 종료일까지 서비스를 계속 이용할 수 있으며, 해지 예정일은 다음 결제일 전날로 처리됩니다.</li>
                        <li>다. 자동결제가 등록되어 있는 경우, 다음 결제는 자동 취소됩니다.</li>
                    </ul>
                    <p><em>④ 회사의 해지 권한</em><br />
                        회원이 본 약관 또는 관계 법령을 위반한 경우 회사는 즉시 멤버십을 해지할 수 있으며, 이 경우 환불은 불가합니다.</p>

                    <div className="sep" />

                    <p><strong>제8조 (기타 서비스 상품: 타임패스·정액권[Cashpass] 해지 및 환불)</strong></p>
                    <ul>
                        <li><em>① 구매 후 7일 이내 미사용 시 전액 환불 가능</em>
                            <ul>
                                <li>결제일로부터 7일 이내에 이용 내역(예약, 출석, 간식 교환, 프로그램 수강 등)이 전혀 없는 경우 전액 환불 가능합니다.</li>
                                <li>7일 경과 또는 1회라도 이용(예약 포함)이 발생한 경우 환불 불가합니다.</li>
                            </ul>
                        </li>
                        <li><em>② 법령 위반 또는 부정 사용 시</em>
                            <ul>
                                <li>부정 결제, 타인 명의 도용, 불법 전매 등의 사유가 확인될 경우 회사는 즉시 이용을 정지하며 환불은 불가합니다.</li>
                            </ul>
                        </li>
                        <li><em>③ 정규 멤버십 전환 시 타임패스 자동 해지</em>
                            <ul>
                                <li>타임패스 보유 상태에서 정규 멤버십(아지트/패밀리)을 신규 가입하는 경우, 타임패스는 자동 해지됩니다.</li>
                                <li>자동 해지 시 잔여 시간은 상품 별 정책(10분당 금액)에 따라 금액으로 환산되어 <strong>정액권(Cashpass)</strong>으로 자동 충전됩니다.</li>
                            </ul>
                        </li>
                    </ul>

                    <div className="sep" />

                    <p><strong>제9조 (양도 금지)</strong><br />
                        멤버십 및 서비스 이용 권리는 타인에게 양도, 증여, 담보 제공할 수 없습니다. 자녀 단위로 귀속된 권리는 해당 자녀에 한해 이용 가능합니다.</p>
                </TermsBody>
                <TermsFoot>
                    <button onClick={onClose} style={{ height: 38, padding: "0 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>닫기</button>
                </TermsFoot>
            </TermsCard>
        </TermsBg>,
        document.body
    );
}
/* ===== Component ===== */
export default function CheckoutConfirmDialog({
    open,
    onClose,
    payload: rawPayload,
    onCreateOrder, // (draft) => { ok, orderId }
    onPrepared, // ({ ok, orderId, test? })
    onAddChild,
}) {
    const [portalEl, setPortalEl] = useState(null);
    useEffect(() => {
        let el = document.getElementById("modal-root");
        if (!el) { el = document.createElement("div"); el.id = "modal-root"; document.body.appendChild(el); }
        setPortalEl(el);
    }, []);

    const {
        phoneE164: ctxPhone,
        profile: ctxProfile,
        memberships: ctxMemberships,
        children: ctxChildren,
        refresh,
    } = useUser() || {};

    const navigate = useNavigate();

    const payload = rawPayload ?? {};
    const product = payload.product ?? { id: "", name: "", kind: null, variant: "" };

    // kind only
    const kind = product.kind;
    const isPoints = kind === "points";
    const ALLOWED = useMemo(
        () => new Set([MEMBERSHIP_KIND.AGITZ, MEMBERSHIP_KIND.FAMILY, MEMBERSHIP_KIND.TIMEPASS, MEMBERSHIP_KIND.CASHPASS, "points"]),
        []
    );

    // ✅ 가격 설정(override 가능)
    const PRICING = payload?.pricing || {};
    const months = Number(payload?.months ?? 1);
    const AGITZ_PRICE_BASE = Number(PRICING?.agitz?.price ?? 59900);
    const FAMILY_PRICE_BASE = Number(PRICING?.family?.base ?? PRICING?.base ?? 59900);
    const FAMILY_ADD_DISCOUNT_RATE = Number(PRICING?.family?.addDiscountRate ?? 0.15); // 15%
    const FAMILY_MAX = Number(PRICING?.family?.max ?? PRICING?.max ?? 10); // 🔟 기본 최대 10명

    // ===== 가격 입력(legacy)
    const priceInput = payload.price ?? { subtotal: 0, discount: 0, total: 0 };

    // ===== 포인트 금액
    const [pointsAmount, setPointsAmount] = useState(() => {
        const fromPayload = Number((payload?.amount ?? payload?.price?.total) || 0);
        return fromPayload > 0 ? fromPayload : 10000;
    });

    /* ====== Buyer ====== */
    const [buyer, setBuyer] = useState({ name: "", phoneE164: "", email: "" });
    useEffect(() => {
        if (!open) return;

        const ctxName = (ctxProfile?.displayName || "").trim();
        const ctxPhoneE164 = (ctxPhone || "").trim();
        const ctxEmail = (ctxProfile?.email || "").trim();

        const pBuyer = (payload?.buyer ?? {});
        const pName = (pBuyer?.name || "").trim();
        const pPhone = (pBuyer?.phoneE164 || "").trim();
        const pEmail = (pBuyer?.email || "").trim();

        setBuyer(prev => ({
            name: prev.name || pName || ctxName,
            phoneE164: prev.phoneE164 || pPhone || ctxPhoneE164,
            email: prev.email || pEmail || ctxEmail,
        }));


    }, [open, ctxPhone, ctxProfile, payload]);

    // 최종 사용값
    const effectivePhoneE164 = (buyer?.phoneE164 || ctxPhone || payload?.buyer?.phoneE164 || "").trim();
    const effectiveName = (buyer?.name || ctxProfile?.displayName || "").trim();
    const effectiveEmail = (buyer?.email || ctxProfile?.email || "").trim();

    /* ====== State ====== */
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ====== 데이터 소스 ====== */
    const childrenSrc = useMemo(() => Array.isArray(ctxChildren) ? ctxChildren : [], [ctxChildren]);

    // 레거시 컨텍스트(참조만)
    const agitzAppliedSetCtx = useMemo(() => {
        const list = ctxMemberships?.agitzList || (ctxMemberships?.agitz?.childId ? [ctxMemberships.agitz.childId] : []);
        return new Set(list || []);
    }, [ctxMemberships]);
    const familyAppliedSetCtx = useMemo(() => new Set(ctxMemberships?.family?.childIds || []), [ctxMemberships]);

    /* ====== DB 스냅샷 ====== */
    const [dbLoading, setDbLoading] = useState(false);
    const [dbChildren, setDbChildren] = useState([]);
    const [dbAgitzSet, setDbAgitzSet] = useState(() => new Set());
    const [dbFamilySet, setDbFamilySet] = useState(() => new Set());
    const dbLoaded = useMemo(() => !dbLoading && !!effectivePhoneE164, [dbLoading, effectivePhoneE164]);

    const readChildrenByPhone = useCallback(async (phoneE164) => {
        const col = collection(db, "members", phoneE164, "children");
        const snap = await getDocs(col);
        const list = [];
        snap.forEach(d => { const v = d.data() || {}; list.push({ childId: v.childId || d.id, ...v }); });
        return list;
    }, []);

    const readActiveSet = useCallback(async (phoneE164, kindName) => {
        const col = collection(db, "members", phoneE164, "memberships");
        const qy = query(
            col,
            where("kind", "==", kindName),
            where("status", "in", [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.FUTURE])
        );
        const snap = await getDocs(qy);
        const set = new Set();
        snap.forEach(d => { const v = d.data() || {}; if (v.childId) set.add(v.childId); });
        return set;
    }, []);

    const refreshDbSnapshot = useCallback(async () => {
        if (!effectivePhoneE164) return;
        setDbLoading(true);
        try {
            const [children, agitz, family] = await Promise.all([
                readChildrenByPhone(effectivePhoneE164),
                readActiveSet(effectivePhoneE164, "agitz"),
                readActiveSet(effectivePhoneE164, "family"),
            ]);
            setDbChildren(children || []);
            setDbAgitzSet(agitz || new Set());
            setDbFamilySet(family || new Set());
        } finally {
            setDbLoading(false);
        }
    }, [effectivePhoneE164, readChildrenByPhone, readActiveSet]);

    useEffect(() => {
        if (!open) return;
        if (!effectivePhoneE164) return;
        refreshDbSnapshot();
    }, [open, effectivePhoneE164, refreshDbSnapshot]);

    /* ====== 선택 상태 (FAMILY = 다중) ====== */
    const [selectedChildIds, setSelectedChildIds] = useState([]);



    const childrenForUI = dbLoaded ? dbChildren : childrenSrc;
    const agitzAppliedSet = dbLoaded ? dbAgitzSet : agitzAppliedSetCtx;
    const familyAppliedSet = dbLoaded ? dbFamilySet : familyAppliedSetCtx;


    const effectiveSelectedChildIds = useMemo(() => {
        if (kind === MEMBERSHIP_KIND.FAMILY || kind == MEMBERSHIP_KIND.AGITZ) {
            return selectedChildIds.filter(id => !(familyAppliedSet.has(id) || agitzAppliedSet.has(id)));
        }
        // ✅ TIMEPASS/CASHPASS/POINTS는 필터링 없음
        return selectedChildIds;
    }, [selectedChildIds, kind, familyAppliedSet, agitzAppliedSet]);


    // 초기 선택: 미적용 자녀 우선
    useEffect(() => {
        const list = childrenForUI || [];
        if (!list.length) { setSelectedChildIds([]); return; }

        if (kind === MEMBERSHIP_KIND.FAMILY) {
            // FAMILY: 초기엔 미적용 자녀 한 명만 체크
            const first = list.find(c => !familyAppliedSet.has(c.childId)) || list[0];
            setSelectedChildIds(first?.childId ? [first.childId] : []);
            return;
        }

        // 단일형(AGITZ/TIMEPASS/CASHPASS/POINTS): 첫 자녀 하나
        const first =
            (kind === MEMBERSHIP_KIND.AGITZ ? (list.find(c => !agitzAppliedSet.has(c.childId)) || list[0]) : list[0]);
        setSelectedChildIds(first?.childId ? [first.childId] : []);
        // eslint-disable-next-line react-hooks/exhaustive-deps


    }, [kind, dbLoaded, childrenForUI.length, agitzAppliedSet.size, familyAppliedSet.size]);


    useEffect(() => {
        if (kind === MEMBERSHIP_KIND.FAMILY) {
            setSelectedChildIds(prev =>
                prev.filter(id => !(familyAppliedSet.has(id) || agitzAppliedSet.has(id)))
            );
        }
    }, [kind, familyAppliedSet, agitzAppliedSet]);


    const showChildSection = true; // 항상 노출

    /* ===== 가격 계산 ===== */
    const priceCalc = useMemo(() => {
        if (isPoints) {
            return {
                subtotal: pointsAmount,
                discount: 0,
                total: pointsAmount,
                meta: { kind },
            };
        }

        if (kind === MEMBERSHIP_KIND.TIMEPASS) {
            const tpTotal = Number(payload?.price?.total ?? priceInput?.total ?? 0);
            return {
                subtotal: tpTotal,
                discount: 0,
                total: tpTotal,
                meta: { kind },
            };
        }

        if (kind === MEMBERSHIP_KIND.AGITZ) {
            const sub = Math.round(AGITZ_PRICE_BASE * months);
            return {
                subtotal: sub,
                discount: 0,
                total: sub,
                meta: { kind, months },
            };
        }

        if (kind === MEMBERSHIP_KIND.FAMILY) {
        
            const n = effectiveSelectedChildIds.length;

            if (n <= 0) {
                return { subtotal: 0, discount: 0, total: 0, meta: { kind, months, n } };
            }
            const base = FAMILY_PRICE_BASE;
            const firstCount = Math.min(1, n);
            const addCount = Math.max(0, n - 1);
            const subUnit = base * n;
            const discUnit = Math.round(base * FAMILY_ADD_DISCOUNT_RATE * addCount);
            const sub = Math.round(subUnit * months);
            const disc = Math.round(discUnit * months);
            const tot = sub - disc;

            return {
                subtotal: sub,
                discount: disc,
                total: tot,
                meta: { kind, months, n, base, addRate: FAMILY_ADD_DISCOUNT_RATE },
            };
        }

        // 기타(CASHPASS 등): legacy 입력 활용
        const baseSubtotal = Number(priceInput.subtotal ?? priceInput.total ?? 0);
        const baseDiscount = Number(priceInput.discount ?? 0);
        const sub = baseSubtotal;
        const disc = baseDiscount;
        const tot = sub - disc;
        return { subtotal: sub, discount: disc, total: tot, meta: { kind } };


    }, [
        isPoints, pointsAmount,
        kind, payload, priceInput,
        AGITZ_PRICE_BASE, months,
        FAMILY_PRICE_BASE, FAMILY_ADD_DISCOUNT_RATE,
        selectedChildIds.length
    ]);

    const { subtotal, discount, total } = priceCalc;

    /* ===== 결제 가능 조건 ===== */
    const canPay = useMemo(() => {
        if (!agree || loading) return false;
        if (!(total > 0)) return false;
        if (!childrenForUI.length) return false;
        if (!selectedChildIds.length) return false;

        // 중복 가드(선택된 것 중 이미 적용된 자녀가 있으면 불가)
        if (kind === MEMBERSHIP_KIND.AGITZ) {
            const target = selectedChildIds[0];
            if (!target || agitzAppliedSet.has(target)) return false;
        }
 
        if (kind === MEMBERSHIP_KIND.FAMILY) {
            if (!effectiveSelectedChildIds.length) return false;
            if (effectiveSelectedChildIds.length > FAMILY_MAX) return false;
        }

        if (kind === MEMBERSHIP_KIND.TIMEPASS) {
            const m = resolveTimepassMinutes(product, payload);
            if (!(m > 0)) return false;
        }
        return true;


    }, [
        agree, loading, total,
        childrenForUI.length, selectedChildIds,
        kind, agitzAppliedSet, familyAppliedSet,
        FAMILY_MAX, product, payload
    ]);

    const fail = (code, msg) => ({ ok: false, code, message: msg });

    // === 사전검증 ===
    const preflightValidateDb = useCallback(() => {
        if (!ALLOWED.has(kind)) return fail("invalid_kind", "상품 종류(kind) 정보가 올바르지 않습니다.");
        if (!effectivePhoneE164) return fail("no_phone", "로그인이 필요합니다.");
        if (!agree) return fail("terms_not_agreed", "결제 약관에 동의해 주세요.");
        if (!(total > 0)) return fail("invalid_amount", "결제 금액이 올바르지 않습니다.");

        if (!childrenForUI.length) return fail("child_required", "자녀를 먼저 등록해 주세요.");
        if (!selectedChildIds.length) return fail("child_not_selected", "적용할 자녀를 선택해 주세요.");
        const ownAll = selectedChildIds.every(id => childrenForUI.find(c => c.childId === id));
        if (!ownAll) return fail("child_not_owned", "선택한 자녀를 찾을 수 없습니다.");

        if (kind === MEMBERSHIP_KIND.AGITZ) {
            const id = selectedChildIds[0];
            if (agitzAppliedSet.has(id)) return fail("agitz_child_already_applied", "이미 정규 멤버십이 적용된 자녀입니다.");
        }


    
        if (kind === MEMBERSHIP_KIND.FAMILY) {
            if (selectedChildIds.length > FAMILY_MAX)
                return fail("family_over_quota", `패밀리 멤버십은 최대 ${FAMILY_MAX}명까지 선택할 수 있습니다.`);
            if (selectedChildIds.some(id => familyAppliedSet.has(id) || agitzAppliedSet.has(id)))
                return fail("family_child_already_applied", "이미 정규/패밀리 멤버십이 적용된 자녀가 포함되어 있습니다.");
        }


        if (kind === MEMBERSHIP_KIND.TIMEPASS) {
            const minutes = resolveTimepassMinutes(product, payload);
            if (!(minutes > 0)) return fail("timepass_minutes_invalid", "시간권 분 설정이 올바르지 않습니다.");
        }
        return { ok: true };


    }, [
        ALLOWED, kind, effectivePhoneE164, agree, total,
        childrenForUI, selectedChildIds, agitzAppliedSet, familyAppliedSet,
        FAMILY_MAX, product, payload
    ]);

    const preflightValidate = useCallback(() => preflightValidateDb(), [preflightValidateDb]);

    // Dev 테스트 번호 범위
    const DEV_TEST_START = "01062141000";
    const DEV_TEST_END = "01062142000";
    const DEV_TEST_EXTRA = "01039239669";
    function isDevTestPhoneLocal(localDigits) {
        if (!localDigits) return false;
        return (localDigits >= DEV_TEST_START && localDigits <= DEV_TEST_END) || (localDigits === DEV_TEST_EXTRA);
    }

    function mapKindToOrderType(k) {
        if (k === MEMBERSHIP_KIND.AGITZ) return ORDER_TYPE.AGITZ;
        if (k === MEMBERSHIP_KIND.FAMILY) return ORDER_TYPE.FAMILY;
        if (k === MEMBERSHIP_KIND.TIMEPASS) return ORDER_TYPE.TIMEPASS;
        if (k === MEMBERSHIP_KIND.CASHPASS) return ORDER_TYPE.CASHPASS;
        if (k === "points") return ORDER_TYPE.POINTS;
        return null;
    }

    function buildDraft(rawE164) {
        const type = mapKindToOrderType(kind);
        const minutesForTimepass = kind === MEMBERSHIP_KIND.TIMEPASS
            ? resolveTimepassMinutes(product, payload) : 0;

        // FAMILY는 다중 자녀: children 배열에 담고, childId는 첫 번째(호환)
        const draft = {
            type, // ORDER_TYPE.*
            childId: effectiveSelectedChildIds[0] || null,
            children: kind === MEMBERSHIP_KIND.FAMILY ? effectiveSelectedChildIds : undefined,
            months:
                (type === ORDER_TYPE.AGITZ || type === ORDER_TYPE.FAMILY)
                    ? Number(payload.months ?? 1)
                    : (type === ORDER_TYPE.CASHPASS ? Number(payload.months ?? 0) : 0),
            minutes: type === ORDER_TYPE.TIMEPASS ? Number(minutesForTimepass || 0) : 0,
            amountKRW: Number(isPoints ? pointsAmount : total) || 0,
            product: { id: product?.id || "", name: product?.name || "", variant: product?.variant || "" },
            provider: { name: "bootpay" },
            buyer: {
                name: (buyer?.name || rawE164?.slice(-4)) || "",
                phoneE164: rawE164 || "",
                email: buyer?.email || "",
            },
            meta: {
                pricing: PRICING || null,
                familyMax: FAMILY_MAX,
                calc: priceCalc.meta || {},
            }
        };
        return sanitizeForFirestore(draft);


    }

    // 결제 처리
    const appId = (process.env.REACT_APP_BOOTPAY_WEB_APP_ID || "").trim();
    const BOOTPAY_PG = (process.env.REACT_APP_BOOTPAY_PG || "").trim();
    const BOOTPAY_METHODS = (process.env.REACT_APP_BOOTPAY_METHODS || "")
        .split(",").map(s => s.trim()).filter(Boolean);

    const handlePay = async () => {
        await refreshDbSnapshot();
        const v = preflightValidate();
        if (!v.ok) { alert(v.message || "결제 조건을 만족하지 않습니다."); return; }

        const rawE164 = effectivePhoneE164;
        const localPhone = toLocalDigitsFromAny(rawE164);
        const devMode = isDevTestPhoneLocal(localPhone);

        setLoading(true);
        try {
            const draft = buildDraft(rawE164);

            let orderRes = { ok: true, orderId: `ord_${Date.now()}` };
            if (typeof onCreateOrder === "function") {
                orderRes = await onCreateOrder(draft);
            } else {
                orderRes = await createOrderDraft(rawE164, draft);
            }
            if (!orderRes?.ok || !orderRes?.orderId) {
                alert(orderRes?.error?.message || "주문 생성 실패");
                setLoading(false);
                return;
            }
            const orderId = orderRes.orderId;

            // 개발/테스트: PG 생략
            if (devMode) {
                try { await markOrderPaid({ phoneE164: rawE164, orderId, provider: { name: "dev", payload: { dev: true } } }); }
                catch (err) { console.error("[Checkout] markOrderPaid(dev) error", err); alert(String(err?.message || err)); setLoading(false); return; }
                try { await refresh?.(); } catch { }
                if (onPrepared) await onPrepared({ ok: true, orderId, test: true });
                alert("테스트 결제가 완료되었습니다.");
                onClose?.();
                setLoading(false);
                return;
            }

            // 운영: Bootpay
            if (!appId) { alert("결제 설정(App ID)이 필요합니다. REACT_APP_BOOTPAY_WEB_APP_ID를 설정하세요."); setLoading(false); return; }

            const response = await Bootpay.requestPayment({
                application_id: appId,
                price: Number(isPoints ? pointsAmount : total) || 0,
                order_name: product?.name || "-",
                order_id: orderId,
                ...(BOOTPAY_PG ? { pg: BOOTPAY_PG } : {}),
                ...(BOOTPAY_METHODS.length ? { methods: BOOTPAY_METHODS } : {}),
                user: {
                    id: localPhone || "guest",
                    username: effectiveName || `회원-${String(rawE164 || "").slice(-4)}`,
                    phone: localPhone,
                    email: effectiveEmail || "",
                },
                items: [{
                    id: product?.id || kind,
                    name: product?.name || kind,
                    qty: kind === MEMBERSHIP_KIND.FAMILY ? Math.max(1, selectedChildIds.length) : 1,
                    price: Number(isPoints ? pointsAmount : total) || 0
                }],
                metadata: sanitizeForFirestore({
                    productId: product?.id || "",
                    kind,
                    variant: product?.variant || "",
                    childId: selectedChildIds[0] || null,
                    childIds: kind === MEMBERSHIP_KIND.FAMILY ? selectedChildIds : undefined,
                    pricing: PRICING || null
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

            if (response?.event === "cancel") { alert("결제가 취소되었습니다."); setLoading(false); return; }
            if (response?.event === "error") { alert(response?.message || "결제 중 오류가 발생했습니다."); setLoading(false); return; }
            if (response?.event === "issued") { alert("가상계좌가 발급되었습니다. 안내에 따라 입금해 주세요."); setLoading(false); onClose?.(); return; }

            if (response?.event === "done") {
                await refreshDbSnapshot();
                const v2 = preflightValidate();
                if (!v2.ok) { alert(v2.message || "결제 후 처리 검증 실패"); setLoading(false); return; }

                try {
                    await markOrderPaid({
                        phoneE164: rawE164,
                        orderId,
                        provider: { name: "bootpay", txnId: response?.data?.receipt_id, payload: response },
                    });
                } catch (err) {
                    console.error("[Checkout] markOrderPaid(prod) error", err);
                    alert(String(err?.message || err));
                    setLoading(false);
                    return;
                }

                try { await refresh?.(); } catch { }
                if (onPrepared) await onPrepared({ ok: true, orderId });
                alert("결제가 완료되었습니다.");
                onClose?.();
                setLoading(false);
                return;
            }

            setLoading(false);
        } catch (e) {
            if (e?.event === "cancel") alert("결제가 취소되었습니다.");
            else alert(e?.message || "결제 중 오류가 발생했습니다.");
            setLoading(false);
        }


    };

    const [termsOpen, setTermsOpen] = useState(false);
    if (!open || !portalEl) return null;

    /** 전 타입 공통 자녀 선택/추가 UI — FAMILY=체크박스, 그 외=라디오 */
    const renderChildPick = () => {
        if (!childrenForUI.length) {
            return (
                <>
                    <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 10 }}>
                        등록된 자녀가 없습니다. 추가해 주세요.
                    </div>
                    <AddChildBox>
                        <AddChildBtn type="button" onClick={() => (typeof onAddChild === "function" ? onAddChild() : navigate("/mypage"))}>
                            + 자녀 추가
                        </AddChildBtn>
                    </AddChildBox>
                </>
            );
        }

        const isFamily = kind === MEMBERSHIP_KIND.FAMILY;

        const toggleFamily = (id, disabled) => {
            if (disabled) return;
            setSelectedChildIds(prev => {
                const has = prev.includes(id);
                if (has) return prev.filter(x => x !== id);
                const next = [...prev, id];
                if (next.length > FAMILY_MAX) {
                    alert(`최대 ${FAMILY_MAX}명까지 선택 가능합니다.`);
                    return prev;
                }
                return next;
            });
        };

        const pickSingle = (id, disabled) => {
            if (disabled) return;
            setSelectedChildIds([id]);
        };

        return (
            <>
                <div style={{ display: "grid", gap: 8 }}>
                    {childrenForUI.map((c) => {
                        const alreadyAgitz = agitzAppliedSet.has(c?.childId);
                        const alreadyFamily = familyAppliedSet.has(c?.childId);

                        const disabledForKindBase =
                            (kind === MEMBERSHIP_KIND.AGITZ && alreadyAgitz) ||
                            (kind === MEMBERSHIP_KIND.FAMILY && (alreadyFamily || alreadyAgitz));

                        const forceEnable =
                            kind === MEMBERSHIP_KIND.CASHPASS || // 정액권
                            kind === MEMBERSHIP_KIND.TIMEPASS || // 시간권
                            kind === "points";                   // 포인트(정액권 UI)

                        const disabledForKind = forceEnable ? false : disabledForKindBase;
              
                        
                        const checked = effectiveSelectedChildIds.includes(c?.childId);

                        let statusBadge = null;
                        if (alreadyAgitz) statusBadge = <Badge>정규 가입됨</Badge>;
                        if (alreadyFamily) statusBadge = <Badge>패밀리 가입됨</Badge>;

                        return (
                            <div
                                key={c?.childId}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    alignItems: "center",
                                    padding: "10px 12px",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: 10,
                                    opacity: disabledForKind ? 0.6 : 1,
                                }}
                            >
                                <div className="name" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <span>{c?.name || "(이름 없음)"} <span className="meta" style={{ color: "#6b7280", fontSize: 12 }}>{c?.birth || ""}</span></span>
                                    {statusBadge}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {isFamily ? (
                                        <input
                                            type="checkbox"
                                            disabled={disabledForKind}
                                            checked={checked}
                                            onChange={() => toggleFamily(c?.childId, disabledForKind)}
                                        />
                                    ) : (
                                        <input
                                            type="radio"
                                            name="child_pick"
                                            disabled={disabledForKind}
                                            checked={checked}
                                            onChange={() => pickSingle(c?.childId, disabledForKind)}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <AddChildBox>
                    <AddChildBtn
                        type="button"
                        onClick={() => (typeof onAddChild === "function" ? onAddChild() : navigate("/mypage"))}
                    >
                        + 자녀 추가
                    </AddChildBtn>
                </AddChildBox>
            </>
        );


    };

    return createPortal(
        <>
            <Backdrop onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
                <Dialog role="dialog" aria-modal="true">
                    <Header>
                        <h3>결제 확인</h3>
                        <button aria-label="닫기" onClick={onClose}>✕</button>
                    </Header>

                    <Body>
                        <div style={{ display: "grid", gap: 12 }}>
                            <OrderCard>
                                <CardTitle>주문 요약</CardTitle>
                                <Row><span className="label">상품</span><span className="val">{product?.name || "-"}</span></Row>
                                <Row><span className="label">구매자</span><span className="val">{toLocalDigitsFromAny(effectivePhoneE164) || "-"}</span></Row>
                                {kind === MEMBERSHIP_KIND.FAMILY && (
                                    <Row><span className="label">선택 자녀</span><span className="val">{selectedChildIds.length}명</span></Row>
                                )}
                                {(kind === MEMBERSHIP_KIND.AGITZ || kind === MEMBERSHIP_KIND.FAMILY) && (
                                    <Row><span className="label">기간</span><span className="val">{months}개월</span></Row>
                                )}
                            </OrderCard>

                            {/* 포인트 충전 섹션 */}
                            {isPoints && (
                                <Card>
                                    <CardTitle>충전 금액 선택</CardTitle>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                                        {POINT_PACKS.map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => setPointsAmount(v)}
                                                style={{
                                                    height: 44, minWidth: 60, padding: '0 12px',
                                                    borderRadius: 12, whiteSpace: 'nowrap',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, border: pointsAmount === v ? '2px solid #1236D0' : '1px solid #E5E7EB',
                                                    background: pointsAmount === v ? 'rgba(18,54,208,0.06)' : '#fff',
                                                }}
                                            >
                                                {v.toLocaleString()}원
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* 자녀 선택/추가 */}
                            <ChildrenWrap>
                                <CardTitle>자녀 연결</CardTitle>
                                {renderChildPick()}
                                {kind === MEMBERSHIP_KIND.FAMILY && (
                                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                        최대 {FAMILY_MAX}명까지 선택할 수 있어요. 2번째 자녀부터 각 {Math.round(FAMILY_ADD_DISCOUNT_RATE * 100)}% 할인 적용.
                                    </div>
                                )}
                            </ChildrenWrap>
                        </div>

                        <AmountBox>
                            <CardTitle>결제 금액</CardTitle>
                            <div className="line"><span>상품금액</span><span className="v">{KRW(subtotal + discount)}원</span></div>
                            {discount > 0 && <div className="line discount"><span>할인금액</span><span className="v">- {KRW(discount)}원</span></div>}
                            <div className="sep" />
                            <div className="total">
                                <div className="tt">총 결제금액</div>
                                <div className="price">{KRW(isPoints ? pointsAmount : total)}원</div>
                            </div>
                            <div className="totalSub" style={{ marginTop: 4 }} />
                        </AmountBox>
                    </Body>

                    <Footer>
                        <AgreeLine>
                            <input id="agree1" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                            <span>
                                <LinkBtn type="button" onClick={() => setTermsOpen(true)}>전자상거래 이용약관(결제·환불)</LinkBtn>에 동의합니다 (필수)
                            </span>
                        </AgreeLine>
                        <PayBtn type="button" disabled={!canPay || dbLoading} onClick={handlePay}>
                            {loading ? "결제 진행 중…" : (dbLoading ? "검증 중…" : "결제하기")}
                        </PayBtn>
                    </Footer>
                </Dialog>
            </Backdrop>

            <PaymentTermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
        </>,
        portalEl


    );
}