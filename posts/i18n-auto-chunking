# 10만 개의 번역 키, 수동 분류 없이 빌드 타임에 최적화하기 (Auto Chunking)

프로젝트 규모가 커지다 보면 i18n 번역 파일 관리 자체가 거대한 기술 부채가 되곤 합니다.

현재 우리 팀의 상황은 이랬습니다.

1.  **방대한 데이터:** 약 10만 개의 번역 키가 존재함.
2.  **단일 소스:** 모든 키는 분류 체계 없이 하나의 거대한 스프레드시트에서 관리됨.
3.  **성능 이슈:** 이를 그대로 로드하자니 초기 번들 사이즈가 너무 크고, 수동으로 나누자니 관리 비용이 불가능한 수준.

이 글에서는 스프레드시트의 분류 체계를 건드리지 않고, **빌드 타임 정적 분석(Static Analysis)을 통해 자동으로 최적화된 JSON 청크(Chunk)를 생성하는 방법**을 공유합니다.

---

## 핵심 전략: 빈도 기반 자동 청킹 (Frequency-based Auto Chunking)

우리의 목표는 **"사람이 분류하지 말고, 기계가 코드 사용량을 보고 판단하게 하자"**입니다.
이를 위해 전체 번역 데이터를 3가지 계층(Tier)으로 나누는 전략을 세웠습니다.

1.  **Tier 1: Common (공통)**
    * 3개 이상의 페이지에서 중복되어 사용되는 키.
    * 앱 실행 시 무조건 로드 (`common.json`).
2.  **Tier 2: Page Specific (페이지 전용)**
    * 특정 페이지 라우트에서만 사용되는 키.
    * 해당 페이지 진입 시 Lazy Loading (`page-home.json`, `page-settings.json`).
3.  **Tier 3: Fallback (나머지)**
    * 정적 분석으로 탐지되지 않는 키(동적 키)나 미사용 키.
    * 필요시 로드하거나 서버 사이드 렌더링 시 참조 (`fallback.json`).

---

## 구현 과정

### 1. 빌드 스크립트 작성 (`scripts/build-i18n.js`)

이 스크립트는 빌드 전(`prebuild`) 단계에서 실행됩니다.
1.  스프레드시트의 전체 데이터를 가져옵니다.
2.  소스 코드를 스캔하여 어떤 페이지가 어떤 키를 쓰는지 파악합니다.
3.  빈도수에 따라 데이터를 쪼개 JSON 파일로 저장합니다.

```javascript
const fs = require('fs');
const glob = require('glob');
const path = require('path');

// 1. 전체 번역 데이터 (실무에선 구글 시트 API 등을 통해 가져옴)
const RAW_DATA = require('../raw-translations.json'); 

// 설정값
const CONFIG = {
  srcDir: 'src/pages', // 페이지 컴포넌트가 위치한 곳
  threshold: 3,        // 공통 키로 간주할 최소 사용 페이지 수
  outputDir: 'public/locales/ko'
};

// 키 사용량을 추적할 맵
// { 'login_btn': ['/login', '/signup', '/home'], ... }
const keyUsageMap = {};
const pageKeyMap = {}; // { '/login': ['login_btn', ...], ... }

function scanCodebase() {
  const files = glob.sync(`${CONFIG.srcDir}/**/*.tsx`);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    // 간단한 정규식 예시 (실무에선 babel-parser 등 AST 사용 권장)
    // t('key'), i18nKey="key" 등의 패턴을 찾음
    const matches = content.match(/['"]([\w_.-]+)['"]/g); 

    if (matches) {
      const pageName = path.basename(file, '.tsx'); // 예: Login
      pageKeyMap[pageName] = pageKeyMap[pageName] || new Set();

      matches.forEach(rawKey => {
        const key = rawKey.replace(/['"]/g, '');
        // 실제 데이터에 존재하는 키인지 확인
        if (RAW_DATA[key]) {
          pageKeyMap[pageName].add(key);
          
          if (!keyUsageMap[key]) keyUsageMap[key] = new Set();
          keyUsageMap[key].add(pageName);
        }
      });
    }
  });
}

function generateChunks() {
  const buckets = {
    common: {},
    fallback: {},
    pages: {}
  };

  // 1. 전체 키 순회하며 분류
  Object.keys(RAW_DATA).forEach(key => {
    const usage = keyUsageMap[key] ? keyUsageMap[key].size : 0;

    if (usage >= CONFIG.threshold) {
      // 3개 이상 페이지에서 사용 -> Common
      buckets.common[key] = RAW_DATA[key];
    } else if (usage === 0) {
      // 코드에서 발견 안됨 (동적 키 등) -> Fallback
      buckets.fallback[key] = RAW_DATA[key];
    } else {
      // 특정 페이지들에서만 사용됨 -> 아직 할당 안 함 (아래에서 처리)
    }
  });

  // 2. 페이지별 JSON 생성 (Common에 없는 것만 담기)
  Object.keys(pageKeyMap).forEach(pageName => {
    buckets.pages[pageName] = {};
    pageKeyMap[pageName].forEach(key => {
      // 이미 Common으로 빠진 건 제외
      if (!buckets.common[key]) {
        buckets.pages[pageName][key] = RAW_DATA[key];
      }
    });
  });

  // 3. 파일 쓰기 예시
  // fs.writeFileSync(path.join(CONFIG.outputDir, 'common.json'), JSON.stringify(buckets.common));
  // fs.writeFileSync(path.join(CONFIG.outputDir, 'fallback.json'), JSON.stringify(buckets.fallback));
  
  console.log(`Common keys: ${Object.keys(buckets.common).length}`);
  console.log(`Fallback keys: ${Object.keys(buckets.fallback).length}`);
}

scanCodebase();
generateChunks();
```

