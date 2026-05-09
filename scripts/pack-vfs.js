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
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    // Add the directory itself
    const relativeDirPath = '/' + path.relative(fsRoot, dir);
    if (relativeDirPath !== '/') {
        results.push({ path: relativeDirPath, type: 'dir' });
    }

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

// Deduplicate directories and process files
const seen = new Set();
const finalFiles = [];

for (const item of rawItems) {
  const relPath = '/' + path.relative(fsRoot, item.path);
  const skipList = ['Trash'];
  if (skipList.some(s => relPath.includes(s))) continue;

  if (seen.has(relPath)) continue;
  seen.add(relPath);

  if (item.type === 'dir') {
    finalFiles.push({ path: relPath, type: 'dir' });
  } else {
    const ext = path.extname(item.path).toLowerCase();
    let content;
    let isBinary = false;

    const BINARY_EXTS = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.webm', '.mov', '.mp3', '.ogg', '.wav', '.pdf', '.zip', '.rar', '.7z', '.iso'];
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
      size: fs.statSync(item.path).size
    });
  }
}

fs.writeFileSync(seedPath, JSON.stringify({ files: finalFiles }, null, 2));
console.log(`Successfully packed ${finalFiles.length} items into public/vfs-seed.json`);
