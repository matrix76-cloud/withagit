/* eslint-disable */
// /src/services/intro_spots 컬렉션 조회 전용 서비스
import {
    collection, query, where, orderBy, limit as qlimit, startAfter,
    getDocs, getDoc, doc
} from "firebase/firestore";
import { db } from "./api"; // ensureFirebase가 필요하면 함께 import해서 사용해도 됩니다.

/** 내부 맵퍼: Firestore DocumentSnapshot → UI용 Spot 객체 */
function toSpot(snap) {
    const d = snap.data() || {};
    return {
        id: snap.id,
        imageUrl: d.imageUrl || "",
        title: d.title || "",
        subtitle: d.subtitle || "",
        badge: d.badge || "",
        published: !!d.published,
        sort: typeof d.sort === "number" ? d.sort : 0,
        createdAt: d.createdAt ?? null,
        updatedAt: d.updatedAt ?? null,
        storagePath: d.storagePath || null,
    };
}

/**
 * 다음 소개 스팟 목록 조회
 * - 기본은 공개(published=true)만, sort desc 기준 상위 N건
 * - 인덱스 없이도 동작하도록 단일 orderBy('sort','desc')를 기본값으로 사용
 */
export async function listIntroSpots({
    publishedOnly = true,
    pageSize = 30,
    startAfterDoc,              // Firestore DocumentSnapshot (옵션)
    orderByField = "sort",      // "sort" | "createdAt"
    orderDirection = "desc",    // "asc" | "desc"
} = {}) {
    const colRef = collection(db, "intro_spots");
    let q = query(
        colRef,
        ...(publishedOnly ? [where("published", "==", true)] : []),
        orderBy(orderByField, orderDirection),
        qlimit(pageSize)
    );
    if (startAfterDoc) {
        q = query(
            colRef,
            ...(publishedOnly ? [where("published", "==", true)] : []),
            orderBy(orderByField, orderDirection),
            startAfter(startAfterDoc),
            qlimit(pageSize)
        );
    }

    const snap = await getDocs(q);
    const items = snap.docs.map(toSpot);
    return {
        items,
        docs: snap.docs, // 다음 페이지네이션을 위해 반환
        nextCursor: snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null,
    };
}

/** 단건 조회 */
export async function getIntroSpot(id) {
    const s = await getDoc(doc(db, "intro_spots", String(id)));
    return s.exists() ? toSpot(s) : null;
}
