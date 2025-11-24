좋아, 이제 **“누가 무엇을 살 수 있냐”**를 딱 정리해 보자.
이 컴포넌트 안에서 각 상품별(정규/패밀리/시간권/정액권/포인트)로 구매 가드가 어떻게 걸리는지 정리하면 이렇게야.

0. 공통 가드 (모든 상품 공통)

결제 버튼이 활성화(canPay === true) 되려면:

약관 동의

agree === true 필수

체크 안 하면 무조건 canPay = false.

금액 유효

total > 0 (또는 points일 때 pointsAmount > 0 → priceCalc에서 total로 들어감)

자녀 존재 + 선택 필수

childrenForUI.length > 0

selectedChildIds.length > 0

로딩 중이 아니어야 함

!loading

전화번호/로그인 & kind 유효 (preflight 단계)

ALLOWED.has(kind) (AGITZ/FAMILY/TIMEPASS/CASHPASS/points만 허용)

effectivePhoneE164 있어야 (로그인 필수)

선택한 자녀가 실제 내 자녀인지 확인

childrenForUI 안에 존재하는 childId인지 전부 검사

아니면 child_not_owned.

이게 “공통 필터”고, 그 위에 kind별 룰이 얹혀져.

1. 정규 멤버십 — AGITZ (아지트)
살 수 있는 조건

UI 레벨에서 먼저 제한:

renderChildPick()에서:

이미 정규 가입된 자녀(alreadyAgitz)는
kind === AGITZ일 때 disabledForKindBase = true → 라디오 비활성.

초기 선택:

agitzAppliedSet에 없는 첫 자녀를 우선 선택하려고 시도, 없으면 첫 자녀.

canPay 레벨:

if (kind === MEMBERSHIP_KIND.AGITZ) {
  const target = selectedChildIds[0];
  if (!target || agitzAppliedSet.has(target)) return false;
}


preflightValidateDb 레벨:

if (kind === MEMBERSHIP_KIND.AGITZ) {
  const id = selectedChildIds[0];
  if (agitzAppliedSet.has(id))
    return fail("agitz_child_already_applied", "이미 정규 멤버십이 적용된 자녀입니다.");
}

요약 — AGITZ는

로그인 + 자녀 최소 1명 필요

한 번에 자녀 한 명만 선택 (라디오)

그 자녀가:

이미 AGITZ 멤버십이 있으면 절대 구매 불가 (UI + canPay + preflight 3중 가드)

FAMILY가 있어도 AGITZ 자체를 막지는 않고, preflight에서 AGITZ only만 체크 (FAMILY는 별도 가드에서 다룸)

기간(months)은 payload 기준, 기본 1개월. 가격은 AGITZ_PRICE_BASE * months.

2. 패밀리 멤버십 — FAMILY
살 수 있는 조건

UI 레벨:

체크박스 멀티 선택 (isFamily === true)

FAMILY_MAX(기본 10명) 초과하면 선택할 때 alert 후 무시.

이미 정규/패밀리인 자녀는 비활성:

const alreadyAgitz = agitzAppliedSet.has(childId);
const alreadyFamily = familyAppliedSet.has(childId);

const disabledForKindBase =
  (kind === FAMILY && (alreadyFamily || alreadyAgitz));


→ AGITZ/FAMILY가 이미 있는 자녀는 FAMILY에서 체크박스 disabled.

초기 선택:

family 미적용 자녀 1명 자동 선택 (없으면 첫 자녀).

effectiveSelectedChildIds:

FAMILY/AGITZ일 때는
familyAppliedSet 또는 agitzAppliedSet에 걸린 자녀는 필터링으로 제거.

canPay 레벨:

if (kind === MEMBERSHIP_KIND.FAMILY) {
  if (!effectiveSelectedChildIds.length) return false;
  if (effectiveSelectedChildIds.length > FAMILY_MAX) return false;
}


preflightValidateDb 레벨:

if (kind === MEMBERSHIP_KIND.FAMILY) {
  if (selectedChildIds.length > FAMILY_MAX)
    return fail("family_over_quota", `패밀리 멤버십은 최대 ${FAMILY_MAX}명까지 선택할 수 있습니다.`);
  if (selectedChildIds.some(id => familyAppliedSet.has(id) || agitzAppliedSet.has(id)))
    return fail("family_child_already_applied", "이미 정규/패밀리 멤버십이 적용된 자녀가 포함되어 있습니다.");
}

요약 — FAMILY는

로그인 + 자녀 최소 1명

최대 FAMILY_MAX명(기본 10명)까지 선택 가능

선택된 자녀 중 단 한 명이라도:

이미 AGITZ 또는 FAMILY 멤버십이 있으면 구매 불가

가격 로직:

첫 자녀 정가, 2번째부터는 FAMILY_ADD_DISCOUNT_RATE(기본 15%) 할인 적용.

