/* eslint-disable */
// src/pages/PickupApplyPage.jsx
// Withagit — 픽업 예약하기 (왼쪽: 자녀/날짜/시간, 오른쪽: 슬롯요약 + 카카오 지도 + 메모 + 하단 안내/CTA)

import React, { useEffect, useMemo, useState, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import {
  MEMBERSHIP_KIND,
  MEMBERSHIP_STATUS,
} from "../constants/membershipDefine";

/* ================== 공통 색상/토큰 ================== */

const primaryText = "#111827";
const subText = "#6b7280";
const borderSoft = "#E5E5E5";
const accent = "#F97316";
const bgSoft = "#FFF7ED";
const cardBg = "#FFFFFF";

/* ================== 페이지 레이아웃 ================== */

const Page = styled.main`
  background: #fff;
  min-height: 100vh;
  padding-bottom: 60px;
`;

const PageInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 100px 20px 40px;

  @media (max-width: 768px) {
    padding: 88px 16px 32px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 6px;
  color: ${primaryText};

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const PageSub = styled.p`
  margin: 0 0 18px;
  font-size: 14px;
  color: ${subText};
`;

const NoticeBox = styled.div`
  margin-bottom: 24px;
  padding: 18px 20px;
  border-radius: 18px;
  background: #f3f4f6;
  font-size: 13px;
  color: ${primaryText};
  line-height: 1.7;

  p {
    margin: 0 0 4px;
  }

  p:last-child {
    margin-bottom: 0;
  }
`;

// 메인 2컬럼 레이아웃: 왼쪽 1.2, 오른쪽 2 비율 + 카드 높이 동일
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 2fr);
  gap: 28px;
  align-items: stretch; /* 🔥 카드 높이 동일하게 */
  
  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/* ================== 왼쪽 컬럼 스타일 ================== */

const LeftWrap = styled.aside`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  height: 100%;

  @media (max-width: 960px) {
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
    padding: 18px 16px 20px;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${primaryText};
`;

const SectionSub = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: ${subText};
`;

const Block = styled.div`
  margin-bottom: 20px;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${primaryText};
  margin-bottom: 6px;
`;

/* --- 자녀 드롭다운 (정액권 스타일) --- */

const SelectBox = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: ${({ $placeholder }) => ($placeholder ? "#9ca3af" : "#111827")};
  cursor: pointer;
`;

const ChildDropdown = styled.div`
  margin-top: 8px;
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
  max-height: 260px;
  overflow-y: auto;
`;

const ChildItemButton = styled.button`
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  font-size: 14px;
  text-align: left;

  &:hover {
    background: #f9fafb;
  }

  .name {
    font-size: 14px;
    font-weight: 700;
    color: ${primaryText};
  }
  .meta {
    font-size: 12px;
    color: ${subText};
    margin-top: 2px;
  }
  .badge-row {
    margin-top: 4px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 999px;
    background: #fef3c7;
    color: #b45309;
    font-weight: 600;
  }
`;

const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#9ca3af" d="M7 9l5 5 5-5H7z" />
  </svg>
);

const AddChildRow = styled.div`
  margin-top: 6px;
  border-radius: 16px;
  border: 1px dashed #f97316;
  background: #fff7ed;
  padding: 12px 16px;
  font-size: 14px;
  color: #9a3412;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* --- 날짜/시간 선택 --- */

const DateTimeBlock = styled.div`
  margin-bottom: 12px;
`;

const BlockLabelRow = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
`;

const BlockHint = styled.div`
  font-size: 11px;
  color: ${subText};
`;

/* 캘린더 */

const CalendarShell = styled.div`
  border-radius: 18px;
  border: 1px solid #f3f4f6;
  background: #fdfdfd;
  padding: 12px 14px 10px;
  margin-bottom: 16px;
`;

const CalendarHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MonthLabelText = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${primaryText};
`;

const MonthNav = styled.div`
  display: flex;
  gap: 4px;
