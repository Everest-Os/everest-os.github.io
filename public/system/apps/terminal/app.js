import { Shell } from './shell.js';
import { registerCommands } from './commands.js';

/**
 * Parse ANSI escape sequences and return an array of HTML spans.
 * Supports SGR codes: bold, dim, italic, underline, strikethrough,
 * foreground (30–37, 90–97), background (40–47, 100–107), and reset (0).
 */
function parseAnsi(text) {
  const COLORS = [
    '#1e1e2e', '#f38ba8', '#a6e3a1', '#f9e2af',
    '#89b4fa', '#cba6f7', '#94e2d5', '#cdd6f4'
  ];
  const BRIGHT_COLORS = [
    '#585b70', '#f38ba8', '#a6e3a1', '#f9e2af',
    '#89b4fa', '#cba6f7', '#94e2d5', '#ffffff'
  ];
  const BG_COLORS = [
    '#1e1e2e', '#f38ba8', '#a6e3a1', '#f9e2af',
    '#89b4fa', '#cba6f7', '#94e2d5', '#cdd6f4'
  ];
  const BRIGHT_BG = [
    '#585b70', '#f38ba8', '#a6e3a1', '#f9e2af',
    '#89b4fa', '#cba6f7', '#94e2d5', '#ffffff'
  ];

  // eslint-disable-next-line no-control-regex
  const re = /\x1b\[([0-9;]*)m/g;

  const parts = [];
  let lastIndex = 0;
  let fg = null, bg = null;
  let bold = false, dim = false, italic = false, underline = false, strike = false;

  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), fg, bg, bold, dim, italic, underline, strike });
    }
    const codes = match[1].split(';').map(Number);
    for (const code of codes) {
      if (code === 0) { fg = null; bg = null; bold = false; dim = false; italic = false; underline = false; strike = false; }
      else if (code === 1) bold = true;
      else if (code === 2) dim = true;
      else if (code === 3) italic = true;
      else if (code === 4) underline = true;
      else if (code === 9) strike = true;
      else if (code >= 30 && code <= 37) fg = COLORS[code - 30];
      else if (code >= 40 && code <= 47) bg = BG_COLORS[code - 40];
      else if (code >= 90 && code <= 97) fg = BRIGHT_COLORS[code - 90];
      else if (code >= 100 && code <= 107) bg = BRIGHT_BG[code - 100];
      else if (code === 39) fg = null;
      else if (code === 49) bg = null;
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), fg, bg, bold, dim, italic, underline, strike });
  }
  return parts;
}

/**
 * Render a text string containing ANSI codes to a DOM element.
 */
function renderAnsiToElement(text) {
  const frag = document.createDocumentFragment();
  const parts = parseAnsi(text);
  for (const part of parts) {
    const span = document.createElement('span');
    span.textContent = part.text;
    const styles = [];
    if (part.fg) styles.push(`color:${part.fg}`);
    if (part.bg) styles.push(`background:${part.bg}`);
    if (part.bold) styles.push('font-weight:bold');
    if (part.dim) styles.push('opacity:0.5');
    if (part.italic) styles.push('font-style:italic');
    if (part.underline) styles.push('text-decoration:underline');
    if (part.strike) styles.push('text-decoration:line-through');
    if (styles.length) span.style.cssText = styles.join(';');
    frag.appendChild(span);
  }
  return frag;
}

