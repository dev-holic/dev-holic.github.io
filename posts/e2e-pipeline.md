---
title: '기획자도 할 수 있다: AI 생성 & 슬랙 버튼으로 완성하는 E2E 테스트 자동화 파이프라인'
summary: >-
  AI 생성 및 슬랙 버튼을 활용하여 E2E 테스트 자동화 파이프라인을 구축하고, 기술 장벽 없이 테스트에 기여할 수 있는 환경을 만드는
  방법을 소개합니다.
tags:
  - E2E 테스트
  - 자동화
  - AI
  - 슬랙
  - ChatOps
date: 2025-12-22T00:00:00.000Z
---

# 기획자도 할 수 있다: AI 생성 & 슬랙 버튼으로 완성하는 E2E 테스트 자동화 파이프라인

프론트엔드 개발자로서 E2E(End-to-End) 테스트의 필요성은 절감하지만, 현실적인 장벽에 부딪힐 때가 많습니다.
"테스트 코드를 짤 시간이 없다", "QA팀은 코드를 모른다", "로컬에서 돌리기 번거롭다" 같은 이유들입니다.

오늘은 이 문제를 기술적으로 해결하기 위해 구축한 **"No-Code 생성 & ChatOps 실행"** 파이프라인을 소개합니다.

---

## 🏗️ 전체 시스템 아키텍처

우리가 만들 시스템의 흐름은 다음과 같습니다.

1.  **Creation (생성):**
    * **Method A (AI):** "로그인 후 메인으로 이동"이라고 적으면 GPT-4가 코드를 짜줍니다.
    * **Method B (Recorder):** 크롬 익스텐션을 켜고 클릭하면, 행동이 코드로 변환됩니다.
    * 결과물은 자동으로 GitHub PR로 등록됩니다.
2.  **Trigger (실행):** 슬랙의 "테스트 실행" 버튼을 누르면 AWS Lambda가 GitHub Actions를 깨웁니다.
3.  **Feedback (보고):** 테스트 결과가 **버튼을 눌렀던 그 스레드**에 답글로 달립니다.

---

## Part 1. 테스트 케이스 생성기 구축 (Server-side)

먼저 비개발자의 입력을 받아 Playwright 코드로 변환하고 PR을 날려주는 백엔드 API가 필요합니다. (Next.js API Route 기준 예시)

### 1-1. AI 기반 생성기 (Text-to-Code)

OpenAI API를 사용하여 자연어를 코드로 변환합니다.

**`pages/api/generate-from-text.ts`**

```typescript
import OpenAI from 'openai';
import { Octokit } from '@octokit/rest';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export default async function handler(req, res) {
  const { scenario, title } = req.body; // 예: "장바구니 담기 테스트"

  // 1. GPT-4에게 Playwright 코드 요청
  const completion = await openai.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: `You are a QA Engineer. Write a Playwright test script in TypeScript. 
                  Target URL is '[https://my-service.com](https://my-service.com)'. 
                  Use 'data-testid' selectors if possible. 
                  Only return the code block without markdown.` 
      },
      { role: "user", content: `Create a test for: ${scenario}` }
    ],
    model: "gpt-4-turbo",
  });
  
  const code = completion.choices[0].message.content;
  const branchName = `test/ai-${Date.now()}`;
  const fileName = `tests/${title}.spec.ts`;

  // 2. GitHub PR 생성 로직 (createPR 함수는 공통 모듈로 분리 권장)
  await createPullRequest(octokit, branchName, fileName, code, title);
  
  res.status(200).json({ success: true });
}

// GitHub PR 생성 헬퍼 함수
async function createPullRequest(octokit, branch, path, content, title) {
  const owner = "MY_ORG";
  const repo = "MY_REPO";

  // 메인 브랜치 SHA 조회
  const { data: refData } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
  
  // 새 브랜치 생성
  await octokit.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha: refData.object.sha });

  // 파일 커밋
  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path, branch,
    message: `feat: add test case - ${title}`,
    content: Buffer.from(content).toString('base64')
  });

  // PR 생성
  await octokit.pulls.create({
    owner, repo, head: branch, base: 'main',
    title: `✅ [Auto-Gen] ${title}`
  });
}
```

### 1-2. Chrome Extension 기반 생성기 (Record & Push)

말로 설명하기 힘든 복잡한 시나리오는 직접 녹화하는 것이 빠릅니다.

#### A. 익스텐션 구조 (`manifest.json`)
```json
{
  "manifest_version": 3,
  "name": "E2E Recorder",
  "permissions": ["activeTab", "scripting"],
  "action": { "default_popup": "popup.html" },
  "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content.js"] }]
}
```

#### B. 이벤트 수집기 (`content.js`)
웹페이지에 주입되어 클릭과 입력을 감지합니다.

```javascript
let events = [];

function getSelector(el) {
  if (el.getAttribute('data-testid')) return `[data-testid="${el.getAttribute('data-testid')}"]`;
  if (el.id) return `#${el.id}`;
  return el.tagName.toLowerCase(); // 실제론 더 정교한 path 로직 필요
}

document.addEventListener('click', (e) => {
  events.push({ type: 'click', selector: getSelector(e.target) });
}, true);