`;

const MonthNavBtn = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
  text-align: center;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const DayCell = styled.button`
  border: none;
  background: ${({ $selected }) =>
    $selected ? accent : "transparent"};
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#111827")};
  border-radius: 999px;
  font-size: 12px;
  padding: 6px 0;
  cursor: pointer;
  margin: 1px 0;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? accent : "rgba(249, 115, 22, 0.06)"};
  }

  &:disabled {
    color: #d1d5db;
    cursor: default;
    background: transparent;
  }
`;

/* 시간 헤더 + 슬롯 박스 */

const TimeHeaderRow = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TimeHeaderTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${primaryText};
`;

const TimeApplyButton = styled.button`
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
  cursor: pointer;

  &:hover {
    background: #e5e7eb;
  }
`;

const TimePickerBox = styled.div`
  border-radius: 18px;
  border: 1px solid #eee2cf;
  background: #fff;
  padding: 12px 16px 14px;
  box-sizing: border-box;
  margin-bottom: 12px;
`;

const TimePickerLabels = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
`;

const TimePickerLabel = styled.div`
  text-align: center;
`;

const TimeColumns = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  align-items: stretch;
  gap: 8px;
`;

// AM/PM column
const AmPmColumn = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 1px solid ${borderSoft};
  overflow: hidden;
`;

const AmPmButton = styled.button`
  flex: 1;
  border: none;
  background: ${({ $active }) =>
    $active ? "rgba(249, 115, 22, 0.08)" : "#ffffff"};
  color: ${({ $active }) => ($active ? accent : primaryText)};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  padding: 6px 4px;

  &:not(:last-child) {
    border-bottom: 1px solid ${borderSoft};
  }
`;

// 숫자 휠 column
const WheelColumn = styled.div`
  border-radius: 14px;
  border: 1px solid ${borderSoft};
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const WheelRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
`;

const WheelNumberWrapper = styled.div`
  width: 100%;
  padding: 4px 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WheelNumber = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${primaryText};
`;

const WheelArrowRow = styled.div`
  display: flex;
  gap: 2px;
  margin-top: 4px;
`;

const WheelArrowBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0 4px;
`;

const TimeResetLink = styled.button`
  border: none;
  background: transparent;
  font-size: 11px;
  color: ${subText};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

/* 선택된 시간 칩 */

const SelectedSlotsRow = styled.div`
  margin: 6px 0 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SlotChip = styled.button`
  border: none;
  border-radius: 999px;
  padding: 4px 10px 4px 8px;
  font-size: 12px;
  background: #fee2e2;
  color: #b91c1c;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const ChipRemove = styled.span`
  font-size: 11px;
