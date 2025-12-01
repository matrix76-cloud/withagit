// src/services/pickupPlacesService.js
/* eslint-disable */
import {
    collection, query, where, getDocs,
    writeBatch, doc, setDoc, deleteDoc,
    serverTimestamp, getFirestore,
} from "firebase/firestore";

// ✅ 프로젝트에 이미 있는 firebase 초기화에서 db를 export 했다면 아래 경로 맞춰줘
import { db } from "./api";



// 🔧 add: 유틸 - undefined 제거 또는 null 치환
function toNullableNumber(v) {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
}
function stripUndefined(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) out[k] = v;          // undefined만 제거, null은 허용
    }
    return out;
}
function normalizeForFirestore(p) {
    return stripUndefined({
        ...p,
        // 숫자형 필드는 null 또는 number만 저장(절대 undefined 금지)
        walkDistanceM: toNullableNumber(p.walkDistanceM),
        walkMinutes: toNullableNumber(p.walkMinutes),
        // 문자열 필드도 undefined가 생기지 않게 보정
        branchName: (p.branchName ?? "") + "",
        placeName: (p.placeName ?? "") + "",
        address: (p.address ?? "") + "",
        phone: p.phone == null ? "" : String(p.phone),
        lat: p.lat == null ? "" : String(p.lat),
        lng: p.lng == null ? "" : String(p.lng),
    });
}


export async function listPlaces(branch = "전체") {
    const ref = collection(db, "pickup_places");
    const snap = branch === "전체"
        ? await getDocs(ref)
        : await getDocs(query(ref, where("branchName", "==", branch)));

    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
        const ta = (a.updatedAt && a.updatedAt.toMillis) ? a.updatedAt.toMillis() : 0;
        const tb = (b.updatedAt && b.updatedAt.toMillis) ? b.updatedAt.toMillis() : 0;
        return tb - ta;
    });
    return rows;
}



export async function removePlace(id) {
    const ref = doc(db, "pickup_places", id);
    await deleteDoc(ref);
}

export async function upsertPlace(p) {
    const id = p.id || cryptoRandom();
    const ref = doc(db, "pickup_places", id);
    const payload = normalizeForFirestore({
        ...p,
        id,
        createdAt: p.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    await setDoc(ref, payload, { merge: true });
    return id;
}

export async function bulkUpsert(places) {
    const parts = chunk(places, 450);
    for (const part of parts) {
        const batch = writeBatch(db);
        part.forEach((p) => {
            const id = p.id || cryptoRandom();
            const ref = doc(db, "pickup_places", id);
            const payload = normalizeForFirestore({
                ...p,
                id,
                createdAt: p.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            batch.set(ref, payload, { merge: true }); // payload에 undefined 없음!
        });
        await batch.commit();
    }
}


/* ===== helpers ===== */
function chunk(arr, n) {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
}
function safeNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}
function cryptoRandom() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return "id_" + Math.random().toString(36).slice(2);
}
