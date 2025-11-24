/* eslint-disable */
// src/pages/PrivacyPage.jsx
import React from "react";
import styled from "styled-components";

const Page = styled.main`
  min-height: 100dvh; background:#FFF7F2; color:#111827;
  display:flex; justify-content:center; padding:32px 16px 80px;
`;
const Sheet = styled.div`
  width:min(960px,100%); background:#fff; border:1px solid #eee; border-radius:14px;
  box-shadow:0 8px 18px rgba(0,0,0,.04); padding:24px; display:grid; gap:18px;
`;
const Head = styled.header`display:grid; gap:6px;`;
const Title = styled.h1`margin:0; font-size:22px; color:#1A2B4C;`;
const Meta = styled.div`color:#6b7280; font-size:12px;`;
const H2 = styled.h2`margin:12px 0 6px; font-size:18px; color:#1A2B4C;`;
const H3 = styled.h3`margin:10px 0 4px; font-size:16px; color:#1A2B4C;`;
const P = styled.p`margin:6px 0; line-height:1.7;`;
const Ul = styled.ul`margin:6px 0 6px 18px; line-height:1.7;`;

export default function PrivacyPage() {
    return (
        <Page>
            <Sheet>
                <Head>
                    <Title>개인정보처리방침</Title>
                    <Meta>사업자: 주식회사 어센트웍스 · 최근 업데이트: 2025-11-06</Meta>
                </Head>

                <section>
                    <H2>1. 개인정보의 수집 및 이용</H2>
                    <P><b>수집 목적:</b> 회원·멤버십 관리, 서비스 제공, 안전관리, 결제·정산, 고지·통지</P>
                    <P><b>보유 기간:</b> 회원 탈퇴 시까지. 단, 법령에 따라 일부 정보는 일정 기간 보관</P>

                    <H3>수집 항목</H3>
                    <Ul>
                        <li><b>필수</b>: 보호자 성명·연락처·생년월일, 어린이 성명·생년월일·재학 기관</li>
                        <li><b>선택</b>: 일정·취향 정보, 서비스 이용기록, 출입기록, CCTV 등</li>
                        <li><b>결제</b>: 카드번호, 거래내역 등</li>
                    </Ul>

                    <H3>동의 거부 권리</H3>
                    <P>필수 항목 미동의 시 서비스 이용이 제한됩니다. 선택 항목은 동의하지 않아도 서비스 이용이 가능합니다.</P>
                </section>

                <section>
                    <H2>2. 개인정보의 제3자 제공</H2>
                    <P>회사는 서비스 제공 및 결제 처리를 위해 필요한 범위에서 개인정보를 아래와 같이 제공합니다.</P>

                    <H3>① 보증기관: 서울보증보험</H3>
                    <Ul>
                        <li>목적: 보증보험 가입 및 보상</li>
                        <li>항목: 계약자·수령인 정보</li>
                        <li>보유 기간: 서비스 제공 기간</li>
                    </Ul>

                    <H3>② 결제대행사(PG사): 라이트페이</H3>
                    <Ul>
                        <li>목적: 결제 처리 및 정산</li>
                        <li>항목: 결제정보, 거래내역</li>
                        <li>보유 기간: 법정 보존 기간</li>
                    </Ul>
                </section>

                <section>
                    <H2>3. 이용자 권리와 행사 방법</H2>
                    <P>이용자는 언제든지 자신의 개인정보 열람·정정·삭제·처리정지를 요청할 수 있습니다. 문의는 고객센터를 통해 접수 가능합니다.</P>
                </section>

                <section>
                    <H2>4. 안전성 확보 조치</H2>
                    <P>회사는 암호화, 접근통제, 내부관리계획 수립 등 관련 법령이 정한 보호조치를 이행합니다.</P>
                </section>

                <section>
                    <H2>5. 고지의 의무</H2>
                    <P>본 방침의 내용 추가·삭제 및 수정이 있을 시에는 개정 최소 7일 전부터 웹사이트 공지사항을 통해 안내합니다.</P>
                </section>
            </Sheet>
        </Page>
    );
}