`;

/* 캘린더 유틸 */

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthMatrix(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeek = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  return cells;
}

/* ================== 왼쪽 컬럼 컴포넌트 ================== */

function PickupLeftColumn({ slots, onChangeSlots }) {
  const { children: ctxChildren, memberships: ctxMemberships } = useUser() || {};
  const children = Array.isArray(ctxChildren) ? ctxChildren : [];

  // 정규/패밀리 멤버십 Set
  const agitzSet = useMemo(() => {
    const set = new Set();
    if (Array.isArray(ctxMemberships)) {
      ctxMemberships.forEach((m) => {
        if (
          m &&
          m.kind === MEMBERSHIP_KIND.AGITZ &&
          (m.status === MEMBERSHIP_STATUS.ACTIVE ||
            m.status === MEMBERSHIP_STATUS.FUTURE) &&
          m.childId
        ) {
          set.add(m.childId);
        }
      });
    }
    return set;
  }, [ctxMemberships]);

  const familySet = useMemo(() => {
    const set = new Set();
    if (Array.isArray(ctxMemberships)) {
      ctxMemberships.forEach((m) => {
        if (
          m &&
          m.kind === MEMBERSHIP_KIND.FAMILY &&
          (m.status === MEMBERSHIP_STATUS.ACTIVE ||
            m.status === MEMBERSHIP_STATUS.FUTURE) &&
          m.childId
        ) {
          set.add(m.childId);
        }
      });
    }
    return set;
  }, [ctxMemberships]);

  const childItems = useMemo(
    () =>
      children.map((c, index) => {
        const id = c.childId || c.id || "child-" + index;
        const name = c.name || c.childName || "";
        const birth = c.birth || c.birthDate || "";
        return {
          id,
          name,
          birth,
          isDefault: index === 0,
          hasAgitz: agitzSet.has(id),
          hasFamily: familySet.has(id),
        };
      }),
    [children, agitzSet, familySet]
  );

  // 자녀 선택 상태
  const [activeChildId, setActiveChildId] = useState(null);
  const [childLabel, setChildLabel] = useState("선택해주세요");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!childItems.length) {
      setActiveChildId(null);
      setChildLabel("선택해주세요");
      return;
    }
    if (!activeChildId) {
      const first = childItems[0];
      setActiveChildId(first.id);
      setChildLabel(
        first.birth ? `${first.name} (${first.birth})` : first.name || "선택해주세요"
      );
    } else {
      const cur = childItems.find((c) => c.id === activeChildId);
      if (cur) {
        setChildLabel(
          cur.birth ? `${cur.name} (${cur.birth})` : cur.name || "선택해주세요"
        );
      }
    }
  }, [childItems, activeChildId]);

  // 날짜/시간/슬롯 상태
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const monthCells = useMemo(() => getMonthMatrix(currentMonth), [currentMonth]);

  const [ampm, setAmPm] = useState("AM");
  const [hour, setHour] = useState(1); // 1~12
  const [minute, setMinute] = useState(0);

  const formattedMonth = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth() + 1;
    return `${y}년 ${m}월`;
  }, [currentMonth]);

  const moveMonth = (diff) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + diff);
      return next;
    });
  };

  const selectDate = (d) => {
    if (!d) return;
    setSelectedDate(d);
  };

  const incHour = (step) => {
    setHour((prev) => {
      let next = prev + step;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      return next;
    });
  };

  const incMinute = (step) => {
    setMinute((prev) => {
      let next = prev + step;
      if (next >= 60) next = 0;
      if (next < 0) next = 55;
      return next;
    });
  };

  const addSlot = () => {
    if (!selectedDate || !activeChildId) {
      alert("자녀와 날짜를 먼저 선택해 주세요.");
      return;
    }

    let h24 = hour % 12;
    if (ampm === "PM") h24 += 12;

    const iso =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    const newSlot = {
      id:
        iso +
        "-" +
        String(h24).padStart(2, "0") +
        String(minute).padStart(2, "0") +
        "-" +
        activeChildId +
        "-" +
        Date.now(),
      childId: activeChildId,
      date: iso,
      hour: h24,
      minute,
      ampm,
    };

    const nextSlots = [...slots, newSlot];
    onChangeSlots(nextSlots);
  };

  const removeSlot = (slotId) => {
    const next = slots.filter((s) => s.id !== slotId);
    onChangeSlots(next);
  };

  const clearSlots = () => {
    onChangeSlots([]);
  };

  return (
    <LeftWrap>
      <SectionHeader>
        <SectionTitle>자녀 / 날짜 · 시간</SectionTitle>
        <SectionSub>
          여러 자녀, 여러 날짜를 한 번에 담아 픽업을 신청할 수 있어요.
        </SectionSub>
      </SectionHeader>

      {/* 자녀 연결 */}
      <Block>
        <SectionLabel>자녀 연결</SectionLabel>
        <SelectBox
          type="button"
          $placeholder={!activeChildId}
          onClick={() => {
            if (!childItems.length) {
              alert("등록된 자녀가 없습니다. 마이페이지에서 자녀를 먼저 등록해 주세요.");
              return;
            }
            setDropdownOpen((prev) => !prev);
          }}
        >
          <span>{childLabel}</span>
          <ChevronDown />
        </SelectBox>

        {dropdownOpen && childItems.length > 0 && (
          <ChildDropdown>
            {childItems.map((c) => {
              const isActive = c.id === activeChildId;
              return (
                <ChildItemButton
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveChildId(c.id);
                    setChildLabel(
                      c.birth ? `${c.name} (${c.birth})` : c.name || "선택해주세요"
                    );
                    setDropdownOpen(false);
                  }}
                  style={{
                    backgroundColor: isActive ? "rgba(240,122,42,0.06)" : "transparent",
                  }}
                >
                  <span className="name">{c.name || "(이름 없음)"}</span>
                  {c.birth && <span className="meta">{c.birth}</span>}
                  {(c.hasAgitz || c.hasFamily) && (
                    <div className="badge-row">
                      {c.hasAgitz && <span className="badge">정규 멤버십</span>}
                      {c.hasFamily && <span className="badge">패밀리 멤버십</span>}
                    </div>
                  )}
                </ChildItemButton>
              );
            })}
          </ChildDropdown>
        )}

        <AddChildRow
          onClick={() => {
            navigate("/mypage");
          }}
        >
          <span>+ 자녀 추가</span>
          <span style={{ fontSize: 12 }}>클릭하면 마이페이지로 이동</span>
        </AddChildRow>
      </Block>

      {/* 날짜 · 시간 선택 */}
      <DateTimeBlock>
        <BlockLabelRow>
          <SectionLabel>날짜 · 시간 선택</SectionLabel>
          <BlockHint>여러 날짜·시간을 추가로 담을 수 있어요.</BlockHint>
        </BlockLabelRow>


        {/* 캘린더 */}
        <CalendarShell>
          <CalendarHeaderRow>
            <MonthLabelText>{formattedMonth}</MonthLabelText>
            <MonthNav>
              <MonthNavBtn type="button" onClick={() => moveMonth(-1)}>
                ‹
              </MonthNavBtn>
              <MonthNavBtn type="button" onClick={() => moveMonth(1)}>
                ›
              </MonthNavBtn>
            </MonthNav>
          </CalendarHeaderRow>

          <WeekRow>
            {WEEK_LABELS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </WeekRow>
          <DayGrid>
            {monthCells.map((d, idx) => {
              if (!d) return <div key={"empty-" + idx} />;
              const isSelected =
                selectedDate &&
                d.getFullYear() === selectedDate.getFullYear() &&
                d.getMonth() === selectedDate.getMonth() &&
                d.getDate() === selectedDate.getDate();

              return (
                <DayCell
                  key={d.toISOString()}
                  type="button"
                  $selected={isSelected}
                  onClick={() => selectDate(d)}
                >
                  {d.getDate()}
                </DayCell>
              );
            })}
          </DayGrid>
        </CalendarShell>

        {/* 시간 선택 + 이대로 담기 */}
        <TimeHeaderRow>
          <TimeHeaderTitle>시간을 선택해주세요</TimeHeaderTitle>
          <TimeApplyButton type="button" onClick={addSlot}>
            이대로 담기
          </TimeApplyButton>
        </TimeHeaderRow>

        <TimePickerBox>
          <TimePickerLabels>
            <TimePickerLabel>오전 / 오후</TimePickerLabel>
            <TimePickerLabel>시간</TimePickerLabel>
            <TimePickerLabel>분</TimePickerLabel>
          </TimePickerLabels>

          <TimeColumns>
            {/* AM / PM */}
            <AmPmColumn>
              <AmPmButton
                type="button"
                $active={ampm === "AM"}
                onClick={() => setAmPm("AM")}
              >
                오전
              </AmPmButton>
              <AmPmButton
                type="button"
                $active={ampm === "PM"}
                onClick={() => setAmPm("PM")}
              >
                오후
              </AmPmButton>
            </AmPmColumn>

            {/* 시간 */}
            <WheelColumn>
              <WheelRow>
                <WheelNumberWrapper>
                  <WheelNumber>{String(hour).padStart(2, "0")}</WheelNumber>
                </WheelNumberWrapper>
                <WheelArrowRow>
                  <WheelArrowBtn type="button" onClick={() => incHour(1)}>
                    ▲
                  </WheelArrowBtn>
                  <WheelArrowBtn type="button" onClick={() => incHour(-1)}>
                    ▼
                  </WheelArrowBtn>
                </WheelArrowRow>
              </WheelRow>
            </WheelColumn>

            {/* 분 */}
            <WheelColumn>
              <WheelRow>
                <WheelNumberWrapper>
                  <WheelNumber>{String(minute).padStart(2, "0")}</WheelNumber>
                </WheelNumberWrapper>
                <WheelArrowRow>
                  <WheelArrowBtn type="button" onClick={() => incMinute(5)}>
                    ▲
                  </WheelArrowBtn>
                  <WheelArrowBtn type="button" onClick={() => incMinute(-5)}>
                    ▼
                  </WheelArrowBtn>
                </WheelArrowRow>
              </WheelRow>
            </WheelColumn>
          </TimeColumns>
        </TimePickerBox>

        <TimeResetLink type="button" onClick={clearSlots}>
          선택한 시간 모두 지우기
        </TimeResetLink>
      </DateTimeBlock>
    </LeftWrap>
  );
}

/* ================== 오른쪽 컬럼 스타일 ================== */

const RightWrap = styled.aside`
  flex: 1 1 0;
  min-width: 0;
  padding: 24px;
  border-radius: 24px;
  background: ${cardBg};
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
  height: 100%;

  @media (max-width: 960px) {
    border-radius: 20px;
    padding: 18px 16px 22px;
  }
