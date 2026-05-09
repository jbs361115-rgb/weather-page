# 경상북도 영천시 의료기관 현황 웹페이지

> 공공데이터포털 REST API를 이용해 영천시 의료기관 정보를 조회하는 정적 웹페이지입니다.

---

## 📋 프로젝트 정보

| 항목 | 내용 |
|------|------|
| 학번 | 2024XXXXXXX _(본인 학번으로 변경)_ |
| 이름 | 홍길동 _(본인 이름으로 변경)_ |
| 데이터명 | 경상북도 영천시\_의료기관현황 |
| API 엔드포인트 | `https://apis.data.go.kr/5100000/YeongcheonMedicalfacility/getResult` |
| 데이터 포맷 | JSON |
| 활용기간 | 2026-03-25 ~ 2028-03-25 |

---

## 📁 파일 구조

```
project/
├── index.html   # 메인 HTML 페이지
├── style.css    # 스타일시트
├── app.js       # API 호출 및 동적 렌더링 로직
└── README.md    # 프로젝트 설명 (이 파일)
```

---

## 🚀 실행 방법

### VS Code에서 실행 (권장)

1. VS Code에서 프로젝트 폴더를 엽니다.
2. **Live Server** 확장 프로그램을 설치합니다.
   - 확장 탭(`Ctrl+Shift+X`) → "Live Server" 검색 → 설치
3. `index.html` 파일을 열고 우하단 **Go Live** 버튼을 클릭합니다.
4. 브라우저에서 `http://127.0.0.1:5500` 로 자동 열립니다.

> ⚠️ `file://` 프로토콜로 직접 열면 CORS 오류가 발생할 수 있습니다.  
> 반드시 Live Server 또는 로컬 웹 서버를 통해 실행하세요.

### 기타 로컬 서버 방법

```bash
# Python 3
python -m http.server 5500

# Node.js (npx 필요)
npx serve .
```

---

## 🔧 API 정보

| 항목 | 내용 |
|------|------|
| 서비스 유형 | REST |
| 인증 방식 | 일반 인증키 (Query Parameter) |
| 요청 파라미터 | `serviceKey`, `pageNo`, `numOfRows`, `type` |
| 응답 포맷 | JSON |
| 일일 트래픽 | 10,000건 |

**인증키**
```
175f573c570576a4a89ae0f7140185c50e84ea6c216d1639b82bc244f985ec9c
```

---

## ✨ 주요 기능

- **데이터 불러오기** – 버튼 클릭 시 공공데이터 API 호출 및 전체 데이터 수집
- **키워드 검색** – 기관명 또는 주소 실시간 필터링
- **종별 필터** – 병원 유형별(병원·의원·약국 등) 필터
- **페이지네이션** – 20건씩 페이지 분할 표시
- **반응형 레이아웃** – 모바일/태블릿 대응

---

## ⚙️ 커스터마이징

`index.html` 상단의 학번·이름을 실제 정보로 수정하세요:

```html
<!-- index.html -->
<span class="value" id="student-id">2024XXXXXXX</span>  <!-- 학번 변경 -->
<span class="value" id="student-name">홍길동</span>      <!-- 이름 변경 -->
```

한 페이지 표시 건수를 바꾸려면 `app.js`의 `CONFIG.pageSize`를 수정합니다:

```js
// app.js
const CONFIG = {
  pageSize: 20,  // 원하는 값으로 변경
  ...
};
```

---

## 📄 라이선스 및 출처

- 데이터 출처: [공공데이터포털](https://www.data.go.kr)
- 이용허락범위: 제한 없음
- 활용목적: 수업 활용 / 연구
