# Dev-Holic Tech Blog

**Dev-Holic** 기술 블로그의 소스 코드 저장소입니다.
Next.js 14 (App Router)와 TypeScript로 구축되었으며, **pnpm Workspaces**와 **TurboRepo**를 사용한 모노레포 구조로 관리됩니다.

## 📚 프로젝트 구조 (Project Structure)

이 저장소는 크게 애플리케이션, 공유 패키지, 그리고 콘텐츠로 구성되어 있습니다.

- **`apps/blog/`**:
  - Next.js 기반의 메인 블로그 웹 애플리케이션입니다.
  - `out/` 디렉토리로 정적 빌드(Static Export)되어 GitHub Pages에 배포됩니다.
- **`packages/posts/`**:
  - `posts/` 폴더의 마크다운 파일을 읽고 파싱하는 데이터 액세스 레이어입니다.
  - `fs`, `gray-matter`, `react-markdown` 등을 사용하여 블로그 포스트 데이터를 처리합니다.
- **`packages/news-bot/`**:
  - RSS 피드를 주기적으로 크롤링하여 Slack으로 뉴스를 전송하는 봇입니다.
  - GitHub Actions Schedule을 통해 서버 없이 매시간 자동으로 실행됩니다.
- **`posts/`**:
  - 실제 블로그 포스트(`*.md`)들이 저장되는 "데이터베이스"입니다.
  - 이미지를 포함할 경우 폴더(`posts/my-post/index.md`) 형태로도 작성 가능합니다.

## 🛠 기술 스택 (Tech Stack)

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), SCSS Modules
- **State/Data:** React Query (TanStack Query), Recoil (if needed)
- **Build System:** [TurboRepo](https://turbo.build/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Deployment:** GitHub Actions -> GitHub Pages

## 🚀 시작하기 (Getting Started)

### 사전 요구사항
- Node.js 18 이상 (LTS 권장)
- pnpm (`npm install -g pnpm`)

### 설치 및 실행

```bash
# 1. 의존성 설치
pnpm install

# 2. 개발 서버 실행 (블로그 앱)
pnpm dev

# 3. 전체 프로젝트 빌드
pnpm build
```

## 📝 글 작성하기 (How to Post)

1. `posts/` 디렉토리에 새로운 `.md` 파일을 생성합니다.
2. 파일 상단에 다음과 같은 **Frontmatter**를 작성합니다.

```yaml
---
title: "포스트 제목"
date: "2024-01-01"
tags: ["Next.js", "Tutorial"]
summary: "목록에 보여질 짧은 요약글"
---

여기서부터 내용을 작성하세요...
```

3. 변경 사항을 Push하면, GitHub Actions가 자동으로 배포를 수행합니다.

## 🤖 자동화 기능 (Automation)

### 1. AI Post Fixer
커밋 시 변경된 마크다운 파일을 감지하여 오타나 포맷팅을 자동으로 수정합니다. (`.github/workflows/deploy.yml`)

### 2. RSS News Bot
`packages/news-bot` 패키지는 설정된 RSS 피드를 모니터링하다가 새로운 글이 올라오면 Slack으로 알림을 보냅니다.
- **설정:** `.github/workflows/news-bot.yml`
- **구독 리스트:** GitHub Variables `RSS_FEED_LIST`