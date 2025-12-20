---
title: 'NPM 패키지 분리 환경에서 싱글톤(Singleton) 유지하기: globalThis와 Symbol.for의 활용'
summary: 물리적으로 분리된 번들 환경에서 globalThis와 Symbol.for를 활용하여 싱글톤 인스턴스를 안전하게 공유하는 방법을 설명합니다.
tags:
  - NPM
  - Singleton
  - globalThis
  - Symbol.for
  - JavaScript
date: 2025-12-20T00:00:00.000Z
---

# [Architecture] NPM 패키지 분리 환경에서 싱글톤(Singleton) 유지하기: globalThis와 Symbol.for의 활용

최근 사내 패키지 배포 구조를 개선하면서 마주친 문제와 그 해결 과정을 공유합니다.

여러 프로젝트에서 공통으로 사용하는 패키지들을 npm 저장소(Nexus 등)에 배포하여 관리하고 있는데, 배포 편의성을 위해 의존성 패키지를 번들(Bundle)에 포함시키는 과정에서 **싱글톤(Singleton) 객체가 유지되지 않는 이슈**가 발생했습니다.

이 글에서는 물리적으로 분리된 번들 환경에서 어떻게 안전하게 싱글톤 인스턴스를 공유했는지, 그 과정에서 **`globalThis`**와 **`Symbol.for`**를 어떻게 활용했는지 다룹니다.

## 1. 문제 상황 (The Problem)

### 아키텍처 구조
현재 우리 팀은 다음과 같은 3가지 패키지를 운용하고 있습니다.

* **Framework**: 핵심 로직과 싱글톤 객체(Store, Manager 등)를 제공
* **Editor**: `Framework`를 의존하여 사용하는 편집 도구
* **Converter**: `Framework`를 의존하여 사용하는 변환 도구

배포 및 설치 편의성을 위해 `Editor`와 `Converter`를 배포할 때, 이들이 의존하는 `Framework` 코드를 각각의 번들에 포함(Bundled)시켜 배포했습니다.

### 발생한 이슈
호스트 애플리케이션에서 `Editor`와 `Converter`를 동시에 설치해서 사용할 때 문제가 발생했습니다.

1.  `Editor`가 로드되면서 내부의 `Framework`가 초기화됨 (싱글톤 A 생성)
2.  `Converter`가 로드되면서 내부의 `Framework`가 초기화됨 (싱글톤 B 생성)
3.  **결과:** 두 패키지가 **서로 다른 싱글톤 인스턴스**를 바라보게 되어 상태 공유가 불가능해짐.

## 2. 원인 분석

일반적인 ES Module 시스템에서 싱글톤은 **모듈 스코프(Module Scope)** 내의 클로저를 통해 유지됩니다.

하지만 번들링을 하게 되면 각 번들 파일(`editor.bundle.js`, `converter.bundle.js`)마다 `Framework`의 코드가 복제되어 들어갑니다. 자바스크립트 런타임 입장에서 이 두 코드는 **서로 다른 물리적 모듈**로 취급되므로, 각각 별도의 실행 컨텍스트와 메모리 공간을 갖게 됩니다.

따라서 모듈 시스템의 스코프를 넘어선 **전역 공간(Global Scope)**을 통한 상태 공유가 필요했습니다.

## 3. 해결 전략: Global Scope 활용

### 1차 접근: 전역 객체(globalThis) 사용
브라우저와 Node.js 환경 모두를 아우를 수 있는 표준인 `globalThis`에 인스턴스를 저장하기로 했습니다.

```typescript
// 단순히 문자열 키를 사용한다면?
globalThis['MY_FRAMEWORK_INSTANCE'] = new Framework();
```

하지만 단순히 문자열 키(`string key`)를 사용하는 것은 다음과 같은 위험이 있습니다.
* **이름 충돌:** 다른 라이브러리나 레거시 코드에서 우연히 같은 이름을 사용할 경우 덮어씌워질 위험이 있음.
* **전역 오염:** `Object.keys(window)` 등으로 조회했을 때 노출되어, 의도치 않은 접근이나 수정이 발생할 수 있음.

### 2차 접근: Symbol.for() 활용 (최종 솔루션)
이 문제를 해결하기 위해 **`Symbol.for()`**를 사용했습니다.

* **Namespace 격리:** Symbol은 일반 문자열 키와 다른 레이어에 저장되므로, 일반적인 전역 변수 접근으로 오염될 일이 없습니다.
* **Cross-Realm 공유:** `Symbol()`은 호출할 때마다 매번 다른 값을 만들지만, `Symbol.for('key')`는 **전역 심볼 레지스트리**를 통해 키가 같으면 동일한 심볼 객체를 반환합니다. 즉, **번들이 달라도 같은 심볼을 가리킬 수 있습니다.**

