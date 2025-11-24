// src/components/BranchShowcase.jsx
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Section = styled.section`
  background: #fff;
  padding: 56px 16px;
  border-top: 1px solid rgba(0,0,0,.04);
  border-bottom: 1px solid rgba(0,0,0,.04);
`;

const Wrap = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  font-size: clamp(22px, 3.2vw, 32px);
  font-weight: 900;
  margin: 0 0 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  @media (max-width: 980px) { grid-template-columns: 1fr; }
`;

const Card = styled(Link)`
  display: grid;
  grid-template-rows: 200px auto;
  background: #fff;
  border: 1px solid rgba(0,0,0,.06);
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  box-shadow: 0 12px 28px rgba(0,0,0,.06);
  transition: transform .1s ease, box-shadow .2s ease, border-color .2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 36px rgba(0,0,0,.08);
    border-color: ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  }
`;

const Thumb = styled.div`
  position: relative;
  background: #eef2f6 url(${({ src }) => src}) center/cover no-repeat;
`;

const Coming = styled(Thumb)`
  /* 지오패턴 느낌의 연한 지도 배경(없으면 색만) */
  background: #f2f6fb;
  &:after{
    content:"Coming Soon!";
    position:absolute; inset:0; display:grid; place-items:center;
    color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
    font-weight: 900; font-size: 22px; opacity:.9;
  }
`;

const Suggest = styled(Thumb)`
  background: linear-gradient(135deg, #fff7e8, #eaf2ff);
  &:after{
    content:"다음 아지트를 제안해주세요!";
    position:absolute; inset:0; display:grid; place-items:center;
    color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
    font-weight: 800; font-size: 18px; text-align:center; padding: 0 16px;
  }
`;

const Body = styled.div`
  padding: 14px 16px 16px;
  display: grid; gap: 6px;
`;

const Name = styled.strong`
  font-size: 18px; font-weight: 900;
`;

const Meta = styled.span`
  font-size: 14px; opacity: .75;
`;

const CTAWrap = styled.div`
  margin-top: 22px; display: grid; place-items: center;
`;

const CTA = styled(Link)`
  height: 44px; padding: 0 16px; border-radius: 12px;
  background: ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  color: #fff; font-weight: 800; text-decoration: none;
  display: inline-flex; align-items: center; justify-content: center;
  border: 2px solid transparent;
  transition: filter .15s, transform .05s;
  &:hover{ filter: brightness(.95); }
  &:active{ transform: translateY(1px); }
`;

export default function BranchShowcase() {
    return (
        <Section>
            <Wrap>
                <Title>위드 아지트 지점 안내</Title>

                <Grid>
                    {/* 1) 첫 번째 지점 — 우리 이미지 사용 */}
                    <Card to="/branches/sooji">
                        <Thumb src="/images/banner1.jpg" aria-label="첫번째 아지트 사진" />
                        <Body>
                            <Name>첫번째 아지트 (수지초)</Name>
                            <Meta>경기 용인시 수지구 · 운영 중</Meta>
                        </Body>
                    </Card>

                    {/* 2) 두번째 아지트 — Coming Soon */}
                    <Card>
                        <Coming aria-label="두번째 아지트 준비중" />
                        <Body>
                            <Name>두번째 아지트</Name>
                            <Meta>Open 예정 · 위치 공개 전</Meta>
                        </Body>
                    </Card>

                    {/* 3) 제안받기 카드 */}
                    <Card to="/branches/suggest">
                        <Suggest aria-label="다음 아지트 제안" />
                        <Body>
                            <Name>우리 동네에 아지트가 필요하세요?</Name>
                            <Meta>집·학교·놀이터가 있는 생활권을 알려주세요.</Meta>
                        </Body>
                    </Card>
                </Grid>

                <CTAWrap>
                    <CTA to="/branches">모든 지점 보기</CTA>
                </CTAWrap>
            </Wrap>
        </Section>
    );
}
