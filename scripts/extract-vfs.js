import fs from 'fs';
import path from 'path';

const seedPath = path.resolve('public/vfs-seed.json');
const fsRoot = path.resolve('fs');

if (!fs.existsSync(fsRoot)) {
  fs.mkdirSync(fsRoot);
}

const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

for (const item of data.seed) {
  // path is like /home/user/Plugins/...
  // we want to strip the leading slash and mount it in `fs/`
  const relativePath = item.path.startsWith('/') ? item.path.slice(1) : item.path;
  const targetPath = path.join(fsRoot, relativePath);
  
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  
  if (item.content.startsWith('data:image')) {
    const base64Data = item.content.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(targetPath, base64Data, 'base64');
  } else {
    fs.writeFileSync(targetPath, item.content, 'utf8');
  }
}

console.log('Successfully extracted VFS seed to physical fs/ directory.');
