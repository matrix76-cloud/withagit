import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useSearchParams, useParams, Link } from "react-router-dom";

/* ── Fixed heights (필요시 조정) ───────────────────── */
const GLOBAL_HEADER_H = 56;  // 전역 헤더 높이
const TITLE_GAP = 100;       // 헤더와 타이틀 사이 여백 (요청: 150px)
const TITLE_H = 92;          // 제목(지점명) 바 높이
const TABS_H = 56;           // 탭 바 높이
const OFFSET_Y = GLOBAL_HEADER_H + TITLE_GAP + TITLE_H + TABS_H + 8; // 스크롤 보정

/* ── Styled ─────────────────────────────────────────── */
const Section = styled.section`
  background: #fff;
  padding: 56px 16px;
`;
const Wrap = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 0 auto;
`;
const Content = styled.div`
  padding-top: 18px;
  display: grid;
  gap: 42px; /* 섹션 간 간격 */
`;

/* ── TitleBar(고정) ─────────────────────────────────── */
const TitleBar = styled.div`
  position: fixed;
  top: ${GLOBAL_HEADER_H + TITLE_GAP}px; /* 전역 헤더에서 150px 아래 */
  left: 0; right: 0;
  height: ${TITLE_H}px;
  background: #fff;
  z-index: 9;
  border-bottom: 1px solid rgba(0,0,0,.06);
  display: flex; align-items: center;
`;
const TitleInner = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 0 auto;
  width: 100%;
  padding: 8px 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
`;
const TitleBlock = styled.div`
  display: grid; gap: 6px;
`;
const Heading = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};

  font-size: clamp(22px, 3.2vw, 32px);
  letter-spacing: -0.2px;
`;
const Sub = styled.div`
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  opacity: .7; font-size: 14px;
`;
const TitleActions = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;
`;
const Btn = styled.a`
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  text-decoration: none;
  display: inline-flex; align-items: center; justify-content: center;
  border: 2px solid ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  color: ${({ theme }) => theme?.colors?.primary || "#FF7A00"};
  background: transparent;
  &:hover { background: rgba(255,122,0,.08); }
`;

const GapCover = styled.div`
  position: fixed;
  top: ${GLOBAL_HEADER_H}px;   /* 전역 헤더 바로 아래 */
  left: 0;
  right: 0;
  height: ${TITLE_GAP}px;      /* 150px 공간 전체를 덮음 */
  background: #fff;
  z-index: 8;                  /* 컨텐츠 위, TitleBar/탭(9)보다 아래 */
  border-bottom: 1px solid rgba(0,0,0,.04); /* 살짝 경계만 */
`;

const BtnPrimary = styled(Btn)`
  background: ${({ theme }) => theme?.colors?.primary || "#2563EB"};
  color: #fff; border-color: transparent;
  &:hover { filter: brightness(.95); }
`;

/* ── Tabs (고정, 좌측 정렬) ─────────────────────────── */
const Tabs = styled.div`
  position: fixed;
  top: ${GLOBAL_HEADER_H + TITLE_GAP + TITLE_H}px;
  left: 0; right: 0;
  height: ${TABS_H}px;
  z-index: 9;
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,.06);
  display: flex; align-items: flex-end;
`;
const TabsInner = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 0 auto;
  width: 100%;
  padding: 8px 16px 0;
  display: flex; gap: 8px;
  justify-content: flex-start; /* 왼쪽부터 시작 */
  overflow-x: auto;
`;
const Tab = styled.button`
  appearance: none; background: transparent; border: 0; cursor: pointer;
  padding: 12px 16px; border-radius: 12px 12px 0 0; font-weight: 800;
  color: ${({ $active, theme }) =>
    $active ? (theme?.colors?.navy || "#1A2B4C") : "rgba(26,43,76,.7)"};
  position: relative; white-space: nowrap;
  &:after{
    content:""; position:absolute; left:0; right:0; bottom:-1px; height:3px;
    background: ${({ $active, theme }) => $active ? (theme?.colors?.primary || "#FF7A00") : "transparent"};
    border-radius: 2px;
  }
`;

/* ── spacers to avoid overlay ──────────────────────── */
const HeaderSpacer = styled.div` height: ${GLOBAL_HEADER_H}px; `;
const GapSpacer = styled.div` height: ${TITLE_GAP}px; `;
const TitleSpacer = styled.div` height: ${TITLE_H}px; `;
const TabsSpacer = styled.div` height: ${TABS_H}px; `;

/* ── Common Blocks ─────────────────────────────────── */
const Box = styled.div`
  background: #fff; border: 1px solid rgba(0,0,0,.06);
  border-radius: 16px; padding: 16px;
  box-shadow: 0 8px 22px rgba(0,0,0,.06);
  width: 100%;