`;

// 상단 슬롯 요약 칩 레일
const SummaryChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

// 출발/도착 검색 영역
const SearchBlock = styled.div`
  margin-bottom: 12px;
`;

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 6px;
  margin-bottom: 8px;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  border-radius: 999px;
  border: 1px solid ${borderSoft};
  padding: 0 14px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${accent};
  }
`;

const SearchBtn = styled.button`
  height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;

  &:hover {
    background: #e5e7eb;
  }
`;

const ListBtn = styled.button`
  height: 40px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${borderSoft};
  background: #ffffff;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;

const HintText = styled.div`
  font-size: 11px;
  color: ${subText};
`;

// 지도 영역
const MapBox = styled.div`
  margin-top: 12px;
  margin-bottom: 14px;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 260px;
  border-radius: 18px;
  overflow: hidden;
  background: #e5e7eb;
`;

// 거리/요금 표시
const DistanceRow = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: ${subText};
`;

// 메모 라벨/입력
const MemoLabel = styled.div`
  margin-top: 18px;
  font-size: 13px;
  font-weight: 700;
  color: ${primaryText};
`;

const MemoArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  border-radius: 18px;
  border: 1px solid ${borderSoft};
  padding: 10px 12px;
  font-size: 13px;
  resize: vertical;
  font-family: inherit;
  color: ${primaryText};
  box-sizing: border-box;

  &::placeholder {
    color: #c4c4c4;
  }
