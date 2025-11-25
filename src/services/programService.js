/* eslint-disable */
// src/services/programService.js
// Withagit — 프로그램 예약 관리/사용자 조회 서비스 (Firestore 기반)

import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
} from "firebase/firestore";

import { db } from "./api";

const COLLECTION_ID = "withagit_programs";

/**
 * subPrograms 구조를 화면에서 쓰기 좋은 dateSlots 형태로 플랫하게 변환
 *
 * subPrograms: [
 *   {
 *     id, title, capacity, reserved, priceKRW, isActive,
 *     dateSlots: [
 *       { date: 'YYYY-MM-DD', timeSlots: [ { id, label, capacity, reserved, ... } ] }
 *     ]
 *   }
 * ]
 *
 * => dateSlots: [
 *   {
 *     date: 'YYYY-MM-DD',
 *     timeSlots: [
 *       {
 *         id, label, capacity, reserved,
 *         title(세부 프로그램 이름), name, subProgramId, subProgramTitle, ...
 *       }
 *     ]
 *   }
 * ]
 */
function buildDateSlotsFromSubPrograms(rawSubPrograms = []) {
    const dateMap = new Map();

    rawSubPrograms.forEach((sp) => {
        if (!sp) return;
        const spId = sp.id || "";
        const spTitle = sp.title || sp.name || "";
        const spCapacity = sp.capacity ?? null;
        const spReserved = sp.reserved ?? null;

        const dsArr = Array.isArray(sp.dateSlots) ? sp.dateSlots : [];
        dsArr.forEach((ds) => {
            if (!ds || !ds.date) return;
            const date = ds.date;

            if (!dateMap.has(date)) {
                dateMap.set(date, { date, timeSlots: [] });
            }

            const timeSlotsArr = Array.isArray(ds.timeSlots) ? ds.timeSlots : [];
            timeSlotsArr.forEach((ts, idx) => {
                if (!ts) return;

                const slotId = ts.id || `${spId || "sub"}-${date}-${idx}`;
                const baseCapacity =
                    ts.capacity ?? spCapacity ?? 0;
                const baseReserved =
                    ts.reserved ?? spReserved ?? 0;

                dateMap.get(date).timeSlots.push({
                    id: slotId,
                    label: ts.label || "",
                    capacity: Number(baseCapacity || 0),
                    reserved: Number(baseReserved || 0),

                    // 🔥 세부 프로그램 이름/매핑 정보
                    title: ts.title || spTitle || "",
                    name: ts.name || "",
                    subTitle: ts.subTitle || "",
                    subProgramId: spId,
                    subProgramTitle: spTitle,

                    // 혹시 타임슬롯에 다른 커스텀 필드들이 있다면 그대로 살려주기
                    ...(() => {
                        const {
                            id,
                            label,
                            capacity,
                            reserved,
                            title,
                            name,
                            subTitle,
                            ...rest
                        } = ts || {};
                        return rest || {};
                    })(),
                });
            });
        });
    });

    const arr = Array.from(dateMap.values());
    // 날짜 기준 정렬
    arr.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    return arr;
}

/**
 * Firestore 문서 → 프런트에서 쓰기 좋은 형태로 변환
 */
function mapProgramDoc(docSnap) {
    const data = docSnap.data() || {};

    const rawDateSlots = Array.isArray(data.dateSlots) ? data.dateSlots : [];
    const rawSubPrograms = Array.isArray(data.subPrograms) ? data.subPrograms : [];

    // ✅ 우선순위:
    // 1) subPrograms가 있으면 subPrograms 기반으로 dateSlots를 계산
    // 2) 없으면 기존 dateSlots 그대로 사용
    let dateSlots = rawDateSlots;
    if (rawSubPrograms.length > 0) {
        dateSlots = buildDateSlotsFromSubPrograms(rawSubPrograms);
    }

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
        // 사용 여부
        isActive: !!data.isActive,
        order: data.order ?? 0,
        // 프로그램 단위 총 정원/현재 예약 인원
        totalCapacity: data.totalCapacity ?? 0,
        totalReserved: data.totalReserved ?? 0,
        // ✅ 화면에서 바로 쓰는 통합 dateSlots (subPrograms → 플랫 변환)
        dateSlots,
        // ✅ 원본 subPrograms도 그대로 노출 (필요 시 디테일 UI에서 참조)
        subPrograms: rawSubPrograms,
    };
}

/**
 * 프로그램 목록 조회 (관리자용: 전체 + 비활성 포함)
 */
export async function listPrograms() {
    const colRef = collection(db, COLLECTION_ID);
    const q = query(colRef, orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(mapProgramDoc);
}

/**
 * 프로그램 목록 조회 (사용자용: 활성 프로그램만)
 */
export async function listProgramsForUser() {
    const colRef = collection(db, COLLECTION_ID);
    const q = query(
        colRef,
        where("isActive", "==", true),
        orderBy("order", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapProgramDoc);
}

/**
 * 프로그램 1개 저장 (create + update 겸용)
 *
 * ⚠️ subPrograms는 현재 관리자 UI에서 직접 다루지 않는다면
 *    프로그램 수정 시 기존 subPrograms를 날리지 않도록
 *    "program.subPrograms가 명시적으로 넘어올 때만" 덮어쓰게 처리.
 */
export async function saveProgram(program) {
    const colRef = collection(db, COLLECTION_ID);
    const safeId = program.id || doc(colRef).id;

    const base = {
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
    };

    // ✅ subPrograms는 program에 명시적으로 넘어올 때만 덮어쓰도록 처리
    const subProgramsPart =
        "subPrograms" in program
            ? {
                  subPrograms: Array.isArray(program.subPrograms)
                      ? program.subPrograms
                      : [],
              }
            : {};

    const dateSlotsPart = {
        // 관리자 UI에서 직접 dateSlots를 다룰 때 사용 (아직은 옵션)
        dateSlots: Array.isArray(program.dateSlots)
            ? program.dateSlots.map((ds) => ({
                  date: ds.date,
                  timeSlots: Array.isArray(ds.timeSlots)
                      ? ds.timeSlots.map((ts) => {
                            const {
                                id,
                                label,
                                capacity,
                                reserved,
                                title,
                                name,
                                subTitle,
                                ...rest
                            } = ts || {};

                            return {
                                id: id || "",
                                label: label || "",
                                capacity: Number(capacity || 0),
                                reserved: Number(reserved || 0),
                                title: title || "",
                                name: name || "",
                                subTitle: subTitle || "",
                                ...rest,
                            };
                        })
                      : [],
              }))
            : [],
    };

    const clean = {
        ...base,
        ...subProgramsPart,
        ...dateSlotsPart,
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
