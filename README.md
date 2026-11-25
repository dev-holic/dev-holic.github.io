# Dev-Holic 기술 블로그

Next.js 16으로 정적 페이지를 만들어 GitHub Pages에 배포합니다. 글 원본은 `posts/`, 화면은 `apps/blog/`, 마크다운 처리 코드는 `packages/posts/`에 있습니다. 홈에는 최근 글, 사용 빈도 상위 8개 태그, 최근 한 달 인기 글이 표시됩니다. 댓글은 Giscus, 블로그 구독 주소는 `/feed.xml`입니다.

## 글 작성과 배포

Codex에서 예를 들어 “$write-blog-post React Query의 staleTime과 gcTime 차이를 조사해서 써줘. 탭을 다시 열었을 때를 예로 들어줘”라고 요청하세요. [포스팅 스킬](.agents/skills/write-blog-post/SKILL.md)이 자료를 확인하고 출처를 포함한 한국어 마크다운 글을 작성합니다.

Node.js 22와 pnpm 10.26.1 환경에서 저장소 루트의 `pnpm install`, `pnpm dev`로 미리 봅니다. `pnpm build` 결과는 `apps/blog/out/`에 생성됩니다. `main`에 푸시하면 GitHub Actions가 빌드·배포합니다.

로컬에서 `pnpm dev`로 실행하면 홈의 인기 글은 `dev-holic` 공개 카운터에서 가져옵니다. 개발 서버에서 글을 열 때는 방문을 기록하지 않습니다.

## 인기 글 집계 연결

1. GoatCounter에서 호스팅 사이트를 만들고 설정에서 **Allow adding visitor counts on your website**를 켭니다.
2. GitHub 저장소의 **Settings → Secrets and variables → Actions → Variables**에 `GOATCOUNTER_CODE`를 추가합니다. 값은 `https://myblog.goatcounter.com`의 경우 `myblog`입니다.
3. **Actions → deploy → Run workflow**로 배포합니다. 이후 글 상세 페이지를 열면 해당 글 경로로 방문이 기록됩니다. 배포 때와 매일 06:17(한국 시간) 예약 실행 때 최근 한 달 방문 수 상위 5개를 계산합니다. 카운터 응답은 최대 4시간 캐시될 수 있습니다.

연결 전이나 방문 데이터가 없을 때는 집계 전 안내가 표시됩니다. 글별 방문 수는 공개 카운터에서 읽습니다. [GoatCounter 카운터 문서](https://www.goatcounter.com/help/visitor-counter)
