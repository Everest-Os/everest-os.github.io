import fs from 'fs';
import path from 'path';

const fsRoot = path.resolve('fs');
const seedPath = path.resolve('public/vfs-seed.json');

if (!fs.existsSync(fsRoot)) {
  console.log('No fs/ directory found. Creating empty seed.');
  fs.writeFileSync(seedPath, JSON.stringify({ files: [] }, null, 2));
  process.exit(0);
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  // Add the current directory itself (relative to fsRoot)
  const relativeDirPath = '/' + path.relative(fsRoot, dir);
  if (relativeDirPath !== '/') {
    results.push({ path: dir, type: 'dir' });
  }

  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push({ path: fullPath, type: 'file' });
    }
  });
  return results;
}

console.log('Packing VFS from fs/ directory...');
const rawItems = walk(fsRoot);

// Deduplicate and process items
const seen = new Set();
const finalFiles = [];

for (const item of rawItems) {
  let relPath = '/' + path.relative(fsRoot, item.path);
  // Clean up any potential backslashes from Windows paths (if applicable) or double slashes
  relPath = relPath.replace(/\\/g, '/').replace(/\/+/g, '/');

  const fileName = path.basename(relPath);
  const skipFiles = ['.gitkeep', '.DS_Store', 'Thumbs.db'];

  // 1. Ignore specific system junk files
  if (skipFiles.includes(fileName)) continue;

  // 2. Ignore files INSIDE Trash, but allow the Trash directory itself to be packed
  if (relPath.includes('/Trash/') && item.type === 'file') continue;

  if (seen.has(relPath)) continue;
  seen.add(relPath);

  if (item.type === 'dir') {
    finalFiles.push({ path: relPath, type: 'dir' });
  } else {
    const ext = path.extname(item.path).toLowerCase();
    let content;
    let isBinary = false;

    const BINARY_EXTS = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.webm', '.mov', '.mp3', '.ogg', '.wav', '.pdf', '.zip', '.rar', '.7z', '.iso', '.odt', '.ods', '.odp'];
    if (BINARY_EXTS.includes(ext)) {
      isBinary = true;
      content = null;
    } else {
      try {
        content = fs.readFileSync(item.path, 'utf8');
      } catch (e) {
        content = '';
      }
    }

    finalFiles.push({
      path: relPath,
      type: 'file',
      content,
      isBinary,
      size: fs.statSync(item.path).size,
      mtime: fs.statSync(item.path).mtimeMs
    });
  }
}

const seedData = {
  seedVersion: Date.now(),
  fileCount: finalFiles.length,
  files: finalFiles
};

fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2));
console.log(`Successfully packed ${finalFiles.length} items into public/vfs-seed.json (v${seedData.seedVersion})`);
