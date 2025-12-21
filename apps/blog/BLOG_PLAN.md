# 기술 블로그 운영 및 구축 계획 (Dev-Holic)

## 1. 개요 (Overview)
*   **목표:** `dev-holic` 아이덴티티를 살린 기술 블로그 구축
*   **핵심 가치:** 개발 지식 공유, 포트폴리오 아카이빙, 꾸준한 글쓰기 습관
*   **기술 스택:** React, TypeScript, Vite, Tailwind CSS (현재 스택 유지)

## 2. 아키텍처 및 기술 전략 (Architecture)

### 2.1 콘텐츠 관리 (Git-based CMS)
별도의 DB나 CMS(WordPress, Contentful 등)를 사용하지 않고, **GitHub 저장소 내의 Markdown 파일**을 DB처럼 사용합니다.
*   **장점:** 개발자 친화적, 버전 관리 용이, 비용 0원, 오프라인 작성 가능.
*   **형식:** `.md` 또는 `.mdx`
*   **위치:** `src/content/posts/*.md` (예정)

### 2.2 필요한 라이브러리 추가
*   **라우팅:** `react-router-dom` (페이지 이동)
*   **마크다운 렌더링:** `react-markdown` 또는 `remix` (Markdown -> HTML 변환)
*   **메타데이터 파싱:** `gray-matter` (Markdown 상단의 Frontmatter 파싱)
*   **코드 하이라이팅:** `react-syntax-highlighter` (코드 블록 스타일링)

## 3. 폴더 구조 개편안 (Directory Structure)
현재 구조를 확장하여 블로그 기능을 수용합니다.

```text
src/
├── components/        # 재사용 가능한 UI 컴포넌트
│   ├── Layout/        # Header, Footer, Sidebar
│   ├── Post/          # PostList, PostItem, PostViewer
│   └── Common/        # Button, Tag, Loader
├── content/           # 블로그 글 저장소
│   └── posts/         # .md 파일들 (YYYY-MM-DD-title.md)
├── hooks/             # 커스텀 훅 (usePosts, useMarkdown)
├── pages/             # 페이지 단위 컴포넌트
│   ├── blog/          # 블로그 메인 (글 목록)
│   ├── post/          # 글 상세 보기
│   └── ...            # 기존 포트폴리오 페이지 유지
├── utils/             # 마크다운 파싱 등 유틸리티 함수
└── ...
```

## 4. 개발 로드맵 (Roadmap)

### Phase 1: 기반 공사 (MVP)
1.  **라우팅 설정:** `react-router-dom` 설치 및 `/blog`, `/blog/:id` 경로 설정.
2.  **마크다운 로더 구현:** 로컬 `.md` 파일을 읽어와서 객체 형태로 변환하는 로직 작성.
3.  **UI 구현:**
    *   `BlogPage`: 전체 글 목록 리스팅 (제목, 날짜, 태그).
    *   `PostDetail`: 마크다운 내용을 HTML로 렌더링.

### Phase 2: 기능 고도화
1.  **카테고리/태그 시스템:** Frontmatter의 태그 정보를 기반으로 필터링 기능 구현.
2.  **SEO 최적화:** `react-helmet-async`를 사용하여 게시글별 Title, Description 동적 변경.
    * Open Graph (OG) Image 및 Twitter Card:
       * 소셜 미디어(카톡, 슬랙, 트위터 등) 공유 시 보여질 미리보기 이미지를 설정합니다.
       * 방법: opengraph-image.tsx 파일을 src/app 또는 src/app/blog/[id] 폴더에 추가하여 동적으로
         이미지를 생성(Image Response)할 수 있습니다. 각 포스트 제목이 들어간 썸네일을 자동으로 만들 때
         유용합니다.
   * JSON-LD (Structured Data):
       * 검색 엔진이 콘텐츠의 구조(제목, 저자, 발행일 등)를 더 잘 이해하도록 돕습니다. 구글 검색 결과에
         리치 스니펫(Rich Snippets)으로 노출될 확률을 높여줍니다.
       * 방법: layout.tsx나 page.tsx에 <script type="application/ld+json"> 태그를 추가하여 Article 또는
         BlogPosting 스키마를 정의합니다.
   * Canonical URL:
       * 중복 콘텐츠 문제를 방지하기 위해 원본 URL을 명시합니다.
       * 방법: generateMetadata 함수 내에 alternates: { canonical: '...' } 속성을 추가합니다.
   * Semantic HTML:
       * <h1>, <article>, <time>, <section> 등의 시멘틱 태그를 적절히 사용하여 문서 구조를 명확히
         합니다. (현재 코드에서도 어느 정도 사용되고 있습니다.)
3.  **스타일링:** Tailwind CSS Typography 플러그인(`@tailwindcss/typography`)을 적용하여 마크다운 스타일 일괄 적용.

### Phase 3: 소통 및 확장
1.  **댓글 시스템:** `Giscus` (GitHub Discussions 기반) 또는 `Utterances` 연동.
2.  **검색 기능:** 클라이언트 사이드 검색 구현.
3.  **RSS Feed:** 블로그 구독을 위한 RSS 생성.

## 5. 운영 프로세스 (Workflow)

### 5.1 글 작성 루틴
1.  로컬 VS Code에서 `src/content/posts` 폴더에 새 `.md` 파일 생성.
2.  Frontmatter 작성:
    ```yaml
    ---
    title: "기술 블로그 시작하기"
    date: "2025-12-20"
    tags: ["React", "Blog"]
    summary: "블로그를 만들게 된 계기와 과정"
    ---
    ```
3.  본문 작성 및 커밋.

### 5.2 배포 (Deployment)
*   GitHub Main 브랜치에 `push` 하면 GitHub Actions(`deploy.yml`)가 자동으로 빌드 및 배포 수행.
*   **결과:** 작성한 글이 실시간으로 웹사이트에 반영됨.

## 6. 액션 아이템 (Action Items)
- [ ] `react-router-dom` 등 필수 패키지 설치
- [ ] `src/content` 디렉토리 생성 및 샘플 글 작성
- [ ] 라우터 설정 및 메인 레이아웃 잡기
