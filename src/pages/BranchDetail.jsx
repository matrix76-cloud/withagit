/* eslint-disable */
// /src/pages/BranchDetail.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import mainLogoWhite from "../assets/images/mainlogo.png";
import {
  FiInfo, FiClock, FiBookOpen, FiShield, FiMapPin,
  FiCreditCard, FiImage, FiCheckCircle, FiAlertTriangle,
  FiFileText, FiUsers, FiAward, FiCamera, FiNavigation, FiHelpCircle
} from "react-icons/fi";
import { MdLocalParking } from "react-icons/md";
import PickupDialog from "../components/PickupDialog";

/** 사용자용 Read 전용 서비스 (픽업 지점) */
import { fetchPickupPlaces } from "../services/publicPickupService";
/** 공간스팟 이미지 서비스 (intro_spots) */
import { listIntroSpots } from "../services/introSpotsService";

/* ── Styled ─────────────────────────────────────────── */
const Section = styled.section`background:#fff; padding:56px 16px;`;
const Wrap = styled.div`max-width:${({ theme }) => theme?.sizes?.container || "1120px"}; margin:0 auto;`;
const Content = styled.div`padding-top:18px; display:grid; gap:42px;`;

const TitleBar = styled.div`
  left:0; right:0; background:#fff; z-index:9;
  border-bottom:1px solid rgba(0,0,0,.06); display:flex; align-items:center;
`;
const TitleInner = styled.div`
  max-width:${({ theme }) => theme?.sizes?.container || "1120px"};
  margin:0 auto; width:100%; padding:8px 16px;
  display:grid; grid-template-columns:1fr auto; align-items:center; gap:16px;
`;
const TitleBlock = styled.div`display:grid; gap:6px;`;
const Heading = styled.h1`
  margin:0; color:${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  font-size:clamp(22px,3.2vw,32px); letter-spacing:-0.2px;
`;
const Sub = styled.div`color:${({ theme }) => theme?.colors?.navy || "#1A2B4C"}; opacity:.7; font-size:14px;`;
const TitleActions = styled.div`display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;`;
const BtnOutline = styled.a`
  height:44px; padding:0 16px; border-radius:12px; text-decoration:none;
  display:inline-flex; align-items:center; justify-content:center;
  border:2px solid ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  color:${({ theme }) => theme?.colors?.primary || "#FF7A00"}; background:transparent;
  &:hover{ background:rgba(255,122,0,.08); }
`;
const BtnPrimary = styled.a`
  height:44px; padding:0 16px; border-radius:12px; text-decoration:none;
  display:inline-flex; align-items:center; justify-content:space-between; gap:8px;
  background:${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  color:#fff; border:2px solid transparent; transition:filter .15s ease;
  &&:hover, &&:focus-visible{ filter:brightness(.96); }
  &[aria-disabled="true"]{ opacity:.5; pointer-events:none; }
`;
const Btn = styled.a`
  height:44px; padding:0 16px; border-radius:12px; text-decoration:none;
  display:inline-flex; align-items:center; justify-content:center;
  border:2px solid ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  color:${({ theme }) => theme?.colors?.primary || "#FF7A00"}; background:transparent;
  &:hover{ background:rgba(255,122,0,.08); }
`;

const Card = styled.div`
  background:#fff; border:1px solid rgba(0,0,0,.06); box-shadow:0 8px 22px rgba(0,0,0,.06);
  width:100%; overflow:hidden; border-radius:12px;
`;
const CardHeader = styled.div`
  background:#F3F3F8; color:#000;
  font-size:18px; line-height:1.2; padding:14px 16px;
  display:flex; align-items:center; gap:8px; svg{ width:18px; height:18px; }
`;
const CardBody = styled.div`padding:16px; border-top:1px solid rgba(0,0,0,.04);`;
const TitleSm = styled.div`
  margin-top:12px; margin-bottom:6px; color:${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  display:inline-flex; align-items:center; gap:6px; svg{ width:16px; height:16px; }
`;
const P = styled.p`margin:0; color:${({ theme }) => theme?.colors?.navy || "#1A2B4C"}; opacity:.85; line-height:1.55;`;

/* ===== Gallery ===== */
const Gallery = styled.div`
  display:grid; gap:10px; grid-template-columns:repeat(4,1fr);
  @media (max-width:980px){ grid-template-columns:repeat(2,1fr); }
`;
const Thumb = styled.div`
  position:relative; aspect-ratio:4 / 3; border-radius:12px; overflow:hidden; background:#eef2f6;
  img{ width:100%; height:100%; object-fit:cover; display:block; transition: transform .35s ease; }
  &:hover img{ transform: scale(1.03); }
`;
const ThumbBadge = styled.span`
  position:absolute; left:8px; top:8px;
  background: rgba(255,255,255,.92); color:#1A2B4C; font-weight:800; font-size:11px;
  padding:2px 8px; border-radius:999px;
`;

