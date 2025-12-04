/* eslint-disable */
// /src/pages/SpacePageSets.jsx
// Withagit — 아지트 지점 소개 (PC + 모바일 공통, Figma 스타일)

import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { listIntroSpots } from "../services/introSpotsService";

/* ===== 공통 레이아웃 ===== */

const Section = styled.section`
  min-height: 100vh;
  padding: 56px 16px 80px;
  background: linear-gradient(180deg, #fff7e8 0%, #fff7e8 60%, #f3f4f6 100%);
  box-sizing: border-box;

  @media (max-width: 720px) {
    padding: 32px 16px 64px;
  }
`;

const Wrap = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
`;

/* 헤더 (공통) */

const Head = styled.div`
  display: grid;
  gap: 8px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  color: #141b2f;
  font-weight: 900;
  font-size: clamp(24px, 3vw, 30px);
  letter-spacing: -0.04em;
`;

const Highlight = styled.span`
  position: relative;
  display: inline-block;
  padding: 0 4px;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    bottom: 3px;
    height: 46%;
    background: #ffe39b;
    border-radius: 999px;
    z-index: -1;
  }
`;

const Sub = styled.p`
  margin: 0;
  color: #4b5563;
  font-size: 14px;
`;

/* ===== 지점 카드 리스트 ===== */

const BranchList = styled.div`
  margin-top: 16px;
  display: grid;
  gap: 18px;
`;

// 공통 카드 베이스
const CardBase = styled.article`
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 640px;
  margin: 0 auto;

  @media (max-width: 720px) {
    border-radius: 24px;
    width: 94%;
  }
`;

/* 지점 카드 */

const BranchCard = styled(CardBase)`
  background: #faedcf;
  box-shadow: none;
`;

const BranchHero = styled.div`
  position: relative;
  height: 210px;
  background: #e5e7eb;
  overflow: hidden;
  border-radius: 24px 24px 0 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 720px) {
    height: 190px;
  }
`;

const StatusPill = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;       /* 왼쪽 상단 */
  padding: 5px 11px;
  border-radius: 999px;
  background: #ff7a2a;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
`;

const BranchInfo = styled.div`
  padding: 14px 18px 18px;
  border-radius: 0 0 24px 24px;
  color: #4b3a2a;
`;

const BranchName = styled.div`
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
`;

const BranchLocRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const LocIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2a7 7 0 0 0-7 7c0 4.3 4.6 9.1 6.4 10.9a1 1 0 0 0 1.2 0C14.4 18.1 19 13.3 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9A2.5 2.5 0 0 1 12 11.5Z"
    />
  </svg>
);

/* ===== Coming Soon 카드 ===== */

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

const ComingStatus = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  color: #f9fafb;
  font-size: 11px;
  font-weight: 700;
`;

const ComingTitleText = styled.div`
  margin-top: 40px;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.3;

  @media (max-width: 720px) {
    margin-top: 30px;
    font-size: 26px;
  }
`;

const ComingFooter = styled.div`
  margin-top: 24px;
  background: #ffe5aa;
  padding: 14px 24px 18px;
  border-radius: 0 0 24px 24px;
  color: #4b3a2a;
  font-size: 13px;
`;

const ComingBottomName = styled.div`
  font-weight: 700;
  margin-bottom: 4px;
`;

const ComingBottomLoc = styled(BranchLocRow)`
  color: #4b3a2a;
`;

/* ===== 제안 카드 ===== */

const SuggestCard = styled(CardBase)`
  background: radial-gradient(circle at 0% 0%, #5b4332 0%, #2b211c 60%);
  color: #ffffff;
  box-shadow: 0 22px 52px rgba(0, 0, 0, 0.32);
`;

const SuggestInner = styled.div`
  padding: 22px 24px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
`;

const SuggestTopLabel = styled.div`
  font-size: 12px;
  color: #f7e6c6;
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
  display: flex;
  justify-content: center;
`;

const SuggestButton = styled.button`
  min-width: 260px;
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

/* ===== 데이터 매핑 유틸 ===== */

function mapSpotsToBranches(spots) {
  return spots.map((s, idx) => ({
    id: s.branchId || s.id || `branch_${idx}`,
    name: s.branchName || s.title || "첫 번째 아지트",
    city: s.city || s.region || "",
    district: s.district || "",
    status: s.status || "open",
    heroImage: s.imageUrl || s.image || "",
  }));
}

/* ===== 페이지 컴포넌트 ===== */

export default function SpacePage() {
  const nav = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { items } = await listIntroSpots({
          publishedOnly: true,
          pageSize: 48,
        });
        if (!alive) return;
        setSpots(items || []);
      } catch (e) {
        console.error("[SpacePage] load error:", e);
        if (alive) setSpots([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const branches = useMemo(() => mapSpotsToBranches(spots), [spots]);

  const handleSuggest = () => {
    nav("/suggest");
  };

  return (
    <Section>
      <Wrap>
        {/* 헤더 */}
        <Head>
          <Title>
            <Highlight>아지트 지점 소개</Highlight>
          </Title>
          <Sub>우리 공간의 다양한 스팟을 미리 만나보세요.</Sub>
        </Head>

        {/* 지점 카드 리스트 */}
        {loading && (
          <div style={{ color: "#6b7280", paddingTop: 12 }}>로딩 중…</div>
        )}

        {!loading && branches.length === 0 && (
          <div style={{ color: "#6b7280", paddingTop: 12 }}>
            등록된 지점이 없습니다. 관리자에서 <b>intro_spots</b> 를 추가해 주세요.
          </div>
        )}

        {!loading && branches.length > 0 && (
          <BranchList>
            {branches.map((b) => {
              // 🔹 운영 중인 지점은 모두 동일 텍스트로 노출
              const isOpen = b.status === "open";

              const displayName = isOpen
                ? "첫 번째 아지트 (수지초)"
                : b.name;

              const displayLoc = isOpen
                ? "경기 용인시 수지구"
                : `${b.city} ${b.district}`;

              return (
                <BranchCard key={b.id}>
                  <BranchHero>
                    {b.heroImage && <img src={b.heroImage} alt={b.name} />}
                    {isOpen && <StatusPill>운영 중</StatusPill>}
                    {!isOpen && b.status === "coming" && (
                      <StatusPill>Open 예정</StatusPill>
                    )}
                  </BranchHero>
                  <BranchInfo>
                    <BranchName>{displayName}</BranchName>
                    <BranchLocRow>
                      <LocIcon />
                      <span>{displayLoc}</span>
                    </BranchLocRow>
                  </BranchInfo>
                </BranchCard>
              );
            })}
          </BranchList>
        )}

        {/* Coming Soon + 제안 카드 */}
        <BranchList>
          <ComingCard>
            <ComingUpper>
              <ComingStatus>Open 예정</ComingStatus>
              <ComingTitleText>
                Coming
                <br />
                Soon!
              </ComingTitleText>
            </ComingUpper>

            <ComingFooter>
              <ComingBottomName>두 번째 아지트</ComingBottomName>
              <ComingBottomLoc>
                <LocIcon />
                <span>위치 공개 전</span>
              </ComingBottomLoc>
            </ComingFooter>
          </ComingCard>

          <SuggestCard>
            <SuggestInner>
              <div>
                <SuggestTopLabel>우리 동네에 아지트가 필요하세요?</SuggestTopLabel>
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
        </BranchList>
      </Wrap>
    </Section>
  );
}
