/* eslint-disable */
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import EmptyLayout from './layouts/EmptyLayout';

import HomePage from './pages/HomePage';
import ServicePage from './pages/ServicePage';
import MembershipPage from './pages/MembershipPage';
import BranchPage from './pages/BranchPage';

import FAQPage from './pages/FAQPage';

import PickupIndex from './pages/PickupPage';
import ChildSelect from './pages/PickupPage/ChildSelect';
import DateSelect from './pages/PickupPage/DateSelect';
import TimeSelect from './pages/PickupPage/TimeSelect';
import RouteSelect from './pages/PickupPage/RouteSelect';
import Options from './pages/PickupPage/Options';
import Review from './pages/PickupPage/Review';

import BranchesPage from './pages/BranchPage';
import BranchDetail from './pages/BranchDetail';
import SpacePage from './pages/SpacePage';
import AboutPage from './pages/AboutPage';
import ProgramPage from './pages/ProgramPage';
import ResservePage from './pages/ReservePage';
import MorePage from './pages/MorePage';
import CarePage from './pages/CarePage';
import TimePage from './pages/TimePage';
import SafetyPage from './pages/SafetytPage';
import MemberShipTimepassPage from './pages/MemberShipTimepassPage';
import MemberShipSubscriptionPage from './pages/MemberShipSubscriptionPage';
import MemberShipPrepagePage from './pages/MemberShipPrepagePage';
import SuggestPage from './pages/SuggestPage';
import SignupFlow from './pages/SignupFlow';
import NoticePage from './pages/NoticePage';
import LoginPage from './pages/LoginPage';
import PickupApplyPage from './pages/PickupApplyPage';
import TopupPage from './pages/TopupPage';
import ProgramListDesktop from './pages/Programs/ProgramListDesktop';
import ProgramDetailDesktop from './pages/Programs/ProgramDetailDesktop';
import SnackDesktopPage from './pages/Snack/SnackDesktopPage';
import PhoneLoginPage from './pages/auth/PhoneLoginPage';
import PhonePassPage from './pages/auth/PhonePassPage';

import MyPage from "./pages/MyPage/index.jsx";
import PricingCheckoutPage from './pages/PricingCheckoutPage.jsx';
import SignupDonePage from './pages/SignupDonePage.jsx';
import { FAQ_ITEMS } from './pages/faqItems.js';
import AuthKakaoCallback from './pages/AuthKakaoCallback.jsx';
import { GlobalFonts } from './theme/GlobalFonts.js';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import HelpLanding from './pages/HelpLanding.jsx';
import HelpFeedback from './pages/HelpFeedback.jsx';
import MembershipPurchasePage from './pages/MembershipPurchasePage.jsx';
import AccountHomePage from './pages/mobile/AccountHomePage.jsx';
import AccountProfilePage from './pages/mobile/AccountProfilePage.jsx';
import AccountChildrenPage from './pages/mobile/AccountChildrenPage.jsx';
import AccountMembershipsPage from './pages/mobile/AccountMembershipsPage.jsx';
import AccountPaymentsPage from './pages/mobile/AccountPaymentsPage.jsx';
import AccountUsagePage from './pages/mobile/AccountUsagePage.jsx';
import AccountPickupsPage from './pages/mobile/AccountPickupsPage.jsx';
import AccountProgramsPage from './pages/mobile/AccountProgramsPage.jsx';
import AccountMobileFAQPage from './pages/mobile/AccountMobileFAQPage.jsx';
import AccountNewsPage from './pages/mobile/AccountNewsPage.jsx';

import SplashPage from "./pages/SplashPage.jsx";

