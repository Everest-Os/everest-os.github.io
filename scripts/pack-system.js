import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const systemRoot = path.join(rootDir, 'public', 'system');
const outputFile = path.join(rootDir, 'public', 'system-manifest.json');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  
  // Add the directory itself
  const relativeDirPath = '/system/' + path.relative(systemRoot, dir);
  if (relativeDirPath !== '/system/') {
    // Normalise to unix paths
    results.push({ path: relativeDirPath.replace(/\\/g, '/'), type: 'dir' });
  }

  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      const relativeFilePath = '/system/' + path.relative(systemRoot, fullPath);
      results.push({ 
        path: relativeFilePath.replace(/\\/g, '/'), 
        type: 'file',
        size: stat.size,
        mtime: stat.mtimeMs
      });
    }
  });
  return results;
}

console.log('Packing System Manifest from public/system/ directory...');
const rawItems = walk(systemRoot);

// Ensure /system exists in the manifest
const manifest = [
  { path: '/system', type: 'dir' },
  ...rawItems
];

fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
console.log(`Successfully packed ${manifest.length} items into public/system-manifest.json`);
