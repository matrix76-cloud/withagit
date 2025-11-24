/* eslint-disable */
// /src/services/branchSuggestService.js
import { db } from "./api";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";

/**
 * 다음 아지트 제안 제출 (파일 첨부 없음)
 * @param {object} p
 *  - userPhoneE164 (string, required)
 *  - region (string, required)           // 희망지역 (시/구/동)
 *  - schoolName (string|null)            // 추천 아지트 학교명 (선택)
 *  - activityPlaces (string|null)        // 주요 학원/활동 장소 (선택)
 *  - reason (string, required)           // 왜 필요한가?
 *  - userName (string|null)              // 이름 (선택)
 *  - contact (string|null)               // 휴대폰 or 이메일 (선택)
 */
export async function submitNextAgitSuggest({
    userPhoneE164,
    region,
    schoolName = null,
    activityPlaces = null,
    reason,
    userName = null,
    contact = null,
}) {
    if (!userPhoneE164) throw new Error("userPhoneE164 is required");
    if (!region || !reason) throw new Error("region and reason are required");

    const refCol = collection(db, "next_agit_suggestions"); // ✅ 별도 컬렉션
    const docData = {
        userPhoneE164,
        region,
        schoolName,
        activityPlaces,
        reason,
        userName,
        contact,
        status: "new",                 // received/new/read/closed 등 확장 가능
        createdAt: serverTimestamp(),
        ua: (typeof navigator !== "undefined" && navigator.userAgent) || null,
    };
    const docRef = await addDoc(refCol, docData);
    return { id: docRef.id };
}


export async function listMyNextAgitSuggestions(userPhoneE164) {
    if (!userPhoneE164) return [];
    const refCol = collection(db, "next_agit_suggestions");
    const q = query(
        refCol,
        where("userPhoneE164", "==", userPhoneE164),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

