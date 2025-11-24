
# Functions API README — 브라우저용 Cloud Functions 템플릿 (+ 소셜 로그인 키트 가이드)

이 문서는 **브라우저(웹앱)에서 호출되는 HTTP Cloud Functions**를 안정적으로 운영하기 위한
**표준 체크리스트**입니다. 또한 **네이버/카카오/구글 등 소셜 로그인**을 *커스텀 토큰 방식*으로
쉽게 재사용할 수 있도록 **프로젝트 간 복제 가능한 운영 절차**를 정리했습니다.

> 핵심 원칙
> - 프론트는 `signInWithCustomToken()`만 공통 사용 → 공급자별 복잡도는 *백엔드 함수*로 캡슐화
> - 배포 단위는 **엔드포인트별 개별 함수**(예: `health`, `naverAuth`, `kakaoAuth`, `googleAuth`)
> - 프런트는 **함수 URL을 직접 호출**(Hosting 리라이트 없이도 OK)
> - 브라우저 CORS는 **form-urlencoded** 전송 + 함수의 CORS 헤더로 최소화/해결

---

## 📦 필수 파일(개요)

- `functions/index.js` … 공급자별 **개별 https 함수**(예: `naverAuth`)를 export
- `.env(.local)` … 각 공급자 Client ID/Secret, Redirect URI, 허용 오리진 등 환경변수
- (선택) `firebase.json` … Hosting을 쓰는 경우에만 SPA 설정(리라이트는 필수 아님)

> ※ 이 README는 **코드 없이 절차만** 제공합니다. 템플릿 코드는 별도 저장소/스니펫을 사용하세요.

---

## 🔐 공통 개념 정리

- **커스텀 토큰 방식**: Functions에서 공급자(OAuth) 코드를 교환해 사용자 식별자를 얻고,
  `createCustomToken()`으로 파이어베이스 토큰을 발급. 프론트는
  `signInWithCustomToken()`으로 로그인. (Firebase Auth Provider를 *꼭* 켤 필요 없음)
- **필수 권한(IAM)**: 함수 런타임 서비스 계정에 `Service Account Token Creator`
  역할이 있어야 커스텀 토큰 서명이 가능.
- **에러 지도**  
  - `403 Forbidden (functions)` → **Invoker 미허용** (처음 배포 시 “Unauthenticated 허용(Y)”)  
  - `No Access-Control-Allow-Origin` → 프리플라이트/CORS → form-urlencoded + 함수 CORS 헤더 설정  
  - `404 Page Not Found (Hosting)` → 함수가 아니라 Hosting으로 라우팅됨  
  - `401 naver_token_error` → `redirect_uri 불일치` / `invalid_client` / `invalid_grant(코드 재사용)`  
  - `500 naver_auth_failed` + `signBlob denied` → **IAM 역할(토큰 생성자)** 누락

---

## ✅ 네이버 로그인 — “프로젝트 복제용” 최소 절차

### 1) 네이버 개발자 콘솔
- 앱 생성 후 **Client ID / Client Secret** 발급
- **콜백 URL** 등록(개발/운영 각각 등록)
  - 개발: `http://localhost:3000/auth/callback/naver` *(http, https 아님)*
  - 운영: `https://<프로덕션도메인>/auth/callback/naver`
- 콘솔의 콜백 URL과 **프론트에서 authorize에 쓰는 redirect_uri**, **함수에서 토큰 교환에 쓰는 redirect_uri**를
  **바이트 단위로 동일**하게 유지 (스킴/포트/경로/슬래시까지)

### 2) Functions 환경 변수(.env) 준비
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `NAVER_REDIRECT_URI`
- `ALLOWED_ORIGINS` (예: `http://localhost:3000,https://<prod>.web.app`)

> 비밀값은 Git에 커밋 금지. 가능하면 **Firebase Secrets / Runtime Config** 사용.

