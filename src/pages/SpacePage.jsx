/* eslint-disable */
// /src/pages/SpacePageSets.jsx
import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { listIntroSpots } from "../services/introSpotsService";

/* ===== 공통 레이아웃 ===== */
const Section = styled.section`
  background: #fff;
  padding: 56px 16px;
  min-height : 900px;
`;
const Wrap = styled.div`
  max-width: ${({ theme }) => theme?.sizes?.container || "1120px"};
  margin: 0 auto;
  display: grid;
  gap: 24px;
`;
const Head = styled.div`display: grid; gap: 6px;`;
const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  font-weight: 900;
  font-size: clamp(22px, 3.2vw, 30px);
  letter-spacing: -0.2px;
`;
const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  opacity: .7;
`;

/* ===== 세트/행/슬롯 ===== */
const SetBlock = styled.div`display: grid; gap: 14px;`;
const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, 1fr);
  gap: 12px;
`;

/* 오버레이 (하단에서 슬라이드 인) */
const Overlay = styled.div`
  position: absolute; left: 0; right: 0; bottom: 0;
  display: grid; align-content: end;
  padding: 16px;
  height: 40%;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.68) 100%);
  transform: translateY(10px);
  opacity: 0;
  transition: opacity 200ms ease, transform 200ms cubic-bezier(.2,.65,.2,1);
  pointer-events: none;
  @media (max-width: 640px) { opacity: 1; transform: none; height: 42%; }
`;

const CapTitle = styled.div`
  color: #fff; font-weight: 900;
  font-size: clamp(16px, 1.7vw, 20px);
  letter-spacing: -0.2px; line-height: 1.2;
`;
const CapSub = styled.div` margin-top: 4px; color: rgba(255,255,255,.9); font-size: 12px; line-height: 1.35; `;
const Badge = styled.span`
  display: inline-grid; place-items: center;
  height: 18px; padding: 0 8px; border-radius: 999px;
  background: rgba(255,255,255,.92);
  color: ${({ theme }) => theme?.colors?.navy || "#1A2B4C"};
  font-size: 11px; font-weight: 800;
  margin-bottom: 8px; width: max-content;
`;

/* 카드(슬롯) */
const Slot = styled.div`
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #eef2f6;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
  aspect-ratio: ${({ $ratio }) => $ratio || "4 / 3"};

  /* 등장 애니메이션 */
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transform: translateY(${({ $show }) => ($show ? "0" : "10px")});
  transition: opacity 520ms ease ${({ $delay = 0 }) => $delay}ms,
              transform 520ms cubic-bezier(.2,.65,.2,1) ${({ $delay = 0 }) => $delay}ms;
  will-change: opacity, transform;

  @media (prefers-reduced-motion: reduce) {
    transition: none; opacity: 1; transform: none;
  }

  img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform .22s cubic-bezier(.2,.65,.2,1);
    will-change: transform;
  }
  &:hover img, &:focus-within img { transform: scale(1.05); }
  &:hover ${Overlay}, &:focus-within ${Overlay} { opacity: 1; transform: translateY(0); }
`;


const SpotInfo = styled.div`
  padding: 14px 18px 18px 18px;
  background: #ffe9a7;
  border-radius: 0 0 36px 36px;
`;

const SpotName = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #342313;
  margin-bottom: 6px;
`;

const SpotLocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b4b2b;
`;

const CardBase = styled.div`
  position: relative;
  border-radius: 36px;
  overflow: hidden;
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.08),
    0 6px 14px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  min-height: 260px;

  @media (max-width: 960px) {
    min-height: 0;
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ff7e32;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
`;

const StatusPillDark = styled(StatusPill)`
  background: rgba(255, 255, 255, 0.22);
`;

const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2a7 7 0 0 0-7 7c0 4.3 4.6 9.1 6.4 10.9a1 1 0 0 0 1.2 0C14.4 18.1 19 13.3 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9A2.5 2.5 0 0 1 12 11.5Z"
    />
  </svg>
);



const CardsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;


  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;


/* ===== 2번째 카드 — Coming Soon! + 하단 크림 인포 영역 ===== */

const ComingCard = styled(CardBase)`
  background: radial-gradient(circle at 0% 0%, #544032 0%, #2b211c 60%);
  color: #ffffff;
  box-shadow: 0 22px 52px rgba(0, 0, 0, 0.32);
`;

const ComingUpper = styled.div`
  flex: 1;
  padding: 22px 24px 0 24px;
  display: flex;
  flex-direction: column;
`;

const ComingFooter = styled.div`
  margin-top: 24px;
  background: #ffe5aa;
  padding: 14px 24px 18px;
  border-radius: 0 0 36px 36px;
  color: #4b3a2a;
  font-size: 13px;
`;

const ComingTitleText = styled.div`
  margin-top: 40px;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.3;
`;

const ComingBottomName = styled.div`
  font-weight: 700;
  margin-bottom: 4px;
`;

const ComingBottomLoc = styled(SpotLocationRow)`
  color: #4b3a2a;
`;

/* ===== 3번째 카드 — 다음 아지트 제안 ===== */

const SuggestCard = styled(CardBase)`
  background: radial-gradient(circle at 0% 0%, #5b4332 0%, #2b211c 60%);
  color: #ffffff;
  box-shadow: 0 22px 52px rgba(0, 0, 0, 0.32);
`;

const SuggestInner = styled.div`
  flex: 1;
  padding: 22px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SuggestTopLabel = styled.div`
  font-size: 12px;
  color: #f7e6c6;
  margin-bottom: 14px;
`;

const SuggestMain = styled.div`
  font-size: 20px;
  line-height: 1.6;
  font-weight: 800;

  span {
    color: #ffb35a;
  }
`;

const SuggestButtonWrap = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;   /* ⬅️ 버튼을 카드 가운데로 */
`;
const SuggestButton = styled.button`
  min-width: 260px;          /* ⬅️ 가로폭 어느 정도 고정 */
  padding: 13px 26px;
  border-radius: 999px;
  border: none;
  background: #ff7e32;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
  outline: none;

  &:hover {
    filter: brightness(1.03);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.24);
  }
`;

/* ===== 그리드 패턴 정의 ===== */
const SETS = [
  { key: "S1", rows: [{ cols: 3, ratios: ["16/10", "16/10", "16/10"] }, { cols: 4, ratios: ["4/3", "4/3", "4/3", "4/3"] }] },
  { key: "S2", rows: [{ cols: 4, ratios: ["4/3", "4/3", "4/3", "4/3"] }, { cols: 3, ratios: ["16/10", "16/10", "16/10"] }] },
  { key: "S3", rows: [{ cols: 2, ratios: ["16/9", "16/9"] }, { cols: 3, ratios: ["1/1", "1/1", "1/1"] }, { cols: 2, ratios: ["4/3", "4/3"] }] },
  { key: "S5", rows: [{ cols: 3, ratios: ["4/3", "4/3", "4/3"] }, { cols: 2, ratios: ["16/9", "16/9"] }, { cols: 3, ratios: ["4/3", "4/3", "4/3"] }] },
  { key: "R4", rows: [{ cols: 4, ratios: ["4/3", "4/3", "4/3", "4/3"] }] },
  { key: "R3", rows: [{ cols: 3, ratios: ["4/3", "4/3", "4/3"] }] },
  { key: "R2", rows: [{ cols: 2, ratios: ["16/10", "16/10"] }] },
  { key: "R1", rows: [{ cols: 1, ratios: ["21/9"] }] },
];
SETS.forEach(s => { s.size = s.rows.reduce((a, r) => a + r.ratios.length, 0); });

/* ===== 유틸 ===== */
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** intro_spots → 그리드 배치용 블록으로 잘라내기 */
function planSetsRandom(spots) {
  const imgs = spots.map(s => ({
    src: s.imageUrl,
    title: s.title,
    subtitle: s.subtitle,
    badge: s.badge
  }));
  const pool = shuffle(imgs);
  const out = [];
  let i = 0, p = 0;

  const pick = (size) => {
    const slice = pool.slice(i, i + size);
    if (!slice.length) return null;
    i += slice.length;
    return slice;
  };

  // 큰 세트부터 채우고 남는 수량은 R*로 마감
  const keys = shuffle(["S1", "S2", "S3", "S5"]);
  while (i < pool.length) {
    const s = SETS.find(x => x.key === keys[p % keys.length]);
    if (!s) break;
    if ((pool.length - i) < s.size) break;
    out.push({ set: s, images: pick(s.size) });
    p++;
  }
  // 나머지 마감
  const endings = ["R4", "R3", "R2", "R1"].map(k => SETS.find(x => x.key === k));
  for (const end of endings) {
    while (i < pool.length && (pool.length - i) >= end.size) {
      out.push({ set: end, images: pick(end.size) });
    }
  }
  if (i < pool.length) {
    const last = SETS.find(s => s.key === "R1");
    const rest = pick(pool.length - i);
    if (rest) out.push({ set: last, images: rest });
  }
  return out;
}

/* ===== 페이지 ===== */
export default function SpacePageSets() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  // 진입 시 fetch
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { items } = await listIntroSpots({ publishedOnly: true, pageSize: 48 });
        if (!alive) return;
        setSpots(items || []);
      } catch (e) {
        console.error("[SpacePageSets] load error:", e);
        if (alive) setSpots([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const blocks = useMemo(() => planSetsRandom(spots), [spots]);

  // ▶ 페이지 진입 후 살짝 지연을 주어 페이드-인
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [spots.length]);

  const handleViewAll = () => {

  };

  const handleSuggest = () => {

  };


  const BASE_DELAY = 60;
  let gIdx = 0;

  return (
    <Section>
      <Wrap>
        <Head>
          <Title>공간 소개</Title>
          <Sub>우리 공간의 다양한 스팟을 미리 만나보세요.</Sub>
        </Head>

        {loading && <div style={{ color: "#6b7280" }}>로딩 중…</div>}

        {/* {!loading && blocks.length === 0 && (
          <div style={{ color: "#6b7280" }}>등록된 이미지가 없습니다. 관리자에서 <b>intro_spots</b> 컬렉션에 스팟을 추가하세요.</div>
        )} */}


          {blocks.map(({ set, images: slice }, bi) => {
            let k = 0;
            return (
              <SetBlock key={`${set.key}-${bi}`}>
                {set.rows.map((row, ri) => (
                  <Row key={ri} $cols={row.cols}>
                    {row.ratios.map((ratio, si) => {
                      const it = slice[k++] || {};
                      const delay = (gIdx++) * BASE_DELAY;
                      const badge = it.badge;
                      const title = it.title || "스팟";
                      const subtitle = it.subtitle || "withagit 공간 스냅샷";
                      const src = it.src;

                      return (
                        <Slot key={`${bi}-${ri}-${si}`}
                          $ratio={ratio}
                          $show={visible}
                          $delay={delay}
                          tabIndex={0}
                          aria-label={`${title} 이미지`}>
                          <img src={src} alt={title} />
                          {(badge || title || subtitle) && (
                            <Overlay>
                              {badge ? <Badge>{badge}</Badge> : null}
                              {title ? <CapTitle>{title}</CapTitle> : null}
                              {subtitle ? <CapSub>{subtitle}</CapSub> : null}
                            </Overlay>
                          )}
                        </Slot>
                      );
                    })}
                  </Row>
                ))}
              </SetBlock>
            );
          })}
  



        {/* 2. Coming Soon 카드 */}
        {
          blocks.length > 0 && <CardsRow>

            <ComingCard>
              <ComingUpper>
                <StatusPillDark>Open 예정</StatusPillDark>
                <ComingTitleText>
                  Coming
                  <br />
                  Soon!
                </ComingTitleText>
              </ComingUpper>

              <ComingFooter>
                <ComingBottomName>두 번째 아지트</ComingBottomName>
                <ComingBottomLoc>
                  <LocationIcon />
                  <span>위치 공개 전</span>
                </ComingBottomLoc>
              </ComingFooter>
            </ComingCard>

            {/* 3. 제안 카드 */}
            <SuggestCard>
              <SuggestInner>
                <div>
                  <SuggestTopLabel>
                    우리 동네에 아지트가 필요하세요?
                  </SuggestTopLabel>
                  <SuggestMain>
                    <span>다음 아지트를</span>
                    <br />
                    제안해주세요!
                  </SuggestMain>
                </div>
                <SuggestButtonWrap>
                  <SuggestButton type="button" onClick={handleSuggest}>
                    제안 남기기
                  </SuggestButton>
                </SuggestButtonWrap>
              </SuggestInner>
            </SuggestCard>

          </CardsRow>
        }



      </Wrap>
    </Section>
  );
}
