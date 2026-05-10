const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '../public/system/apps');

function processDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;

      // Match import { A, B } from '../../runtime/...';
      const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/\.\.\/runtime\/.*?['"];?/g;
      content = content.replace(importRegex, (match, imports) => {
        modified = true;
        return `const { ${imports.trim()} } = window.osAPI;`;
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('Fixed imports in:', fullPath);
      }
    }
  }
}

processDir(appsDir);
