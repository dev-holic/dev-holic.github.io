# Dev-Holic Blog Project Documentation

This document serves as a guide to the architecture, functionality, and operational procedures of the Dev-Holic technical blog.

## 1. Project Environment & Structure

The project is organized as a monorepo using **pnpm workspaces** and **TurboRepo** for build orchestration.

### Key Directories
- **`apps/blog/`**: The main frontend application built with **Next.js 14+ (App Router)**.
  - Uses `tailwindcss` for styling.
  - Generates static site output (`out/`) for deployment.
- **`packages/posts/`**: A shared internal package responsible for data access logic.
  - Reads, parses, and processes Markdown files from the root `posts/` directory.
  - Exports utilities like `getAllPosts`, `getPostById`, and the `PostViewer` component.
- **`posts/`**: The "Database" of the blog.
  - Contains all blog posts in Markdown format (`.md`).
  - Supports both flat files (e.g., `post-title.md`) and folder-based posts (e.g., `post-title/index.md`) for co-locating assets like images.

### Tech Stack
- **Framework:** Next.js (App Router), React
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Sass
- **Markdown Processing:** `react-markdown`, `gray-matter`, `react-syntax-highlighter`, `rehype-raw`, `remark-gfm`
- **Package Manager:** pnpm

## 2. Blog App Functionality

The blog is designed to be a high-performance, developer-friendly static site.

### Core Features
- **Markdown Rendering:** Posts are written in standard Markdown with support for GFM (GitHub Flavored Markdown) and HTML embedding.
- **Syntax Highlighting:** Code blocks are automatically highlighted using `react-syntax-highlighter`.
- **SEO Optimization:**
  - Dynamic generation of `title` and `description` metadata based on post frontmatter.
  - **JSON-LD** (Structured Data) injection for better search engine understanding.
  - **Open Graph (OG)** images generated for social sharing previews.
- **RSS Feed:** automatically generated at `/feed.xml` for subscribers.
- **Comments:** Integrated **Giscus** (GitHub Discussions based) comment system.
- **Dark Mode Support:** Styled with Tailwind's dark mode capabilities (e.g., `dark:text-gray-100`).

## 3. How to Add a Blog Post

The blog content is managed entirely via Git. No external CMS is required.

### Steps
1. **Create a File:**
   - **Option A (Simple):** Create a new `.md` file in the root `posts/` directory (e.g., `posts/my-new-post.md`).
   - **Option B (With Assets):** Create a folder in `posts/` and add an `index.md` file (e.g., `posts/my-new-post/index.md`). You can put images in this folder and reference them relatively.

2. **Add Frontmatter:**
   Add the following metadata block at the top of your Markdown file:
   ```yaml
   ---
   title: "My Post Title"
   date: "2024-01-01"
   tags: ["React", "Tutorial"]
   summary: "A brief summary of the post for previews and SEO."
   ---
   ```

3. **Write Content:**
   Write your post body below the frontmatter using standard Markdown.

4. **Commit & Push:**
   Commit your changes to the git repository.

### Automated Checks (AI Fix)
The repository includes a unique automated feature. On commit/push:
- A script checks changed Markdown files.
- If an **OpenAI/Gemini API Key** is configured in the environment, an AI agent can automatically fix typos or formatting issues in the post.
- If no key is present, basic regex-based fixes are applied.
- Changes are automatically committed back to the branch before deployment.

## 4. Deployment Process

Deployment is fully automated using **GitHub Actions**.

### Workflow (`.github/workflows/deploy.yml`)
1. **Trigger:** The workflow runs on every push to the `main` branch.
2. **Setup:** Installs Node.js and `pnpm`.
3. **Pre-processing (Auto-Fix):**
   - Detects changed `.md` files in `posts/`.
   - Runs `ai-fix-posts` (or fallback script) to validate and correct post content.
   - If changes are made by the script, they are committed and pushed back to the repo.
4. **Build:** Runs `pnpm build` to generate the static export of the Next.js app.
5. **Deploy:** Uses `peaceiris/actions-gh-pages` to deploy the `apps/blog/out` directory to the `gh-pages` branch, which serves the site via GitHub Pages.