`;

// 오른쪽 슬롯 칩 (피그마 스타일)
const RightSlotChip = styled.button`
  position: relative;
  border: 1px solid ${accent};
  border-radius: 24px;
  padding: 8px 28px 8px 14px;
  min-width: 180px;
  background: #fff3e6;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;

  .topline {
    font-size: 12px;
    font-weight: 700;
    color: ${accent};
  }

  .bottomline {
    margin-top: 3px;
    font-size: 14px;
    font-weight: 800;
    color: ${accent};
  }

  .close {
    position: absolute;
    top: 6px;
    right: 10px;
    font-size: 12px;
    color: ${accent};
  }
`;


/* ================== 오른쪽 컬럼 컴포넌트 (카카오 지도 포함) ================== */

function PickupRightColumn({ slots,onChangeSlots }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const placesRef = useRef(null);

  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");

  const [startPlace, setStartPlace] = useState(null);
  const [endPlace, setEndPlace] = useState(null);

  const [distanceKm, setDistanceKm] = useState(0);
  const [estimatedFare, setEstimatedFare] = useState(7000);
  const [memo, setMemo] = useState("");

  const { children: ctxChildren } = useUser() || {};
  const children = Array.isArray(ctxChildren) ? ctxChildren : [];

  const childMap = useMemo(() => {
    const map = {};
    children.forEach((c) => {
      const id = c.childId || c.id;
      if (!id) return;
      map[id] = (c.name || c.childName || "") || "";
    });
    return map;
  }, [children]);


  // 지도 초기화 — index.html에서 이미 kakao sdk를 로딩하는 방식
  useEffect(() => {
    if (!mapRef.current) {
      console.log("[PickupRightColumn] mapRef 없음");
      return;
    }
    if (!window.kakao || !window.kakao.maps) {
      console.log("[PickupRightColumn] window.kakao.maps 없음:", window.kakao);
      return;
    }
    if (mapInstanceRef.current) {
      console.log("[PickupRightColumn] 지도 이미 초기화됨");
      return;
    }

    const kakao = window.kakao;
    const center = new kakao.maps.LatLng(37.5665, 126.978);
    const map = new kakao.maps.Map(mapRef.current, {
      center,
      level: 5,
    });

    mapInstanceRef.current = map;
    placesRef.current = new kakao.maps.services.Places();

    console.log("[PickupRightColumn] kakao 지도 초기화 완료");
  }, []);




  // 출발/도착 변경 시 마커/라인 업데이트
  useEffect(() => {
    const kakao = window.kakao && window.kakao.maps;
    const map = mapInstanceRef.current;
    if (!kakao || !map) return;

    // 기존 라인 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // 마커 초기화/업데이트
    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null);
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null);
      endMarkerRef.current = null;
    }

    if (!startPlace && !endPlace) {
      setDistanceKm(0);
      setEstimatedFare(7000);
      return;
    }

    const bounds = new kakao.LatLngBounds();
    const path = [];

    if (startPlace) {
      const pos = new kakao.LatLng(startPlace.lat, startPlace.lng);
      const marker = new kakao.maps.Marker({
        position: pos,
        map,
      });
      startMarkerRef.current = marker;
      bounds.extend(pos);
      path.push(pos);
    }

    if (endPlace) {
      const pos = new kakao.LatLng(endPlace.lat, endPlace.lng);
      const marker = new kakao.maps.Marker({
        position: pos,
        map,
      });
      endMarkerRef.current = marker;
      bounds.extend(pos);
      path.push(pos);
    }

    if (path.length >= 2) {
      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: "#22c55e",
        strokeOpacity: 0.9,
        strokeStyle: "solid",
      });
      polyline.setMap(map);
      polylineRef.current = polyline;

      const lengthM = polyline.getLength(); // m
      const km = lengthM / 1000;
      setDistanceKm(km);

      // 간단 요금 계산
      const fare = 7000 + Math.max(0, km - 2) * 500;
      setEstimatedFare(Math.round(fare / 100) * 100);
    } else {
      setDistanceKm(0);
      setEstimatedFare(7000);
    }

    if (bounds.isEmpty && !bounds.isEmpty()) {
      map.setBounds(bounds);
    }
  }, [startPlace, endPlace]);

  const doSearch = (type) => {
    const kakao = window.kakao && window.kakao.maps;
    const ps = placesRef.current;
    const map = mapInstanceRef.current;
    if (!kakao || !ps || !map) {
      alert("지도를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.");
      return;
    }

    const query = type === "start" ? startQuery : endQuery;
    if (!query || !query.trim()) {
      alert("검색어를 입력해 주세요.");
      return;
    }

    ps.keywordSearch(query, (data, status) => {
      if (status !== kakao.services.Status.OK || !data || !data.length) {
        alert("검색 결과가 없습니다.");
        return;
      }
      const first = data[0];
      const place = {
        name: first.place_name,
        address: first.road_address_name || first.address_name || "",
        lat: parseFloat(first.y),
        lng: parseFloat(first.x),
      };

      if (type === "start") setStartPlace(place);
      else setEndPlace(place);

      const pos = new kakao.LatLng(place.lat, place.lng);
      map.setCenter(pos);
    });
  };

  // 슬롯 요약 칩
  const slotChips = useMemo(
    () =>
      slots.map((s) => {
        const childName = childMap[s.childId] || "";
        const h12 = (s.hour % 12) || 12;
        const ampmLabel = s.ampm === "PM" ? "오후" : "오전";
        const datePretty = s.date.replace(/-/g, "."); // 2025-11-17 → 2025.11.17
        // 피그마 느낌: "이은기 · 2025.11.17(월)" / "오후 3:30"
        const top = childName
          ? `${childName} · ${datePretty}`
          : `${datePretty}`;
        const bottom = `${ampmLabel} ${String(h12).padStart(2, "0")}:${String(
          s.minute
        ).padStart(2, "0")}`;
        return {
          id: s.id,
          top,
          bottom,
        };
      }),
    [slots, childMap]
  );

  return (
    <RightWrap>
      {/* 1) 상단 슬롯 요약 칩 레일 (오른쪽 전용) */}
      <SummaryChipsRow>
        {slotChips.length === 0 ? (
          <span style={{ fontSize: 12, color: subText }}>
            왼쪽에서 날짜·시간을 선택 후 &ldquo;이대로 담기&rdquo;를 눌러 슬롯을
            만들어 주세요.
          </span>
        ) : (
          slotChips.map((chip) => (
            <RightSlotChip
              key={chip.id}
              type="button"
              onClick={() => {
                // 오른쪽 칩 클릭으로도 삭제 가능
                const next = slots.filter((s) => s.id !== chip.id);
                onChangeSlots(next);
              }}
            >
              <div className="topline">{chip.top}</div>
              <div className="bottomline">{chip.bottom}</div>
              <div className="close">×</div>
            </RightSlotChip>
          ))
        )}
      </SummaryChipsRow>


      

      {/* 2) 출발지/도착지 검색 + 지도 */}
      <SearchBlock>
        <SectionLabel>출발지 / 도착지</SectionLabel>

        <SearchRow>
          <SearchInput
            placeholder="출발지 검색"
            value={startQuery}
            onChange={(e) => setStartQuery(e.target.value)}
          />
          <SearchBtn type="button" onClick={() => doSearch("start")}>
            검색
          </SearchBtn>
          <ListBtn type="button" onClick={() => alert("즐겨찾기 목록 연결 예정")}>
            목록
          </ListBtn>
        </SearchRow>

        <SearchRow>
          <SearchInput
            placeholder="도착지 검색"
            value={endQuery}
            onChange={(e) => setEndQuery(e.target.value)}
          />
          <SearchBtn type="button" onClick={() => doSearch("end")}>
            검색
          </SearchBtn>
          <ListBtn type="button" onClick={() => alert("즐겨찾기 목록 연결 예정")}>
            목록
          </ListBtn>
        </SearchRow>

        <HintText>
          출발/도착지는 나중에 위치등록으로 저장해 두고 다시 사용할 수 있어요.
        </HintText>

        <MapBox>
          <MapContainer ref={mapRef} />
          <DistanceRow>
            현재 선택 거리:{" "}
            <strong>{distanceKm > 0 ? distanceKm.toFixed(1) : "0.0"} km</strong>{" "}
            · 예상 요금(기본 기준):{" "}
            <strong>{estimatedFare.toLocaleString("ko-KR")}원</strong>
          </DistanceRow>
        </MapBox>
      </SearchBlock>

      {/* 3) 메모 */}
      <MemoLabel>메모 (선택)</MemoLabel>
      <MemoArea
        placeholder="기사님께 전달하고 싶은 내용을 자유롭게 남겨주세요."
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
    </RightWrap>
  );
}

/* ================== 하단 안내/CTA (InfoBox + 버튼) ================== */

const InfoBoxWrap = styled.div`
  margin-top: 40px;
  padding: 26px 24px 24px;
  border-radius: 24px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${primaryText};