export async function launch(ctx, options = {}) {
  const { windowManager } = ctx;
  const startTime = Date.now();

  const shell = new Shell(ctx);
  shell._startTime = startTime;

  // Register basic commands
  await registerCommands(shell);

  // ── Container ──────────────────────────────────────────────────────
  const container = document.createElement('div');
  container.className = 'terminal-container';
  container.style.cssText = `
    height: 100%;
    background: #0d0d14;
    color: #cdd6f4;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 13px;
    line-height: 1.45;
    padding: 12px 14px;
    overflow-y: auto;
    overflow-x: hidden;
    cursor: text;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    scroll-behavior: smooth;
  `;

  // ── Scrollback buffer ──────────────────────────────────────────────
  const scrollback = document.createElement('div');
  scrollback.className = 'terminal-scrollback';
  scrollback.style.cssText = 'white-space:pre-wrap; word-break:break-all;';
  container.appendChild(scrollback);

  // ── Active prompt line ─────────────────────────────────────────────
  const promptLine = document.createElement('div');
  promptLine.className = 'terminal-prompt-line';
  promptLine.style.cssText = 'display:flex; align-items:center; gap:0; white-space:pre;';

  const promptSpan = document.createElement('span');
  promptSpan.className = 'terminal-prompt';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'terminal-input';
  input.spellcheck = false;
  input.autocomplete = 'off';
  input.style.cssText = `
    flex: 1;
    background: transparent;
    border: none;
    color: #cdd6f4;
    font: inherit;
    outline: none;
    padding: 0;
    margin: 0;
    caret-color: #a6e3a1;
  `;

  const updatePrompt = () => {
    const cwd = shell.cwd === '/home/user' ? '~' : shell.cwd.replace('/home/user', '~');
    promptSpan.innerHTML = '';
    const userPart = document.createElement('span');
    userPart.style.color = '#a6e3a1';
    userPart.style.fontWeight = 'bold';
    userPart.textContent = `${shell.env.USER}@everest`;
    const sep = document.createElement('span');
    sep.style.color = '#6c7086';
    sep.textContent = ':';
    const cwdPart = document.createElement('span');
    cwdPart.style.color = '#89b4fa';
    cwdPart.style.fontWeight = 'bold';
    cwdPart.textContent = cwd;
    const dollar = document.createElement('span');
    dollar.style.color = '#cdd6f4';
    dollar.textContent = '$ ';
    promptSpan.appendChild(userPart);
    promptSpan.appendChild(sep);
    promptSpan.appendChild(cwdPart);
    promptSpan.appendChild(dollar);
  };
  updatePrompt();

  promptLine.appendChild(promptSpan);
  promptLine.appendChild(input);
  container.appendChild(promptLine);

  // ── Helpers ────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  };

  const write = (text) => {
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length > 0) {
        scrollback.appendChild(renderAnsiToElement(line));
      }
      if (i < lines.length - 1) {
        scrollback.appendChild(document.createElement('br'));
      }
    }
    scrollToBottom();
  };

  const stdout = {
    write: (text) => write(text),
    clear: () => { scrollback.innerHTML = ''; },
    _output: scrollback,
  };

  // Freeze the current prompt + typed command into scrollback
  const freezePrompt = (line) => {
    const frozenLine = document.createElement('div');
    frozenLine.style.cssText = 'display:flex; align-items:center; gap:0; white-space:pre;';
    const clonedPrompt = promptSpan.cloneNode(true);
    frozenLine.appendChild(clonedPrompt);
    const cmdSpan = document.createElement('span');
    cmdSpan.textContent = line;
    frozenLine.appendChild(cmdSpan);
    scrollback.appendChild(frozenLine);
  };

  // ── Window Creation ────────────────────────────────────────────────
  const win = windowManager.createWindow({
    id: `terminal-${Date.now()}`,
    title: 'Terminal',
    icon: 'terminal,💻',
    width: 700,
    height: 480,
    content: container,
  });

  // ── History navigation ─────────────────────────────────────────────
  let historyIndex = -1;
  let savedInput = '';

  // ── Focus management ───────────────────────────────────────────────
  container.addEventListener('mouseup', (e) => {
    // Only re-focus input if no text is selected (preserve selection for copy)
    setTimeout(() => {
      if (window.getSelection()?.toString() === '') {
        input.focus();
      }
    }, 10);
  });
  setTimeout(() => input.focus(), 100);

  // ── Right-click context menu (Copy / Paste) ─────────────────────────
  container.addEventListener('contextmenu', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const selected = window.getSelection()?.toString() || '';
    let clipboardText = '';
    try { clipboardText = await navigator.clipboard.readText(); } catch { }

    const menuItems = [];

    if (selected) {
      menuItems.push({
        icon: '📋', label: 'Copy',
        action: () => {
          navigator.clipboard.writeText(selected).catch(() => {});
          window.getSelection()?.removeAllRanges();
        }
      });
    }

    if (clipboardText) {
      menuItems.push({
        icon: '📌', label: 'Paste',
        action: () => {
          const start = input.selectionStart ?? input.value.length;
          const end = input.selectionEnd ?? input.value.length;
          input.value = input.value.substring(0, start) + clipboardText + input.value.substring(end);
          const newPos = start + clipboardText.length;
          input.focus();
          input.setSelectionRange(newPos, newPos);
        }
      });
    }

    if (scrollback.textContent.trim()) {
      menuItems.push({
        icon: '🗑️', label: 'Clear Terminal',
        action: () => { scrollback.innerHTML = ''; }
      });
    }

    if (menuItems.length > 0) {
      const { showContextMenu } = window.osAPI;
      showContextMenu(menuItems, e.clientX, e.clientY);
    }
  });

  // ── Key handling ───────────────────────────────────────────────────
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const line = input.value;
      input.value = '';
      historyIndex = -1;
      savedInput = '';

      freezePrompt(line);

      if (line.trim()) {
        await shell.execute(line, stdout);
      }

      updatePrompt();
      scrollToBottom();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (shell.history.length === 0) return;
      if (historyIndex === -1) savedInput = input.value;
      if (historyIndex < shell.history.length - 1) {
        historyIndex++;
        input.value = shell.history[shell.history.length - 1 - historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        historyIndex = -1;
        input.value = savedInput;
      } else {
        historyIndex--;
        input.value = shell.history[shell.history.length - 1 - historyIndex];
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      scrollback.innerHTML = '';
    } else if (e.key === 'c' && e.ctrlKey) {
      // If text is selected in scrollback, copy it; otherwise send ^C
      const selected = window.getSelection()?.toString();
      if (selected) {
        navigator.clipboard.writeText(selected).catch(() => {});
        window.getSelection()?.removeAllRanges();
      } else {
        e.preventDefault();
        freezePrompt(input.value + '^C');
        input.value = '';
        updatePrompt();
        scrollToBottom();
      }
    }
  });

  // Also handle Ctrl+C for copy when focus is on scrollback text
  container.addEventListener('keydown', (e) => {
    if (e.key === 'c' && e.ctrlKey && e.target !== input) {
      const selected = window.getSelection()?.toString();
      if (selected) {
        navigator.clipboard.writeText(selected).catch(() => {});
        window.getSelection()?.removeAllRanges();
        e.preventDefault();
      }
    }
    // Ctrl+V paste when focus is anywhere in the terminal
    if (e.key === 'v' && e.ctrlKey && e.target !== input) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        if (text) {
          input.value += text;
          input.focus();
        }
      }).catch(() => {});
    }
  });
  container.tabIndex = -1; // Allow container to receive keyboard events

  // ── Welcome message ────────────────────────────────────────────────
  write('\x1b[1m\x1b[32mEverest OS\x1b[0m \x1b[2mv1.0.0\x1b[0m — \x1b[36mpsh\x1b[0m (Playground Shell)\n');
  write('Type \x1b[33mhelp\x1b[0m for a list of available commands.\n\n');
}
