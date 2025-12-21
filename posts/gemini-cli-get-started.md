# 🚀 Gemini CLI 완벽 가이드

Gemini CLI는 터미널에서 Google의 Gemini 모델과 직접 상호작용하며 코딩, 문서 작업, 시스템 관리 등을 수행할 수 있는 강력한 도구입니다.

## 1. 설정 (Configuration)

### 설치
Node.js 환경에서 npm을 통해 간단히 설치할 수 있습니다.

```bash
npm install -g @google/gemini-cli

# 또는 설치 없이 바로 실행하려면
npx @google/gemini-cli
```

### 인증 (Authentication)
설치 후 처음 실행하면 인증 절차가 진행됩니다.

```bash
gemini
```

* **Google 로그인 (권장):** 개인 사용자라면 브라우저를 통해 Google 계정으로 로그인하는 것이 가장 간편합니다.
* **API Key:** `GEMINI_API_KEY` 환경 변수를 설정하여 AI Studio에서 발급받은 키를 사용할 수 있습니다.
* **Vertex AI:** 기업/클라우드 사용자의 경우 `gcloud` 인증이나 서비스 계정을 통해 Vertex AI 모델을 사용할 수 있습니다.

### 설정 파일
Gemini CLI의 동작은 `settings.json` 파일을 통해 제어됩니다.

* **전역 설정:** `~/.gemini/settings.json`
* **프로젝트별 설정:** 프로젝트 루트의 `.gemini/settings.json` (이 설정이 전역 설정보다 우선함)
* **.env 파일 지원:** `.gemini/.env` 파일을 만들어 API 키나 프로젝트 ID 같은 환경 변수를 관리할 수 있습니다.

---

## 2. 기본 사용법 (Basic Usage)

Gemini CLI는 크게 **Slash 명령어(/)**, **At 명령어(@)**, **Shell 명령어(!)** 세 가지 방식으로 조작합니다.

### 🔹 Slash 명령어 (기능 제어)
CLI의 기능을 제어하거나 설정을 변경할 때 사용합니다.

* `/help`: 도움말 및 명령어 목록 확인
* `/clear` (또는 `Ctrl+L`): 화면 초기화
* `/chat save <태그>`: 현재 대화 상태 저장
* `/chat resume <태그>`: 저장된 대화 불러오기
* `/model`: 사용할 Gemini 모델 변경 (예: Gemini 1.5 Pro, Flash 등)
* `/settings`: 설정 메뉴 열기

### 🔹 At 명령어 (컨텍스트 주입)
파일이나 폴더의 내용을 프롬프트에 포함시킬 때 사용합니다.

* `@filename.js`: 특정 파일의 내용을 읽어 프롬프트에 추가
* `@src/`: 해당 디렉토리(및 하위 디렉토리)의 모든 텍스트 파일 내용을 추가
* `@README.md 이 파일을 요약해줘`: 파일 내용을 바탕으로 질문

### 🔹 Shell 명령어 (시스템 실행)
터미널 명령어를 직접 실행하거나 Gemini에게 실행을 맡길 수 있습니다.

* `!ls -la`: 현재 폴더 파일 목록 출력 (직접 실행)
* `!`: Shell 모드로 전환 (프롬프트가 쉘 명령어로 인식됨)

---

## 3. 잘 활용할 수 있는 팁 (Tips)

### 🛠 커스텀 커맨드 (Custom Commands) 만들기
자주 쓰는 복잡한 프롬프트를 단축키처럼 만들 수 있습니다. `.gemini/commands/` 폴더에 `.toml` 파일을 생성하여 정의합니다.

**예시: `/refactor` 명령어로 코드를 정리하도록 설정**
파일 경로: `~/.gemini/commands/refactor.toml`

```toml
description = "코드를 리팩토링하고 설명을 추가합니다."
prompt = """
다음 코드를 클린 코드 원칙에 따라 리팩토링해줘.
변경 사항에 대한 주석도 달아줘: {{args}}
"""
```
* **사용법:** `/refactor @main.js`

### ⌨️ 단축키 활용
* `Ctrl + L`: 화면 클리어
* `Ctrl + Z`: 입력 실행 취소 (Undo)
* `Ctrl + C`: 현재 작업 취소
* `Tab`: 자동 완성 수락

### 📂 프로젝트별 컨텍스트 관리 (GEMINI.md)
프로젝트 루트나 폴더에 `GEMINI.md` 파일을 만들고 프로젝트에 대한 설명, 코딩 컨벤션, 규칙 등을 적어두면 Gemini가 이를 "기억(Memory)"으로 인식하여 항상 해당 규칙을 따르며 답변합니다.

* **팁:** 컨벤션이 변경되었다면 `/memory refresh` 명령어로 `GEMINI.md` 내용을 갱신하세요.

### 🔧 내장 도구 (Tools) 활용
Gemini는 단순 텍스트 생성 외에도 실제 작업을 수행할 수 있는 도구들을 가지고 있습니다.

* `run_shell_command`: 쉘 명령어 실행 (예: "git status 확인해줘")
* `read_file` / `write_file`: 파일 읽기 및 생성/수정
* `web_fetch`: 특정 URL의 웹페이지 내용 긁어오기

---

## 4. 활용 예시 (Examples)

### 📸 이미지 파일 일괄 이름 변경
파일 내용을 인식하여 이름을 바꿔달라고 요청할 수 있습니다.
> **User:** "photos 폴더에 있는 이미지들의 내용을 보고 적절한 이름으로 변경해줘."
>
> **Gemini:** (각 이미지를 분석 후) `run_shell_command`를 사용하여 `mv photo1.jpg sunset_beach.jpg` 등의 명령을 제안하고 실행 승인을 요청함.

### 💻 오픈소스 코드 분석
방대한 코드를 빠르게 파악할 때 유용합니다.
> **User:** "`@src/` 폴더의 코드 구조를 파악하고, `app.js`가 어떻게 동작하는지 다이어그램을 그리듯이 설명해줘."

### 📊 데이터 병합 및 가공
> **User:** "`data_2023.csv`와 `data_2024.csv` 파일을 합치고, 매출 컬럼을 기준으로 내림차순 정렬해서 `total_sales.csv`로 저장해줘."

### 🧪 테스트 코드 자동 생성
> **User:** "`@login.ts` 파일을 읽고 이에 대한 Jest 유닛 테스트 코드를 작성해서 `login.test.ts` 파일로 만들어줘."