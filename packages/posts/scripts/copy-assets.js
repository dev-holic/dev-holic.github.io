const fs = require('fs');
const path = require('path');

// Configuration
const postsDir = path.join(__dirname, '../src/content');
// Target: apps/blog/public/posts
// We need to resolve relative to this script location (packages/posts/scripts)
const targetBaseDir = path.resolve(__dirname, '../../../apps/blog/public/posts');

console.log(`Copying post assets...`);
console.log(`Source: ${postsDir}`);
console.log(`Target: ${targetBaseDir}`);

// Ensure target base directory exists
if (!fs.existsSync(targetBaseDir)) {
    fs.mkdirSync(targetBaseDir, { recursive: true });
}

// Function to copy directory content recursively (or just files)
function copyAssets(postId, sourcePath) {
    const targetDir = path.join(targetBaseDir, postId);
    
    // Create target directory for the post
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const files = fs.readdirSync(sourcePath);
    let count = 0;

    files.forEach(file => {
        const filePath = path.join(sourcePath, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile()) {
            // Check extensions (images, videos, etc.)
            // You can add more extensions if needed
            if (/\.(png|jpg|jpeg|gif|svg|webp|mp4|webm)$/i.test(file)) {
                fs.copyFileSync(filePath, path.join(targetDir, file));
                count++;
            }
        }
        // If it's a subdirectory, we could recurse, but usually assets are flat in the post folder.
        // Let's keep it simple for now.
    });
    
    if (count > 0) {
        console.log(`[${postId}] Copied ${count} asset(s).`);
    }
}

// Main scanning logic
try {
    const entries = fs.readdirSync(postsDir, { withFileTypes: true });
    
    entries.forEach(entry => {
        if (entry.isDirectory()) {
            // This is a folder-based post
            const postId = entry.name;
            const postPath = path.join(postsDir, postId);
            
            // Check if index.md exists (to verify it's a valid post folder)
            if (fs.existsSync(path.join(postPath, 'index.md'))) {
                copyAssets(postId, postPath);
            }
        }
    });

    console.log("✅ Asset copy complete.");
} catch (e) {
    console.error("❌ Error copying assets:", e);
    process.exit(1);
}
