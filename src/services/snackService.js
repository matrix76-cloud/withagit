/* eslint-disable */
// /src/services/snackService.js
import {
    collection, getDocs, query, orderBy, limit as qLimit, where,
} from "firebase/firestore";
import { db, ensureFirebase } from "./api";

ensureFirebase();

/** 공통 매핑 */
function mapItem(d) {
    const x = d.data() || {};
    return {
        id: d.id,
        title: x.title || "",
        price: Number(x.price || 0),
        imageUrl: x.imageUrl || "",
        order: Number(x.order || 9999),
        updatedAt: x.updatedAt || null,
    };
}



/** 섹션별 메뉴 로딩 (cat/allergens 없이, 컬렉션 분리) */
export async function listMenuBySections({ limit = 200 } = {}) {
    const basicRef = collection(db, "snack_menu_basic");
    const growthRef = collection(db, "snack_menu_growth");

    const [basicSnap, growthSnap] = await Promise.all([
        getDocs(query(basicRef, orderBy("order", "asc"), qLimit(limit))),
        getDocs(query(growthRef, orderBy("order", "asc"), qLimit(limit))),
    ]);

    const basic = basicSnap.docs.map(mapItem);
    const growth = growthSnap.docs.map(mapItem);

    return { basic, growth };
}
/**
 * 특별간식: 가장 가까운 공개/오픈 이벤트 1건
 *  - special_snack_events
 *    { published, status, deadlineDate, deadlineTs(Timestamp),
 *      branch, product:{title, price, imageUrl, html}, sort }
 */
function fromTs(ts) { return ts?.toDate ? ts.toDate() : null; }

export async function getNearestSpecialEvent() {
    ensureFirebase();
    const col = collection(db, "special_snack_events");

    // 공개 + 오픈 + 마감 시점 이후만 필터
    const now = new Date();
    // ⚠️ 아래 where 조합은 인덱스가 필요할 수 있음(콘솔에서 안내해줌)
    const q = query(
        col,
        where("published", "==", true),
        where("status", "==", "open"),
        where("deadlineTs", ">=", now),
        orderBy("deadlineTs", "asc"),
        qLimit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;

    const d = snap.docs[0];
    const x = d.data() || {};
    return {
        id: d.id,
        title: x.title || "",
        branch: x.branch || "",
        deadlineTs: fromTs(x.deadlineTs),           // Date
        deadlineDate: x.deadlineDate || "",
        product: {
            title: x.product?.title || "",
            price: Number(x.product?.price || 0),
            imageUrl: x.product?.imageUrl || "",
            html: x.product?.html || "",
        },
    };
}

/**
 * 기타 상품(키즈카페 이용권, 체험 클래스 등) 리스트
 *
 * 컬렉션: snack_menu_basic
 */
export async function listOtherProducts({ limit = 30 } = {}) {
    ensureFirebase();
    const col = collection(db, "snack_menu_basic"); // 🔹 콘솔에서 컬렉션 이름 꼭 확인

    const q = query(col, orderBy("order", "asc"), qLimit(limit));
    const snap = await getDocs(q);

    console.log("[listOtherProducts] docs:", snap.size);

    if (snap.empty) return [];

    return snap.docs.map((d) => {
        const x = d.data() || {};
        const priceNumber = Number(x.price || 0);
        const priceLabel =
            typeof x.priceLabel === "string" && x.priceLabel.trim()
                ? x.priceLabel
                : `₩${priceNumber.toLocaleString()}`;

        return {
            key: d.id,
            title: x.title || "",
            badge: x.badge || "기타 상품",
            price: priceLabel,
            time: x.timeLabel || "",
            remain: x.remainLabel || "",
            place: x.place || "",
            thumb: x.imageUrl || "",
            order: Number(x.order || 9999),
        };
    });
}
