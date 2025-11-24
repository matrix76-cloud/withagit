
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ behavior = "auto" }) {
    const { pathname } = useLocation();

    // 브라우저의 자동 복원을 끔
    useEffect(() => {
        if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    // 경로가 바뀔 때만 맨 위로 (쿼리스트링/탭 변경은 무시)
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, left: 0, behavior });
        }
    }, [pathname, behavior]);

    return null;
}