`;
const CardTitle = styled.div`
  font-weight: 900; margin-bottom: 8px;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  font-size: 18px;
`;
const TitleSm = styled.div`
  margin-top: 12px; margin-bottom: 6px; font-weight: 900;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
`;
const P = styled.p`
  margin: 0; color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  opacity: .85; line-height: 1.55;
`;

/* ── Gallery ───────────────────────────────────────── */
const Gallery = styled.div`
  display: grid; gap: 10px; grid-template-columns: repeat(4, 1fr);
  @media (max-width: 980px){ grid-template-columns: repeat(2, 1fr); }
`;
const Thumb = styled(Link)`
  aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; background: #eef2f6;
  img{ width:100%; height:100%; object-fit:cover; display:block; transition: transform .35s ease; }
  &:hover img{ transform: scale(1.03); }
`;

/* ── Location (Kakao Map) ──────────────────────────── */
const MapContainer = styled.div`
  width: 100%; height: 360px; border-radius: 12px; overflow: hidden; background: #eef2f6; position: relative;
`;
const MapActions = styled.div`
  position: absolute; top: 12px; right: 12px; display: flex; gap: 8px;
  a, button { height:34px; padding:0 12px; border-radius:10px; border:0; font-weight:800; cursor:pointer;
    background: rgba(255,255,255,.95); box-shadow: 0 4px 12px rgba(0,0,0,.08); text-decoration:none; color: inherit; }
`;
const DetailsGrid = styled.div`
  display: grid; gap: 12px; grid-template-columns: 1.2fr .8fr;
  @media (max-width: 900px){ grid-template-columns: 1fr; }
`;
const Row = styled.div`display: grid; gap: 6px;`;
const Text = styled.div`
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"}; opacity: .85; line-height: 1.55;
`;

/* ── Tabs Data ─────────────────────────────────────── */
const TAB_KEYS = ["intro", "hours", "programs", "safety", "location", "amenities", "pricing", "gallery"];
const TAB_LABELS = {
  intro: "소개글", hours: "영업시간", programs: "프로그램", safety: "안전 시스템",
  location: "위치정보", amenities: "주차 및 편의시설", pricing: "요금정보", gallery: "사진정보",
};

/* ── Kakao helpers ─────────────────────────────────── */
const loadKakaoIfNeeded = () =>
  new Promise((resolve) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) resolve();
    else if (window.kakao && window.kakao.maps && window.kakao.maps.load) window.kakao.maps.load(resolve);
    else resolve(); // SDK가 없으면 조용히 패스(콘솔로 확인 가능)
  });
const buildKakaoLink = ({ lat, lng, name }) =>
  `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
const buildNaverLink = ({ lat, lng, name }) =>
  `https://map.naver.com/v5/directions/-/-/${lng},${lat}/${encodeURIComponent(name)}`;

