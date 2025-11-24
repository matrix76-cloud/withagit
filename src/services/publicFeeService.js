// src/services/publicFeeService.js
/* eslint-disable */
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db, ensureFirebase } from "./api";

ensureFirebase();

/** 사용자용: 단일 요금표 문서 읽기 */
export async function fetchFeeTable(id = "simple-default") {
    const snap = await getDoc(doc(db, "fee_tables", id));
    if (!snap.exists()) return null;

    const data = snap.data() || {};
    const rows = Array.isArray(data.items)
        ? data.items.map((r) => ({ name: r.name, fee: r.fee }))
        : [];

    return { id: snap.id, rows };
}
