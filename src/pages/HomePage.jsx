// src/pages/HomePage.jsx
/* eslint-disable */
import React from "react";
import styled from "styled-components";


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
import MembershipBenefitPanel from "../components/MembershipBenefitPanel";
import DebugUser from "../utils/debugger";
import FeatureSpotlightList2 from "../components/FeatureSpotlightList2";
import { imageDB } from "../utils/imageDB";

import HeroDownloadSection from "../components/HeroDownloadSection";
import SpotsSection from "../components/SpotsSection";
import CallToActionSection from "../components/CallToActionSection";
import Banner from "../components/Banner";
import HomeQuickMenu from "../components/HomeQuickMenu";
import CoreValue from "../components/CoreValue";
import { useNavigate } from "react-router-dom";


const Wrap = styled.main`
  position: relative;      /* 섹션 자체는 그대로 */
  background: transparent; /* 상단 패턴 유지 */
`;

export default function HomePage() {

    const navigate = useNavigate();

    const onClickViewAll = () => {
        navigate("/Space");
    }

    const onClickSignup = () =>{
        navigate("/signup");
    }

    const onClickContact = () => {
        navigate("/m/faq");
    }

    const onClickSuggest = () => {
        navigate("/suggest");
    }

    return (
        <Wrap>
            <Banner />
       
            <HomeQuickMenu />           {/* ⬅️ 여기! */}

            <CoreValue/>

            <CoreValuesSplit
                label="CORE VALUES"
                mainTitle="안전한 픽업과 따뜻한 돌봄"
                desc="아이가 성장하는 매 순간을 특별하게, 안전하게 지켜드립니다"
            />
            <MembershipPlans /> 
          
            
            <HeroDownloadSection />


            <SpotsSection onClickViewAll={onClickViewAll} onClickSuggest={onClickSuggest} />

            <CallToActionSection onClickContact={onClickContact} onClickSignup={onClickSignup} />
    
    

        </Wrap>
    );
}