export default function Router() {
    /* ===== 유틸: 세션/가드 ===== */
    function getSession() {
        try { return JSON.parse(localStorage.getItem("auth_dev_session")) || null; } catch { return null; }
    }
    function RequireAuth({ children }) {
        const loc = useLocation();
        const session = getSession();
        if (!session?.isLoggedIn) {
            const from = encodeURIComponent(loc.pathname + (loc.search || ""));
            return <Navigate to={`/login?from=${from}`} replace />;
        }
        return children;
    }

    function ScrollToTop() {
        const { pathname } = useLocation();
        React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
        return null;
    }

    return (
        <>
            <GlobalFonts />
            <ScrollToTop />

            <Routes>
                {/* 🔶 일반 페이지: 헤더/푸터 포함 */}
                <Route element={<MainLayout />}>
                    {/* 🔺 홈은 이제 /home */}
                    <Route path="/home" element={<HomePage />} />

                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/about/care" element={<CarePage />} />
                    <Route path="/about/time" element={<TimePage />} />
                    <Route path="/about/safety" element={<SafetyPage />} />
                    <Route path="/more" element={<MorePage />} />
                    <Route path="/support/reserve" element={<ResservePage />} />
                    <Route path="/services" element={<HomePage />} />
                    <Route path="/membership" element={<MembershipPage />} />
                    <Route path="/membership/timepass" element={<MemberShipTimepassPage />} />
                    <Route path="/membership/subscription" element={<MemberShipSubscriptionPage />} />
                    <Route path="/membership/prepaid" element={<MemberShipPrepagePage />} />
                    <Route path="/pickup/apply" element={<PickupApplyPage />} />
                    <Route path="/topup" element={<TopupPage />} />
                    <Route path="/programs" element={<ProgramListDesktop />} />
                    <Route path="/programs/:id" element={<ProgramDetailDesktop />} />
                    <Route path="/snack" element={<SnackDesktopPage />} />
                    <Route path="price" element={<MembershipPurchasePage />} />

                    {/* 지점 */}
                    <Route path="/branches" element={<BranchesPage />} />
                    <Route path="/branches/:id" element={<BranchDetail />} />
                    <Route path="/branches/suggest" element={<SuggestPage />} />
                    <Route path="/Space" element={<SpacePage />} />

                    {/* 픽업 멀티스텝 */}
                    <Route path="/pickup" element={<PickupIndex />}>
                        <Route path="child" element={<ChildSelect />} />
                        <Route path="date" element={<DateSelect />} />
                        <Route path="time" element={<TimeSelect />} />
                        <Route path="route" element={<RouteSelect />} />
                        <Route path="options" element={<Options />} />
                        <Route path="review" element={<Review />} />
                    </Route>

                    {/* 공개 페이지 */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupFlow />} />
                    <Route path="/signup/done" element={<SignupDonePage />} />
                    <Route path="/auth/phone" element={<PhoneLoginPage />} />
                    <Route path="/auth/phone/pass" element={<PhonePassPage />} />
                    <Route path="/pricing/checkout" element={<PricingCheckoutPage />} />
                    <Route path="/faq" element={<FAQPage items={FAQ_ITEMS} />} />
                    <Route path="/notice" element={<NoticePage />} />
                    <Route path="/help" element={<HelpLanding />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/help/feedback" element={<HelpFeedback />} />
                    <Route path="/m/account" element={<AccountHomePage />} />
                    <Route path="/m/account/profile" element={<AccountProfilePage />} />
                    <Route path="/m/account/children" element={<AccountChildrenPage />} />
                    <Route path="/m/account/memberships" element={<AccountMembershipsPage />} />
                    <Route path="/m/account/payments" element={<AccountPaymentsPage />} />
                    <Route path="/m/account/usage" element={<AccountUsagePage />} />
                    <Route path="/m/account/pickups" element={<AccountPickupsPage />} />
                    <Route path="/m/account/programs" element={<AccountProgramsPage />} />
                    <Route path="/m/account/news" element={<AccountNewsPage />} />
                    <Route path="/m/faq" element={<AccountMobileFAQPage />} />

                    <Route path="/suggest" element={<SuggestPage />} />

                    {/* 보호 라우트 */}
                    <Route path="/mypage" element={<RequireAuth><MyPage /></RequireAuth>} />
                </Route>

                {/* 🔷 헤더/푸터 없는 전용 페이지들 */}
                <Route element={<EmptyLayout />}>
                    {/* 루트 진입 → 스플래시 */}
                    <Route path="/" element={<SplashPage />} />
                    <Route path="/auth/callback/kakao" element={<AuthKakaoCallback />} />
                </Route>
            </Routes>
        </>
    );
}
