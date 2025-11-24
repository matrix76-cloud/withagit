// src/services/noticesService.js
/* eslint-disable */
import {
    collection, getDocs, getDoc, doc, query, where, orderBy,
} from "firebase/firestore";
import { db, ensureFirebase } from "./api";

ensureFirebase();

/** 공지 전체 조회 (게시된 것만) — isPinned desc → publishedAt desc */
export async function listNotices() {
    const col = collection(db, "notices");
    // ⚠️ 복합 정렬 인덱스 필요: isPinned desc, publishedAt desc
    let q = query(
        col,
        where("status", "==", "published"),
        orderBy("isPinned", "desc"),
        orderBy("publishedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** 단건 조회 */
export async function getNotice(id) {
    const snap = await getDoc(doc(db, "notices", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** 헬퍼: Timestamp/Date/string 모두 YYYY-MM-DD */
export function fmtDateYYYYMMDD(ts) {
    try {
        const dt = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : new Date(ts));
        return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
    } catch { return ""; }
}

export default listNotices;