`;

const InfoList = styled.ul`
  margin: 0;
  padding-left: 0;
  list-style: none;
  font-size: 13px;
  color: ${primaryText};
  line-height: 1.8;
`;

const InfoItem = styled.li`
  position: relative;
  padding-left: 18px;

  &::before {
    content: "✓";
    position: absolute;
    left: 0;
    top: 2px;
    font-size: 12px;
    color: #d1d5db;
  }

  .strong-link {
    color: #f97316;
    font-weight: 700;
    cursor: pointer;
  }
`;

// 하단 픽업 신청하기 버튼 (피그마 스타일)
const BottomBar = styled.div`
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
`;

const ApplyButton = styled.button`
  min-width: 190px;
  height: 44px;
  border-radius: 999px;
  border: none;
  background: #e5e5e5;           /* 연한 회색 배경 */
  color: #4b5563;                /* 진한 회색 글자 */
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0 24px;

  &:hover {
    filter: brightness(0.98);
  }
  &:active {
    transform: translateY(1px);
  }
`;

/* ================== 페이지 컴포넌트 ================== */

export default function PickupApplyPage() {
  const nav = useNavigate();
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    // 진입 로깅 등 필요하면 여기
  }, []);

  return (
    <Page>
      <PageInner>
        <PageTitle>픽업 예약하기</PageTitle>
        <PageSub>
          안전하고 믿을 수 있는 픽업 서비스 — 여러 건을 한 번에 신청할 수 있어요.
        </PageSub>

        <MainGrid>
        <PickupLeftColumn slots={slots} onChangeSlots={setSlots} />
        <PickupRightColumn slots={slots} onChangeSlots={setSlots} />
        </MainGrid>

        {/* 하단 안내 사항 + 픽업 신청하기 버튼 */}
        <InfoBoxWrap>
          <InfoTitleRow>
            <InfoTitle>안내 사항</InfoTitle>
          </InfoTitleRow>
          <InfoList>
            <InfoItem>
              매 달 1일~15일에 다음 달 선예약이 오픈됩니다. 16일 이후는 상황에 따라 픽업 예약이
              불가능 할 수 있습니다.
            </InfoItem>
            <InfoItem>
              리스트에 없는 픽업, 도착 장소는{" "}
              <span
                className="strong-link"
                onClick={() => alert("다른 픽업 장소 요청 페이지로 이동 예정")}
              >
                다른 픽업 장소 요청
              </span>
              을 통해 요청해 주세요. 1:1 상담을 통해 확정됩니다.
            </InfoItem>
            <InfoItem>
              픽업 출발 혹은 도착지 중 한 곳은 위드아지트로 설정 필요합니다. 추후 학원 ↔ 학원,
              위드아지트 ↔ 자택, 택시 서비스 등 오픈 예정
            </InfoItem>
            <InfoItem>
              <span
                className="strong-link"
                onClick={() => alert("다른 픽업 장소 요청하기 이동")}
              >
                다른 픽업 장소 요청하기
              </span>{" "}
              버튼 /{" "}
              <span
                className="strong-link"
                onClick={() => alert("수지초 아지트 정류장 확인하기 이동")}
              >
                수지초 아지트 정류장 확인하기
              </span>{" "}
              버튼
            </InfoItem>
          </InfoList>
        </InfoBoxWrap>

        <BottomBar>
          <ApplyButton
            type="button"
            onClick={() => {
              console.log("[PickupApplyPage] 픽업 신청하기", { slots });
              alert("픽업 신청하기 실제 로직은 나중에 연결하자 :)");
            }}
          >
            픽업 신청하기
          </ApplyButton>
        </BottomBar>
      </PageInner>
    </Page>
  );
}
