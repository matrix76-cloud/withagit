/* eslint-disable */
import { db, storage } from "./api"; // ✅ storage 추가
import {
    addDoc, collection, query, where, orderBy, getDocs,
    serverTimestamp, doc, updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * 기존 제출 (로그인 필수) — 그대로 유지
 */
export async function submitFeedback({ title, content, contact, userPhoneE164 }) {
    if (!userPhoneE164) throw new Error("userPhoneE164 is required");
    const refCol = collection(db, "feedbacks");
    const docData = {
        userPhoneE164,
        title,
        content,
        contact: contact || null,
        status: "new",
        createdAt: serverTimestamp(),
        ua: (typeof navigator !== "undefined" && navigator.userAgent) || null,
    };
    await addDoc(refCol, docData);
    return true;
}

/**
 * 확장 제출 — 카테고리/이름/첨부파일(이미지/PDF) 포함
 * files: File[] (선택)
 * category: "program"|"snack"|"improve"|"etc" (기본 program)
 * userName: string (선택)
 */
/* eslint-disable */
export async function submitFeedbackExt({
    userPhoneE164, title, content, contact,
    category = "program", userName = null, files = [],
}) {
    console.groupCollapsed("[feedback] submitFeedbackExt");
    try {
        if (!userPhoneE164) throw new Error("userPhoneE164 is required");

        // ── 0) 환경 점검
        console.log("[feedback] args", {
            userPhoneE164, titleLen: title?.length, contentLen: content?.length,
            contact, category, userName, filesCount: files?.length || 0
        });
        // storage 체크
        try {
            // eslint-disable-next-line no-undef
            console.log("[feedback] storage exists?", !!storage);
        } catch (e) {
            console.warn("[feedback] storage not in scope!", e);
        }

        // ── 1) 본문 먼저 생성
        const refCol = collection(db, "feedbacks");
        const base = {
            userPhoneE164, title, content,
            contact: contact || null, category,
            userName: userName || null, status: "new",
            createdAt: serverTimestamp(),
            ua: (typeof navigator !== "undefined" && navigator.userAgent) || null,
        };
        console.time("[feedback] addDoc");
        const docRef = await addDoc(refCol, base);
        console.timeEnd("[feedback] addDoc");
        console.log("[feedback] docRef", docRef.id);

        // ── 2) 첨부 업로드 (있으면)
        let attachments = [];
        if ((files || []).length) {
            console.log("[feedback] uploading files…", files.map((f, i) => ({
                i, name: f.name, type: f.type, bytes: f.size
            })));

            const uploads = (files || []).slice(0, 5).map((file, i) => {
                const ext = (file.name && file.name.split(".").pop()) || "dat";
                const path = `feedbacks/${userPhoneE164}/${docRef.id}/att_${Date.now()}_${i}.${ext}`;
                const r = ref(storage, path);

                console.time(`[feedback] upload ${i}`);
                return uploadBytes(r, file)
                    .then(async snap => {
                        console.timeEnd(`[feedback] upload ${i}`);
                        const url = await getDownloadURL(snap.ref);
                        const meta = {
                            name: file.name,
                            url,
                            type: file.type || "application/octet-stream",
                            bytes: file.size || null,
                            path
                        };
                        console.log(`[feedback] uploaded ${i}`, meta);
                        return meta;
                    })
                    .catch(err => {
                        console.timeEnd(`[feedback] upload ${i}`);
                        console.error(`[feedback] upload error ${i}`, { path, name: file.name, type: file.type, bytes: file.size }, err);
                        // 실패는 이후 results 집계에서 처리
                        throw err;
                    });
            });

            console.time("[feedback] Promise.allSettled uploads");
            const results = await Promise.allSettled(uploads);
            console.timeEnd("[feedback] Promise.allSettled uploads");

            const failed = results.filter(r => r.status === "rejected");
            const succeeded = results.filter(r => r.status === "fulfilled").map(r => r.value);
            attachments = succeeded;

            console.log("[feedback] upload results", {
                total: results.length,
                ok: succeeded.length,
                fail: failed.length
            });
            if (failed.length) {
                // 첫 실패 로그도 남김
                console.error("[feedback] an upload failed example:", failed[0]?.reason);
            }

            // ── 3) 문서에 첨부 목록 병합
            console.time("[feedback] updateDoc(attachments)");
            await updateDoc(docRef, {
                ...(attachments.length ? { attachments } : {}),
                ...(failed.length ? { attachmentsFailed: true } : {}),
                updatedAt: serverTimestamp(),
            });
            console.timeEnd("[feedback] updateDoc(attachments)");
        } else {
            console.log("[feedback] no files to upload");
        }

        console.groupEnd();
        return { id: docRef.id, attachments: attachments || [] };
    } catch (e) {
        console.error("[feedback] submitFeedbackExt fatal", e);
        console.groupEnd();
        throw e;
    }
}




/** 내 제안 목록 조회 (최신순) */
export async function listMyFeedbacks(userPhoneE164) {
    if (!userPhoneE164) return [];
    const ref = collection(db, "feedbacks");
    const q = query(ref,
        where("userPhoneE164", "==", userPhoneE164),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
