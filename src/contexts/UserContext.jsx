/* eslint-disable */
// src/contexts/UserContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getSession } from "../services/auth/session";
import { loadMemberSnapshot } from "../services/memberService";

const Ctx = createContext(null);
export const useUser = () => useContext(Ctx);

// 중복 방지 유틸(동일 childId 병합)
function uniqueChildren(arr = []) {
    const map = {};
    for (const c of arr) {
        if (!c || !c.childId) continue;
        map[c.childId] = { ...(map[c.childId] || {}), ...c };
    }
    return Object.values(map);
}

export default function UserProvider({ children: slot }) {
    const [initialized, setInitialized] = useState(false);
    const [phoneE164, setPhone] = useState("");
    const [profile, setProfile] = useState({});
    const [memberships, setMemberships] = useState(null);
    const [kids, setKids] = useState([]); // ← state 이름 변경

    const bootWithPhone = useCallback(async (p) => {
        if (!p) {
         
            setPhone("");
            setProfile({});
            setMemberships(null);
            setKids([]);
            setInitialized(true);
            return;
        }
    
        const snap = await loadMemberSnapshot(p, { source: "server" });
        setPhone(p);



        setProfile(snap.profile || {});   // 객체로 유지(널가드)
        
        setMemberships(snap.memberships);
        setKids(uniqueChildren(snap.children || []));
        setInitialized(true);
    }, []);

    // 앱 부팅: 세션에서 phoneE164 읽어 초기화
    useEffect(() => {
        (async () => {
            const sess = getSession();
            await bootWithPhone(sess?.phoneE164 || "");
        })();
    }, [bootWithPhone]);

    // 실시간 반영(다른 탭/같은 탭 로그인 이벤트)
    useEffect(() => {
        const onCustom = (e) => bootWithPhone(e?.detail?.phoneE164 || "");
        const onStorage = (e) => {
            if (e.key !== "auth_dev_session") return;
            try {
                const v = e.newValue ? JSON.parse(e.newValue) : null;
                bootWithPhone(v?.phoneE164 || "");
            } catch {
                bootWithPhone("");
            }
        };
        window.addEventListener("auth:session", onCustom);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener("auth:session", onCustom);
            window.removeEventListener("storage", onStorage);
        };
    }, [bootWithPhone]);

    // 파생 플래그(저장 금지, 계산만)
    const perms = useMemo(() => {
        const agitzActive = !!memberships?.agitz?.active;
        const canBuyFamily = agitzActive && (kids?.length || 0) >= 2;
        return { agitzActive, canBuyFamily };
    }, [memberships, kids]);

    const refresh = useCallback(async () => {
        if (!phoneE164) return;
        const snap = await loadMemberSnapshot(phoneE164);

        console.log("member snap", snap);
        setProfile(snap.profile);
        setMemberships(snap.memberships);
        setKids(uniqueChildren(snap.children || []));
    }, [phoneE164]);

    const value = useMemo(
        () => ({
            initialized,
            phoneE164,
            profile,
            memberships,
            children: kids,   // 외부에는 기존 키 이름 유지
            perms,
            refresh,
            bootWithPhone,    // 로그인 직후 즉시 반영용
        }),
        [initialized, phoneE164, profile, memberships, kids, perms, refresh, bootWithPhone]
    );

    return <Ctx.Provider value={value}>{slot}</Ctx.Provider>;
}