document.addEventListener('change', (e) => {
  events.push({ type: 'fill', selector: getSelector(e.target), value: e.target.value });
}, true);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "GET_EVENTS") sendResponse({ events });
});
```

#### C. 전송 및 변환 (`popup.js` & Backend)
팝업에서 '전송'을 누르면 백엔드로 이벤트를 보냅니다. 백엔드는 이를 코드로 바꿉니다.

**`pages/api/generate-from-record.ts`**

```typescript
export default async function handler(req, res) {
  const { events, title } = req.body;

  // JSON Events -> Playwright Code 변환
  let code = `import { test, expect } from '@playwright/test';\n\n`;
  code += `test('${title}', async ({ page }) => {\n`;
  
  events.forEach(evt => {
    if (evt.type === 'click') code += `  await page.click('${evt.selector}');\n`;
    if (evt.type === 'fill') code += `  await page.fill('${evt.selector}', '${evt.value}');\n`;
  });
  
  code += `});`;

  // GitHub PR 생성 (위와 동일한 로직)
  await createPullRequest(octokit, `test/record-${Date.now()}`, `tests/${title}.spec.ts`, code, title);
  
  res.status(200).json({ success: true });
}
```

---

## Part 2. 슬랙 트리거 & 중계 서버 (AWS Lambda)

이제 테스트 케이스가 준비되었습니다. 슬랙 버튼을 눌러 실행하는 환경을 만듭니다.
슬랙 인터랙션은 `application/x-www-form-urlencoded` 페이로드를 보내므로, 이를 받아 GitHub API(`application/json`)로 변환해줄 **중계 서버(Lambda)**가 필수적입니다.

**`index.js` (AWS Lambda Handler)**

```javascript
const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  // 1. 슬랙 Payload 파싱 (URL Decoding 필수)
  const bodyParams = new URLSearchParams(event.body);
  const payload = JSON.parse(bodyParams.get('payload'));

  // 2. 버튼 클릭 액션 감지
  if (payload.actions && payload.actions[0].action_id === "run_e2e_test") {
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    
    // 3. 핵심: 결과 리포팅을 위해 channel_id와 thread_ts 추출
    const channelId = payload.channel.id;
    const threadTs = payload.message.ts; // 메시지의 ts가 곧 스레드 ID가 됨

    try {
      // 4. GitHub Actions 트리거 (workflow_dispatch)
      await octokit.actions.createWorkflowDispatch({
        owner: "MY_ORG",
        repo: "MY_REPO",
        workflow_id: "e2e.yml",
        ref: "main",
        inputs: {
          slack_channel: channelId,
          slack_thread: threadTs, // 이 값을 GitHub로 넘겨주는 것이 제일 중요함!
        },
      });

      // 5. 슬랙 사용자 피드백 (즉시 응답)
      return {
        statusCode: 200,
        body: JSON.stringify({
          replace_original: false, // 기존 버튼 메시지 유지
          text: `🚀 테스트 요청이 접수되었습니다! (스레드를 확인하세요)`
        }),
      };
    } catch (error) {
      console.error(error);
      return { statusCode: 500, body: "GitHub API Error" };
    }
  }

  return { statusCode: 200, body: "OK" };
};
```

---

## Part 3. CI 실행 및 리포팅 (GitHub Actions)

마지막으로 GitHub Actions가 테스트를 수행하고, 넘겨받은 `slack_thread` 정보를 이용해 결과를 배달합니다.

### 3-1. 워크플로우 설정 (`.github/workflows/e2e.yml`)

```yaml
name: Playwright E2E
on:
  workflow_dispatch:
    inputs:
      slack_channel:
        required: true
      slack_thread:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      
      - name: Install Dependencies
        run: npm ci && npx playwright install --with-deps

      - name: Run Playwright
        run: npx playwright test
        continue-on-error: true # 테스트 실패해도 리포트는 보내야 하므로

      # 결과 전송 단계
      - name: Report to Slack
        if: always()
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
          SLACK_CHANNEL: ${{ inputs.slack_channel }}
          SLACK_THREAD: ${{ inputs.slack_thread }}
          JOB_STATUS: ${{ job.status }}
        run: node scripts/report-to-slack.js
```

### 3-2. 리포팅 스크립트 (`scripts/report-to-slack.js`)

Webhook URL 방식은 스레드 답글이 불가능하므로, `slack-web-api`를 사용해야 합니다.

```javascript
const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_BOT_TOKEN);

async function report() {
  const channel = process.env.SLACK_CHANNEL;
  const thread_ts = process.env.SLACK_THREAD;
  const status = process.env.JOB_STATUS; // 'success' or 'failure'
  
  const isSuccess = status === 'success';
  const color = isSuccess ? '#36a64f' : '#ff0000';
  const icon = isSuccess ? '✅' : '❌';

  await web.chat.postMessage({
    channel: channel,
    thread_ts: thread_ts, // 람다 -> GitHub -> 여기까지 전달된 스레드 ID
    text: `E2E 테스트 결과: ${status}`,
    attachments: [
      {
        color: color,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${icon} *Playwright Test Completed*\nResult: *${status.toUpperCase()}*`
            }
          },
          {
            type: "context",
            elements: [{ type: "mrkdwn", text: "상세 로그는 GitHub Actions 탭을 확인하세요." }]
          }
        ]
      }
    ]
  });
}

report();
```

---

## 🎯 마치며

이렇게 구축된 환경에서 팀원들은 다음과 같이 일합니다.

1.  **생성:** 기획자가 "결제 페이지 테스트"를 입력하면 AI가 코드를 짜서 PR을 올립니다.
2.  **실행:** 슬랙 채널에 상주하는 "테스트 실행" 버튼을 누릅니다.
3.  **확인:** 커피 한 잔 하고 오면 **해당 스레드**에 초록색 체크(✅) 알림이 와 있습니다.

개발 환경 구축 없이 누구나 테스트에 기여할 수 있는 환경, 여러분의 팀에도 도입해 보세요.
