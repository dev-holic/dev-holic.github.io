# 포스트 작성 및 검수 가이드

새로운 포스트(.md)를 추가하거나 수정할 때, 다음 절차를 따라주세요.

## 1. 프론트매터(Frontmatter) 표준화

모든 포스트는 `packages/posts/TEMPLATE.md`의 형식을 따라야 합니다.

## 2. 콘텐츠 안전성 검사 (HTML 태그 오인 방지)

Markdown 본문(Prose) 내에서 React 컴포넌트나 HTML 태그처럼 보이는 텍스트(예: `<Suspense>`, `<Component>`)가 포함되어 있는지 확인해야 합니다. 
이러한 텍스트가 코드 블록이나 백틱(`) 없이 그대로 작성되면, 렌더링 시 브라우저가 이를 실제 HTML 태그로 해석하려다 에러(예: `The tag <suspense> is unrecognized`)를 발생시킬 수 있습니다.

### 검사 및 수정 방법
1. **검색**: 본문 내용 중 `<대문자로시작하는단어>` 형태의 텍스트를 찾습니다.
2. **수정**: 해당 텍스트가 코드 블록 내부에 있지 않다면, 백틱(`)으로 감싸서 인라인 코드로 변환합니다.

**잘못된 예:**
Server Component가 <Suspense> fallback UI로...

**올바른 예:**
Server Component가 `<Suspense>` fallback UI로...

```