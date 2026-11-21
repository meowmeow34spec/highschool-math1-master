# 💎 LOGIC PRISM · 고1 공통수학1 반학기 마스터

> **2022 개정 교육과정 고등학교 1학년 공통수학1 (1학기 중간고사 범위) 완벽 대비**  
> 단순 암기를 넘어 **파인만 직관 → 스텔스 공식 인출 → 4단계 논리 체인 조립 → 인터랙티브 시각 실험실 → 3-Wave 실전 배틀 & 라이트너 복습**으로 수학의 논리 회로를 완성하는 웹 학습 플랫폼입니다.

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-4F46E5?style=for-the-badge&logo=github)](https://meowmeow34spec.github.io/highschool-math1-master/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-0F172A?style=for-the-badge&logo=github)](https://github.com/meowmeow34spec/highschool-math1-master)
[![Curriculum](https://img.shields.io/badge/2022_개정_교육과정-공통수학1_(반학기)-10B981?style=for-the-badge)](#커리큘럼-로드맵-5-chapters--15-stages)
[![Tech](https://img.shields.io/badge/Zero_Build-Vanilla_JS_%2B_KaTeX_%2B_HiDPI_Canvas-0EA5E9?style=for-the-badge)](#로컬-실행-및-무결성-검증)

---

## 🔗 바로가기 (Quick Links)

- 🌐 **실시간 웹 학습 플랫폼 (GitHub Pages)**: [https://meowmeow34spec.github.io/highschool-math1-master/](https://meowmeow34spec.github.io/highschool-math1-master/)
- 📦 **GitHub 소스 저장소**: [https://github.com/meowmeow34spec/highschool-math1-master](https://github.com/meowmeow34spec/highschool-math1-master)
- 📘 **커리큘럼 및 인지학습 설계 가이드**: [`docs/CURRICULUM_AND_LOGIC.md`](./docs/CURRICULUM_AND_LOGIC.md)

---

## ✨ 왜 LOGIC PRISM인가요?

고1 첫 시험인 **1학기 중간고사(Ⅰ. 다항식 ~ Ⅱ. 방정식과 부등식 중 이차함수의 최대·최소)** 는 중학교 연산 위주 수학에서 **구조적·논리적 고교 수학**으로 도약하는 결정적 분기점입니다.  
**LOGIC PRISM**은 공식을 무작정 눈으로 읽는 수동적 학습을 배제하고, 학생이 스스로 식의 대칭성과 인과관계를 깨닫도록 **5대 인지 학습 엔진**을 결합했습니다.

### 🎯 5대 핵심 학습 기능

#### 1. 💡 파인만 직관 노트 & 내신 함정 주의보 (`Feynman Intuition & Trap Alert`)
- **호기심 훅 질문 (`Hook Question`)**: 공식을 제시하기 전에 *"왜 몫 $Q(x)$를 구하지도 않고 나머지를 단숨에 알 수 있을까?"* 와 같은 본질적 질문으로 사고를 깨웁니다.
- **파인만 직관 해설**: 친구에게 설명하듯 명쾌한 스토리텔링과 KaTeX 수식 조판으로 개념의 필연성을 이해시킵니다.
- **내신 함정 주의보 (`Trap Alert`)**: 조립제법에서 $ax+b$로 나눌 때의 몫 보정, 음수의 제곱근에서 $0$인 예외, 판별식 실계수 조건 등 실제 학교 시험에서 오답률 1위를 기록하는 함정을 선제 타격합니다.

#### 2. 🃏 스텔스 빈칸 공식 암기장 (`Stealth Cloze Formula Deck`)
- 전 단원 **45개 핵심 공식**에 **스텔스 빈칸 모드(`\boxed{?}`)** 를 지원합니다.
- 눈으로만 읽으며 아는 척하는 '유창성 착각(Illusion of Fluency)'을 막고, 결정적 항을 스스로 떠올린 뒤 클릭해 확인하는 **능동적 인출(Active Recall)** 훈련을 제공합니다.
- 각 공식마다 **왜 성립할까?(유도 원리)** 와 **암기 팁**, 그리고 `[알아요 ✓] / [헷갈려요 📌]` 필터링을 통해 시험 직전 3분 만에 취약 공식만 집중 점검할 수 있습니다.

#### 3. 🔗 4단계 논리 체인 조립 퍼즐 (`4-Step Logic Chain Builder`)
- 모든 스테이지(15개)마다 핵심 정리나 킬러 유형의 유도 과정을 **4단계 논리 블록(`Step 1 → Step 2 → Step 3 → Step 4`)** 으로 분해했습니다.
- 무작위로 섞인 수식·논리 카드를 올바른 인과 순서로 직접 조립(클릭 또는 숫자키 `1~4`)하며, 각 단계가 선택될 때마다 **왜 이 변환이 정당한지(`reason`)** 즉시 피드백을 받습니다.

#### 4. 🔬 4종 인터랙티브 시각 수학 실험실 (`HiDPI Visual Math Labs`)
대수적 수식이 기하학적 도형과 좌표평면 위에서 어떻게 살아 움직이는지 슬라이더와 스텝 버튼으로 직접 실험합니다 (`devicePixelRatio` 고해상도 캔버스 및 라이트/다크 테마 완벽 대응).
- 🧩 **`poly-sim` (곱셈공식 기하 블록 & 대칭 구조 실험실)**: $(a+b)^2$ 넓이 분할로 $2ab$가 생기는 이유 확인, $(a+b)(a-b)$ 합차 도형 이동, $a^3+b^3=(a+b)^3-3ab(a+b)$ 3D 정육면체 해부.
- 🎯 **`synthetic-div` (조립제법 스텝 시뮬레이터 & $ax+b$ 몫 함정 해부기)**: 삼차식 조립제법의 단계별 애니메이션 실행 및 $dx-e$ ($d \neq 1$)로 나눌 때 몫이 $\frac{1}{d}Q(x)$로 축소되고 나머지 $R$은 불변하는 원리 실시간 비교.
- 🌀 **`complex-plane` (복소평면 $i^n$ 회전기 & 켤레복소수 실험실)**: $\times i$ 연산이 복소평면에서 $90^\circ$ 반시계 회전임을 눈으로 확인하여 $i^2=-1$과 4주기 합 $0$의 원리를 체득하고, 실수축 대칭인 $\overline{z}$의 합·곱 실수화를 관찰.
- 📈 **`quadratic-explorer` (이차함수 판별식 $D$ · 직선 교점 · 제한된 범위 최대·최소 실험실)**: 포물선과 직선의 위치 관계($D>0, D=0, D<0$) 실시간 탐색 및 **제한된 범위 $\alpha \le x \le \beta$ 에서 대칭축 $x=p$의 위치(좌측·내부·우측 3가지 케이스)** 에 따른 최댓값·최솟값 변화 실험.

#### 5. ⚔️ 3-Wave 논리 배틀 & 라이트너 스마트 오답노트 (`3-Wave Arena & Leitner SRS`)
- 스테이지마다 총 **7문항의 3-Wave 배틀**이 펼쳐집니다 (전 단원 총 **105문항**: O/X 45제 + 객관식 60제):
  - **Wave 1 (O/X 개념 함정 브레이커 · 3문항)**: 참/거짓 판별로 내신 서술형·진위형 함정 격파
  - **Wave 2 (개념·공식 변형 드릴 · 3문항)**: 논리 힌트와 함께 핵심 유형 체화
  - **Wave 3 (내신 실전 보스전 · 1문항)**: 복합 조건이 결합된 고난도 실전 문제 도전
- 모든 문항 풀이 직후 **과교정(Hypercorrection) 정밀 해설 패널**이 열려 정·오답의 논리적 근거를 완벽히 짚어줍니다.
- 틀린 문항은 자동으로 **라이트너 상자(`Box 0 긴급 복습 → Box 1 → Box 2 → Box 3 졸업`)** 에 등록되어 완전 정복할 때까지 관리되며, 언제든 **반학기 랜덤 실전 모의고사 10제**로 전 범위 실력을 점검할 수 있습니다.

---

## 🗺️ 커리큘럼 로드맵 (5 Chapters · 15 Stages)

**2022 개정 교육과정 공통수학1**의 1학기 중간고사 표준 진도(Ⅰ. 다항식 전체 + Ⅱ. 방정식과 부등식 중 복소수~이차함수의 최대·최소)를 빈틈없이 다룹니다.

| 대단원 | 중단원 | 스테이지 | 핵심 학습 주제 | 연계 실험실 |
| :--- | :--- | :--- | :--- | :--- |
| **Ⅰ. 다항식** | **I-1. 다항식의 연산** | `STAGE 01` | 다항식의 정리와 덧셈·뺄셈 (기준 문자 내림차순 정리·동류항) | `poly-sim` |
| **Ⅰ. 다항식** | **I-1. 다항식의 연산** | `STAGE 02` | 곱셈공식과 곱셈공식의 변형 (대칭식 구조 유도) | `poly-sim` |
| **Ⅰ. 다항식** | **I-1. 다항식의 연산** | `STAGE 03` | 다항식의 나눗셈과 $A = BQ + R$ ($\deg(R) < \deg(B)$ 필연성) | `poly-sim` |
| **Ⅰ. 다항식** | **I-2. 항등식과 나머지정리** | `STAGE 04` | 항등식의 성질과 미정계수법 (계수비교법 vs 수치대입법) | `synthetic-div` |
| **Ⅰ. 다항식** | **I-2. 항등식과 나머지정리** | `STAGE 05` | 나머지정리와 인수정리 ($Q(x)$ 소거 스위치·이차식 나머지 설정) | `synthetic-div` |
| **Ⅰ. 다항식** | **I-2. 항등식과 나머지정리** | `STAGE 06` | 조립제법과 일차식 계수 함정 ($ax+b$ 나눗셈 몫 $\frac{1}{a}Q(x)$ 해부) | `synthetic-div` |
| **Ⅰ. 다항식** | **I-3. 인수분해** | `STAGE 07` | 핵심 인수분해 공식과 세제곱 대칭식 ($a^3+b^3+c^3-3abc$) | `poly-sim` |
| **Ⅰ. 다항식** | **I-3. 인수분해** | `STAGE 08` | 복잡한 식의 인수분해 전략 (치환·복이차식·최저차 문자 정리) | `poly-sim` |
| **Ⅰ. 다항식** | **I-3. 인수분해** | `STAGE 09` | 인수정리를 이용한 고차식의 인수분해 (약수 탐색 + 연쇄 조립제법) | `poly-sim` |
| **Ⅱ. 방정식과 부등식** | **II-1. 복소수와 이차방정식** | `STAGE 10` | 허수단위 $i$와 복소수의 연산·켤레복소수 ($i^n$ 4주기·실수화) | `complex-plane` |
| **Ⅱ. 방정식과 부등식** | **II-1. 복소수와 이차방정식** | `STAGE 11` | 음수의 제곱근 성질과 이차방정식의 판별식 (부호 함정·$D=b^2-4ac$) | `complex-plane` |
| **Ⅱ. 방정식과 부등식** | **II-1. 복소수와 이차방정식** | `STAGE 12` | 이차방정식의 근과 계수의 관계 (항등식 유도·켤레근 전제 조건) | `complex-plane` |
| **Ⅱ. 방정식과 부등식** | **II-2. 이차방정식과 이차함수** | `STAGE 13` | 이차함수의 그래프와 $x$축의 위치 관계 (교점 개수 $\iff$ 실근 $\iff D$) | `quadratic-explorer` |
| **Ⅱ. 방정식과 부등식** | **II-2. 이차방정식과 이차함수** | `STAGE 14` | 이차함수의 그래프와 직선의 위치 관계 (차함수 $f(x)-g(x)=0$ 접선 논리) | `quadratic-explorer` |
| **Ⅱ. 방정식과 부등식** | **II-2. 이차방정식과 이차함수** | `STAGE 15` | 이차함수의 최대·최소와 제한된 범위 (대칭축 $x=p$ 포함 여부 3케이스) | `quadratic-explorer` |

> 각 스테이지의 상세 논리 체인 설계와 내신 빈출 함정 분석은 [`docs/CURRICULUM_AND_LOGIC.md`](./docs/CURRICULUM_AND_LOGIC.md)에서 확인하실 수 있습니다.

---

## 🎨 디자인 시스템 & 사용자 경험 (UI/UX)

- **Crystal Daylight Bento & Midnight Prism Glass 듀얼 테마**: 토스·리니어 스타일의 정갈한 벤토 그리드(Bento Grid)와 고대비 라이트/다크 모드를 지원합니다.
- **최적의 한글·수식 가독성**: `Pretendard Variable` 웹폰트(`word-break: keep-all`, 넉넉한 행간)와 `KaTeX 0.16.11` 수식 렌더링을 결합해 수식이 섞인 긴 해설도 한눈에 읽힙니다.
- **무설치·무서버 학습 상태 보존**: `localStorage` 기반으로 연속 학습일(🔥 Streak), 레벨 및 칭호(`다항식 탐험가` ~ `공통수학1 그랜드마스터`), 일일 퀘스트, 스테이지 별점(`★★★`), 라이트너 오답 상자가 브라우저에 자동 저장됩니다.
- **반응형 레이아웃 & 키보드 단축키**: 모바일(`375px`), 태블릿(`768px`), 데스크톱(`1440px+`) 전 화면 대응 및 논리 퍼즐/배틀 키보드 조작을 지원합니다.

---

## 📂 프로젝트 구조

```text
highschool-math1-master/
├── index.html                      # 앱 엔트리 및 시맨틱 벤토 레이아웃 셸
├── README.md                       # 프로젝트 소개 및 실행 가이드
├── docs/
│   └── CURRICULUM_AND_LOGIC.md     # 15스테이지 상세 커리큘럼·논리유도·내신함정 설계서
├── src/
│   ├── css/
│   │   ├── design-system.css       # 라이트/다크 컬러 토큰, 타이포그래피, 반응형 그리드
│   │   └── components.css          # 벤토 카드, 수식 박스, 논리 퍼즐, 배틀 아레나, 실험실 스타일
│   ├── data/
│   │   ├── chapters-alg.js         # Ⅰ. 다항식 (Ch 1~3, STAGE 01~09) 데이터셋
│   │   ├── chapters-eq.js          # Ⅱ. 방정식과 부등식 (Ch 4~5, STAGE 10~15) 데이터셋
│   │   └── curriculum-index.js     # 통합 커리큘럼 조회 API (브라우저 & Node 겸용)
│   └── js/
│       ├── math-render.js          # KaTeX 인라인/블록/스텔스 빈칸 렌더러 및 안전 폴백
│       ├── learning-state.js       # XP/스트릭/퀘스트/라이트너 복습 상태 관리 & Web Audio 효과음
│       ├── visual-lab.js           # 4종 HiDPI 캔버스 인터랙티브 수학 실험실
│       └── app-controller.js       # 5개 메인 뷰 라우팅 및 학습 게임 인터랙션 컨트롤러
├── scripts/
│   ├── validate-curriculum.mjs     # 15스테이지 스키마·LaTeX 수식 균형·수학적 정답 무결성 검증
│   └── publish-github.ps1          # GitHub 저장소 생성·푸시 및 GitHub Pages 자동 활성화 스크립트
└── tests/
    └── verify-e2e.mjs              # 실제 헤드리스 브라우저 기반 전 기능 E2E 자동 검증 스위트
```

---

## 🚀 로컬 실행 및 무결성 검증

별도의 번들러 빌드 과정 없이 정적 웹 서버만으로 즉시 실행됩니다.

### 1. 로컬 웹 서버 실행

```powershell
# 프로젝트 폴더로 이동
cd C:\Users\USER\.gemini\antigravity\scratch\highschool-math1-master

# Node npx로 정적 서버 실행 (또는 python -m http.server 8080)
npx --yes serve . -l 8080
```

브라우저에서 `http://localhost:8080` 으로 접속하면 모든 기능을 바로 이용할 수 있습니다.

### 2. 커리큘럼 및 수학적 무결성 검증

5개 중단원 · 15개 스테이지 · 45개 공식 · 15개 논리 체인 · 105개 배틀 문항의 스키마, `$...$` LaTeX 구분자 균형, 정답 유효성을 검증합니다.

```powershell
node scripts/validate-curriculum.mjs
```

### 3. 브라우저 E2E 자동화 검증

로컬 정적 서버와 헤드리스 브라우저를 구동하여 대시보드, 다크/라이트 테마 전환, 스텔스 공식장, 4단계 논리 체인 조립, 3-Wave 배틀, 4종 시각 실험실 캔버스 렌더링, 라이트너 오답노트, 모바일/데스크톱 반응형 레이아웃 및 콘솔 무오류 여부를 전수 검사합니다.

```powershell
node tests/verify-e2e.mjs
```

### 4. GitHub 저장소 및 GitHub Pages 배포

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-github.ps1
```

---

## 📜 라이선스 및 교육 활용 안내

본 프로젝트는 대한민국 고등학교 1학년 학생들의 **2022 개정 교육과정 공통수학1** 자기주도 학습과 수학적 사고력 향상을 위해 제작된 오픈 교육 플랫폼입니다. 학교 수업, 방과후 보충학습, 자기주도 내신 대비에 자유롭게 활용하실 수 있습니다.