### 2. 클라이언트 로딩 전략 (React + i18next)

이제 생성된 파일들을 효율적으로 불러와야 합니다. `i18next-http-backend`를 사용하여 페이지 진입 시 필요한 리소스를 로드합니다.

```typescript
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'ko',
    fallbackLng: 'ko',
    ns: ['common'], // 기본적으로 common만 로드
    defaultNS: 'common',
    backend: {
      // 페이지별 JSON 로드 경로 설정
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
```

페이지 컴포넌트에서는 `useTranslation` 훅을 사용하거나 라우터 레벨에서 네임스페이스를 로드합니다.

```typescript
// pages/Settings.tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t, i18n } = useTranslation();

  // 페이지 진입 시 해당 페이지 전용 JSON 로드 (Lazy Loading)
  useEffect(() => {
    i18n.loadNamespaces('page-Settings');
  }, []);

  return <h1>{t('settings_title')}</h1>;
};
```

---

## 난관과 해결: 동적 키(Dynamic Keys)

정적 분석의 최대 약점은 `t('error.' + code)`와 같은 동적 키를 읽을 수 없다는 점입니다. 이 경우 해당 키는 `fallback.json`으로 분류되어 초기 로딩에서 누락될 수 있습니다.

이를 해결하기 위해 **매직 코멘트(Magic Comments)** 방식을 도입했습니다.

```typescript
// 코드 어딘가에 주석으로 힌트를 남김
// @i18n-scan: error.*
// @i18n-scan: status.paid, status.pending

const code = '404';
t(`error.${code}`); 
```

빌드 스크립트(`scanCodebase`)에서 정규식을 보강하여 `// @i18n-scan:` 뒤에 오는 패턴을 읽어, 해당 키들을 강제로 사용된 것으로 간주(Whitelist)하면 문제를 해결할 수 있습니다.

---

## 결론

이 방식을 도입함으로써 얻은 이점은 명확합니다.

1.  **초기 로딩 속도 개선:** 10만 개의 데이터(수 MB)를 한 번에 받지 않고, 필요한 1~2만 개만 먼저 받습니다.
2.  **관리 포인트 최소화:** 기획/번역 팀은 여전히 스프레드시트 하나만 관리하면 됩니다. 개발팀은 네임스페이스를 고민할 필요 없이 코딩만 하면 됩니다.
3.  **자동화된 최적화:** 프로젝트가 커져도 `threshold` 값만 조절하면 언제든 최적의 청크 상태를 유지할 수 있습니다.

대규모 i18n 데이터를 다루고 있다면, 무리한 수동 분리보다는 **빌드 파이프라인을 통한 자동화**를 먼저 고려해보시길 추천합니다.
