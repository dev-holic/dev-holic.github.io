const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const contentDir = path.join(__dirname, '../src/content');

// Simple args parsing
const args = process.argv.slice(2);
const targetFiles = args.filter(arg => !arg.startsWith('--'));

if (!API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

async function processPost(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(fileContent);
    const { data, content } = parsed;
    const fileName = path.basename(filePath);

    // ... (rest of the processing logic) ...
    // Check if processing is needed
    // 1. Missing metadata
    const isMetadataMissing = !data.title || !data.summary || !data.tags || data.tags.length === 0;
    
    // 2. Dangerous tags (Naive check first to save API calls)
    const hasDangerousTags = (function(text) {
        const stripped = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
        return /<[A-Z][a-zA-Z0-9]*(\s[^>]*)?>/.test(stripped);
    })(content);

    if (!isMetadataMissing && !hasDangerousTags) {
      console.log(`[${fileName}] ✅  Skipping (Metadata OK, No dangerous tags detected)`);
      return;
    }

    console.log(`[${fileName}] 🤖 Processing with Gemini... (Missing Meta: ${isMetadataMissing}, Dangerous Tags: ${hasDangerousTags})`);

    const prompt = `
    You are an expert Markdown and SEO editor. I will provide you with a markdown file content.
    
    Your task is to:
    1. Analyze the content.
    2. If the Frontmatter (YAML metadata) is missing 'title', 'summary', or 'tags', generate appropriate ones based on the content.
       - title: Concise and engaging.
       - summary: A single sentence summary.
       - tags: A list of 3-5 relevant tags.
       - date: Keep existing or use today's date (${new Date().toISOString().split('T')[0]}) if missing.
    3. Scan the body text (prose) for any text that looks like a React component or HTML tag (e.g., <Suspense>, <MyComponent>) that is NOT inside a code block or inline code backticks.
    4. Escape these occurrences by wrapping them in backticks (e.g., \`<Suspense>\`).
    5. Return the COMPLETELY valid markdown file with the updated frontmatter and corrected body.
    
    IMPORTANT:
    - Do NOT wrap the output in a markdown code block (like \`\`\`markdown ... \`\`\`). Just return the raw markdown content.
    - Preserve the original content logic and structure. Only fix metadata and escape tags.
    
    --- INPUT MARKDOWN ---
    ${fileContent}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let newContent = response.text();

    // Cleanup potential markdown code block wrapping from LLM
    if (newContent.startsWith('```markdown')) {
        newContent = newContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    } else if (newContent.startsWith('```')) {
        newContent = newContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Sanity check: ensure frontmatter exists
    if (!newContent.startsWith('---')) {
        console.error(`[${fileName}] ❌ AI response format error (no frontmatter). Skipping.`);
        return;
    }

    fs.writeFileSync(filePath, newContent);
    console.log(`[${fileName}] ✨ Updated successfully.`);

  } catch (error) {
    console.error(`[${filePath}] ❌ Processing failed:`, error);
  }
}

async function main() {
  let filesToProcess = [];

  if (targetFiles.length > 0) {
    filesToProcess = targetFiles.map(f => {
      // 1. Try resolving relative to CWD (where the script is called from)
      const absPath = path.resolve(f);
      if (fs.existsSync(absPath)) return absPath;
      
      // 2. Try resolving relative to the default content directory
      const inContentDir = path.join(contentDir, path.basename(f));
      if (fs.existsSync(inContentDir)) return inContentDir;

      console.warn(`⚠️ File not found: ${f}`);
      return null;
    }).filter(Boolean);
  } else {
    console.log("No specific files provided. Scanning all posts...");
    filesToProcess = fs.readdirSync(contentDir)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(contentDir, f));
  }

  if (filesToProcess.length === 0) {
      console.log("No markdown files to process.");
      return;
  }

  console.log(`Checking ${filesToProcess.length} file(s)...`);

  for (const file of filesToProcess) {
      await processPost(file);
  }
}

main();