전체 자녀 수와 months에 따라 discount/subtotal 계산.

3. 시간권 — TIMEPASS
살 수 있는 조건

UI 레벨:

자녀 선택은 단일 (라디오)지만, disabled 기준은 훨씬 느슨함.

const forceEnable =
  kind === CASHPASS ||
  kind === TIMEPASS ||
  kind === "points";

const disabledForKind = forceEnable ? false : disabledForKindBase;


→ TIMEPASS는 AGITZ/FAMILY 적용 여부와 상관없이 자녀 선택 가능.

canPay 레벨:

if (kind === MEMBERSHIP_KIND.TIMEPASS) {
  const m = resolveTimepassMinutes(product, payload);
  if (!(m > 0)) return false;
}


preflightValidateDb 레벨:

if (kind === MEMBERSHIP_KIND.TIMEPASS) {
  const minutes = resolveTimepassMinutes(product, payload);
  if (!(minutes > 0))
    return fail("timepass_minutes_invalid", "시간권 분 설정이 올바르지 않습니다.");
}


resolveTimepassMinutes는:

payload.minutes > 0이면 우선 사용.

아니면 product.variant 문자열에서:

"2h", "120m", "2시간" 패턴 등을 찾아 분으로 변환.

요약 — TIMEPASS는

로그인 + 자녀 1명 이상 (어떤 멤버십이 이미 있어도 상관 없음)

분(minute) 설정이 반드시 유효해야 구매 가능 (0분이면 불가)

정규/패밀리와 무관하게 추가로 시간권을 얹는 개념.

4. 정액권/캐시 — CASHPASS
살 수 있는 조건

kind === CASHPASS일 때, forceEnable 때문에 자녀 선택이 자유로움 (AGITZ/FAMILY와 무관).

가격은 payload.price 또는 priceInput에서 직접 들어오는 legacy 방식:

const baseSubtotal = Number(priceInput.subtotal ?? priceInput.total ?? 0);
const baseDiscount = Number(priceInput.discount ?? 0);
const tot = sub - disc;


preflightValidateDb에서 CASHPASS 전용 추가 가드는 없음.

사실상 금액 > 0 + 자녀 선택 + 약관 동의만 만족하면 결제 가능.

요약 — CASHPASS는

멤버십 중복과 상관없이 구매 가능.

검증은 거의 “공통 가드” 수준.

5. 포인트 충전 — POINTS
살 수 있는 조건

kind === "points". isPoints === true.

가격/금액

pointsAmount state로 관리 (초기값: payload.amount/price.total 혹은 10,000원).

UI에서 POINT_PACKS = [10000, 20000, 30000, 40000, 50000] 5개의 버튼 중 하나 선택해서 변경.

if (isPoints) {
  return { subtotal: pointsAmount, discount: 0, total: pointsAmount, meta: { kind } };
}


가드

TIMEPASS/CASHPASS와 마찬가지로 forceEnable이라
AGITZ/FAMILY 여부와 상관없이 자녀 선택 가능.

추가 kind-specific preflight 없음 — 공통 가드만 체크.

요약 — POINTS는

“정액권 잔액” 비슷한 개념으로 어떤 자녀 상태와도 독립.

금액 > 0 + 자녀/약관/로그인만 있으면 구매 가능.

6. cross-cut 정리 — “이 조합은 절대 안 됨”

코드 상에서 명시적으로 막는 조합만 모으면:

AGITZ를 이미 AGITZ인 자녀에게 또 사려고 할 때

agitz_child_already_applied

FAMILY에서 이미 AGITZ/FAMILY인 자녀를 포함해서 결제하려 할 때

family_child_already_applied

FAMILY에서 FAMILY_MAX 초과 선택

family_over_quota

TIMEPASS인데 minutes 못 읽는 상품 (분 설정 잘못)

timepass_minutes_invalid

kind가 ALLOWED 밖

invalid_kind

로그인/전화번호 없음

no_phone

자녀 0명 or 선택 없음

child_required / child_not_selected

내가 가진 자녀 목록에 없는 childId 선택

child_not_owned

금액 0 이하

invalid_amount

약관 미동의

terms_not_agreed

TIMEPASS/CASHPASS/POINTS는 멤버십 중복 관련 가드는 전혀 없음이 포인트야.

7. 한 줄씩 정리해 달라고 하면…

정규(AGITZ):

“아직 정규 멤버십이 없는 자녀 한 명에게만 살 수 있음. 이미 정규인 자녀한테는 절대 안 팔림.”

패밀리(FAMILY):

“정규·패밀리 아무 것도 안 붙어 있는 자녀들만 최대 10명까지 묶어서 살 수 있음. 그중 하나라도 이미 멤버십 있으면 전체 결제 자체가 막힘.”

