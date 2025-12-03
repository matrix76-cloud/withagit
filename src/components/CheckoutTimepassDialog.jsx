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

/* ===== 상세정보 탭 스타일 ===== */
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

/* ===== 2시간권 / 4시간권 이미지 카드 ===== */

/* 한 줄에 두 개, 적당한 크기 */
const PassRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 140px);  /* ✅ 카드 폭 140px x 2 */
  justify-content: center;
  gap: 18px;
  margin-bottom: 24px;

  @media (max-width: 360px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

/* 바깥 박스 느낌 제거 */
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

/* 이미지 크기 줄이기 */
const PassImage = styled.img`
  width: 70px;        /* ✅ 카드 폭(140px)의 절반 정도 */
  height: auto;
  border-radius: 20px;
  object-fit: contain;
`;


/* 2시간권 / 4시간권 — bold 제거 유지 */
const PassLabel = styled.div`
  font-size: 14px;
  font-weight: 400;   /* 일반 두께 */
  color: #111827;
  text-align: center;
`;

const PassPrice = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  text-align: center;
`;





const BenefitEmoji = styled.span`
  font-size: 16px;
  line-height: 1.4;
`;

const BenefitText = styled.span`
  line-height: 1.7;
`;



/* ===== 구매하기 탭 스타일 ===== */
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
  overflow: hidden;      /* 🔸 안쪽 요소가 바깥 라운드에 딱 붙게 */
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
  margin: 0 0 8px;   /* 양 옆 꽉 채우게 */
`;

const AddChildRow = styled.button`
  width: calc(100% - 24px);             /* 카드 안에서 살짝 안으로 들어오게 */
  margin: 8px 12px 10px;
  padding: 8px 14px 9px;                /* 🔸 높이 살짝 줄임 */
  border-radius: 999px;                 /* 알약 라운드 */
  border: 1px dashed #facc15;
  background: #fff9e6;
  font-size: 13px;
  font-weight: 700;
  color: #b45309;                       /* 피그마 느낌 진한 주황 */
  display: flex;
  align-items: center;
  justify-content: flex-start;          /* 왼쪽 정렬 */
  gap: 6px;                             /* + 와 글자 사이 간격 → 글씨를 오른쪽으로 */
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

/* 자녀 드롭다운 */
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

/* ===== Footer CTA ===== */
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

const PurchaseWrap = styled.div`
  padding: 0 18px;
`;



/* ===== 혜택 포인트 / 확인하세요! 카드 ===== */

/* 회색 박스 바깥 제목 */
const SectionTitle = styled.h4`
  margin: 24px 0 10px;
  font-size: 15px;
  font-weight: 900;
  color: #111827;
`;

/* 회색 박스(혜택, 확인 공용) */
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

/* 혜택 포인트용 체크 리스트 아이템 */
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

/* 확인하세요!용 도트 리스트 */
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
/* 카드 안 제목 (혜택 포인트 / 확인하세요! 공용) */
const CardTitle = styled.div`
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 900;
  color: #111827;
`;




const BenefitTitle = styled.div`
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 900;
  color: #111827;
`;



/* 확인하세요! 카드 (제목 포함) */
const CheckCard = styled.div`
  margin-top: 22px;
  padding: 16px 18px 14px;
  border-radius: 24px;
  background: #f3f4f6;
`;

const CheckTitle = styled.div`
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 900;
  color: #111827;
`;



/* ===== 타임패스 옵션 ===== */
const TIMEPASS_OPTIONS = [
  { key: "2h", label: "2시간권 (25,000원)", hours: "2h", minutes: 120, price: 25000 },
  { key: "4h", label: "4시간권 (45,000원)", hours: "4h", minutes: 240, price: 45000 },
];

const KRW = (n = 0) => n.toLocaleString("ko-KR");

/* util: 전화번호, dev test, sanitize */

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

const accent = "var(--color-accent, #F07A2A)";
const navy = "#1A2B4C";
const line = "rgba(0,0,0,.10)";
const blueBtn = "#1236D0";
const blueBtnDark = "#0E2CAE";
const POINT_PACKS = [10000, 20000, 30000, 40000, 50000];

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

function mapKindToOrderType(k) {
  if (k === MEMBERSHIP_KIND.TIMEPASS) return ORDER_TYPE.TIMEPASS;
  return null;
}

export default function CheckoutTimepassDialog({
  open,
  onClose,
  onProceed, // (result) => { ok, orderId, payload } (optional)
}) {
  const [portalEl, setPortalEl] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");
  const [selectedKey, setSelectedKey] = useState("2h");

  const [selectedChildLabel, setSelectedChildLabel] = useState("선택해주세요");
  const [selectedOptionLabel, setSelectedOptionLabel] = useState("선택해주세요");

  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { children: ctxChildren, phoneE164, profile, refresh } = useUser() || {};

  const children = useMemo(
    () => (Array.isArray(ctxChildren) ? ctxChildren : []),
    [ctxChildren]
  );

  const handleGoToBuy = () => {
    // 상세 탭에서 CTA 누르면 "구매하기" 탭으로만 전환
    setActiveTab("buy");
  };

  const [termsOpen, setTermsOpen] = useState(false); // 약관 모달
  

  useEffect(() => {
    let el = document.getElementById("modal-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "modal-root";
      document.body.appendChild(el);
    }
    setPortalEl(el);
  }, []);

 useEffect(() => {
  if (!open) return;
  setSelectedKey("2h");
  setActiveTab("detail");
  setChildDropdownOpen(false);
  setLoading(false);

  setSelectedChildId(null);
  setSelectedChildLabel("선택해주세요");

  const base = TIMEPASS_OPTIONS.find((o) => o.key === "2h");
  setSelectedOptionLabel(base ? base.label : "선택해주세요");
}, [open, children]);

  if (!open || !portalEl) return null;

  const selected =
    TIMEPASS_OPTIONS.find((o) => o.key === selectedKey) || TIMEPASS_OPTIONS[0];

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

    // 주문 드래프트 – TIMEPASS 전용
    const draft = sanitizeForFirestore({
      type,                       // ORDER_TYPE.TIMEPASS
      childId: selectedChildId,   // child-scoped
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
        calc: { kind },          // 기존 구조 호환용
      },
    });

    console.groupCollapsed("[TimepassCheckout] draft 생성");
    console.log("phoneE164", rawE164);
    console.log("childId", selectedChildId);
    console.log("draft", draft);
    console.groupEnd();

    setLoading(true);

    try {
      const orderRes = await createOrderDraft(rawE164, draft);
      console.log("[TimepassCheckout] createOrderDraft 결과", orderRes);

      // 🔥 여기서부터는 ok 안 보고 orderId만 확인
      const orderId = orderRes?.orderId;
      if (!orderId) {
        console.error("[TimepassCheckout] 주문 생성 실패 상세", orderRes);
        alert(orderRes?.error?.message || "주문 생성에 실패했습니다.");
        setLoading(false);
        onProceed?.({ ok: false, stage: "createOrder", error: orderRes });
        return;
      }

      // ===== dev/test: Bootpay 생략 =====
      if (devMode) {
        console.log("[TimepassCheckout] dev 모드, Bootpay 생략");
        await markOrderPaid({
          phoneE164: rawE164,
          orderId,
          provider: { name: "dev", payload: { dev: true, kind: "timepass" } },
        });
        console.log("[TimepassCheckout] markOrderPaid(dev) 완료");

        try {
          await refresh?.();
        } catch (e) {
          console.warn("[TimepassCheckout] refresh 실패", e);
        }

        alert("테스트 결제가 완료되었습니다.");
        onProceed?.({ ok: true, test: true, orderId, payload });
        onClose?.();
        setLoading(false);
        return;
      }

      // ===== 운영: Bootpay 호출 =====
      if (!appId) {
        alert(
          "결제 설정(App ID)이 필요합니다. REACT_APP_BOOTPAY_WEB_APP_ID를 설정해 주세요."
        );
        setLoading(false);
        return;
      }

      console.log("[TimepassCheckout] Bootpay.requestPayment 호출");
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

      console.log("[TimepassCheckout] Bootpay 응답", response);

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
          console.log("[TimepassCheckout] markOrderPaid(prod) 완료");
        } catch (err) {
          console.error("[TimepassCheckout] markOrderPaid(prod) 실패", err);
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
          console.warn("[TimepassCheckout] refresh 실패", e);
        }

        alert("결제가 완료되었습니다.");
        onProceed?.({ ok: true, stage: "done", orderId, payload, response });
        onClose?.();
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (e) {
      console.error("[TimepassCheckout] 예외 발생", e);
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

    {/* ✅ 제목이 박스 ‘밖에’ */}
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
      <BuyTitle>타임패스 멤버십 </BuyTitle>
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
          <span>{selectedChildId ? selectedChildLabel : "선택해주세요"}</span>
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
                  <span className="name">{c.name || "(이름 없음)"}</span>
                  {c.birth ? (
                    <span className="meta">{c.birth}</span>
                  ) : null}
                </ChildItemButton>
              ))}
            </ChildDropdown>
          </>
        )}

        <AddChildRow
            onClick={() => {
            onClose?.();

            // 화면 폭 기준으로 간단하게 모바일 판별
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
            // 간단 토글: 2h ↔ 4h
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
        <Dialog role="dialog" aria-modal="true" aria-label="타임패스 멤버십 상세">
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
                ? "타임패스 이용하기" // ✅ 상세 탭: 결제 안 하고 탭만 전환
                : loading
                  ? "결제 진행 중…"
                  : `결제 하기`}
            </CTAButton>
          </Footer>

        </Dialog>
      </Backdrop>,

      {/* 🔥 전자상거래 이용약관(결제·환불) 팝업 */}
      < PaymentTermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    
    </>,
    portalEl
  );
}