## 4. 구현 코드 (Implementation)

기존의 싱글톤 레지스트리 패턴에 `globalThis`와 `Symbol.for`를 적용한 구현입니다.

### SingletonRegistry.ts

```typescript
// 1. 전역에서 유일성을 보장하기 위한 Symbol 키 생성
// 충돌 방지를 위해 회사 도메인 등을 포함한 긴 네이밍 권장
const CONSTRUCTORS_KEY = Symbol.for('my-org.framework.registry.constructors');
const SINGLETONS_KEY = Symbol.for('my-org.framework.registry.singletons');

// 2. 전역 객체 타입 정의 (TypeScript)
type GlobalWithRegistry = typeof globalThis & {
  [CONSTRUCTORS_KEY]?: Map<string, new (...args: any[]) => any>;
  [SINGLETONS_KEY]?: Map<string, any>;
};

// 3. 전역 맵 접근 헬퍼 (초기화 로직 포함)
function getGlobalSingletons(): Map<string, any> {
  const g = globalThis as GlobalWithRegistry;
  if (!g[SINGLETONS_KEY]) {
    g[SINGLETONS_KEY] = new Map();
  }
  return g[SINGLETONS_KEY]!;
}

// ... 생성자 맵 접근 함수도 동일한 방식 ...

export namespace SingletonRegistry {
  export const register = (name: string, constructor: new (...args: any[]) => any) => {
    // 로컬 변수가 아닌 전역 심볼 맵에 저장
    getGlobalConstructors().set(name, constructor);
  };

  export const resolve = (name: string) => {
    const singletons = getGlobalSingletons();
    
    // 이미 생성된 인스턴스가 전역 맵에 있는지 확인
    if (!singletons.has(name)) {
      const constructors = getGlobalConstructors();
      const constructor = constructors.get(name);
      
      if (!constructor) {
        throw new Error(`Singleton ${name} is not registered`);
      }
      
      // 인스턴스 생성 후 전역 맵에 저장 -> 다른 번들에서도 이 인스턴스를 보게 됨 
      singletons.set(name, new constructor());
    }

    return singletons.get(name);
  };
}
```

이렇게 구현하면 `Editor` 번들에서 먼저 `resolve`를 호출해 인스턴스를 만들면, 나중에 로드된 `Converter` 번들에서도 `globalThis`의 심볼 키를 통해 **동일한 인스턴스**를 찾아 반환하게 됩니다.

## 5. 주의사항 및 한계 (Trade-offs)

이 방식은 유용한 "탈출구(Escape Hatch)"이지만, 몇 가지 주의할 점이 있습니다.

### 1) `instanceof` 체크 불가
서로 다른 번들에서 로드된 클래스는 내용은 같아도 자바스크립트 엔진상 **다른 생성자 함수**입니다. 따라서 `resolve()`로 가져온 객체에 대해 `instanceof` 검사를 하면 `false`가 나올 수 있습니다.
* **해결:** 타입 체크가 필요하다면 `instanceof` 대신 **Duck Typing**이나 공통 **Interface**를 사용해야 합니다.

### 2) 버전 관리 (Version Mismatch)
만약 `Editor`는 Framework v1.0을, `Converter`는 Framework v2.0을 번들링하고 있다면 런타임 에러가 발생할 수 있습니다. (v1 인스턴스가 전역에 있는데 v2 메서드를 호출하는 경우 등)
* **해결:** 모든 패키지가 동일한 버전의 Framework를 사용하도록 CI 단계에서 엄격하게 관리하거나, 심볼 키에 버전을 명시(`Symbol.for('...v1')`)하여 격리해야 합니다.

### 3) 테스트 격리
단위 테스트(Jest/Vitest) 실행 시 `globalThis`가 오염되어 테스트 간 간섭이 발생할 수 있습니다. `afterEach` 등에서 전역 심볼 맵을 초기화해주는 작업이 필요합니다.

## 6. 결론

NPM 패키지 배포 시 번들링 전략에 따라 싱글톤 패턴이 깨지는 문제는 흔히 발생할 수 있습니다. 가장 정석적인 방법은 `peerDependencies`를 사용하여 호스트가 단일 버전을 설치하게 하는 것이지만, 배포 및 사용 편의성을 위해 번들링이 필수적인 상황이라면 **`globalThis`와 `Symbol.for`를 활용한 전역 레지스트리 패턴**이 훌륭한 해결책이 될 수 있습니다.

이 패턴은 React, Styled-components 등 유명 라이브러리들에서도 런타임 환경의 제약을 극복하기 위해 내부적으로 사용하는 검증된 방식입니다. 다만, 사용 시 발생할 수 있는 사이드 이펙트(버전, 타입 체크)를 충분히 인지하고 적용해야 합니다.
