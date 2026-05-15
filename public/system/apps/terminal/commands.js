/**
 * Terminal Commands — Ported and inspired by ProzillaOS shell commands.
 * Supports ANSI color codes for rich terminal output.
 */

const FORTUNES = [
  "Do not be afraid of competition.",
  "An exciting opportunity lies ahead of you.",
  "You love peace.",
  "Get your mind set... confidence will lead you on.",
  "You will always be surrounded by true friends.",
  "Sell your ideas — they have exceptional merit.",
  "You should be able to undertake and complete anything.",
  "A routine task will turn into an enchanting adventure.",
  "Be true to your work, your word, and your friend.",
  "A journey of a thousand miles begins with a single step.",
  "Forget injuries; never forget kindnesses.",
  "Respect yourself and others will respect you.",
  "Attitude is a little thing that makes a big difference.",
  "Experience is the best teacher.",
  "Expect the unexpected.",
  "Once you make a decision the universe conspires to make it happen.",
  "Nothing great was ever achieved without enthusiasm.",
  "Dance as if no one is watching.",
  "Live this day as if it were your last.",
  "Bloom where you are planted.",
  "Borrow money from a pessimist. They don't expect it back.",
  "Help! I'm being held prisoner in a fortune cookie factory.",
];

const COW_ART = `        \\\\   ^__^
         \\\\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;

function renderCowsay(text) {
  const maxWidth = 40;
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  const maxLen = Math.max(...lines.map(l => l.length));
  const top = ' ' + '_'.repeat(maxLen + 2);
  const bottom = ' ' + '-'.repeat(maxLen + 2);

  const body = lines.map((line, i) => {
    const padded = line.padEnd(maxLen);
    if (lines.length === 1) return `< ${padded} >`;
    if (i === 0) return `/ ${padded} \\`;
    if (i === lines.length - 1) return `\\ ${padded} /`;
    return `| ${padded} |`;
  });

  return [top, ...body, bottom, COW_ART].join('\n');
}

export async function registerCommands(shell) {
  const { vfs } = shell.ctx;

  // ── help ───────────────────────────────────────────────────────────
  shell.register('help', async (args, { stdout }) => {
    const cmds = Array.from(shell.commands.keys()).sort();
    stdout.write('\x1b[1m\x1b[33mAvailable commands:\x1b[0m\n\n');
    const cols = 5;
    for (let i = 0; i < cmds.length; i += cols) {
      const row = cmds.slice(i, i + cols).map(c => `  \x1b[36m${c.padEnd(14)}\x1b[0m`).join('');
      stdout.write(row + '\n');
    }
    stdout.write('\n\x1b[2mUse "man <command>" for more information.\x1b[0m\n');
  });

  // ── clear ──────────────────────────────────────────────────────────
  shell.register('clear', async (args, { stdout }) => {
    stdout.clear();
  });

  // ── echo ───────────────────────────────────────────────────────────
  shell.register('echo', async (args, { stdout }) => {
    stdout.write(args.join(' ') + '\n');
  });

  // ── ls ─────────────────────────────────────────────────────────────
  shell.register('ls', async (args, { shell: s, stdout }) => {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
    const pathArg = args.find(a => !a.startsWith('-'));
    const path = s.resolve(pathArg);
    try {
      const items = await vfs.readdir(path);
      let filtered = showAll ? items : items.filter(i => !i.name.startsWith('.'));

      if (longFormat) {
        for (const item of filtered) {
          const type = item.type === 'dir' ? 'd' : '-';
          const perms = 'rwxr-xr-x';
          const size = item.size != null ? String(item.size).padStart(8) : '       0';
          const name = item.type === 'dir'
            ? `\x1b[1m\x1b[34m${item.name}/\x1b[0m`
            : item.name;
          stdout.write(`\x1b[2m${type}${perms}\x1b[0m  ${size}  ${name}\n`);
        }
      } else {
        const coloredItems = filtered.map(item => {
          if (item.type === 'dir') return `\x1b[1m\x1b[34m${item.name}/\x1b[0m`;
          if (item.name.endsWith('.js') || item.name.endsWith('.json')) return `\x1b[32m${item.name}\x1b[0m`;
          return item.name;
        });
        stdout.write(coloredItems.join('  ') + '\n');
      }
    } catch (e) {
      throw new Error(`ls: cannot access '${pathArg || '.'}': ${e.message}`);
    }
  });

  // ── cd ─────────────────────────────────────────────────────────────
  shell.register('cd', async (args, { shell: s }) => {
    if (!args[0] || args[0] === '~') {
      s.cwd = '/home/user';
      return;
    }
    if (args[0] === '-') {
      const prev = s._prevCwd || s.cwd;
      s._prevCwd = s.cwd;
      s.cwd = prev;
      return;
    }
    const path = s.resolve(args[0]);
    try {
      const stat = await vfs.stat(path);
      if (stat && stat.type === 'dir') {
        s._prevCwd = s.cwd;
        s.cwd = path;
      } else {
        throw new Error('Not a directory');
      }
    } catch (e) {
      throw new Error(`cd: ${args[0]}: No such file or directory`);
    }
  });

  // ── cat ────────────────────────────────────────────────────────────
  shell.register('cat', async (args, { shell: s, stdout }) => {
    if (args.length === 0) throw new Error('cat: missing operand');
    for (const arg of args) {
      const path = s.resolve(arg);
      try {
        const content = await vfs.readFile(path);
        stdout.write(content + '\n');
      } catch (e) {
        stdout.write(`\x1b[31mcat: ${arg}: No such file or directory\x1b[0m\n`);
      }
    }
  });

  // ── head ───────────────────────────────────────────────────────────
  shell.register('head', async (args, { shell: s, stdout }) => {
    let n = 10;
    const nIdx = args.indexOf('-n');
    if (nIdx !== -1 && args[nIdx + 1]) {
      n = parseInt(args[nIdx + 1], 10);
      args.splice(nIdx, 2);
    }
    if (args.length === 0) throw new Error('head: missing operand');
    const path = s.resolve(args[0]);
    const content = await vfs.readFile(path);
    const lines = content.split('\n').slice(0, n);
    stdout.write(lines.join('\n') + '\n');
  });

  // ── tail ───────────────────────────────────────────────────────────
  shell.register('tail', async (args, { shell: s, stdout }) => {
    let n = 10;
    const nIdx = args.indexOf('-n');
    if (nIdx !== -1 && args[nIdx + 1]) {
      n = parseInt(args[nIdx + 1], 10);
      args.splice(nIdx, 2);
    }
    if (args.length === 0) throw new Error('tail: missing operand');
    const path = s.resolve(args[0]);
    const content = await vfs.readFile(path);
    const lines = content.split('\n').slice(-n);
    stdout.write(lines.join('\n') + '\n');
  });

  // ── wc ─────────────────────────────────────────────────────────────
  shell.register('wc', async (args, { shell: s, stdout }) => {
    if (args.length === 0) throw new Error('wc: missing operand');
    for (const arg of args) {
      const path = s.resolve(arg);
      try {
        const content = await vfs.readFile(path);
        const lines = content.split('\n').length;
        const words = content.split(/\s+/).filter(Boolean).length;
        const chars = content.length;
        stdout.write(`  ${lines}  ${words}  ${chars} ${arg}\n`);
      } catch (e) {
        stdout.write(`\x1b[31mwc: ${arg}: No such file or directory\x1b[0m\n`);
      }
    }
  });

  // ── mkdir ──────────────────────────────────────────────────────────
  shell.register('mkdir', async (args, { shell: s }) => {
    if (args.length === 0) throw new Error('mkdir: missing operand');
    for (const arg of args) {
      const path = s.resolve(arg);
      await vfs.mkdir(path);
    }
  });

  // ── rm ─────────────────────────────────────────────────────────────
  shell.register('rm', async (args, { shell: s, stdout }) => {
    if (args.length === 0) throw new Error('rm: missing operand');
    const files = args.filter(a => !a.startsWith('-'));
    for (const arg of files) {
      const path = s.resolve(arg);
      try {
        await vfs.rm(path);
      } catch (e) {
        stdout.write(`\x1b[31mrm: cannot remove '${arg}': ${e.message}\x1b[0m\n`);
      }
    }
  });

  // ── rmdir ──────────────────────────────────────────────────────────
  shell.register('rmdir', async (args, { shell: s }) => {
    if (args.length === 0) throw new Error('rmdir: missing operand');
    const path = s.resolve(args[0]);
    const items = await vfs.readdir(path);
    if (items.length > 0) throw new Error(`rmdir: failed to remove '${args[0]}': Directory not empty`);
    await vfs.rm(path);
  });

  // ── touch ──────────────────────────────────────────────────────────
  shell.register('touch', async (args, { shell: s }) => {
    if (args.length === 0) throw new Error('touch: missing operand');
    for (const arg of args) {
      const path = s.resolve(arg);
      try {
        await vfs.readFile(path); // exists, do nothing
      } catch {
        await vfs.writeFile(path, '');
      }
    }
  });

  // ── cp ─────────────────────────────────────────────────────────────
  shell.register('cp', async (args, { shell: s }) => {
    if (args.length < 2) throw new Error('cp: missing operand');
    const src = s.resolve(args[0]);
    const dest = s.resolve(args[1]);
    const content = await vfs.readFile(src);
    await vfs.writeFile(dest, content);
  });

  // ── mv ─────────────────────────────────────────────────────────────
  shell.register('mv', async (args, { shell: s }) => {
    if (args.length < 2) throw new Error('mv: missing operand');
    const src = s.resolve(args[0]);
    const dest = s.resolve(args[1]);
    const content = await vfs.readFile(src);
    await vfs.writeFile(dest, content);
    await vfs.rm(src);
  });

  // ── pwd ────────────────────────────────────────────────────────────
  shell.register('pwd', async (args, { shell: s, stdout }) => {
    stdout.write(s.cwd + '\n');
  });

  // ── whoami ─────────────────────────────────────────────────────────
  shell.register('whoami', async (args, { shell: s, stdout }) => {
    stdout.write(s.env.USER + '\n');
  });

  // ── hostname ───────────────────────────────────────────────────────
  shell.register('hostname', async (args, { stdout }) => {
    stdout.write('everest-os\n');
  });

  // ── uname ──────────────────────────────────────────────────────────
  shell.register('uname', async (args, { stdout }) => {
    if (args.includes('-a')) {
      stdout.write('EverestOS 1.0.0 everest-os x86_64 JavaScript/VFS\n');
    } else {
      stdout.write('EverestOS\n');
    }
  });

  // ── date ───────────────────────────────────────────────────────────
  shell.register('date', async (args, { stdout }) => {
    stdout.write(new Date().toString() + '\n');
  });

  // ── uptime ─────────────────────────────────────────────────────────
  shell.register('uptime', async (args, { shell: s, stdout }) => {
    const elapsed = Math.floor((Date.now() - (s._startTime || Date.now())) / 1000);
    const hrs = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;
    const time = new Date().toLocaleTimeString();
    stdout.write(` \x1b[1m${time}\x1b[0m up ${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}, 1 user\n`);
  });

  // ── history ────────────────────────────────────────────────────────
  shell.register('history', async (args, { shell: s, stdout }) => {
    if (s.history.length === 0) {
      stdout.write('\x1b[2mNo history yet.\x1b[0m\n');
      return;
    }
    s.history.forEach((cmd, i) => {
      stdout.write(`  \x1b[2m${String(i + 1).padStart(4)}\x1b[0m  ${cmd}\n`);
    });
  });

  // ── env / printenv ─────────────────────────────────────────────────
  shell.register('env', async (args, { shell: s, stdout }) => {
    for (const [key, val] of Object.entries(s.env)) {
      stdout.write(`\x1b[36m${key}\x1b[0m=${val}\n`);
    }
  });
  shell.register('printenv', async (args, ctx) => {
    await shell.commands.get('env')(args, ctx);
  });

  // ── export ─────────────────────────────────────────────────────────
  shell.register('export', async (args, { shell: s, stdout }) => {
    if (args.length === 0) {
      // List all env vars
      for (const [key, val] of Object.entries(s.env)) {
        stdout.write(`declare -x ${key}="${val}"\n`);
      }
      return;
    }
    for (const arg of args) {
      const eq = arg.indexOf('=');
      if (eq === -1) {
        stdout.write(`\x1b[31mexport: '${arg}': not a valid identifier\x1b[0m\n`);
      } else {
        const key = arg.slice(0, eq);
        const val = arg.slice(eq + 1);
        s.env[key] = val;
      }
    }
  });

  // ── grep ───────────────────────────────────────────────────────────
  shell.register('grep', async (args, { shell: s, stdout }) => {
    const caseInsensitive = args.includes('-i');
    const showLineNumbers = args.includes('-n');
    const filtered = args.filter(a => !a.startsWith('-'));

    if (filtered.length < 2) throw new Error('grep: usage: grep [-i] [-n] PATTERN FILE');
    const pattern = filtered[0];
    const path = s.resolve(filtered[1]);
    const content = await vfs.readFile(path);
    const lines = content.split('\n');
    const re = new RegExp(pattern, caseInsensitive ? 'gi' : 'g');

    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        const highlighted = lines[i].replace(re, (m) => `\x1b[1m\x1b[31m${m}\x1b[0m`);
        const prefix = showLineNumbers ? `\x1b[32m${i + 1}\x1b[0m:` : '';
        stdout.write(`${prefix}${highlighted}\n`);
        re.lastIndex = 0;
      }
    }
  });

  // ── rev ────────────────────────────────────────────────────────────
  shell.register('rev', async (args, { stdout }) => {
    if (args.length === 0) throw new Error('rev: missing string argument');
    stdout.write(args.join(' ').split('').reverse().join('') + '\n');
  });

  // ── fortune ────────────────────────────────────────────────────────
  shell.register('fortune', async (args, { stdout }) => {
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    stdout.write(`\x1b[33m${fortune}\x1b[0m\n`);
  });

  // ── cowsay ─────────────────────────────────────────────────────────
  shell.register('cowsay', async (args, { stdout }) => {
    const text = args.length > 0 ? args.join(' ') : 'Moo!';
    stdout.write(renderCowsay(text) + '\n');
  });

  // ── curl ────────────────────────────────────────────────────────────
  shell.register('curl', async (args, { shell: s, stdout }) => {
    const showHeaders = args.includes('-I') || args.includes('--head');
    const silent = args.includes('-s') || args.includes('--silent');
    const useRemoteName = args.includes('-O');

    // Parse -o filename
    let outputFile = null;
    const oIdx = args.indexOf('-o');
    if (oIdx !== -1 && args[oIdx + 1]) {
      outputFile = args[oIdx + 1];
      args.splice(oIdx, 2);
    }

    const url = args.find(a => !a.startsWith('-'));
    if (!url) throw new Error('curl: no URL specified\nUsage: curl [OPTIONS] URL\n  -o FILE   Write output to FILE\n  -O        Write output using remote filename\n  -I        Show headers only\n  -s        Silent mode');

    let fullUrl = url;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    // Derive filename from URL for -O
    if (useRemoteName && !outputFile) {
      try {
        const urlObj = new URL(fullUrl);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        outputFile = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'index.html';
      } catch {
        outputFile = 'download';
      }
    }

    if (!silent) {
      stdout.write(`\x1b[2m  % Total    % Received  Time     Speed\x1b[0m\n`);
      stdout.write(`\x1b[2m                         -------  -----\x1b[0m\n`);
    }

    try {
      const startTime = performance.now();
      const response = await fetch(fullUrl);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);

      if (showHeaders) {
        stdout.write(`\x1b[36mHTTP/${response.status >= 200 ? '1.1' : '2'} ${response.status}\x1b[0m\n`);
        for (const [key, value] of response.headers.entries()) {
          stdout.write(`\x1b[32m${key}\x1b[0m: ${value}\n`);
        }
        stdout.write('\n');
      } else {
        const text = await response.text();
        const size = new Blob([text]).size;
        if (!silent) {
          stdout.write(`\x1b[2m  ${size}    100       ${elapsed}s    ${Math.round(size / parseFloat(elapsed))} B/s\x1b[0m\n\n`);
        }

        // Save to file if -o or -O was given
        if (outputFile) {
          const savePath = s.resolve(outputFile);
          await vfs.writeFile(savePath, text);
          stdout.write(`\x1b[32m✓ Saved ${size} bytes to ${outputFile}\x1b[0m\n`);
        } else {
          // Print to stdout
          if (text.length > 5000) {
            stdout.write(text.substring(0, 5000));
            stdout.write(`\n\x1b[33m... (truncated, ${text.length} bytes total)\x1b[0m\n`);
          } else {
            stdout.write(text + '\n');
          }
        }
      }
    } catch (e) {
      stdout.write(`\x1b[31mcurl: (6) Could not resolve host: ${url}\x1b[0m\n`);
      stdout.write(`\x1b[31m${e.message}\x1b[0m\n`);
    }
  });

  // ── ping ───────────────────────────────────────────────────────────
  shell.register('ping', async (args, { stdout }) => {
    let count = 4;
    const cIdx = args.indexOf('-c');
    if (cIdx !== -1 && args[cIdx + 1]) {
      count = parseInt(args[cIdx + 1], 10);
      args.splice(cIdx, 2);
    }
    const host = args.find(a => !a.startsWith('-'));
    if (!host) throw new Error('ping: missing host operand\nUsage: ping [-c count] host');

    let fullUrl = host;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    stdout.write(`\x1b[1mPING\x1b[0m ${host}: ${count} packets\n`);

    let sent = 0, received = 0, totalTime = 0, minTime = Infinity, maxTime = 0;

    for (let i = 0; i < count; i++) {
      sent++;
      try {
        const start = performance.now();
        await fetch(fullUrl, { method: 'HEAD', mode: 'no-cors' });
        const ms = (performance.now() - start).toFixed(1);
        const msNum = parseFloat(ms);
        received++;
        totalTime += msNum;
        if (msNum < minTime) minTime = msNum;
        if (msNum > maxTime) maxTime = msNum;
        stdout.write(`\x1b[32m64 bytes from ${host}: icmp_seq=${i + 1} time=${ms} ms\x1b[0m\n`);
      } catch (e) {
        stdout.write(`\x1b[31mRequest timeout for icmp_seq ${i + 1}\x1b[0m\n`);
      }
      // Small delay between pings
      if (i < count - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    stdout.write(`\n\x1b[1m--- ${host} ping statistics ---\x1b[0m\n`);
    const loss = (((sent - received) / sent) * 100).toFixed(1);
    stdout.write(`${sent} packets transmitted, ${received} received, \x1b[${loss === '0.0' ? '32' : '31'}m${loss}% packet loss\x1b[0m\n`);
    if (received > 0) {
      const avg = (totalTime / received).toFixed(1);
      stdout.write(`rtt min/avg/max = ${minTime.toFixed(1)}/${avg}/${maxTime.toFixed(1)} ms\n`);
    }
  });

  // ── exit ───────────────────────────────────────────────────────────
  shell.register('exit', async (args, { ctx }) => {
    // Close the terminal window if possible
    const win = ctx.windowManager?.activeWindow;
    if (win) ctx.windowManager.closeWindow(win);
  });

  // ── reboot / reload ────────────────────────────────────────────────
  shell.register('reboot', async () => {
    window.location.reload();
  });
  shell.register('reload', async () => {
    window.location.reload();
  });

  // ── man ────────────────────────────────────────────────────────────
  shell.register('man', async (args, { stdout }) => {
    const manPages = {
      ls:       'ls [OPTIONS] [PATH]\n  List directory contents.\n  Options: -a (show hidden), -l (long format)',
      cd:       'cd [PATH]\n  Change directory. Use ~ for home, - for previous directory.',
      cat:      'cat FILE...\n  Concatenate and display file contents.',
      head:     'head [-n NUM] FILE\n  Display first NUM lines of a file (default 10).',
      tail:     'tail [-n NUM] FILE\n  Display last NUM lines of a file (default 10).',
      wc:       'wc FILE...\n  Print line, word, and byte counts.',
      grep:     'grep [-i] [-n] PATTERN FILE\n  Search for PATTERN in FILE.\n  Options: -i (case insensitive), -n (line numbers)',
      mkdir:    'mkdir DIR...\n  Create directories.',
      rm:       'rm FILE...\n  Remove files or directories.',
      rmdir:    'rmdir DIR\n  Remove empty directories.',
      touch:    'touch FILE...\n  Create empty files or update timestamps.',
      cp:       'cp SOURCE DEST\n  Copy a file.',
      mv:       'mv SOURCE DEST\n  Move or rename a file.',
      echo:     'echo [TEXT...]\n  Display a line of text.',
      clear:    'clear\n  Clear the terminal screen.',
      history:  'history\n  Display command history.',
      export:   'export [NAME=VALUE...]\n  Set environment variables.',
      env:      'env\n  Print all environment variables.',
      rev:      'rev TEXT\n  Reverse a string.',
      cowsay:   'cowsay [TEXT]\n  Display a cow saying something.',
      fortune:  'fortune\n  Display a random fortune.',
      neofetch: 'neofetch\n  Display system information.',
      uname:    'uname [-a]\n  Print system information.',
      uptime:   'uptime\n  Print how long the system has been running.',
      date:     'date\n  Print the current date and time.',
      curl:     'curl [OPTIONS] URL\n  Transfer data from a URL.\n  Options: -o FILE (save to file), -O (use remote name), -I (headers only), -s (silent)',
      ping:     'ping [-c COUNT] HOST\n  Send ICMP-like requests to a host.\n  Options: -c N (number of pings, default 4)',
      backup:   'backup [FILE]\n  Export entire VFS as a JSON backup.\n  Without args: downloads to your computer.\n  With FILE: saves backup inside VFS.\n  Works across storage modes (Server FS / IndexedDB).',
      restore:  'restore [FILE]\n  Restore VFS from a JSON backup.\n  Without args: opens file picker to select a backup.\n  With FILE: restores from a VFS path.\n  Cross-mode: backup from IndexedDB can restore to Server FS and vice versa.',
    };
    if (args.length === 0) {
      stdout.write('\x1b[33mWhat manual page do you want?\nUsage: man <command>\x1b[0m\n');
      return;
    }
    const page = manPages[args[0]];
    if (page) {
      stdout.write(`\x1b[1m\x1b[36m${args[0].toUpperCase()}\x1b[0m\n\n${page}\n`);
    } else {
      stdout.write(`\x1b[31mNo manual entry for ${args[0]}\x1b[0m\n`);
    }
  });

  // ── version ────────────────────────────────────────────────────────
  shell.register('version', async (args, { stdout }) => {
    stdout.write('\x1b[1m\x1b[32mEverest OS\x1b[0m v1.0.0\n');
    stdout.write('\x1b[36mpsh\x1b[0m (Playground Shell) v2.0.0\n');
    stdout.write('\x1b[2mPowered by VFS + JavaScript\x1b[0m\n');
  });

  // ── cmatrix (simulation) ───────────────────────────────────────────
  shell.register('cmatrix', async (args, { stdout }) => {
    stdout.clear();
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()';
    const width = 80;
    const height = 24;
    const columns = new Array(width).fill(0);

    const interval = setInterval(() => {
      let line = '';
      for (let i = 0; i < width; i++) {
        if (Math.random() > 0.95 || columns[i] > 0) {
          line += `\x1b[32m${chars[Math.floor(Math.random() * chars.length)]}\x1b[0m`;
          columns[i] = (columns[i] + 1) % height;
        } else {
          line += ' ';
        }
      }
      stdout.write(line + '\n');
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      stdout.write('\n\x1b[2m(cmatrix ended after 10s)\x1b[0m\n');
    }, 10000);
  });

  // ── neofetch ───────────────────────────────────────────────────────
  shell.register('neofetch', async (args, { stdout }) => {
    const user = shell.ctx.vfs?.USER || 'user';
    const theme = shell.ctx.themeManager?.currentTheme || 'Everest-Dark';
    const iconTheme = shell.ctx.themeManager?.currentIconTheme || 'bloom-dark';
    const vfsInstance = shell.ctx.vfs;
    const BASE_URL = vfsInstance?.BASE_URL || (window.location.pathname.includes('/EverestOS') ? '/EverestOS/' : '/');

    let storageMode = 'Unknown';
    if (vfsInstance?.staticMode) {
      storageMode = 'Static (GitHub Pages — IndexedDB Persistent)';
    } else {
      try {
        const res = await fetch(BASE_URL + 'api/fs/info');
        if (res.ok) {
          storageMode = 'Server FS (Persistent)';
        } else {
          throw 0;
        }
      } catch {
        if (vfsInstance?.db) {
          storageMode = 'IndexedDB (Browser — Persistent)';
        } else if (vfsInstance?.useLocalStorage) {
          storageMode = 'LocalStorage (Volatile)';
        }
      }
    }
    const info = `
\x1b[0m         \x1b[36m--------------\x1b[0m       \x1b[0m \x1b[1m${user}\x1b[0m@\x1b[1meverest-os\x1b[0m
\x1b[0m     \x1b[36m--------------------\x1b[0m     \x1b[0m \x1b[2m──────────────────\x1b[0m
\x1b[0m   \x1b[36m------------------------\x1b[0m   \x1b[0m \x1b[36mOS:\x1b[0m Everest OS v1.0.0
\x1b[0m  \x1b[36m--------------------------\x1b[0m  \x1b[0m \x1b[36mHost:\x1b[0m Browser Sandbox
\x1b[0m \x1b[36m----------------------------\x1b[0m \x1b[0m \x1b[36mKernel:\x1b[0m VFS Hybrid Engine
\x1b[36m--------------\x1b[97m...\x1b[36m-------------\x1b[0m \x1b[36mShell:\x1b[0m psh 2.0.0
\x1b[36m------------\x1b[97m...\x1b[34m#\x1b[97m..\x1b[36m--\x1b[97m..\x1b[36m----\x1b[97m.\x1b[36m---\x1b[0m \x1b[36mResolution:\x1b[0m ${window.innerWidth}x${window.innerHeight}
\x1b[36m----\x1b[97m.\x1b[36m------\x1b[97m...\x1b[34m###\x1b[94m+\x1b[97m..\x1b[94m+\x1b[34m##\x1b[97m...\x1b[36m-\x1b[94m+\x1b[36m--\x1b[0m \x1b[36mTheme:\x1b[0m ${theme}
\x1b[36m--\x1b[97m..\x1b[94m+\x1b[34m#\x1b[97m.\x1b[36m-\x1b[97m...\x1b[94m+\x1b[34m#################\x1b[97m.\x1b[0m \x1b[36mIcons:\x1b[0m ${iconTheme}
\x1b[97m..\x1b[34m#####\x1b[97m..\x1b[34m####################\x1b[94m+\x1b[0m \x1b[36mTerminal:\x1b[0m psh (EverestOS)
\x1b[97m.\x1b[34m############################\x1b[97m.\x1b[0m \x1b[36mCPU:\x1b[0m ${navigator.userAgent.includes('Chrome') ? 'V8' : navigator.userAgent.includes('Firefox') ? 'SpiderMonkey' : 'JS'} Engine
\x1b[0m \x1b[36m-\x1b[34m##########################\x1b[36m-\x1b[0m \x1b[0m \x1b[36mMemory:\x1b[0m ${navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Browser Allocated'}
\x1b[0m  \x1b[36m-\x1b[34m########################\x1b[36m-\x1b[0m  \x1b[0m \x1b[36mStorage:\x1b[0m ${storageMode}
\x1b[0m   \x1b[36m-\x1b[94m+\x1b[34m####################\x1b[94m+\x1b[97m.\x1b[0m   \x1b[0m 
\x1b[0m     \x1b[97m.\x1b[36m-\x1b[34m################\x1b[36m-\x1b[97m.\x1b[0m     \x1b[0m \x1b[40m   \x1b[41m   \x1b[42m   \x1b[43m   \x1b[44m   \x1b[45m   \x1b[46m   \x1b[47m   \x1b[0m
\x1b[0m        \x1b[97m.\x1b[36m-\x1b[94m+++\x1b[34m####\x1b[94m+++\x1b[36m--\x1b[0m        \x1b[0m
`;
    stdout.write(info + '\n');
  });

  // ── backup ─────────────────────────────────────────────────────────
  shell.register('backup', async (args, { shell: s, stdout }) => {
    const targetPath = args[0]; // optional: save to VFS instead of download

    stdout.write('\x1b[36m⏳ Collecting files...\x1b[0m\n');

    // Recursively walk the VFS
    const files = [];
    const walk = async (dir) => {
      try {
        const items = await vfs.readdir(dir);
        for (const item of items) {
          if (item.type === 'dir') {
            files.push({ path: item.path, type: 'dir' });
            await walk(item.path);
          } else {
            try {
              const content = await vfs.readFile(item.path);
              files.push({
                path: item.path,
                type: 'file',
                content,
                size: content.length,
              });
            } catch { /* skip unreadable */ }
          }
        }
      } catch { /* skip inaccessible dirs */ }
    };

    await walk('/');
    const backup = {
      version: '1.0',
      os: 'EverestOS',
      timestamp: new Date().toISOString(),
      fileCount: files.length,
      files,
    };
    const json = JSON.stringify(backup, null, 2);
    const sizeKB = (new Blob([json]).size / 1024).toFixed(1);

    if (targetPath) {
      // Save to VFS path
      const savePath = s.resolve(targetPath);
      await vfs.writeFile(savePath, json);
      stdout.write(`\x1b[32m✓ Backup saved to ${targetPath} (${sizeKB} KB, ${files.length} files)\x1b[0m\n`);
    } else {
      // Download as browser file
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `everest-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      stdout.write(`\x1b[32m✓ Backup downloaded (${sizeKB} KB, ${files.length} files)\x1b[0m\n`);
    }
  });

  // ── restore ────────────────────────────────────────────────────────
  shell.register('restore', async (args, { shell: s, stdout }) => {
    const sourcePath = args[0]; // optional: restore from VFS path

    let backupData;

    if (sourcePath) {
      // Restore from a VFS file
      const path = s.resolve(sourcePath);
      try {
        const json = await vfs.readFile(path);
        backupData = JSON.parse(json);
      } catch (e) {
        throw new Error(`restore: cannot read '${sourcePath}': ${e.message}`);
      }
    } else {
      // Prompt user to pick a file from their computer
      stdout.write('\x1b[36m📂 Select a backup file...\x1b[0m\n');
      backupData = await new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async () => {
          const file = input.files[0];
          if (!file) { reject(new Error('No file selected')); return; }
          try {
            const text = await file.text();
            resolve(JSON.parse(text));
          } catch (e) {
            reject(new Error(`Invalid backup file: ${e.message}`));
          }
        };
        input.oncancel = () => reject(new Error('Cancelled'));
        input.click();
      });
    }

    if (!backupData || !backupData.files) {
      throw new Error('restore: invalid backup format (missing files array)');
    }

    stdout.write(`\x1b[36m⏳ Restoring ${backupData.files.length} items from ${backupData.timestamp || 'unknown date'}...\x1b[0m\n`);

    let restored = 0, errors = 0;

    // Create directories first, then files
    const dirs = backupData.files.filter(f => f.type === 'dir');
    const files = backupData.files.filter(f => f.type === 'file');

    for (const dir of dirs) {
      try {
        await vfs.mkdir(dir.path);
        restored++;
      } catch { errors++; }
    }

    for (const file of files) {
      try {
        // Ensure parent directory exists
        const parentDir = file.path.substring(0, file.path.lastIndexOf('/'));
        if (parentDir) {
          try { await vfs.mkdir(parentDir); } catch { /* already exists */ }
        }
        await vfs.writeFile(file.path, file.content || '');
        restored++;
      } catch { errors++; }
    }

    stdout.write(`\x1b[32m✓ Restore complete: ${restored} items restored\x1b[0m`);
    if (errors > 0) {
      stdout.write(`, \x1b[31m${errors} errors\x1b[0m`);
    }
    stdout.write('\n');

    if (backupData.os) {
      stdout.write(`\x1b[2m  Backup from: ${backupData.os} (${backupData.timestamp})\x1b[0m\n`);
    }
  });

  // ── epm ─────────────────────────────────────────────────────────────
  shell.register('epm', async (args, { stdout }) => {
    const pm = window.osAPI.PackageManager;
    if (!pm) throw new Error('epm: Package Manager subsystem is initializing. Try again in a second.');

    const printHelp = () => {
      stdout.write('\x1b[1m\x1b[33mEverest Package Manager (epm)\x1b[0m\n');
      stdout.write('Usage: epm <command> [arguments]\n\n');
      stdout.write('Commands:\n');
      stdout.write('  \x1b[36mupdate\x1b[0m                Update package registry cache.\n');
      stdout.write('  \x1b[36mapp list\x1b[0m              List available online apps.\n');
      stdout.write('  \x1b[36mapp install <id>\x1b[0m      Install a specific app.\n');
      stdout.write('  \x1b[36mplugin list\x1b[0m           List available online extensions.\n');
      stdout.write('  \x1b[36mplugin install <id>\x1b[0m   Install a specific extension.\n');
    };

    if (args.length === 0) { printHelp(); return; }

    const cmd = args[0].toLowerCase();

    if (cmd === 'update') {
      stdout.write('\x1b[36mFetching package registry from remote...\x1b[0m\n');
      try {
        const reg = await pm.update();
        const total = (reg.apps?.length || 0) + (reg.extensions?.length || 0);
        stdout.write(`\x1b[32m✓ Successfully fetched registry containing ${total} items.\x1b[0m\n`);
      } catch(e) {
        throw new Error(`epm update failed: ${e.message}`);
      }
    } 
    else if (cmd === 'app') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'list') {
        const reg = await pm.getRegistry();
        const apps = reg.apps || [];
        stdout.write('\x1b[1mAVAILABLE APPLICATIONS\x1b[0m\n');
        stdout.write('\x1b[2m' + 'ID'.padEnd(20) + 'NAME'.padEnd(25) + 'VERSION\x1b[0m\n');
        for (const a of apps) {
          stdout.write(`\x1b[36m${a.id.padEnd(20)}\x1b[0m \x1b[1m${a.name.padEnd(25).substring(0, 24)}\x1b[0m \x1b[32m${a.version || '1.0'}\x1b[0m\n`);
        }
      } 
      else if (sub === 'install') {
        const id = args[2];
        if (!id) throw new Error('epm app install: missing application ID argument.');
        stdout.write(`\x1b[36mAttempting to install app: ${id}...\x1b[0m\n`);
        try {
          await pm.installApp(id);
          stdout.write(`\x1b[32m✓ Successfully installed ${id}. You can now launch it from the App Menu.\x1b[0m\n`);
        } catch (err) {
          stdout.write(`\x1b[31m✖ Installation failed: ${err.message}\x1b[0m\n`);
        }
      } 
      else {
        throw new Error('epm app: unknown sub-command. Valid: list, install.');
      }
    } 
    else if (cmd === 'plugin' || cmd === 'ext') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'list') {
        const reg = await pm.getRegistry();
        const exts = reg.extensions || [];
        stdout.write('\x1b[1mAVAILABLE EXTENSIONS / PLUGINS\x1b[0m\n');
        stdout.write('\x1b[2m' + 'UUID'.padEnd(30) + 'TYPE'.padEnd(12) + 'AUTHOR\x1b[0m\n');
        for (const e of exts) {
          stdout.write(`\x1b[36m${e.uuid.padEnd(30)}\x1b[0m \x1b[1m${(e.type || 'applet').padEnd(12)}\x1b[0m \x1b[32m${(e.author || 'unknown').substring(0,15)}\x1b[0m\n`);
        }
      } 
      else if (sub === 'install') {
        const id = args[2];
        if (!id) throw new Error('epm plugin install: missing extension UUID argument.');
        stdout.write(`\x1b[36mAttempting to install extension: ${id}...\x1b[0m\n`);
        try {
          await pm.installPlugin(id);
          stdout.write(`\x1b[32m✓ Successfully installed ${id}.\x1b[0m\n`);
        } catch (err) {
          stdout.write(`\x1b[31m✖ Installation failed: ${err.message}\x1b[0m\n`);
        }
      } 
      else {
        throw new Error('epm plugin: unknown sub-command. Valid: list, install.');
      }
    } 
    else {
      throw new Error(`epm: unknown command '${cmd}'. Type 'epm' to show usage.`);
    }
  });
}
