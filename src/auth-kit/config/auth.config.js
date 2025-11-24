import { imageDB } from "../../utils/imageDB";

export default {
    brand: {
        appName: "헬스케어",
        slogan: "맞춤형 상담, 빠른 연결",
        description: "내 상태와 일정에 맞는 전문가와 프로그램을 바로 시작하세요",
    },

    landing: {
        sliderItems: [
            {
                title: "맞춤형 상담으로 빠르게.",
                lines: ["내 상태와 일정에 맞는", "전문가를 바로 연결"],
                image: imageDB.scene1,
                bg: "#FFF4E6",
            },
            {
                title: "질문은 전문가에게 하세요.",
                lines: ["진짜 전문가의", "재활 가이드를 받아보세요."],
                image: imageDB.scene2,
                bg: "#FFF0E0",
            },
            {
                title: "나에게 맞는 프로그램.",
                lines: ["신경계·근골격계·기타", "분야를 비교하고 선택하세요."],
                image: imageDB.scene3,
                bg: "#FFEAD6",
            },
        ],
    },

    // 소셜 제공자(그대로 유지)
    providers: ["google", "naver", "kakao"],

    // 로그인 텍스트(그대로 유지 가능)
    texts: {
        signinTitle: "로그인",
        signupTitle: "회원가입",
        emailLabel: "아이디 또는 이메일",
        idLabel: "아이디",
        pwLabel: "비밀번호",
        signinBtn: "로그인",
        // 추가(옵션): 버튼 라벨 커스텀
        passStartBtn: "문자인증으로 본인확인",
        alimtalkStartBtn: "카카오 알림톡으로 인증코드 받기",
        otpPlaceholder: "6자리 인증코드",
    },

    // ✅ 전화 인증 정책 (PASS 또는 ALIMTALK 중 하나를 설정)
    phoneAuth: {
        method: "pass",          // "pass" | "alimtalk"  ← 여기서 바꿔가며 사용
        otpTtlSec: 180,          // 인증코드 입력 제한 (초)
        resendWaitSec: 60,       // 재전송 대기(나중에 실제 연동 시 사용)
    },

    postSignInRoute: "/home",   // ← Callback.jsx에서 사용됨
    postSignOutRoute: "/auth",
    splashImage: "../../../assests/images/splash.jpg",
    links: {
        tos: "/legal/terms",
        privacy: "/legal/privacy"
    },
    assets: {
        loginButtons: {
            kakao: {
                src: imageDB.kakao
            },
            naver: {
                src: imageDB.naver
            },
            google: {
                src: imageDB.google
            }

        
        }
    }
};
