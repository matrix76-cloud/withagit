// src/pages/HomePage.jsx
/* eslint-disable */
import React from "react";
import styled from "styled-components";

import HomeHero from "../components/HomeHero";
import ConsultStrip from "../components/common/ConsultStrip";
import ServiceIntro from "../components/ServiceIntro";
import MembershipPlans from "../components/MembershipPlans";
import BranchShowcase from "../components/BranchShowcase";
import GetStartedCTA from "../components/GetStartedCTA";
import CoreValuesSection from "../components/CoreValuesSection";
import FeatureSpotlightList from "../components/FeatureSpotlightList";

import centerinfo1 from "../assets/images/centerinfo1.png"; // PNG 로고
import centerinfo2 from "../assets/images/centerinfo2.png"; // PNG 로고
import spot3 from "../assets/images/spot3.png"; // PNG 로고
import AppDownloadCTA from "../components/AppDownloadCTA";
import ProgramTrustSection from "../components/ProgramTrustSection";
import CoreValuesSplit from "../components/CoreValuesSection";


const Wrap = styled.main`
  position: relative;      /* 섹션 자체는 그대로 */
  background: transparent; /* 상단 패턴 유지 */
`;

export default function HomePage() {
    return (
        <Wrap>
            <HomeHero />


            <CoreValuesSplit
                label="CORE VALUES"
                mainTitle="안전한 픽업과 따뜻한 돌봄"
                desc="아이가 성장하는 매 순간을 특별하게, 안전하게 지켜드립니다"
            />

            <MembershipPlans /> 
            <FeatureSpotlightList
            items={[
                {
                imageUrl:centerinfo1,
                alt: "픽업 돌봄 현장",
                label: "Safe Care",
                title: "믿을 수 있는 픽업과",
                highlight: "따뜻한 돌봄",
                body: `아이의 하루를 안전하게, 부모님의 마음은 편안하게!
            우리의 픽업돌봄서비스는 단순한 이동 지원을 넘어
            아이의 하루를 책임지는 맞춤형 케어 솔루션입니다.
            아이의 등하원부터 방과 후 돌봄까지,
            전문 교육을 받은 돌봄 교사가
            안전하고 따뜻하게 함께합니다.`,
                accent: "orange",
                imageSide: "right"
                },
                {
                imageUrl: centerinfo2,
                alt: "맞춤 케어 활동",
                label: "Customized Care",
                title: "아이 중심의 세심한 배려",
                highlight: "맞춤 케어",
                body: `모든 아이가 동일한 돌봄을 받는 것이 아니라,
            각 아이에게 꼭 맞는 방식으로 일과를 설계합니다.
            성향과 생활 패턴을 고려한 개인화 케어로
            아이의 성장과 정서를 안정적으로 돕고,
            부모님과의 소통으로 목표를 공유하며,
            일상의 작은 변화를 세심히 챙깁니다.`,
                accent: "blue",
                imageSide: "left"
                },
                {
                imageUrl: spot3,
                alt: "우리 동네 돌봄",
                label: "Local Care",
                title: "아이 하루 책임지는",
                highlight: "우리 동네 맞춤 돌봄 서비스",
                body: `실시간 체크인·아웃 알림과 사진 공유로
            부모님은 언제든 안심하실 수 있습니다.
            배정 교사 사전 검증과 일정 관리 시스템으로
            돌봄 품질을 표준화하고,
            예기치 않은 상황에도 즉시 대응하며,
            지역사회 속 신뢰 가능한 돌봄을 실현합니다.`,
                accent: "orange",
                imageSide: "right"
                },
            ]}
            />
     

            
            <AppDownloadCTA
                appStoreUrl="https://apps.apple.com/kr/app/yourappid"
                playStoreUrl="https://play.google.com/store/apps/details?id=yourappid"
                phoneImg1="/assets/withagit/phone-activities.png"
                phoneImg2="/assets/withagit/phone-calendar.png"
                bubbleText="영신"
            />
            

            <ProgramTrustSection autoplayMs={3500} />

        </Wrap>
    );
}