시간권(TIMEPASS):

“멤버십 여부 상관없이, 분 설정만 정상(>0)이면 누구에게나 추가로 사줄 수 있음.”

정액권(CASHPASS):

“멤버십 상태 상관없이 자유롭게 충전형 상품 구매 가능.”

포인트(points):

“멤버십과 독립적인 충전 상품. 금액 선택하고, 자녀 1명만 지정하면 됨. 멤버십 중복 가드는 없음.”



이제 Checkout(결제창) 전체의 “정책/가드/흐름/데이터 구조”를 README 버전으로 완전 정리해서 줄게.
이 문서는 형이 다른 채팅방에서도 바로 기억시키고 참고하기 좋은 형태로 구성했어.

📘 Checkout 모듈 README (Withagit 결제 시스템)

결제창(CheckoutConfirmDialog.jsx)에서 수행하는 모든 로직을
정책·가드·데이터흐름 중심으로 정리한 공식 문서 버전.

1) 전체 구조 Overview

CheckoutConfirmDialog는 Withagit의 모든 결제(Google/Bootpay)에서
최종 확인 → 결제 요청 → 결제 완료 후 DB 반영까지 담당하는 모듈이다.

구현 상 크게 4단계로 구성된다:

컨텍스트 로딩

보호자(Profile)

자녀(children)

기존 멤버십(memberships)

상품 정보 / 가격 계산

구매 가능 조건(가드) 검사

주문 생성 → Bootpay → 결제 완료 처리

추가로:

결제 약관(전자상거래 이용약관) 모달 내장

포인트 충전 / 멤버십 / 시간권 / 정액권 공통 처리

2) 데이터 소스 (Context 구조)

Checkout은 사용자 컨텍스트를 기반으로 동작한다:

{
  "profile": {
    "phoneE164": "+821062141000",
    "displayName": "",
    "avatarUrl": "members/%2B821062141000/profile_*.jpg",
    "email": "",
    "gender": "female",
    "updatedAt": 1762892319485,
    "consents": {
      "tos": true,
      "privacy": true,
      "ecommerce": true,
      "marketing": true
    }
  },

  "children": [
    {
      "childId": "c_이은기_20210404",
      "name": "이은기",
      "birth": "2021-04-04",
      "avatarUrl": "...",
      "school": "...",
      "grade": "...",
      "classroom": "...",
      "contactPhone": "01062149766"
    },
    ...
  ],

  "memberships": [
    {
      "kind": "agitz",    // 정규 멤버십
      "childId": "xxx",
      "status": "active",
      "startedAt": ...,
      "expiresAt": ...
    },
    {
      "kind": "family",   // 패밀리 멤버십
      "childId": "xxx",
      "status": "active"
    },
    {
      "kind": "timepass", // 시간권
      "childId": "xxx",
      "remainMinutes": ...
    },
    {
      "kind": "cashpass", // 정액권(포인트)
      "childId": "xxx",
      "remainKRW": ...
    }
  ]
}

3) Kind 분류표 & 주요 의미
kind	의미	비고
agitz	정규 멤버십	1자녀 전용 / 중복 불가
family	패밀리 멤버십	여러 자녀 묶음형 / 정규·패밀리 중복 불가
timepass	시간권	분 단위 / 중복 허용
cashpass	정액권	금액 기반 / 중복 허용
points	포인트 충전	cashpass와 동일 취급

결제창은 위 5종류 모두 처리가능.

4) Firestore에서 필요한 데이터 (실시간 스냅샷)

결제할 때 context 데이터만 사용하는 게 아니라,
정확성 확보를 위해 Firestore에서도 최신 스냅샷을 다시 불러온다:

4-1. /members/{phone}/children

→ 자녀 목록 (childId, name, birth, …)

4-2. /members/{phone}/memberships

조건:

kind == (agitz|family)

status in ["active", "future"]

→ 현재 해당 멤버십이 적용된 자녀 집합을 각각 Set으로 구성

agitzAppliedSet   = new Set([...]);
familyAppliedSet  = new Set([...]);


이 두 Set이 모든 멤버십 구매 가드의 핵심 자료구조가 된다.

5) 구매 가드(Guard) — 가장 중요한 정책 부분

Checkout의 모든 제한은 아래 규칙들로 결정된다.

5-1. 공통 가드 (모든 kind 공통)
조건	실패 시 code
로그인(전화번호) 필요	no_phone
약관 동의 필요	terms_not_agreed
금액 total > 0	invalid_amount
자녀 최소 1명 등록	child_required
자녀 선택됨	child_not_selected
선택한 childId가 실제 childrenForUI 안에 존재해야 함	child_not_owned
5-2. AGITZ 정규 멤버십 가드

선택된 자녀가 agitzAppliedSet에 있으면 구매 불가

FAMILY 멤버십 여부는 AGITZ 가드에 포함되지 않음