/* Location */
const MapContainer = styled.div`
  width:100%; height:360px; border-radius:12px; overflow:hidden; background:#eef2f6; position:relative;
`;
const DetailsGrid = styled.div`
  display:grid; gap:12px; grid-template-columns:1.2fr .8fr;
  @media (max-width:900px){ grid-template-columns:1fr; }
`;
const Row = styled.div`display:grid; gap:6px;`;
const Text = styled.div`color:${({ theme }) => theme?.colors?.navy || "#1A2B4C"}; opacity:.85; line-height:1.55;`;

/* ── Kakao helpers ─────────────────────────────────── */
const loadKakaoIfNeeded = () => new Promise((resolve) => {
  if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) resolve();
  else if (window.kakao && window.kakao.maps && window.kakao.maps.load) window.kakao.maps.load(resolve);
  else resolve();
});
const PICKUP_PIN_SVG = (fill = "#2B6FCE") =>
  "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="22" viewBox="0 0 24 36">
      <path fill="${fill}" d="M12 0C6.5 0 2 4.5 2 10c0 6.3 6.7 15.2 9.1 18.3.5.6 1.3.6 1.8 0C15.3 25.2 22 16.3 22 10 22 4.5 17.5 0 12 0zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
      <circle cx="12" cy="10" r="2.2" fill="#fff" opacity=".9"/>
    </svg>`
  );
const createPickupMarkerImage = (kakao) => new kakao.maps.MarkerImage(
  PICKUP_PIN_SVG(), new kakao.maps.Size(14, 22), { offset: new kakao.maps.Point(7, 22) }
);
const buildKakaoLink = ({ lat, lng, name }) => `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
const buildNaverLink = ({ lat, lng, name }) => `https://map.naver.com/v5/directions/-/-/${lng},${lat}/${encodeURIComponent(name)}`;

