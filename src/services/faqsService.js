// src/services/faqsService.js
/* eslint-disable */
// Firestore 실데이터 연동: faqs 컬렉션에서 cat asc → order asc 정렬로 전량 조회
import { db, ensureFirebase } from "./api";
import {
  collection, getDocs, query, orderBy
} from "firebase/firestore";

/**
 * Firestore에서 FAQ 전량 로드
 * - 정렬: cat asc → order asc
 * - 반환: { categories: string[], faqs: Array<{id, cat, q, a, order, ...}> }
 */
async function getFaqData() {
  const ref = collection(db, "faqs");
  const qy = query(ref, orderBy("cat", "asc"), orderBy("order", "asc"));
  const snap = await getDocs(qy);
  const faqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const categories = Array.from(new Set(faqs.map(x => x.cat)));
  return { categories, faqs };
}

// ✅ named export
export { getFaqData };
// ✅ default export (default-only 환경 호환)
export default getFaqData;

// ✅ CJS interop (번들러가 commonjs 변환 시 안전장치; 실패해도 무시)
try { module.exports = { ...module.exports, getFaqData, default: getFaqData }; } catch (_) { }
