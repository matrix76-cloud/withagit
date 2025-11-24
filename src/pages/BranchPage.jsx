/* eslint-disable */
// /src/pages/BranchesPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Link, useSearchParams } from "react-router-dom";
import mainLogoRed from "../assets/images/mainlogo2.png";
import { FiList, FiMapPin } from "react-icons/fi";
import { useUser } from "../contexts/UserContext";
import { submitNextAgitSuggest } from "../services/branchSuggestService";
import SpotsSection from "../components/SpotsSection";


/* ── Theme helpers ─────────────────────────────────── */
const getNavy = (t) => t?.colors?.navy || "#1A2B4C";
const getBlue = (t) => t?.colors?.blue || "#3A6FF8";

const bg = "#FFFFFF";
const navy = "#1A2B4C";
const text = "var(--color-text, #111827)";
const sub = "#6b7280";
const HEADER_VAR = "var(--header-height, 64px)";
const line = "rgba(17,24,39,.12)";
const primary = "var(--color-primary, #2F6BFF)";
const accent = "var(--color-accent, #F07A2A)";


/* ── Layout ────────────────────────────────────────── */
const Page = styled.main`
  --header-h: var(--header-h, 56px);
  --footer-h: var(--footer-h, 320px);
  min-height: calc(100vh - var(--header-h) - var(--footer-h));
  padding: 40px 16px 120px;
  background: #fff;
`;
const BottomGap = styled.div`height: 48px;`;

const Wrap = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 0 auto;
`;

/* ── Title & View Toggle ───────────────────────────── */
const TitleRow = styled.div`
  display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 16px; margin-bottom: 20px;
`;
const H1 = styled.h1`
  margin: 0; color: ${({ theme }) => getNavy(theme)};
  font-size: clamp(22px, 3.2vw, 30px);
