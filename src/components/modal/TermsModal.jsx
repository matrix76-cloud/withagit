/* eslint-disable */
// /src/components/modal/TermsModal.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 9999;
`;

const Sheet = styled.div`
  width: min(920px, 92vw);
  max-height: min(88vh, 880px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.22);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
`;

const Head = styled.header`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #1a2b4c;
  letter-spacing: -0.2px;
`;

const Body = styled.div`
  padding: 18px 20px;
  overflow: auto;
  color: #111;
  line-height: 1.65;
`;

const Foot = styled.footer`
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Btn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111;
  cursor: pointer;
  &:hover {
    background: #fafafa;
  }
`;

const Primary = styled(Btn)`
  background: #e47b2c;
  color: #fff;
  border-color: transparent;
  font-weight: 900;
  &:hover {
    filter: brightness(0.98);
  }
`;

function useBodyLock(open) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

/* ================== 1) 서비스 이용약관 요약 ================== */

function ServiceTerms() {
  return (
    <div>
      <h3 style={{ margin: "0 0 8px" }}>위드아지트 서비스 이용약관(요약)</h3>

      {/* 제1장 총칙 */}
      <h4 style={{ margin: "10px 0 6px" }}>제1장 총칙</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          <b>목적:</b> 위드아지트(주식회사 어센트웍스)가 제공하는 멤버십, 돌봄,
          프로그램, 픽업 등 서비스 이용에 관한 회사와 회원(어린이·보호자)의
          권리·의무를 규정합니다.
        </li>
        <li>
          <b>주요 용어:</b> 이용자, 회원/비회원, 멤버십 회원, 멤버십, 서비스, 아지트,
          아지트 서비스, 운영일, 콘텐츠 등의 의미를 정의합니다.
        </li>
        <li>
          <b>멤버십 및 요금:</b> 멤버십은 월 단위 정액제로 하루 2시간 기본 돌봄이
          포함되며, 초과 시 10분당 2,500원이 부과됩니다. 주말 요금은 멤버십 회원
          시간당 12,000원, 비회원 시간당 15,000원이며, 주말/방학 프로그램은
          프로그램별로 금액이 상이합니다.
        </li>
        <li>
          <b>약관 게시·개정:</b> 회사는 약관과 회사 정보를 웹사이트에 게시하며,
          관련 법령 범위에서 개정할 수 있습니다. 중요한 변경 시 최소 30일 전
          사전 공지하며, 회원이 거부 의사를 표시하지 않으면 동의한 것으로
          간주됩니다. 동의하지 않는 경우 회원 탈퇴를 요청할 수 있습니다.
        </li>
        <li>
          <b>세부 운영:</b> 약관에 규정되지 않은 사항은 웹사이트·아지트 공지사항 및
          운영정책을 따릅니다. 회원 통지는 이메일, 문자, 앱 알림, 전화 등으로
          개별 발송하거나, 전체 공지는 웹사이트에 7일 이상 게시할 수 있습니다.
        </li>
        <li>
          <b>회사의 의무:</b> 안정적인 서비스 제공과 개인정보 보호를 위해 최선을
          다하며, 관련 법령을 준수합니다.
        </li>
        <li>
          <b>이용자의 의무:</b> 회원은 서비스의 무단 변경, 저작권 침해, 영리 목적의
          사용, 불법·유해 정보 게시, 폭언·폭력, 감독 소홀 등의 행위를 할 수
          없으며, 위반 시 이용 제한·해지 및 법적 조치를 받을 수 있습니다.
        </li>
      </ul>

      {/* 제2장 회원 */}
      <h4 style={{ margin: "10px 0 6px" }}>제2장 회원</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          <b>회원가입:</b> 만 14세 미만 어린이는 법정대리인의 동의가 필요하며, 만
          14세 이상 어린이·보호자는 본인 동의로 가입합니다. 허위 정보 기재, 타인
          명의 도용 등의 경우 가입이 제한되거나 취소될 수 있습니다.
        </li>
        <li>
          <b>정보 관리:</b> ID(휴대전화 번호) 및 개인정보는 본인이 직접 관리해야
          하며, 변경 사항 발생 시 지체 없이 알려야 합니다.
        </li>
        <li>
          <b>회원 탈퇴:</b> 예약 및 멤버십 이용 내역이 없는 경우 언제든지 탈퇴할 수
          있으며, 멤버십이나 예약이 남아 있는 경우 먼저 해지·취소 후 탈퇴가
          가능합니다.
        </li>
        <li>
          <b>자격 상실:</b> 약관·법령 위반 시 이용을 제한하거나 회원 자격을 상실할
          수 있으며, 이 경우 이미 납부한 금액은 환불되지 않을 수 있습니다.
        </li>
        <li>
          <b>서비스 중단:</b> 원칙적으로 24시간 제공하나, 시스템 점검, 천재지변 등
          불가피한 사유로 일시 중단될 수 있습니다.
        </li>
      </ul>

      {/* 제3장 아지트 및 예약 */}
      <h4 style={{ margin: "10px 0 6px" }}>제3장 아지트 및 예약</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          <b>아지트 서비스:</b> 아지트에서는 돌봄·학습, 주말/방학 프로그램, 키트
          판매, 픽업 연계, 출입 알림, 상담 등의 서비스를 제공합니다.
        </li>
        <li>
          <b>운영일·운영시간:</b> 운영일과 시간은 웹사이트·공지사항을 통해 안내하며,
          변경 시 사전 고지합니다.
        </li>
        <li>
          <b>예약:</b> 웹사이트, 앱, 전화로 예약할 수 있으며, 아동 안전·운영 여건
          등을 고려하여 회사가 예약을 제한하거나 거절할 수 있습니다.
        </li>
        <li>
          <b>예약 취소:</b> 일반 예약은 <b>이용일 전날 오후 5시</b>까지 취소 시 전액
          환불되며, 이후 취소 또는 무단 미이용(No-show)의 경우 환불되지 않습니다.
        </li>
        <li>
          <b>이용수칙·안전:</b> 회원과 어린이는 공지된 수칙을 준수해야 하며, 질환,
          알레르기, 특이사항 등은 사전에 고지해야 합니다. 응급 상황 시 회사는
          합리적인 범위 내에서 즉시 필요한 조치를 취할 수 있습니다.
        </li>
      </ul>

      {/* 제4장 픽업 서비스 */}
      <h4 style={{ margin: "10px 0 6px" }}>제4장 픽업 서비스</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          <b>이용 대상:</b> 픽업 서비스는 정규 멤버십(아지트, 패밀리 멤버십) 회원만
          신청 가능합니다.
        </li>
        <li>
          <b>범위·신청:</b> 사전에 등록된 학교·기관·지정 장소와 아지트 간에서
          제공되며, 보호자가 경로와 인수인계자를 등록해야 합니다. 현장 상황에 따라
          일정이 조정될 수 있습니다.
        </li>
        <li>
          <b>요금·취소:</b> 픽업 요금은 회사가 공지한 기준에 따르며, 예약 전날
          17시 이후 취소 시 환불이 불가합니다.
        </li>
        <li>
          <b>책임 범위:</b> 회사의 책임은 아이를 인수한 시점부터 아지트에 인계할
          때까지이며, 무단 이탈, 잘못된 정보 제공, 인계 지연, 천재지변·교통사고
          등 불가항력 사유는 책임이 제한될 수 있습니다.
        </li>
      </ul>

      {/* 제5장 기타 */}
      <h4 style={{ margin: "10px 0 6px" }}>제5장 기타</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          <b>저작권:</b> 서비스 내 게시되는 콘텐츠의 저작권은 회사에 귀속되며,
          무단 복제·배포 등은 금지됩니다.
        </li>
        <li>
          <b>광고·정보제공:</b> 마케팅·광고 메시지 수신에 동의한 경우에도 앱 설정
          또는 고객센터를 통해 언제든 수신 거부할 수 있습니다.
        </li>
        <li>
          <b>분쟁 해결:</b> 불편사항은 고객센터를 통해 접수할 수 있으며, 원만한
          해결을 위해 노력합니다. 필요 시 회사 본점 소재지를 관할하는 지방법원을
          전속 관할로 합니다.
        </li>
      </ul>

 
    </div>
  );
}

/* ================== 2) 개인정보/제3자 제공 요약 ================== */

function PrivacyTerms() {
  return (
    <div>
      <h3 style={{ margin: "0 0 8px" }}>
        개인정보 수집·이용 및 제3자 제공 동의(요약)
      </h3>

      {/* 1. 수집 목적/보유기간 */}
      <h4 style={{ margin: "10px 0 6px" }}>1) 수집·이용 목적 및 보유기간</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          <b>수집 목적:</b> 회원 및 멤버십 관리, 서비스 제공, 출석·안전 관리, 예약·
          결제·정산, 고지·통지 및 민원 처리 등.
        </li>
        <li>
          <b>보유 기간:</b> 원칙적으로 회원 탈퇴 시까지 보관하며, 관련 법령에 따라
          일부 정보는 일정 기간 별도 보관합니다.
        </li>
      </ul>

      {/* 2. 수집 항목 */}
      <h4 style={{ margin: "10px 0 6px" }}>2) 수집 항목</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          <b>필수:</b> 보호자 성명·연락처·생년월일, 어린이 성명·생년월일·재학 기관
          등 기본 신원 정보.
        </li>
        <li>
          <b>선택:</b> 일정·취향 정보, 서비스 이용 기록, 출입 기록, CCTV 등 안전 및
          서비스 품질 향상에 필요한 정보.
        </li>
        <li>
          <b>결제:</b> 카드번호, 승인번호, 거래 내역 등 결제 관련 정보.
        </li>
      </ul>

      {/* 3. 제3자 제공 */}
      <h4 style={{ margin: "10px 0 6px" }}>3) 개인정보의 제3자 제공</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          <b>보증기관(서울보증보험):</b> 보증보험 가입 및 보상 처리를 위해 계약자·
          수령인 정보를 제공하며, 보유 기간은 서비스 제공 기간입니다.
        </li>
        <li>
          <b>결제대행사(PG사, 라이트페이):</b> 결제 처리 및 정산을 위해 결제정보,
          거래내역을 제공하며, 보유 기간은 법정 보존 기간입니다.
        </li>
      </ul>

      {/* 4. 마케팅/광고 수신 */}
      <h4 style={{ margin: "10px 0 6px" }}>4) 마케팅·광고 수신 동의(선택)</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          문자, 알림톡, 앱 알림, 이메일 등을 통해 이벤트·혜택 정보를 받을 수
          있으며, 동의하지 않아도 서비스 이용에는 제한이 없습니다.
        </li>
        <li>수신 동의는 언제든지 설정 변경 또는 고객센터 요청을 통해 철회할 수 있습니다.</li>
      </ul>

      {/* 5. 이용자 권리 */}
      <h4 style={{ margin: "10px 0 6px" }}>5) 이용자의 권리</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          본인의 개인정보에 대해 <b>열람, 정정, 삭제, 처리정지</b>를 요청할 수
          있으며, 회사는 법령에 따라 이에 성실히 응합니다.
        </li>
        <li>
          필수 항목 수집·이용 및 제3자 제공에 동의하지 않을 수 있으나, 이 경우
          서비스 이용이 제한될 수 있습니다. 선택 항목은 동의하지 않아도 서비스
          이용이 가능합니다.
        </li>
      </ul>

      {/* 6. 만 14세 미만 */}
      <h4 style={{ margin: "10px 0 6px" }}>6) 만 14세 미만 어린이</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          만 14세 미만 어린이의 서비스 이용·회원가입에는{" "}
          <b>법정대리인의 동의</b>가 필수이며, 관련 동의서 작성 및 확인 절차를
          거칩니다.
        </li>
      </ul>

      {/* 7. 안전조치/고지 */}
      <h4 style={{ margin: "10px 0 6px" }}>7) 안전성 확보 및 고지</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          회사는 암호화, 접근통제, 내부관리계획 수립 등 관련 법령에 따른 안전성
          확보 조치를 이행합니다.
        </li>
        <li>
          개인정보 처리방침 변경 시 개정 최소 7일 전부터 웹사이트 공지사항 등을
          통해 안내합니다.
        </li>
      </ul>

      <p style={{ color: "#6b7280", marginTop: 8 }}>
      ※ 개인정보 처리에 대한 자세한 내용은 고객센터로 문의해 주세요.
      </p>
    </div>
  );
}

/* ================== 3) 전자상거래(멤버십/정액권) 약관 요약 ================== */

function EcommerceTerms() {
  return (
    <div>
      <h3 style={{ margin: "0 0 8px" }}>전자상거래(멤버십/정액권) 이용약관(요약)</h3>

      <h4 style={{ margin: "10px 0 6px" }}>1. 거래조건 안내 및 가입</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          멤버십의 종류, 혜택, 가격, 이용 기간, 환불 기준 등은 웹사이트 및 안내문을
          통해 미리 확인할 수 있습니다.
        </li>
        <li>
          멤버십 가입 절차는 <b>멤버십 종류 확인 → 정보 확인 → 요금 결제 → 가입
          완료</b> 순서로 진행됩니다.
        </li>
        <li>
          결제 수단은 카드결제, 간편결제 등 회사가 제공하는 방식에 따르며, 회사가
          승낙하는 시점에 계약이 성립합니다.
        </li>
      </ul>

      <h4 style={{ margin: "10px 0 6px" }}>2. 멤버십 혜택 및 만료</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          정규 멤버십(아지트, 패밀리 멤버십)에는 <b>주중 매일 2시간 돌봄</b>이
          포함되며, 초과 시 10분당 2,500원이 추가됩니다.
        </li>
        <li>
          프로그램·키트 할인, 픽업 서비스 이용 등은 멤버십 종류에 따라 별도 혜택이
          제공됩니다. 픽업 서비스는 정규 멤버십 회원만 신청 가능합니다.
        </li>
        <li>
          멤버십 기간이 종료되면 계약은 자동 종료되고, 이용하지 않은 잔여 혜택은
          소멸됩니다.
        </li>
      </ul>

      <h4 style={{ margin: "10px 0 6px" }}>
        3. 정규 멤버십(아지트·패밀리) 해지 및 환불
      </h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          회원은 마이페이지의 <b>‘멤버십 해지’</b> 기능을 통해 언제든지 해지를
          신청할 수 있으며, 해지 시점에 따라 환불 가능 여부가 달라집니다.
        </li>
        <li>
          <b>결제일로부터 14일 이내 해지</b>: 이미 이용한 기간에 해당하는 금액과
          환불 위약금(10%)을 공제한 뒤 잔여 금액을 환불합니다.
          <br />
          <span style={{ fontSize: 12, color: "#4b5563" }}>
            환불금액 = 결제금액 – (이용일 수 일할 비용 × 환불 위약금 10%)
          </span>
        </li>
        <li>
          14일 이내 해지 시, 해지 요청일 기준으로 멤버십 이용은 즉시 종료되며,
          등록된 자동결제는 다음 결제부터 중단됩니다.
        </li>
        <li>
          <b>결제일로부터 14일 경과 후 해지</b>: 환불은 불가하며, 이미 결제된 이용
          기간 종료일까지 서비스를 이용할 수 있습니다. 다음 결제 예정분은 자동
          취소됩니다.
        </li>
        <li>
          회원이 약관 또는 관계 법령을 중대하게 위반한 경우 회사는 멤버십을 즉시
          해지할 수 있으며, 이 경우 환불은 불가합니다.
        </li>
      </ul>

      <h4 style={{ margin: "10px 0 6px" }}>
        4. 기타 서비스 상품(타임패스 멤버십, 정액권 등) 해지 및 환불
      </h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          결제일로부터 <b>7일 이내</b>이며, 예약·출석·간식 교환 등{" "}
          <b>이용 내역이 전혀 없는 경우</b> 전액 환불이 가능합니다.
        </li>
        <li>
          구매 후 7일이 경과하거나 1회라도 이용(예약, 출석, 간식 교환 등)이 발생한
          경우에는 환불이 불가합니다.
        </li>
        <li>
          부정 결제, 타인 명의 도용, 불법 전매 등 법령 위반·부정 사용이 확인될
          경우 회사는 즉시 이용을 정지하고 환불 없이 계약을 해지할 수 있습니다.
        </li>
        <li>
          타임패스를 보유한 상태에서 정규 멤버십(아지트, 패밀리 멤버십)에 신규
          가입하는 경우 타임패스는 자동 해지되고,
          <br />
          잔여 시간은 상품별 10분당 금액을 기준으로 환산하여 정액권(충전금)으로
          자동 전환됩니다.
        </li>
      </ul>

      <h4 style={{ margin: "10px 0 6px" }}>5. 양도 금지 및 분쟁 해결</h4>
      <ul style={{ margin: "0 0 10px 18px", lineHeight: 1.65 }}>
        <li>
          멤버십 및 정액권 등 이용권은 타인에게 양도하거나 증여, 담보 제공할 수
          없습니다.
        </li>
        <li>
          과오납·이중결제 발생 시 확인 후 전액 환불하며, 환불 소요 기간은 카드사·
          PG사 정책에 따릅니다.
        </li>
        <li>
          전자상거래 관련 분쟁은 고객센터를 통해 우선 협의하며, 법적 분쟁이 필요한
          경우 회사 본점 소재지 관할 지방법원을 따릅니다.
        </li>
      </ul>

      <p style={{ color: "#6b7280" }}>
        ※ 실제 환불/취소 기준은 서비스 특성에 따라 개별 고지될 수 있으며, 개별
        고지 및 관련 법령이 본 요약보다 우선합니다.
      </p>
    </div>
  );
}

/* ================== 모달 래퍼 ================== */

const DOCS = {
  service: { title: "위드아지트 서비스 이용약관", Comp: ServiceTerms },
  privacy: {
    title: "개인정보 수집·이용 및 제3자 제공 동의",
    Comp: PrivacyTerms,
  },
  ecommerce: {
    title: "전자상거래(멤버십/정액권) 이용약관",
    Comp: EcommerceTerms,
  },
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
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              fontSize: 18,
              color: "#6b7280",
            }}
            aria-label="닫기"
          >
            ✕
          </button>
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