export default function BranchDetailPage() {
  const params = useParams();
  const [sp, setSp] = useSearchParams();
  const initialTab = sp.get("tab") || "intro";

  const [active, setActive] = useState(initialTab);
  const isAutoScrollingRef = useRef(false);

  const sectionRefs = useRef({
    intro: null, hours: null, programs: null, safety: null,
    location: null, amenities: null, pricing: null, gallery: null,
  });

  /* Kakao map */
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // 스크롤 → 탭 활성화
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (isAutoScrollingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        if (visible.length) {
          const id = visible[0].target.id;
          if (id && id !== active) {
            setActive(id);
            setSp(prev => { const n = new URLSearchParams(prev); n.set("tab", id); return n; }, { replace: true });
          }
        }
      },
      { root: null, threshold: [0, 0.2, 0.6], rootMargin: "-20% 0px -60% 0px" }
    );
    TAB_KEYS.forEach(k => { const el = sectionRefs.current[k]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [params?.id, setSp, active]);

  // 첫 진입 복원
  useEffect(() => {
    const t = sp.get("tab") || "intro";
    const el = sectionRefs.current[t];
    if (!el) return;
    requestAnimationFrame(() => setTimeout(() => smoothScrollTo(el), 80));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const branch = useMemo(() => ({
    id: params?.id || "sooji",
    name: "첫번째 아지트 (수지초)",
    address: "경기 용인시 수지구 00-00",
    addressJibun: "수지구 00-00",
    phone: "010-6214-9756",
    hours: "평일 13:00~21:00 / 주말 10:00~18:00",
    lat: 37.394921, lng: 127.110648, floor: "B1",
    landmarkTips: "정문 오른쪽 엘리베이터 2번 이용",
    wayfinding: "안내 표지판 따라 좌측 30m",
    parkingSummary: "지하 주차 30분 무료(정산 필요)",
    images: [
      "/images/banner1.jpg", "/images/banner2.jpg", "/images/banner3.jpg", "/images/banner4.jpg",
      "/images/banner5.jpg", "/images/banner6.jpg", "/images/banner7.jpg", "/images/banner8.jpg",
      "/images/banner9.jpg", "/images/banner10.jpg", "/images/banner3.jpg", "/images/banner4.jpg",
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
    const top = el.getBoundingClientRect().top + window.pageYOffset - OFFSET_Y;
    isAutoScrollingRef.current = true;
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => { isAutoScrollingRef.current = false; }, 600);
  };

  // Kakao Map init
  useEffect(() => {
    let marker, map;
    const init = async () => {
      await loadKakaoIfNeeded();
      if (!(window.kakao && window.kakao.maps)) return;
      const { kakao } = window;
      const center = new kakao.maps.LatLng(branch.lat, branch.lng);
      if (!mapRef.current) return;
      map = new kakao.maps.Map(mapRef.current, { center, level: 3 });
      marker = new kakao.maps.Marker({ position: center }); marker.setMap(map);
      map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
      map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
      mapObjRef.current = map;
    };
    init();
    return () => { mapObjRef.current = null; };
  }, [branch.lat, branch.lng]);

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(
        branch.address + (branch.addressJibun ? ` (${branch.addressJibun})` : "")
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("복사에 실패했어요. 브라우저 설정을 확인해주세요.");
    }
  };

  const kakaoLink = buildKakaoLink({ lat: branch.lat, lng: branch.lng, name: branch.name });
  const naverLink = buildNaverLink({ lat: branch.lat, lng: branch.lng, name: branch.name });

  return (
    <Section>
      {/* 고정 타이틀 바 */}
      <GapCover />
      <TitleBar>
        <TitleInner>
          <TitleBlock>
            <Heading>{branch.name}</Heading>
            <Sub>{branch.address} · {branch.hours}</Sub>
          </TitleBlock>
          <TitleActions>
            <BtnPrimary href="/pickup">픽업 신청하기</BtnPrimary>
            <Btn href="/membership">멤버십 안내</Btn>
          </TitleActions>
        </TitleInner>
      </TitleBar>

      {/* 고정 탭 바 */}
      <Tabs>
        <TabsInner role="tablist" aria-label="지점 상세 탭">
          {TAB_KEYS.map((key) => (
            <Tab
              key={key}
              role="tab"
              aria-selected={active === key}
              $active={active === key}
              onClick={() => onTabClick(key)}
            >
              {TAB_LABELS[key]}
            </Tab>
          ))}
        </TabsInner>
      </Tabs>

      <Wrap>
        {/* 상단 고정 UI만큼 여백 확보 */}
        <HeaderSpacer />
        <GapSpacer />
        <TitleSpacer />
        <TabsSpacer />

        <Content>
          {/* 소개글 — 한 박스 */}
          <div id="intro" ref={(el) => (sectionRefs.current.intro = el)}>
            <Box>
              <CardTitle>소개글</CardTitle>
              <P>
                시간제/등하원/주말 케어 등 지점별 맞춤 프로그램을 운영합니다.
                아이들이 안전하고 즐겁게 머무를 수 있도록 전문 교사와
                표준화된 운영 매뉴얼을 갖추고 있습니다.
              </P>
              <TitleSm>핵심 포인트</TitleSm>
              <P>① 접근성 좋은 위치 · ② 놀이/학습 균형 커리큘럼 · ③ 상시 보호자 알림 시스템</P>
              <TitleSm>상담 안내</TitleSm>
              <P>문의: {branch.phone}</P>
            </Box>
          </div>

          {/* 영업시간 — 한 박스 */}
          <div id="hours" ref={(el) => (sectionRefs.current.hours = el)}>
            <Box>
              <CardTitle>영업시간</CardTitle>
              <TitleSm>운영 정보</TitleSm>
              <P>운영시간: {branch.hours}</P>
              <P>문의: {branch.phone}</P>
              <TitleSm>공휴일/특이사항</TitleSm>
              <P>법정 공휴일은 별도 공지에 따릅니다.</P>
            </Box>
          </div>

          {/* 프로그램 — 한 박스 */}
          <div id="programs" ref={(el) => (sectionRefs.current.programs = el)}>
            <Box>
              <CardTitle>프로그램</CardTitle>
              <TitleSm>개요</TitleSm>
              <P>시간제/등하원/주말 케어 등 지점별 맞춤 프로그램을 운영합니다.</P>
              <TitleSm>대상/연령</TitleSm>
              <P>만 3세~초등 저학년 중심(지점 상황에 따라 상이)</P>
              <TitleSm>특화 수업</TitleSm>
              <P>창의놀이 · 기초체육 · 생활안전 등 선택 운영</P>
            </Box>
          </div>

          {/* 안전 시스템 — 한 박스 */}
          <div id="safety" ref={(el) => (sectionRefs.current.safety = el)}>
            <Box>
              <CardTitle>안전 시스템</CardTitle>
              <TitleSm>운영</TitleSm>
              <P>출입관리·보호자 알림·신원/자격 검증으로 안심 환경 제공</P>
              <TitleSm>CCTV/안전 교육</TitleSm>
              <P>공개 범위·보존기간 준수, 정기 안전 교육 실시</P>
              <TitleSm>보험</TitleSm>
              <P>영업배상책임보험 등 관련 보험 가입</P>
            </Box>
          </div>

          {/* 위치정보 — 지도 + 상세 */}
          <div id="location" ref={(el) => (sectionRefs.current.location = el)}>
            <Box>
              <CardTitle>위치정보</CardTitle>

              <MapContainer id="kakao-map" role="img" aria-label={`지도(${branch.name} 위치)`}>
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
  
              </MapContainer>

              <DetailsGrid>
                <Row>
                  <TitleSm>주소</TitleSm>
                  <Text>
                    {branch.address}
                    {branch.addressJibun ? ` (${branch.addressJibun})` : ""}
                    {branch.floor ? ` · ${branch.floor}` : ""}
                  </Text>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <BtnPrimary as="button" onClick={copyAddr}>
                      {copied ? "복사됨!" : "주소 복사"}
                    </BtnPrimary>
                    <Btn href={`tel:${branch.phone.replace(/\D/g, "")}`}>전화 걸기</Btn>
                  </div>
                </Row>

                <Row>
                  <TitleSm>찾아오는 길</TitleSm>
                  <Text>{branch.landmarkTips}</Text>
                  <Text>{branch.wayfinding}</Text>
                  {branch.parkingSummary && (
                    <Text style={{ opacity: 0.8 }}>주차: {branch.parkingSummary}</Text>
                  )}
                </Row>
              </DetailsGrid>
            </Box>
          </div>

          {/* 주차 및 편의시설 — 한 박스 */}
          <div id="amenities" ref={(el) => (sectionRefs.current.amenities = el)}>
            <Box>
              <CardTitle>주차 및 편의시설</CardTitle>
              <TitleSm>주차</TitleSm><P>건물 내 주차 30분 무료(정산 필요)</P>
              <TitleSm>편의시설</TitleSm><P>유모차 보관, 엘리베이터, 키즈 화장실 구비</P>
              <TitleSm>이용 팁</TitleSm><P>주차 혼잡 시간대(18~20시) 대중교통 권장</P>
            </Box>
          </div>

          {/* 요금정보 — 한 박스 */}
          <div id="pricing" ref={(el) => (sectionRefs.current.pricing = el)}>
            <Box>
              <CardTitle>요금정보</CardTitle>
              <TitleSm>기본</TitleSm><P>시간제/정액제/패키지는 지점별 공지 참고</P>
              <TitleSm>환불/연장 정책</TitleSm><P>이용 전일까지 전액 환불, 당일 일부 차감</P>
              <TitleSm>자주 묻는 질문</TitleSm><P>형제/자매 동시 이용 시 할인 제공(지점별 상이)</P>
            </Box>
          </div>

          {/* 사진정보 — 한 박스 */}
          <div id="gallery" ref={(el) => (sectionRefs.current.gallery = el)}>
            <Box>
              <CardTitle>사진정보</CardTitle>
              <Gallery>
                {branch.images.map((src, i) => (
                  <Thumb key={i} to={`/branches/${branch.id}/space/${i}`} aria-label={`공간 상세 보기 ${i + 1}`}>
                    <img src={src} alt="" loading="lazy" />
                  </Thumb>
                ))}
              </Gallery>
            </Box>
          </div>
        </Content>
      </Wrap>
    </Section>
  );
}