`;

/* ── List Grid & Card ─────────────────────────────── */
const Grid = styled.div`
  display: grid; gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  @media (max-width: 980px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const Card = styled(Link)`
  display: block;
  border-radius: 16px; border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 8px 22px rgba(0,0,0,.06);
  background: #fff; overflow: hidden; text-decoration: none; color: ${getNavy};
  transition: transform .12s ease, box-shadow .12s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.08); }
`;
const Thumb = styled.div`
  aspect-ratio: 16 / 9; background: #eef2f6;
  img{ width:100%; height:100%; object-fit: cover; display:block; }
`;
const CardBody = styled.div` padding: 12px 14px 14px; `;
const CardTitle = styled.div` color: ${getNavy}; margin-bottom: 4px; `;
const CardSub = styled.div` font-size: 14px; color: ${getNavy}; opacity: .7; `;

/* 스페셜 카드(Coming Soon / 제안하기) */
const SpecialCard = styled.div`
  border-radius: 16px; background: linear-gradient(180deg, #F7FAFF 0%, #EEF4FF 100%);
  border: 1px solid rgba(0,0,0,.06); box-shadow: 0 8px 22px rgba(0,0,0,.06);
  display: grid; grid-template-rows: 1fr auto; overflow: hidden;
`;
const SpecialBody = styled.div`
  padding: 36px 18px; display: grid; place-items: center; text-align: center; color: ${getNavy};
  h3{ margin:0; font-size: clamp(18px, 2.6vw, 28px); font-weight: 600; }
  p{ margin:8px 0 0; opacity:.7; }
`;
const SpecialFooter = styled.div` padding: 12px 14px 14px; background:#fff; `;

/* CTA 버튼을 Link 대신 button으로 */
const CtaBtn = styled.button`
  display:inline-flex; align-items:center; justify-content:center;
  height:40px; padding:0 14px; border-radius:10px; font-weight:600;
  background: ${({ theme }) => theme?.colors?.primary || "#FF8C00"}; color:#fff; border:0; cursor:pointer;
  &:hover{ filter:brightness(.98); }
`;

/* ── Map View ─────────────────────────────────────── */
const MapBox = styled.div`
  height: 560px; border-radius: 16px; border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 8px 22px rgba(0,0,0,.06); overflow: hidden; background: #eef2f6;
  @media (max-width: 640px){ height: 420px; }
`;


const ModalBg = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(48px, 10vh, 120px) 16px 32px;
  overflow: auto;
  z-index: 4000;
  top:100px;
`;
const ModalCard = styled.div`
  width: min(720px, 100%);
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: auto;
  max-height: min(80vh, 760px);
`;
const ModalHead = styled.div`
  padding:12px 16px; border-bottom:1px solid rgba(0,0,0,.06);
  display:flex; align-items:center; justify-content:space-between; gap:8px;
`;
const ModalTitle = styled.div`font-weight:900;color:${navy};`;

const ModalBody = styled.div`
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr;
  & > * { width: 100%; }
`;
const Label = styled.label`font-size:12px;color:${sub};`;
const Input = styled.input`
  width: 100%;
  height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  &:focus{ outline: none; border-color: ${primary}; box-shadow: 0 0 0 3px color-mix(in srgb, ${primary} 18%, transparent); }
`;
const Textarea = styled.textarea`
  width: 100%;
  min-height: 180px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  resize: vertical;
  &:focus{ outline: none; border-color: ${primary}; box-shadow: 0 0 0 3px color-mix(in srgb, ${primary} 18%, transparent); }
`;
const ModalFoot = styled.div`padding:12px 16px;border-top:1px solid rgba(0,0,0,.06);display:flex;gap:8px;justify-content:flex-end;`;
const Ghost = styled.button`
  height:42px;padding:0 16px;border-radius:12px;font-weight:900;cursor:pointer;border:1px solid #e5e7eb;background:#fff;color:#111;
`;
const PrimaryBtn = styled.button`
  height:42px;padding:0 16px;border-radius:12px;font-weight:900;cursor:pointer;border:0;color:#fff;background:${accent};
  &:disabled{opacity:.6;cursor:not-allowed;}
`;
const Select = styled.select`
  width: 100%;
  height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  background: #fff;
  &:focus{ outline: none; border-color: ${primary}; box-shadow: 0 0 0 3px color-mix(in srgb, ${primary} 18%, transparent); }
`;

const loadKakaoIfNeeded = () =>
  new Promise((resolve) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) resolve();
    else if (window.kakao && window.kakao.maps && window.kakao.maps.load) window.kakao.maps.load(resolve);
    else { console.warn("[BranchesPage] Kakao Maps SDK not found on window."); resolve(); }
  });

const ensureWithagitMarkerCSS = () => {
  if (document.getElementById("withagit-marker-css")) return;
  const style = document.createElement("style");
  style.id = "withagit-marker-css";
  style.textContent = `
    .withagit-marker{ position:relative; transform:translateZ(0); pointer-events:auto; cursor:pointer; }
    .withagit-marker .chip{ height:36px; width:36px; border-radius:12px; background:transparent !important; display:flex; align-items:center; justify-content:center; box-shadow:none !important; }
    .withagit-marker .chip img{ display:none !important; }
  `;
  document.head.appendChild(style);
};

/* 샘플 데이터 */
const useBranches = () => {
  const data = useMemo(() => ([
    {
      id: "sooji-1",
      type: "open",
      name: "첫번째 아지트 (수지초)",
      district: "경기 용인시 수지구 · 운영 중",
      lat: 37.394921, lng: 127.110648,
      thumbnail: "/images/banner1.jpg",
    },
    {
      id: "coming-1",
      type: "coming",
      title: "Coming Soon!",
      subtitle: "두번째 아지트",
      footTitle: "두번째 아지트",
      footSub: "Open 예정 · 위치 공개 전",
    },
    {
      id: "suggest-1",
      type: "suggest",
      title: "다음 아지트를 제안해주세요!",
      subtitle: "우리 동네에 아지트가 필요하세요?",
      ctaLabel: "제안 남기기",
    },
  ]), []);
  return data;
};

/* 픽업 샘플 */
const makePickupSpots = (lat, lng, count = 10) =>
  Array.from({ length: count }).map((_, i) => ({
    id: `pk-${i + 1}`,
    title: "수지점 픽업 가능",
    place: ["수지프라자", "라임스퀘어", "한빛빌딩", "센트럴타워", "메디컬프라자", "스타오피스", "리버뷰상가", "파크스퀘어", "더샵상가", "스테이션몰"][i % 10],
    lat: lat + ([0.0009, -0.0007, 0.0003, -0.0006, 0.0005, 0.0001, -0.0009, 0.0008, -0.0002, -0.0004][i % 10]),
    lng: lng + ([0.0004, 0.0002, -0.0005, -0.0003, 0.0007, -0.0008, 0.0006, -0.0002, 0.0009, -0.0006][i % 10]),
  }));


  /* ===== 다음 아지트 제안하기 모달 ===== */
  function NextAgitModal({ open, onClose, onSubmitted }) {
      const { phoneE164 } = useUser() || {};
      const [region, setRegion] = React.useState("");
      const [schoolName, setSchoolName] = React.useState("");
      const [activityPlaces, setActivityPlaces] = React.useState("");
      const [reason, setReason] = React.useState("");
      const [userName, setUserName] = React.useState("");
      const [contact, setContact] = React.useState("");
      const [busy, setBusy] = React.useState(false);
  
      React.useEffect(() => {
          if (!open) {
              setRegion(""); setSchoolName(""); setActivityPlaces(""); setReason("");
              setUserName(""); setContact(""); setBusy(false);
          }
      }, [open]);
  
      const submit = async () => {
          if (!phoneE164) {
              alert("제안을 보내려면 로그인이 필요합니다.");
              try { window.location.href = `/login?from=${encodeURIComponent("/help")}`; } catch { }
              return;
          }
          const r = region.trim(), s = schoolName.trim(), a = activityPlaces.trim(), rsn = reason.trim();
          if (!r || !rsn) {
              alert("희망지역과 추천 의견(이유)을 입력해 주세요.");
              return;
          }
          try {
              setBusy(true);
              await submitNextAgitSuggest({
                  userPhoneE164: phoneE164,
                  region: r,
                  schoolName: s || null,
                  activityPlaces: a || null,
                  reason: rsn,
                  userName: userName.trim() || null,
                  contact: contact.trim() || null,
              });
              alert("제안해주셔서 감사합니다!\n모든 의견은 내부 검토 후 서비스 확장에 활용됩니다.");
              onSubmitted?.({ region: r, reason: rsn });
              onClose?.();
          } catch (e) {
              console.error("[NextAgitModal] submit failed:", e);
              alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
          } finally { setBusy(false); }
      };
  
      if (!open) return null;
  
      return (
          <ModalBg onClick={onClose}>
              <ModalCard onClick={(e) => e.stopPropagation()}>
                  <ModalHead>
                      <ModalTitle>다음 아지트 제안하기</ModalTitle>
                      <button onClick={onClose} aria-label="닫기"
                          style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 18, color: "#6b7280" }}>✕</button>
                  </ModalHead>
  
                  <ModalBody>
                      <div>
                          <Label>기본 정보 입력</Label>
                          <div style={{ display: "grid", gap: 10 }}>
                              <div>
                                  <Label htmlFor="na-region">희망지역 (시/구/동까지)</Label>
                                  <Input id="na-region" value={region} onChange={e => setRegion(e.target.value)}
                                      placeholder="예) 성남시 분당구 정자동" />
                              </div>
                              <div>
                                  <Label htmlFor="na-school">주요 생활권</Label>
                                  <Input id="na-school" value={schoolName} onChange={e => setSchoolName(e.target.value)}
                                      placeholder="추천 아지트 학교명(선택)" />
                              </div>
                              <div>
                                  <Input value={activityPlaces} onChange={e => setActivityPlaces(e.target.value)}
                                      placeholder="주요 학원 및 활동 장소(선택)" />
                              </div>
                          </div>
                      </div>
  
                      <div>
                          <Label>추천 의견</Label>
                          <Textarea
                              value={reason}
                              onChange={e => setReason(e.target.value)}
                              placeholder={`왜 이 동네에 아지트가 필요하다고 생각하시나요?\n예) 맞벌이 가정이 많고 초등학교 방과 후 돌봄이 부족해요.\n예) 근처에 사교육 시설은 많은데 아이들이 쉴 곳이 없어요.`}
                          />
                      </div>
  
                      <div>
                          <Label>연락처 (선택)</Label>
                          <Input value={userName} onChange={e => setUserName(e.target.value)} placeholder="이름(선택)" />
                          <div style={{ height: 6 }} />
                          <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="휴대폰 번호 또는 이메일(선택)" />
                          <div style={{ marginTop: 8, color: sub, fontSize: 12 }}>
                              * 시장 조사를 위한 인터뷰 요청을 드릴 수 있습니다. 아이들이 방과 후 안전하고 행복하게 지낼 수 있는 아지트를 찾아요.
                          </div>
                      </div>
                  </ModalBody>
  
                  <ModalFoot>
                      <Ghost type="button" onClick={onClose}>취소</Ghost>
                      <PrimaryBtn type="button" onClick={submit} disabled={busy}>
                          {busy ? "제출 중..." : "제안 보내기"}
                      </PrimaryBtn>
                  </ModalFoot>
              </ModalCard>
          </ModalBg>
      );
  }

export default function BranchesPage() {
  const branches = useBranches();
  const [sp, setSp] = useSearchParams();
  const view = sp.get("view") === "map" ? "map" : "list";

  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const overlaysRef = useRef([]);

  // ✅ 팝업 상태
  const [openNext, setOpenNext] = useState(false);

  const onToggleView = (next) => {
    setSp((prev) => { const n = new URLSearchParams(prev); n.set("view", next); return n; }, { replace: true });
  };

  useEffect(() => {
    if (view !== "map") return;
    let map;
    const init = async () => {
      ensureWithagitMarkerCSS();
      await loadKakaoIfNeeded();
      if (!(window.kakao && window.kakao.maps && mapRef.current)) return;
      const { kakao } = window;

      if (branches.length >= 1) {
        const bounds = new kakao.maps.LatLngBounds();
        branches.filter(b => b.type === "open").forEach((b) => bounds.extend(new kakao.maps.LatLng(b.lat, b.lng)));
        const center = bounds.isEmpty() ? new kakao.maps.LatLng(37.5665, 126.9780) : bounds.getCenter();
        map = new kakao.maps.Map(mapRef.current, { center, level: 5 });
        if (!bounds.isEmpty()) map.setBounds(bounds, 40, 40, 40, 40);

        const overlays = [];
        branches.filter(b => b.type === "open").forEach((b) => {
          const pos = new kakao.maps.LatLng(b.lat, b.lng);
          const mainHtml = `
            <a href="/branches/${b.id}" class="withagit-marker" role="link" aria-label="${b.name}" target="_self" style="text-decoration:none;">
              <div class="chip"></div>
            </a>`;
          const mainOv = new kakao.maps.CustomOverlay({ content: mainHtml, position: pos, xAnchor: .5, yAnchor: 1, zIndex: 15 });
          mainOv.setMap(map); overlays.push(mainOv);

          const pin = new kakao.maps.Marker({
            position: pos,
            image: new kakao.maps.MarkerImage(
              "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="22" viewBox="0 0 24 36"><path fill="#2B6CB0" d="M12 0C6.5 0 2 4.5 2 10c0 6.3 6.7 15.2 9.1 18.3.5.6 1.3.6 1.8 0C15.3 25.2 22 16.3 22 10 22 4.5 17.5 0 12 0zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/><circle cx="12" cy="10" r="2.2" fill="#fff" opacity=".9"/></svg>'),
              new kakao.maps.Size(14, 22),
              { offset: new kakao.maps.Point(7, 22) }
            ),
            zIndex: 8
          });
          pin.setMap(map); overlays.push(pin);

          makePickupSpots(b.lat, b.lng, 10).forEach((p) => {
            const ppos = new kakao.maps.LatLng(p.lat, p.lng);
            const lbl = new kakao.maps.CustomOverlay({
              content: `<div style="background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:8px;padding:2px 6px;white-space:nowrap;font-size:10px;font-weight:700;color:#1A2B4C;box-shadow:0 2px 6px rgba(0,0,0,.08);margin-left:10px;">수지점 픽업 가능 <small style="font-weight:600;opacity:.75;margin-left:6px;">· ${p.place}</small></div>`,
              position: ppos, xAnchor: 0, yAnchor: .55, zIndex: 9
            });
            lbl.setMap(map); overlays.push(lbl);
          });
        });

        overlaysRef.current = overlays;
      }
      mapObjRef.current = map;
    };

    init();
    return () => {
      overlaysRef.current.forEach((ov) => ov && ov.setMap && ov.setMap(null));
      overlaysRef.current = [];
      mapObjRef.current = null;
    };
  }, [view, branches]);

  return (
    <>
      <SpotsSection />
    </>
  );
}