### 3) 함수 배포 (gcloud 없이)
- 공급자별로 **개별 함수**를 export (예: `exports.naverAuth`)
- 배포: `firebase deploy --only functions:naverAuth`
- 처음 배포 시 CLI 프롬프트에서 **“Allow unauthenticated?” → Y**

### 4) IAM 권한(중요)
- GCP 콘솔 → Cloud Functions → `naverAuth` → **Runtime service account** 확인  
  (예: `daonthecare@appspot.gserviceaccount.com` 또는 `<PROJECT_NUMBER>-compute@developer.gserviceaccount.com`)
- 콘솔 → IAM & Admin → IAM → **Grant access**  
  - New principals: 위 서비스 계정 이메일
  - Role: **Service Account Token Creator** (서비스 계정 토큰 생성자)
- 저장 후 즉시 적용(대개 재배포 불필요)

### 5) 프론트 통합(절차만)
- **Authorize 단계**
  - 브라우저를 네이버 authorize URL로 이동 (client_id, redirect_uri, state 포함)
- **Callback 단계**
  - URL 쿼리에서 `code`, `state` 파싱
  - **중복 실행 방지**: React StrictMode 이중 호출 가드 + `?code`를 `history.replaceState`로 제거
  - 함수 URL 호출: `POST https://<region>-<project>.cloudfunctions.net/naverAuth`
    - Body: `code`, `state`, `redirect_uri`(프론트 env 값 — 함수는 내부에서 서버값으로 고정 사용 권장)
    - Header: `Content-Type: application/x-www-form-urlencoded` *(프리플라이트 회피)*
  - 응답 `{ token }` 수신 후 `signInWithCustomToken()` 호출

### 6) 운영 시 주의
- **redirect_uri**를 운영 도메인으로 교체 후 **네이버 콘솔에도 동일 등록**
- Authorized domains(Firebase Auth)에는 운영 도메인을 추가(필요 시)
- 에러 대응은 함수 로그로 원인 확인:  
  `[NAVER_TOKEN_ERR] raw: redirect_uri mismatch / invalid_client / invalid_grant` 등

---

## 🧭 자주 막히는 포인트와 바로잡기

- **콜백 URL 불일치 → 401**: 콘솔/프론트/함수 3곳의 redirect_uri를 **완전히 동일**하게 맞춘다.
- **코드 재사용 → 401**: 콜백에서 **한 번만 교환**(useRef 가드) + URL에서 `?code` 제거.
- **커스텀 토큰 서명 실패 → 500**: 런타임 서비스 계정에 **Service Account Token Creator** 역할 부여.
- **호출 403**: 함수 배포 시 **Unauthenticated 허용(Y)** 또는 Invoker 권한(allUsers) 부여.
- **Hosting 404**: 함수가 아니라 정적 호스팅으로 간 것. 함수 URL로 직접 호출하거나 리라이트를 점검.

---

## 🔁 다른 공급자(카카오/구글)도 동일 패턴

- **카카오**: REST API Key(+ Secret 선택), `/oauth/authorize` → `/oauth/token`,
  사용자 API( `/v2/user/me` )로 id 획득 → `createCustomToken()`
- **구글**: OAuth 클라이언트(웹), `/o/oauth2/v2/auth` → `/token`,
  `id_token` 또는 `/userinfo`로 sub 획득 → `createCustomToken()`
- 각 공급자별 **Client ID/Secret/Redirect URI**만 .env로 교체하면 동일한 절차.

---

## 🧪 점검 루틴(복붙 체크리스트)

1) `curl https://<region>-<project>.cloudfunctions.net/health` → 200 OK
2) 콜백에서 함수 응답 코드/본문 확인
   - 200 `{ token }` → `signInWithCustomToken()`
   - 401 → redirect_uri/ID/Secret/code 재사용 여부 확인
   - 500 + `signBlob denied` → IAM 역할 추가
3) 문제시 Functions 로그 확인(세부 사유가 그대로 출력)



