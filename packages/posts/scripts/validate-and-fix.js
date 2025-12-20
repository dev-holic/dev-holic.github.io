const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Helper to get arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const targetFiles = args.filter(arg => !arg.startsWith('--'));

const contentDir = path.join(__dirname, '../src/content');

let hasError = false;
let fixedCount = 0;

function escapeDangerousTags(text) {
  // ... (same as before) ...
  // 1. Split by code blocks (```...```)
  // The capturing group (```[\s\S]*?```) includes the delimiters in the result array
  const parts = text.split(/(```[\s\S]*?```)/g);

  const processedParts = parts.map(part => {
    // If it's a code block, return as is
    if (part.startsWith('```')) return part;

    // 2. Split by inline code (`...`)
    const inlineParts = part.split(/(`[^`]*`)/g);

    const processedInline = inlineParts.map(subPart => {
      // If it's inline code, return as is
      if (subPart.startsWith('`')) return subPart;

      // 3. Replace <Capitalized...> that looks like an HTML/React tag
      // Regex explanation:
      // <          : Starts with <
      // [A-Z]      : First letter is uppercase (React component convention)
      // [a-zA-Z0-9]* : Followed by alphanumeric chars
      // (\s[^>]*)? : Optional attributes
      // >          : Ends with >
      return subPart.replace(/(<[A-Z][a-zA-Z0-9]*(\s[^>]*)?>)/g, '`$1`');
    });

    return processedInline.join('');
  });

  return processedParts.join('');
}

// Determine files to process
let filesToProcess = [];

if (targetFiles.length > 0) {
    filesToProcess = targetFiles.map(f => {
        const absPath = path.resolve(f);
        if (fs.existsSync(absPath)) return absPath;
        
        const inContentDir = path.join(contentDir, path.basename(f));
        if (fs.existsSync(inContentDir)) return inContentDir;
        
        console.warn(`⚠️ File not found: ${f}`);
        return null;
    }).filter(Boolean);
} else {
    // Default: scan all
    filesToProcess = fs.readdirSync(contentDir)
        .filter(f => f.endsWith('.md'))
        .map(f => path.join(contentDir, f));
}

console.log(`Processing ${filesToProcess.length} posts... (Fix mode: ${shouldFix})`);

if (filesToProcess.length === 0) {
    console.log("No files to process.");
    process.exit(0);
}

filesToProcess.forEach(filePath => {
  const file = path.basename(filePath);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    const { data, content: markdownBody } = parsed;
    let fileChanged = false;

    // 1. Check Frontmatter
    const requiredFields = ['title', 'date', 'summary'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      console.error(`[${file}] ❌ Missing frontmatter fields: ${missingFields.join(', ')}`);
      hasError = true;
    }

    // 2. Check & Fix Dangerous Tags
    const newBody = escapeDangerousTags(markdownBody);
    
    if (newBody !== markdownBody) {
      if (shouldFix) {
        // stringify ensures proper quoting for YAML values
        const newContent = matter.stringify(newBody, data);
        fs.writeFileSync(filePath, newContent);
        console.log(`[${file}] ✅ Auto-fixed unescaped tags.`);
        fileChanged = true;
        fixedCount++;
      } else {
        console.error(`[${file}] ❌ Potential unescaped React component or HTML tag found. Run with --fix to resolve.`);
        hasError = true;
      }
    }
  } catch (err) {
    console.error(`[${file}] ❌ Failed to process: ${err.message}`);
    hasError = true;
  }
});

if (hasError && !shouldFix) {
  console.error('\nErrors found. Run with --fix to attempt automatic repair.');
  process.exit(1);
} else {
  console.log(`\nDone. ${fixedCount} files fixed.`);
  if (hasError) {
      console.log('Some errors (like missing frontmatter) require manual intervention.');
      process.exit(1);
  }
}