→ 결과:

“정규 멤버십이 없는 자녀 한 명에게만 가입 가능”

5-3. FAMILY 패밀리 멤버십 가드

선택된 자녀가 단 한 명이라도
agitzAppliedSet 또는 familyAppliedSet에 있으면 전체 구매 불가

최대 FAMILY_MAX명 (기본 10명)

선택은 체크박스 기반 멀티

→ 결과:

FAMILY는 “정규/패밀리 둘 다 없는 자녀들만 묶어서 구매 가능”

5-4. TIMEPASS 시간권 가드

멤버십 상태 상관 없음 (정규/패밀리 있어도 구매 가능)

분(minutes) 설정이 유효해야 함 (>0)

그 외 가드는 공통 가드만 적용

→ 결과:

어떤 자녀에게든 시간권을 여러 번 추가로 구매 가능

5-5. CASHPASS 정액권 가드

멤버십 상태 상관 없음

금액 total만 유효하면 구매 가능

중복 구매 제한 없음

→ 결과:

모든 자녀에게 무제한 충전 가능

5-6. POINTS 포인트 충전 가드

CASHPASS와 동일

금액 선택 10,000 ~ 50,000원

중복 제한 없음

→ 결과:

모든 자녀에게 충전 가능

멤버십 상태와 무관

6) 실제 컨텍스트 기준 “누가 무엇을 살 수 있나” 정리

컨텍스트 기반 Set:

agitzAppliedSet  = { c_이은기_20100604, c_이은서_20151212 }
familyAppliedSet = { c_이은주_20080807 }

자녀별 구매 가능/불가 Summary:
자녀	AGITZ	FAMILY	TIMEPASS	CASHPASS	POINTS
2021 이은기	✅	✅(단독만)	✅	✅	✅
2010 이은기	❌(정규 有)	❌(정규 有)	✅	✅	✅
2008 이은주	✅(정규 없음)	❌(패밀리 有)	✅	✅	✅
2015 이은서	❌(정규 有)	❌(정규 有)	✅	✅	✅

요약:

AGITZ 구매 가능자는 막내 + 이은주(2008) 2명

FAMILY 신규 구성 가능자는 막내 단독

TIMEPASS/CASHPASS/POINTS는 4명 모두 완전 자유

7) 결제 절차(실제 PG 동작 순서)

버튼 클릭 시 → handlePay()

Firestore 스냅샷 재조회 (refreshDbSnapshot)

preflight(가드) 실행

주문 draft 생성 (kind 분기 + children + months + price 등)

onCreateOrder(draft) 또는 createOrderDraft()로 주문 생성 → orderId 발급

테스트 번호면 PG 생략 → 바로 markOrderPaid.dev

실제 PG 모드면 Bootpay.requestPayment(...)

이벤트 처리:

cancel, error, issued

done → 결제 성공

결제 성공 후:

DB 스냅샷 재조회

preflight 재검증 (정합성 체크)

markOrderPaid로 Firestore 반영

refresh()로 Context 갱신

onPrepared({ ok:true })

alert / 모달 닫기

8) 모달/약관 구조

<PaymentTermsModal> 은 결제약관 전체문서(제1~9조)를 포함한 독립 포털 모달

Checkout footer의 LinkBtn 클릭 시 열린다

약관 동의 체크 여부는 agree state로만 관리

agree === false이면 무조건 “결제하기” 비활성

9) 정책 변경 시 수정 포인트

가드를 바꾸고 싶을 때 어떤 부분을 수정해야 하는지 정리:

변경 요구	수정 위치
AGITZ 중복 허용 / 금지 조건 변경	preflightValidateDb / renderChildPick
FAMILY 중복 정책 변경	같은 위치 (preflightValidateDb, effectiveSelectedChildIds)
TIMEPASS 구매 제한 추가	preflightValidateDb TIMEPASS 분기
CASHPASS 제한 추가	CASHPASS 분기 추가
포인트 최소/최대 금액 변경	POINT_PACKS
FAMILY 할인율/최대 인원 변경	FAMILY_ADD_DISCOUNT_RATE, FAMILY_MAX
Bootpay 설정/redirect 정책 변경	Bootpay.requestPayment.extra
주문 스키마 변경	buildDraft()
10) 결론 — 이 README를 기억해야 하는 이유

이 문서를 기반으로:

형이 다른 채팅방에서도
“이 자녀한테 뭘 팔 수 있는지”
“결제창 내부 가드가 왜 이렇게 동작하는지”
“어디를 바꿔야 정책이 변경되는지”
를 바로 이야기할 수 있음.

이 구조는 **Withagit의 결제/멤버십 시스템의 SSOT(단일 진실)**이기 때문에
이후 기능 추가·UI 수정·에러 검증 시에도 기준점이 됨.