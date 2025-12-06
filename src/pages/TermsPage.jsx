/* eslint-disable */
// src/pages/TermsPage.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Page = styled.main`
  min-height: 100dvh;
  background: #fff7f2;
  color: #111827;
  display: flex;
  justify-content: center;
  padding: 32px 16px 80px;
`;

const Sheet = styled.div`
  position: relative;
  width: min(960px, 100%);
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
  padding: 24px;
  display: grid;
  gap: 18px;
`;

const Head = styled.header`
  display: grid;
  gap: 6px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
  color: #1a2b4c;
`;

const Meta = styled.div`
  color: #6b7280;
  font-size: 12px;
`;

const Toc = styled.nav`
  border: 1px solid #eef1f4;
  background: #fbfcfe;
  border-radius: 10px;
  padding: 12px;

  ul {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 6px;
  }

  a {
    color: #1a2b4c;
    text-underline-offset: 3px;
  }
`;

const H2 = styled.h2`
  margin: 12px 0 6px;
  font-size: 18px;
  color: #1a2b4c;
`;

const H3 = styled.h3`
  margin: 10px 0 4px;
  font-size: 16px;
  color: #1a2b4c;
`;

const P = styled.p`
  margin: 6px 0;
  line-height: 1.7;
`;

const Ul = styled.ul`
  margin: 6px 0 6px 18px;
  line-height: 1.7;