/* 거리/샘플 유틸 */
function kmBetween(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function sample(arr, max = 600) {
  if (!arr?.length) return [];
  if (arr.length <= max) return arr;
  const step = Math.ceil(arr.length / max);
  const out = [];
  for (let i = 0; i < arr.length; i += step) out.push(arr[i]);
  return out;
}

/* ── 페이지 컴포넌트 ───────────────────────────────── */
export default function BranchDetailPage() {
  const params = useParams();
  const [sp, setSp] = useSearchParams();
  const initialTab = sp.get("tab") || "basic";

  const [active, setActive] = useState(initialTab);
  const isAutoScrollingRef = useRef(false);

  const [pickupOpen, setPickupOpen] = useState(false);
  const sectionRefs = useRef({ basic: null, space: null, operation: null, location: null, about: null });

  /* 카카오 맵 refs */
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const overlaysRef = useRef([]);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  /* Firestore에서 실제 픽업 지점 로딩 */
  const [pickupSpots, setPickupSpots] = useState([]); // [{id,name,address,lat,lng}]
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchPickupPlaces();
        const withLL = list.filter(x => Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lng)));
        const noLL = list.filter(x => !withLL.includes(x));
        const merged = [...withLL, ...noLL];
        if (alive) setPickupSpots(merged);
      } catch (e) {
        console.error("fetchPickupPlaces error:", e);
        if (alive) setPickupSpots([]);
      }
    })();
    return () => { alive = false; };
  }, [params?.id]);

  /* 공간 스팟 이미지 불러오기 (intro_spots) */
  const [spots, setSpots] = useState([]);
  const [spotsLoading, setSpotsLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { items } = await listIntroSpots({ publishedOnly: true, pageSize: 48, orderByField: "sort", orderDirection: "desc" });
        if (!alive) return;
        setSpots(items || []);
      } catch (e) {
        console.error("[BranchDetail] listIntroSpots error:", e);
        if (alive) setSpots([]);
      } finally {
        if (alive) setSpotsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [params?.id]);

  const branch = useMemo(() => ({
    id: params?.id || "sooji-1",
    name: "첫번째 아지트 (수지초)",
    address: "경기 용인시 수지구 00-00",
    addressJibun: "수지구 00-00",
    phone: "031-548-2962",
    hours: "평일 13:00~21:00 / 주말 10:00~18:00",
    lat: 37.394921, lng: 127.110648, floor: "B1",
    landmarkTips: "정문 오른쪽 엘리베이터 2번 이용",
    wayfinding: "안내 표지판 따라 좌측 30m",
    parkingSummary: "지하 주차 30분 무료(정산 필요)",
    /* 폴백 이미지 (intro_spots 없을 때만 사용) */
    images: [
      "/images/banner1.jpg", "/images/banner2.jpg", "/images/banner3.jpg", "/images/banner4.jpg",
      "/images/banner5.jpg", "/images/banner6.jpg", "/images/banner7.jpg", "/images/banner8.jpg",
      "/images/banner9.jpg", "/images/banner10.jpg",
    ],
  }), [params]);

  const onTabClick = (next) => {
    const el = sectionRefs.current[next];
    if (!el) return;
    setSp(prev => { const n = new URLSearchParams(prev); n.set("tab", next); return n; }, { replace: true });
    setActive(next);
    smoothScrollTo(el);
  };
  const smoothScrollTo = (el) => {
    const GLOBAL_HEADER_H = 56, TITLE_GAP = 50, TITLE_H = 92, TABS_H = 56, TAB_OVERLAP = 50;
    const OFFSET_Y = GLOBAL_HEADER_H + TITLE_GAP + TITLE_H + TABS_H + TAB_OVERLAP + 8;
    const top = el.getBoundingClientRect().top + window.pageYOffset - OFFSET_Y;
    isAutoScrollingRef.current = true;
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => { isAutoScrollingRef.current = false; }, 600);
  };

  /* 스크롤 → 탭 활성화 */
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (isAutoScrolling) return;
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
      if (visible.length) {
        const id = visible[0].target.id;
        if (id && id !== active) {
          setActive(id);
          setSp(prev => { const n = new URLSearchParams(prev); n.set("tab", id); return n; }, { replace: true });
        }
      }
    }, { root: null, threshold: [0, .2, .6], rootMargin: "-20% 0px -60% 0px" });
    const refs = Object.values(sectionRefs.current);
    refs.forEach(el => el && obs.observe(el));
    let isAutoScrolling = false;
    const unSub = () => { isAutoScrolling = false; };
    return () => { obs.disconnect(); unSub(); };
  }, [active, setSp]);

  /* 카카오 맵 초기화 */
  useEffect(() => {
    let map;
    let clusterer = null;
    const allOverlays = [];
    const cleanup = () => {
      if (clusterer && clusterer.clear && clusterer.setMap) { try { clusterer.clear(); clusterer.setMap(null); } catch { } }
      allOverlays.forEach(ov => { try { ov?.setMap?.(null); } catch { } });
      overlaysRef.current = [];
      mapObjRef.current = null;
    };

    const init = async () => {
      await loadKakaoIfNeeded();
      if (!(window.kakao && window.kakao.maps && mapRef.current)) return;
      const { kakao } = window;

      const center = new kakao.maps.LatLng(branch.lat, branch.lng);
      map = new kakao.maps.Map(mapRef.current, { center, level: 4 });

      // 메인 위치 라벨
      const mainMarker = new kakao.maps.Marker({ position: center, zIndex: 10 });
      mainMarker.setMap(map);
      const mainLabelHtml = `
        <div style="padding:8px 10px;border-radius:10px;background:#fff;border:1px solid rgba(0,0,0,.1);box-shadow:0 8px 20px rgba(0,0,0,.08);">
          <div style="display:flex;align-items:center;gap:6px;">
            <img src="${mainLogoWhite}" alt="" style="height:16px;width:auto;display:block;" />
            <div style="font-weight:800;color:#1A2B4C;">${branch.name}</div>
          </div>
          <div style="opacity:.75;font-size:12px;margin-top:2px;">${branch.address}${branch.addressJibun ? ` (${branch.addressJibun})` : ""}</div>
        </div>`;
      const mainLabel = new kakao.maps.CustomOverlay({ content: mainLabelHtml, position: center, yAnchor: 1.1, zIndex: 12 });
      mainLabel.setMap(map);
      allOverlays.push(mainMarker, mainLabel);

      // 픽업 포인트 렌더링
      const MAX_DRAW = 600;
      const RADIUS_KM = 2;
      const pinImg = createPickupMarkerImage(kakao);
      const withLL = (pickupSpots || []).filter(p => Number.isFinite(+p.lat) && Number.isFinite(+p.lng));
      const inRadius = withLL.filter(p => kmBetween(branch.lat, branch.lng, +p.lat, +p.lng) <= RADIUS_KM);
      const draw = sample(inRadius.length ? inRadius : withLL, MAX_DRAW);

      const info = new kakao.maps.InfoWindow({ zIndex: 20 });
      if (kakao.maps.MarkerClusterer) {
        clusterer = new kakao.maps.MarkerClusterer({ map, averageCenter: true, minLevel: 5, gridSize: 60 });
        const markers = draw.map(p => {
          const pos = new kakao.maps.LatLng(+p.lat, +p.lng);
          const m = new kakao.maps.Marker({ position: pos, image: pinImg, zIndex: 8 });
          kakao.maps.event.addListener(m, "click", () => {
            const html = `<div style="padding:6px 8px;font-size:12px;">
              <div style="font-weight:700;color:#1A2B4C;">${p.name || ""}</div>
              ${p.address ? `<div style="opacity:.8;">${p.address}</div>` : ""}
            </div>`;
            info.setContent(html); info.open(map, m);
          });
          return m;
        });
        clusterer.addMarkers(markers);
        allOverlays.push(clusterer, info);
      } else {
        const bounds = new kakao.maps.LatLngBounds();
        draw.forEach(p => {
          const pos = new kakao.maps.LatLng(+p.lat, +p.lng);
          const m = new kakao.maps.Marker({ position: pos, image: pinImg, zIndex: 8 });
          m.setMap(map); bounds.extend(pos);
          kakao.maps.event.addListener(m, "click", () => {
            const html = `<div style="padding:6px 8px;font-size:12px;">
              <div style="font-weight:700;color:#1A2B4C;">${p.name || ""}</div>
              ${p.address ? `<div style="opacity:.8;">${p.address}</div>` : ""}
            </div>`;
            info.setContent(html); info.open(map, m);
          });
          allOverlays.push(m);
        });
        try { map.setBounds(bounds, 40, 40, 40, 40); } catch { }
        allOverlays.push(info);
      }

      mapObjRef.current = map;
      overlaysRef.current = allOverlays;
    };

    init();
    return cleanup;
  }, [branch.lat, branch.lng, branch.address, branch.addressJibun, pickupSpots]);

  const copyAddr = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        branch.address + (branch.addressJibun ? ` (${branch.addressJibun})` : "")
      );
      setCopied(true); setTimeout(() => setCopied(false), 1200);
    } catch { alert("복사에 실패했어요. 브라우저 설정을 확인해주세요."); }
  }, [branch.address, branch.addressJibun]);

  const kakaoLink = useMemo(() => `https://map.kakao.com/link/to/${encodeURIComponent(branch.name)},${branch.lat},${branch.lng}`, [branch]);
  const naverLink = useMemo(() => `https://map.naver.com/v5/directions/-/-/${branch.lng},${branch.lat}/${encodeURIComponent(branch.name)}`, [branch]);

  const _handlePickup = () => { navigate("/pickup/apply"); };

  // intro_spots를 갤러리 데이터로 변환 (없으면 폴백)
  const galleryItems = useMemo(() => {
    if (spots?.length) {
      return spots.map(s => ({ src: s.imageUrl, badge: s.badge, title: s.title, subtitle: s.subtitle }));
    }
    return (branch.images || []).map(src => ({ src, badge: "", title: "", subtitle: "" }));
  }, [spots, branch.images]);

  return (
    <Section>
      <PickupDialog
        isOpen={pickupOpen}
        branch={{ id: branch.id, name: branch.name, address: `${branch.address}${branch.addressJibun ? ` (${branch.addressJibun})` : ""}` }}
        onClose={() => setPickupOpen(false)}
        onSubmit={async () => { }}
      />

      <TitleBar>
        <TitleInner>
          <TitleBlock>
            <Heading>{branch.name}</Heading>
            <Sub>{branch.address} · {branch.hours}</Sub>
          </TitleBlock>
          <TitleActions>
            <BtnPrimary as="button" onClick={_handlePickup}>픽업 신청하기</BtnPrimary>
            <BtnOutline href="/membership">멤버십 안내</BtnOutline>
            <BtnOutline href="http://pf.kakao.com/_qYzxkn" target="_blank" rel="noreferrer">카카오톡 채널</BtnOutline>
          </TitleActions>
        </TitleInner>
      </TitleBar>

      <Wrap>
        <Content>
          {/* 기본 정보 */}
          <div id="basic" ref={(el) => (sectionRefs.current.basic = el)}>
            <Card>
              <CardHeader><FiInfo /> 기본 정보</CardHeader>
              <CardBody>
                <TitleSm><FiFileText /> 지점명</TitleSm><P>{branch.name}</P>
                <TitleSm><FiClock /> 운영 시간</TitleSm>
                <P>평일: 13:00 ~ 21:00</P><P>주말: 10:00 ~ 18:00</P><P>공휴일: 공지 별도 운영</P>
                <TitleSm><FiHelpCircle /> 연락처</TitleSm>
                <div style={{ display: "flex", gap: 8, flexWrap: "front" }}>
                  <BtnPrimary as="button" onClick={copyAddr}>{copied ? "복사됨!" : "주소 복사"}</BtnPrimary>
                  <Btn href={`tel:${branch.phone.replace(/\D/g, "")}`}>전화 걸기</Btn>
                  <BtnOutline href="http://pf.kakao.com/_qYzxkn" target="_blank" rel="noreferrer">카카오톡 채널</BtnOutline>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 공간 소개 (intro_spots) */}
          <div id="space" ref={(el) => (sectionRefs.current.space = el)}>
            <Card>
              <CardHeader><FiImage /> 공간 소개</CardHeader>
              <CardBody>
                {spotsLoading && <P style={{ opacity: .7 }}>이미지 불러오는 중…</P>}
                {!spotsLoading && !galleryItems.length && <P style={{ opacity: .7 }}>등록된 이미지가 없습니다.</P>}
                {!!galleryItems.length && (
                  <Gallery>
                    {galleryItems.map((it, i) => (
                      <Thumb key={i} as="div">
                        <img src={it.src} alt={it.title || `스팟 이미지 ${i + 1}`} loading="lazy" />
                        {it.badge ? <ThumbBadge>{it.badge}</ThumbBadge> : null}
                      </Thumb>
                    ))}
                  </Gallery>
                )}
              </CardBody>
            </Card>
          </div>

          {/* 운영 안내 */}
          <div id="operation" ref={(el) => (sectionRefs.current.operation = el)}>
            <Card>
              <CardHeader><FiBookOpen /> 운영 안내</CardHeader>
              <CardBody>
                <TitleSm><FiUsers /> 운영 형태</TitleSm>
                <P>평일: 방과 후 아지트로 운영(정규 멤버십)</P>
                <P>주말/공휴일: 특별 프로그램 및 대관 운영</P>
                <TitleSm><FiAward /> 기타 안내</TitleSm>
                <P>프로그램/일정은 지점 사정에 따라 변동될 수 있으며, 앱 공지로 안내합니다.</P>
              </CardBody>
            </Card>
          </div>

          {/* 위치 정보 · 픽업 */}
          <div id="location" ref={(el) => (sectionRefs.current.location = el)}>
            <Card>
              <CardHeader><FiMapPin /> 위치 정보 · 픽업</CardHeader>
              <CardBody>
                <MapContainer role="img" aria-label={`지도(${branch.name} 위치)`}>
                  <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                </MapContainer>

                <DetailsGrid>
                  <Row>
                    <TitleSm><FiMapPin /> 주소</TitleSm>
                    <Text>
                      {branch.address}{branch.addressJibun ? ` (${branch.addressJibun})` : ""}{branch.floor ? ` · ${branch.floor}` : ""}
                    </Text>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <BtnPrimary as="button" onClick={copyAddr}>{copied ? "복사됨!" : "주소 복사"}</BtnPrimary>
                      <Btn href={`tel:${branch.phone.replace(/\D/g, "")}`}>전화 걸기</Btn>
                    </div>
                  </Row>

                  <Row>
                    <TitleSm><FiNavigation /> 찾아오는 길</TitleSm>
                    <Text>{branch.landmarkTips}</Text>
                    <Text>{branch.wayfinding}</Text>
                    {branch.parkingSummary && <Text style={{ opacity: 0.8 }}><MdLocalParking /> 주차: {branch.parkingSummary}</Text>}
                  </Row>

                  <Row>
                    <TitleSm><FiCheckCircle /> 픽업 가능 장소</TitleSm>
                    <Text style={{ opacity: .75, marginTop: 8 }}>픽업 장소는 계속 업데이트 됩니다!</Text>
                  </Row>
                </DetailsGrid>
              </CardBody>
            </Card>
          </div>

          {/* 지점 소개(관리자) */}
          <div id="about" ref={(el) => (sectionRefs.current.about = el)}>
            <Card>
              <CardHeader><FiFileText /> 지점 소개(관리자)</CardHeader>
              <CardBody>
               
                <TitleSm><FiShield /> 안전/운영정책</TitleSm>
                <P>안전 가이드, 운영 규정 등은 별도 페이지로 연결 가능합니다.</P>
              </CardBody>
            </Card>
          </div>
        </Content>
      </Wrap>
    </Section>
  );
}
