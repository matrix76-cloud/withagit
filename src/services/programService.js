/* eslint-disable */
// src/services/programService.js
// Withagit — 프로그램 예약 관리용 서비스 (Firestore 기반)

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
} from "firebase/firestore";


import { db } from "./api";

const COLLECTION_ID = "withagit_programs";

/**
 * Firestore 문서 → 프런트에서 쓰기 좋은 형태로 변환
 */
function mapProgramDoc(docSnap) {
    const data = docSnap.data() || {};
    return {
        id: docSnap.id,
        title: data.title || "",
        // 가격은 그냥 숫자
        priceKRW: data.priceKRW ?? 0,
        // 상세 설명
        description: data.description || "",
        // 메인 이미지 1장
        heroImageUrl: data.heroImageUrl || "",
        // 상세 이미지 여러 장
        detailImageUrls: Array.isArray(data.detailImageUrls)
            ? data.detailImageUrls
            : [],
        // 태그 제거 → 사용 안 함
        isActive: !!data.isActive,
        order: data.order ?? 0,
        // 프로그램 단위 총 정원/현재 예약 인원
        totalCapacity: data.totalCapacity ?? 0,
        totalReserved: data.totalReserved ?? 0,
        // 날짜별 시간 슬롯
        dateSlots: Array.isArray(data.dateSlots) ? data.dateSlots : [],
    };
}

/**
 * 프로그램 목록 조회
 */
export async function listPrograms() {
    const colRef = collection(db, COLLECTION_ID);
    const snap = await getDocs(colRef);
    const items = snap.docs.map(mapProgramDoc);
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    return items;
}

/**
 * 프로그램 1개 저장 (create + update 겸용)
 */
export async function saveProgram(program) {
    const colRef = collection(db, COLLECTION_ID);
    const safeId = program.id || doc(colRef).id;

    const clean = {
        title: program.title || "",
        priceKRW: Number(program.priceKRW || 0),
        description: program.description || "",
        heroImageUrl: program.heroImageUrl || "",
        detailImageUrls: Array.isArray(program.detailImageUrls)
            ? program.detailImageUrls.filter(Boolean)
            : [],
        isActive: !!program.isActive,
        order: Number(program.order ?? 0),
        totalCapacity: Number(program.totalCapacity || 0),
        totalReserved: Number(program.totalReserved || 0),
        dateSlots: Array.isArray(program.dateSlots)
            ? program.dateSlots.map((ds) => ({
                date: ds.date,
                timeSlots: Array.isArray(ds.timeSlots)
                    ? ds.timeSlots.map((ts) => ({
                        id: ts.id || "",
                        label: ts.label || "",
                        capacity: Number(ts.capacity || 0),
                        reserved: Number(ts.reserved || 0),
                    }))
                    : [],
            }))
            : [],
    };

    const docRef = doc(db, COLLECTION_ID, safeId);
    await setDoc(docRef, clean, { merge: true });
    return { ...clean, id: safeId };
}

/**
 * 프로그램 삭제
 */
export async function deleteProgram(programId) {
    if (!programId) return;
    const docRef = doc(db, COLLECTION_ID, programId);
    await deleteDoc(docRef);
}