`;

/* 상단 닫기 버튼 (PrivacyPage와 톤 맞춤) */
const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
  color: #4b5563;

  &:hover {
    background: #e5e7eb;
  }

  &:active {
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.16);
    transform: translateY(1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export default function TermsPage() {
    const navigate = useNavigate();

    const handleClose = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    return (
        <Page>
            <Sheet>
                <CloseButton type="button" onClick={handleClose} aria-label="닫기">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            d="M7 7l10 10M17 7L7 17"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </CloseButton>

                <Head>
                    <Title>위드아지트 서비스 이용약관</Title>
                    <Meta>사업자: 주식회사 어센트웍스 · 최근 업데이트: 2025-12-06</Meta>
                </Head>

                <Toc aria-label="목차">
                    <strong>목차</strong>
                    <ul>
                        <li>
                            <a href="#ch1">제1장 총칙</a>
                        </li>
                        <li>
                            <a href="#ch2">제2장 회원</a>
                        </li>
                        <li>
                            <a href="#ch3">제3장 아지트 및 예약</a>
                        </li>
                        <li>
                            <a href="#ch4">제4장 픽업 서비스</a>
                        </li>
                        <li>
                            <a href="#ch5">제5장 기타</a>
                        </li>
                    </ul>
                    <P style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
                        * 전자상거래(결제·환불) 약관은 결제 창에서 팝업으로 별도 고지됩니다.
                    </P>
                </Toc>

                {/* 제1장 총칙 */}
                <section id="ch1">
                    <H2>제1장 총칙</H2>

                    <H3>제1조 목적</H3>
                    <P>
                        본 약관은 주식회사 어센트웍스(서비스명: 위드아지트, 이하 “회사”)가 운영하는
                        웹사이트와 오프라인 아지트 공간(이하 “아지트”)에서 제공하는 멤버십,
                        돌봄·프로그램·픽업 서비스 이용과 관련하여 회원의 권리와 의무를 규정합니다.
                    </P>

                    <H3>제2조 용어 정의</H3>
                    <Ul>
                        <li>이용자: 회사 서비스를 이용하는 모든 분(어린이와 보호자 포함)</li>
                        <li>회원: 약관에 동의하고 가입한 분 (어린이 회원, 보호자 회원 포함)</li>
                        <li>비회원: 가입 절차 없이 서비스를 이용하는 분</li>
                        <li>멤버십 회원: 멤버십 계약을 체결한 회원</li>
                        <li>
                            멤버십: 월 단위 정액제 이용권. 하루 2시간 기본 돌봄 포함, 초과 시 10분 당
                            2,500원 부과
                        </li>
                        <li>
                            이용요금
                            <Ul>
                                <li>
                                    멤버십 회원: 평일 하루 2시간 초과 시 10분 당 2,500원 / 주말 시간 당
                                    12,000원
                                </li>
                                <li>비회원: 주말 시간 당 15,000원</li>
                                <li>주말 및 방학 프로그램: 프로그램 별 이용금액 상이</li>
                            </Ul>
                        </li>
                        <li>
                            서비스: 돌봄, 프로그램, 픽업, 키트 판매 등 회사가 제공하는 모든 서비스
                        </li>
                        <li>아지트: 위드아지트가 운영하는 돌봄 공간</li>
                        <li>아지트 서비스: 아지트에서 이루어지는 모든 활동과 서비스</li>
                        <li>운영일: 회사가 아지트를 운영하는 날</li>
                        <li>콘텐츠: 서비스 내 게시되는 글, 사진, 동영상, 파일 등</li>
                    </Ul>

                    <H3>제3조 약관의 게시 및 개정</H3>
                    <P>
                        회사는 약관과 회사 정보를 웹사이트에 게시합니다. 필요한 경우 관련 법령을
                        준수하는 범위에서 약관을 개정할 수 있으며, 시행일과 사유를 사전 안내합니다.
                        중요한 변경은 최소 30일 전 공지하며, 회원이 거부 의사를 표시하지 않으면
                        동의한 것으로 간주합니다. 동의하지 않을 경우 회원 탈퇴를 요청할 수 있습니다.
                    </P>

                    <H3>제4조 약관 외 준칙</H3>
                    <P>세부 운영정책과 안내는 웹사이트 및 아지트 공지사항을 따릅니다.</P>

                    <H3>제5조 회원 통지</H3>
                    <P>
                        회원에게 필요한 안내는 이메일, 문자, 알림, 전화 등으로 제공하며, 전체 공지는
                        웹사이트에 7일 이상 게시할 수 있습니다.
                    </P>

                    <H3>제6조 회사의 의무</H3>
                    <P>회사는 안정적인 서비스 제공과 개인정보 보호를 위해 최선을 다합니다.</P>

                    <H3>제7조 이용자의 의무</H3>
                    <P>
                        회원은 무단 변경, 저작권 침해, 영리 목적 사용, 불법·유해 정보 게시, 폭언·폭력,
                        감독 소홀 등의 행위를 할 수 없습니다. 위반 시 이용 제한·해지 및 법적 조치가
                        따를 수 있습니다.
                    </P>

                    <H3>제8조 개인정보 보호</H3>
                    <P>
                        회사는 개인정보보호법을 준수하며, 자세한 내용은 개인정보처리방침에서 확인할
                        수 있습니다.
                    </P>
                </section>

                {/* 제2장 회원 */}
                <section id="ch2">
                    <H2>제2장 회원</H2>

                    <H3>제9조 회원가입</H3>
                    <Ul>
                        <li>만 14세 미만 어린이: 법정대리인의 동의 필요</li>
                        <li>만 14세 이상 어린이 및 보호자: 본인 동의 필요</li>
                    </Ul>
                    <P>허위 정보 기재나 타인 명의 도용 등은 가입이 제한됩니다.</P>

                    <H3>제10조 회원 정보 관리</H3>
                    <P>
                        ID(휴대전화 번호) 및 개인 정보는 본인이 직접 관리해야 하며, 변경 사항은 즉시
                        알려야 합니다.
                    </P>

                    <H3>제11조 회원 탈퇴</H3>
                    <P>
                        예약이나 멤버십 이용 내역이 없으면 언제든 탈퇴 가능합니다. 멤버십이나 예약이
                        남아 있다면 먼저 해지·취소 후 탈퇴해야 합니다.
                    </P>

                    <H3>제12조 회원 자격 상실</H3>
                    <P>
                        약관 위반 시 자격이 제한·상실될 수 있으며, 이미 납부한 금액은 환불되지
                        않습니다.
                    </P>

                    <H3>제13조 서비스 중단</H3>
                    <P>
                        서비스는 원칙적으로 24시간 제공되나, 점검이나 천재지변 등 불가피한 경우 일시
                        중단될 수 있습니다.
                    </P>
                </section>

                {/* 제3장 아지트 및 예약 */}
                <section id="ch3">
                    <H2>제3장 아지트 및 예약</H2>

                    <H3>제14조 아지트 서비스</H3>
                    <P>
                        아지트에서는 돌봄·학습, 프로그램, 키트 판매, 픽업, 출입 알림, 상담 서비스를
                        제공합니다.
                    </P>

                    <H3>제15조 운영일·운영시간</H3>
                    <P>
                        운영일과 시간은 공지사항을 통해 안내하며, 변경 시 사전 고지합니다.
                    </P>

                    <H3>제16조 예약</H3>
                    <P>
                        웹사이트, 앱 또는 전화로 예약할 수 있으며, 필요 시 회사는 예약을 거절할 수
                        있습니다.
                    </P>

                    <H3>제17조 예약 취소</H3>
                    <P>
                        예약일 전날 오후 5시까지 취소 가능. 이후 취소나 무단 미이용(No-show) 시 환불되지
                        않습니다.
                    </P>

                    <H3>제18조 이용수칙·안전</H3>
                    <P>
                        회원과 어린이는 공지된 수칙을 지켜야 하며, 질환·알레르기 등은 사전에 알려야
                        합니다. 응급 상황 시 회사는 합리적인 조치를 취할 수 있습니다.
                    </P>
                </section>

                {/* 제4장 픽업 서비스 */}
                <section id="ch4">
                    <H2>제4장 픽업 서비스</H2>

                    <H3>제19조 범위</H3>
                    <P>
                        픽업 서비스는 정규 멤버십(아지트, 패밀리 멤버십) 회원만 신청 가능하며, 사전
                        등록된 학교·기관·지정 장소·아지트 간에만 가능합니다.
                    </P>

                    <H3>제20조 신청</H3>
                    <P>
                        보호자가 경로와 인수인계자를 등록해야 하며, 현장 상황에 따라 일정이 조정될 수
                        있습니다.
                    </P>

                    <H3>제21조 요금·취소</H3>
                    <P>
                        픽업 요금은 회사가 공지한 기준에 따르며, 예약 전일 오후 5시 이후 취소 시
                        환불이 불가합니다.
                    </P>

                    <H3>제22조 책임 범위</H3>
                    <P>
                        회사의 책임은 아이를 인수한 시점부터 아지트에 인계할 때까지입니다. 무단 이탈,
                        잘못된 정보 제공, 불가항력 사유는 책임지지 않습니다.
                    </P>

                    <H3>제22조의2 책임의 제한</H3>
                    <Ul>
                        <li>보호자가 아동의 질환, 알레르기, 특이사항을 고지하지 않은 경우</li>
                        <li>보호자가 잘못된 정보를 제공한 경우</li>
                        <li>어린이의 무단 이탈, 보호자의 인계 지연 등 관리범위를 벗어난 상황</li>
                        <li>천재지변, 교통사고 등 불가항력 사유</li>
                    </Ul>
                </section>

                {/* 제5장 기타 */}
                <section id="ch5">
                    <H2>제5장 기타</H2>

                    <H3>제23조 저작권</H3>
                    <P>
                        서비스 내 게시물의 저작권은 회사에 있으며, 무단 이용은 금지됩니다.
                    </P>

                    <H3>제24조 광고·정보 제공</H3>
                    <P>
                        회원은 마케팅·광고 메시지 수신에 동의한 경우에도, 앱 푸시 설정 또는 고객센터를
                        통해 언제든 수신 거부할 수 있습니다.
                    </P>

                    <H3>제25조 분쟁 해결</H3>
                    <P>
                        불편사항은 고객센터를 통해 접수할 수 있으며, 신속히 해결을 위해 노력합니다.
                    </P>

                    <H3>제26조 관할·준거법</H3>
                    <P>
                        본 약관은 대한민국 법령에 따르며, 회사와 회원 간 분쟁은 회사 본점 소재지를
                        관할하는 지방법원을 전속 관할로 합니다.
                    </P>
                </section>
            </Sheet>
        </Page>
    );
}
