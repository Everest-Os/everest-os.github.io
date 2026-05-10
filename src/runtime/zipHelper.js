/**
 * Zip Helper — Shared utility for archive handling using JSZip.
 * Dynamically loads JSZip from CDN if not present.
 */

let jszipPromise = null;

async function loadJSZip() {
  if (window.JSZip) return window.JSZip;
  if (jszipPromise) return jszipPromise;

  jszipPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/system/lib/jszip.js';
    script.onload = () => resolve(window.JSZip);
    script.onerror = () => reject(new Error('Failed to load JSZip library'));
    document.head.appendChild(script);
  });

  return jszipPromise;
}

export const ZipHelper = {
  async getJSZip() {
    return await loadJSZip();
  },

  /**
   * Extract a blob to a VFS path
   */
  async extractToVfs(blob, targetPath, vfs, onProgress) {
    const JSZip = await loadJSZip();
    const zip = await JSZip.loadAsync(blob);
    const files = Object.keys(zip.files);
    let completed = 0;

    for (const filename of files) {
      const file = zip.files[filename];
      const fullPath = `${targetPath}/${filename}`;

      if (file.dir) {
        await vfs.mkdir(fullPath);
      } else {
        const content = await file.async('blob');
        // Ensure parent directory exists
        const parent = fullPath.substring(0, fullPath.lastIndexOf('/'));
        if (parent) await vfs.mkdir(parent);
        await vfs.writeFile(fullPath, content);
      }

      completed++;
      if (onProgress) onProgress(completed / files.length, filename);
    }
  }
};
