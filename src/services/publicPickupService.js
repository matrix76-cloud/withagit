// src/services/publicPickupService.js
/* eslint-disable */
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { db, ensureFirebase } from "./api";

ensureFirebase();


export async function fetchPickupPlaces() {
    const colRef = collection(db, "pickup_places");
    const snap = await getDocs(colRef);
    const out = [];
    snap.forEach((d) => {
        const v = d.data() || {};
        const name = String(v.placeName ?? "").trim();
        const address = String(v.address ?? "").trim();
        const lat = Number(v.lat);
        const lng = Number(v.lng);
        out.push({
            id: d.id,
            name: name || "(이름없음)",
            address,
            lat: Number.isFinite(lat) ? lat : null,
            lng: Number.isFinite(lng) ? lng : null,
        });
    });
    // 좌표가 있는 항목 먼저, 없는 항목 뒤로
    out.sort((a, b) => (a.lat && a.lng ? 0 : 1) - (b.lat && b.lng ? 0 : 1));
    return out;
}