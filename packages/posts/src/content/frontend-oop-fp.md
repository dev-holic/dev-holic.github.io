# 프론트엔드 개발, OOP와 FP의 완벽한 조화: 실무 적용 가이드

프론트엔드 개발 생태계는 빠르게 변화했습니다. 과거 UI를 클래스로 제어하던 시절을 지나, React Hooks와 Redux의 등장으로 함수형 프로그래밍(FP)의 개념이 깊숙이 자리 잡았습니다.

많은 개발자가 **"그래서 클래스를 써야 해, 함수를 써야 해?"**라는 질문을 던집니다. 하지만 모던 프론트엔드 아키텍처의 핵심은 양자택일이 아닌 **적재적소의 조화(Harmony)**에 있습니다.

이번 포스팅에서는 프론트엔드 실무에서 **객체 지향 프로그래밍(OOP)**과 **함수형 프로그래밍(FP)**을 어떻게 섞어 써야 가장 효율적인지, 구체적인 케이스와 코드를 통해 알아봅니다.

---

## 1. 객체 지향 프로그래밍 (OOP)
> **핵심 키워드:** 캡슐화(Encapsulation), 상태 유지, 응집도

OOP는 데이터(State)와 그 데이터를 조작하는 행위(Method)를 하나의 '객체'로 묶어서 관리합니다. 프론트엔드에서 OOP가 빛을 발하는 순간은 **"맥락(Context)을 유지해야 할 때"**입니다.

### 📌 Best Case: 외부 시스템 및 연결 관리 (Service Layer)
API 클라이언트, 소켓 연결, 복잡한 인증 로직처럼 **설정값이나 연결 상태를 계속 유지해야 하는 경우** 클래스가 유리합니다.

#### ❌ FP만 고집할 때의 문제점 (Prop Drilling)
모든 함수에 토큰이나 설정값을 인자로 계속 넘겨줘야 합니다.

```typescript
// 매번 token을 인자로 받아야 함 (불편함)
const fetchUser = (token: string, userId: string) => {
  return fetch(`/api/users/${userId}`, {
    headers: { Authorization: token }
  });
};
```

#### ✅ OOP를 활용한 해결책 (Encapsulation)
`ApiClient` 클래스 내부에 토큰과 Base URL을 **캡슐화**하면, 사용하는 쪽에서는 내부 구현을 신경 쓸 필요가 없습니다.

```typescript
class ApiClient {
  constructor(private token: string, private baseUrl: string) {}

  // 설정값(token)을 내부 상태로 관리하여 응집도를 높임
  private async request(path: string) {
    return fetch(`${this.baseUrl}${path}`, {
      headers: { Authorization: this.token }
    });
  }

  getUser(userId: string) {
    return this.request(`/users/${userId}`);
  }
}

// 사용: 사용하는 쪽 코드가 깔끔해짐
const api = new ApiClient('user-token-123', 'https://api.app.com');
api.getUser('user-1'); // 토큰을 넘길 필요 없음
```

---

## 2. 함수형 프로그래밍 (FP)
> **핵심 키워드:** 순수 함수(Pure Function), 불변성(Immutability), 파이프라인

FP는 부수 효과(Side-effect)를 없애고 입력이 같으면 출력도 같다는 것을 보장합니다. 프론트엔드에서 FP가 빛을 발하는 순간은 **"데이터를 가공하고 계산할 때"**입니다.

### 📌 Best Case: 비즈니스 로직 및 데이터 변환
서버에서 받은 데이터를 필터링하거나, 장바구니 합계를 계산하는 등의 로직은 순수 함수로 작성하는 것이 좋습니다.

#### ❌ OOP 스타일의 문제점 (강한 결합)
로직이 특정 객체의 상태(`this`)에 의존하면, 테스트하기 어렵고 다른 곳에서 재사용하기 힘듭니다.

```typescript
class ShoppingCart {
  private items: Product[] = [];
  
  // 상태와 로직이 섞여 있어 테스트가 번거로움
  calculateTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

#### ✅ FP를 활용한 해결책 (Predictability)
데이터 구조와 로직을 분리합니다. `calculateTotal` 함수는 오직 입력받은 배열에만 의존하므로 예측 가능하고 테스트가 쉽습니다.

```typescript
// 순수 함수: Input -> Output이 명확함
const calculateTotal = (items: Product[]): number => {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  // 배송비 계산 로직 등 확장에도 유연함
  return total > 30000 ? total : total + 3000;
};

// 사용: 어디서든 재사용 가능
const finalPrice = calculateTotal(cartItems);
```

---

## 3. 결론: 하이브리드 아키텍처 (Harmony)

실제 프로덕션 레벨의 프론트엔드 코드는 이 두 가지 패러다임을 혼합하여 사용합니다. React 컴포넌트는 이 둘을 이어주는 **접착제(Glue)** 역할을 수행합니다.

### 💡 실무 적용 패턴 예시

1.  **OOP:** 복잡한 API 통신과 설정은 `Class`로 관리합니다.
2.  **FP:** 데이터를 화면에 보여주기 위한 가공은 `Pure Function`을 사용합니다.
3.  **React:** 이 둘을 조합하여 UI를 렌더링합니다.

```tsx
// 1. [OOP] Service Layer 인스턴스 생성
const authService = new AuthService(config);

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // [OOP] 메서드 호출: 복잡한 인증 로직은 숨겨져 있음
    authService.getUsers().then(setUsers);
  }, []);

  // 2. [FP] 순수 함수 사용: 데이터 가공 로직 분리
  // sortUsersByName은 외부 파일에 정의된 순수 함수라고 가정
  const sortedUsers = useMemo(() => sortUsersByName(users), [users]);

  return (
    <ul>
      {/* 3. [FP] 선언적 렌더링 */}
      {sortedUsers.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

### 요약: 언제 무엇을 써야 할까?

| 구분 | 역할 | 추천 패러다임 | 이유 |
| :--- | :--- | :--- | :--- |
| **API / Service** | 데이터 페칭, 소켓, 인증 | **OOP** | 설정값과 연결 상태를 **캡슐화**하기 위해 |
| **Business Logic** | 계산, 포맷팅, 필터링 | **FP** | **테스트 용이성**과 예측 가능성을 위해 |
| **Store** | 전역 상태 변경 (Redux 등) | **FP** | **불변성**을 통한 상태 변경 추적을 위해 |
| **UI Component** | 화면 렌더링 | **Hybrid** | 라이프사이클(OOP) + 렌더링 로직(FP) |

프론트엔드 개발자로서 한 가지 패러다임에 갇히기보다, 각 패러다임이 가진 장점을 이해하고 상황에 맞게 골라 쓰는 유연함이 필요합니다. 

**"상태 관리는 OOP처럼, 데이터 처리는 FP처럼."** 이 원칙을 기억하면 더 견고한 애플리케이션을 설계할 수 있을 것입니다.
