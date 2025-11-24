// src/services/bannerService.js
/* eslint-disable */
import {
    getFirestore, collection, doc,
    getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit
} from "firebase/firestore";



import { db, ensureFirebase } from "./api";



/**
 * 리스트 조회
 * @param {Object} opts
 * @param {string}  opts.zone        - 배너 존(선택)
 * @param {boolean} opts.onlyVisible - visible=true만
 * @param {number}  opts.pageSize    - 최대 개수
 * @returns {Promise<{items: Array}>}
 */

export async function listBanners({ pageSize = 5 } = {}) {
    console.log("[bannerService] listBanners 호출");            // ← 서비스 레벨 로그
    const colRef = collection(db, "banners");

    // 우선 sort 하나만: 인덱스 없어도 통과되게
    const qRef = query(colRef, orderBy("sort", "desc"), limit(pageSize));
    const snap = await getDocs(qRef);

    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log("[bannerService] 가져옴 size=", items.length);
    return { items };
}
/**
 * 단건 조회
 */
export async function getBanner(bannerId) {
    const db = ensureFirebase();
    const ref = doc(db, "banners", bannerId);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * 생성
 * @param {Object} data - { imageUrl, title, subtitle, ctaText, ctaHref, visible, sort, zone, createdAt }
 */
export async function createBanner(data = {}) {
    const db = ensureFirebase();
    const colRef = collection(db, "banners");
    const now = new Date();
    const payload = {
        imageUrl: "",
        title: "",
        subtitle: "",
        ctaText: "",
        ctaHref: "",
        visible: true,
        sort: 0,
        zone: "",
        createdAt: now,
        ...data,
    };
    const res = await addDoc(colRef, payload);
    return res.id;
}

/**
 * 수정(병합 아님: 필요한 필드만 전달)
 */
export async function updateBanner(bannerId, patch = {}) {
    const db = ensureFirebase();
    const ref = doc(db, "banners", bannerId);
    await updateDoc(ref, patch);
    return true;
}

/**
 * 삭제
 */
export async function deleteBanner(bannerId) {
    const db = ensureFirebase();
    const ref = doc(db, "banners", bannerId);
    await deleteDoc(ref);
    return true;
}

/**
 * visible 토글 (유틸)
 */
export async function toggleBannerVisible(bannerId, nextVisible) {
    return updateBanner(bannerId, { visible: !!nextVisible });
}
