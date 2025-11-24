/* eslint-disable */
// /src/components/modal/TermsModal.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: grid; place-items: center; z-index: 9999;
`;

const Sheet = styled.div`
  width: min(920px, 92vw);
  max-height: min(88vh, 880px);
  background: #fff; border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
  display: grid; grid-template-rows: auto 1fr auto;
  overflow: hidden;
`;

const Head = styled.header`
  padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06);
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
`;
const Title = styled.h2`
  margin: 0; font-size: 18px; color: #1A2B4C; letter-spacing: -.2px;
`;
const Body = styled.div`
  padding: 18px 20px; overflow: auto; color: #111; line-height: 1.65;
`;
const Foot = styled.footer`
  padding: 12px 20px; border-top: 1px solid rgba(0,0,0,.06);
  display: flex; justify-content: flex-end; gap: 8px;
`;
const Btn = styled.button`
  height: 40px; padding: 0 14px; border-radius: 10px; border: 1px solid #E5E7EB;
  background: #fff; color: #111; cursor: pointer;
  &:hover { background: #FAFAFA; }
`;
const Primary = styled(Btn)`
  background: #e47b2c; color: #fff; border-color: transparent; font-weight: 900;
  &:hover { filter: brightness(.98); }
`;

function useBodyLock(open) {
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);
}
// /src/components/modal/TermsModal.jsx 내
function ServiceTerms() {
    return (
        <div>
            <h3 style={{ margin: "0 0 8px" }}>위드아지트 서비스 이용약관(요약)</h3>

            {/* 제1장 총칙 */}
            <h4 style={{ margin: "10px 0 6px" }}>제1장 총칙</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li><b>목적:</b> 회사가 제공하는 멤버십·돌봄·프로그램·픽업 서비스 이용과 관련한 회원/회사의 권리·의무 규정</li>
                <li><b>용어:</b> 이용자/회원/비회원/멤버십 회원/서비스/아지트/운영일/콘텐츠 등 정의</li>
                <li><b>게시·개정:</b> 약관 및 회사 정보 게시, 개정 시 사전 안내(중요 변경 최소 30일 전 고지), 거부 시 탈퇴 가능</li>
                <li><b>준칙·통지:</b> 세부 운영정책·공지사항 준수, 회원 개별/전체 통지 절차</li>
                <li><b>의무:</b> 회사의 안정적 서비스 제공·개인정보 보호, 회원의 금지행위(불법/유해정보, 영리목적, 폭언 등) 준수</li>
                <li><b>개인정보:</b> 관련 법령 및 개인정보처리방침에 따름</li>
            </ul>

            {/* 제2장 회원 */}
            <h4 style={{ margin: "10px 0 6px" }}>제2장 회원</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li><b>가입:</b> 만 14세 미만은 법정대리인 동의 필요, 허위정보/명의도용 시 제한</li>
                <li><b>정보관리:</b> ID(휴대전화) 등 개인정보의 정확성·보안 유지 의무</li>
                <li><b>탈퇴:</b> 이용내역 없으면 자유 탈퇴, 멤버십/예약 존재 시 선해지·취소 후 탈퇴</li>
                <li><b>자격상실:</b> 약관 위반 시 제한/상실 및 환불 제한 가능</li>
                <li><b>중단:</b> 점검·천재지변 등 불가피한 사유로 일시 중단 가능</li>
            </ul>

            {/* 제3장 아지트 및 예약 */}
            <h4 style={{ margin: "10px 0 6px" }}>제3장 아지트 및 예약</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li><b>서비스:</b> 돌봄·학습, 프로그램, 키트 판매, 픽업, 출입알림, 상담 제공</li>
                <li><b>운영:</b> 운영일/시간은 공지로 안내, 필요 시 변경 가능</li>
                <li><b>예약:</b> 웹/앱/전화로 가능, 부득이한 경우 회사가 거절할 수 있음</li>
                <li><b>취소:</b> <b>이용 전날 17:00 이전</b> 전액 환불, 이후 취소·No-show 환불 불가</li>
                <li><b>안전:</b> 수칙 준수, 질환·알레르기 사전 고지, 응급 시 합리적 조치</li>
            </ul>

            {/* 제4장 픽업 서비스 */}
            <h4 style={{ margin: "10px 0 6px" }}>제4장 픽업 서비스</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li><b>범위:</b> 정규 멤버십 회원 대상, 사전 등록된 경로(학교/기관/지정 장소/아지트) 내 제공</li>
                <li><b>신청:</b> 보호자 경로·인수인계자 등록, 현장 상황에 따라 일정 조정 가능</li>
                <li><b>요금/취소:</b> 공지 기준 따름, 전날 17:00 이후 취소 시 환불 불가</li>
                <li><b>책임:</b> 인수~아지트 인계까지, 무단이탈/오정보/불가항력 등은 면책될 수 있음</li>
            </ul>

            {/* 제5장 기타 */}
            <h4 style={{ margin: "10px 0 6px" }}>제5장 기타</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li><b>저작권:</b> 서비스 내 게시물의 저작권은 회사에 귀속, 무단 이용 금지</li>
                <li><b>광고/정보:</b> 마케팅 수신 동의 후에도 설정에서 언제든 수신 거부 가능</li>
                <li><b>분쟁/관할:</b> 고객센터 우선 협의, 회사 본점 소재지 관할 지방법원</li>
            </ul>

            <p style={{ color: "#6b7280", marginTop: 8 }}>
                ※ 자세한 전문은 <b>이용약관</b> 페이지에서 확인할 수 있습니다.
            </p>
        </div>
    );
}


// /src/components/modal/TermsModal.jsx 내
function PrivacyTerms() {
    return (
        <div>
            <h3 style={{ margin: "0 0 8px" }}>개인정보 수집·이용 동의(요약)</h3>

            {/* 1. 개인정보의 수집 및 이용 */}
            <h4 style={{ margin: "10px 0 6px" }}>1) 수집·이용 목적 및 보유기간</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li><b>목적:</b> 회원·멤버십 관리, 서비스 제공, 안전관리, 결제·정산, 고지·통지</li>
                <li><b>보유기간:</b> 회원 탈퇴 시까지(법령에 따라 일부 정보는 별도 기간 보관)</li>
            </ul>

            <h4 style={{ margin: "10px 0 6px" }}>2) 수집 항목</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li><b>필수:</b> 보호자 성명·연락처·생년월일, 어린이 성명·생년월일·재학 기관</li>
                <li><b>선택:</b> 일정·취향 정보, 서비스 이용기록, 출입기록, CCTV 등</li>
                <li><b>결제:</b> 카드번호, 거래내역 등</li>
            </ul>

            {/* 2. 제3자 제공 */}
            <h4 style={{ margin: "10px 0 6px" }}>3) 개인정보의 제3자 제공</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li><b>보증기관(서울보증보험):</b> 보증보험 가입 및 보상 — 계약자/수령인 정보, 제공 기간은 서비스 제공 기간</li>
                <li><b>PG사(라이트페이):</b> 결제 처리 및 정산 — 결제정보·거래내역, 보유는 법정 보존 기간</li>
            </ul>

            {/* 3. 이용자 권리 */}
            <h4 style={{ margin: "10px 0 6px" }}>4) 이용자 권리 및 행사 방법</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li>본인의 개인정보에 대해 <b>열람·정정·삭제·처리정지</b>를 언제든지 요청 가능</li>
                <li>행사 방법: 고객센터 등 지정 채널을 통해 요청</li>
            </ul>

            {/* 4. 안전조치 */}
            <h4 style={{ margin: "10px 0 6px" }}>5) 안전성 확보 조치</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li>암호화, 접근통제, 내부관리계획 등 관련 법령에 따른 보호조치 이행</li>
            </ul>

            {/* 5. 고지의 의무 */}
            <h4 style={{ margin: "10px 0 6px" }}>6) 고지의 의무</h4>
            <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
                <li>방침 변경 시 개정 최소 7일 전부터 웹사이트 공지사항으로 안내</li>
            </ul>

            <p style={{ color: "#6b7280", marginTop: 8 }}>
                ※ 자세한 전문은 <b>개인정보처리방침</b> 페이지에서 확인할 수 있습니다.
            </p>
        </div>
    );
}

// /src/components/modal/TermsModal.jsx 내
function EcommerceTerms() {
    return (
        <div>
            <h3 style={{ margin: "0 0 8px" }}>전자상거래(결제/환불) 약관(요약)</h3>

            <h4 style={{ margin: "10px 0 6px" }}>1. 청약 및 결제</h4>
            <ul style={{ margin: "0 0 10px 18px" }}>
                <li>회원은 프로그램/멤버십/픽업 등 유료 서비스에 대해 결제를 통해 청약할 수 있습니다.</li>
                <li>결제수단: 신용/체크카드, 간편결제, 실시간 계좌이체 등 회사가 제공하는 수단.</li>
                <li>미성년자 결제는 법정대리인 동의가 필요하며, 무단 결제 시 취소될 수 있습니다.</li>
            </ul>

            <h4 style={{ margin: "10px 0 6px" }}>2. 청약철회(환불) 및 위약금</h4>
            <ul style={{ margin: "0 0 10px 18px" }}>
                <li>프로그램/예약 서비스는 제공 시작 전까지 청약철회가 가능하며, 개시 후에는 환불이 제한될 수 있습니다.</li>
                <li>
                    예약 서비스는 <b>이용일 전날 오후 5시</b>까지 취소 시 전액 환불, 이후 취소 또는 No-show는 환불 불가가 원칙입니다.
                </li>
                <li>멤버십은 관계 법령과 개별 정책에 따라 잔여 기간/이용 실적을 고려하여 환불액을 산정합니다.</li>
            </ul>

            <h4 style={{ margin: "10px 0 6px" }}>3. 과오납/이중결제 환불</h4>
            <ul style={{ margin: "0 0 10px 18px" }}>
                <li>과오납 또는 이중결제 확인 시 전액 환불합니다. 환불 소요 기간은 PG사/카드사 정책에 따릅니다.</li>
            </ul>

            <h4 style={{ margin: "10px 0 6px" }}>4. 계약 해지 및 이용 제한</h4>
            <ul style={{ margin: "0 0 10px 18px" }}>
                <li>회원의 약관 위반, 부정 사용 등이 확인되면 서비스 이용 제한 또는 계약 해지가 가능하며, 환불 제한이 있을 수 있습니다.</li>
            </ul>

            <h4 style={{ margin: "10px 0 6px" }}>5. 분쟁 해결</h4>
            <ul style={{ margin: "0 0 10px 18px" }}>
                <li>분쟁은 고객센터를 통해 협의하며, 법적 분쟁은 회사 본점 소재지 관할 법원을 따릅니다.</li>
            </ul>

            <p style={{ color: "#6b7280" }}>
                ※ 실제 환불/취소 기준은 서비스 특성에 따라 별도 고지될 수 있습니다. 본 약관은 안내용 요약이며, 개별 고지 및 관련 법령이 우선합니다.
            </p>
        </div>
    );
}


const DOCS = {
    service: { title: "위드아지트 서비스 이용약관", Comp: ServiceTerms },
    privacy: { title: "개인정보 수집·이용 동의", Comp: PrivacyTerms },
    ecommerce: { title: "전자상거래(결제/환불) 약관", Comp: EcommerceTerms },
};

export default function TermsModal({ open, doc = "service", onClose }) {
    useBodyLock(open);
    if (!open) return null;

    const { title, Comp } = DOCS[doc] || DOCS.service;

    return ReactDOM.createPortal(
        <Backdrop onClick={onClose} role="dialog" aria-modal="true">
            <Sheet onClick={(e) => e.stopPropagation()}>
                <Head>
                    <Title>{title}</Title>
                    <button
                        onClick={onClose}
                        style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 18, color: "#6b7280" }}
                        aria-label="닫기"
                    >✕</button>
                </Head>
                <Body>
                    <Comp />
                </Body>
                <Foot>
                    <Btn onClick={onClose}>닫기</Btn>
                    <Primary onClick={onClose}>확인</Primary>
                </Foot>
            </Sheet>
        </Backdrop>,
        document.body
    );
}
