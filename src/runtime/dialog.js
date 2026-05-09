/**
 * Systemwide Dialog Interface
 * Modern, glassmorphic, and highly premium custom modal dialog system.
 */

export function showSystemDialog({
  title = 'System Notification',
  message = '',
  type = 'alert', // 'alert' | 'confirm' | 'prompt'
  confirmText = 'OK',
  cancelText = 'Cancel',
  extraButtonText = null,
  placeholder = '',
  value = '',
  onConfirm = null,
  onCancel = null,
  onExtra = null
}) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0, 0, 0, 0.4)';
  overlay.style.backdropFilter = 'blur(12px)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '100000';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)';

  const dialog = document.createElement('div');
  dialog.style.width = '420px';
  dialog.style.background = 'var(--bg-elevated)';
  dialog.style.backdropFilter = 'blur(24px) saturate(160%)';
  dialog.style.border = '1px solid var(--border)';
  dialog.style.borderRadius = '16px';
  dialog.style.boxShadow = 'var(--shadow-lg)';
  dialog.style.padding = '24px';
  dialog.style.color = 'var(--text-primary)';
  dialog.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  dialog.style.display = 'flex';
  dialog.style.flexDirection = 'column';
  dialog.style.gap = '16px';
  dialog.style.transform = 'scale(0.9) translateY(10px)';
  dialog.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';

  const titleEl = document.createElement('div');
  titleEl.style.fontSize = '16px';
  titleEl.style.fontWeight = '600';
  titleEl.style.color = '#fff';
  titleEl.textContent = title;

  header.appendChild(titleEl);
  dialog.appendChild(header);

  if (message) {
    const desc = document.createElement('div');
    desc.style.fontSize = '13.5px';
    desc.style.color = 'rgba(255, 255, 255, 0.75)';
    desc.style.lineHeight = '1.5';
    desc.style.wordBreak = 'break-word';
    desc.textContent = message;
    dialog.appendChild(desc);
  }

  let input = null;
  if (type === 'prompt') {
    input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder || '';
    input.value = value || '';
    input.style.width = '100%';
    input.style.padding = '10px 14px';
    input.style.borderRadius = '8px';
    input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    input.style.background = 'rgba(0, 0, 0, 0.3)';
    input.style.color = '#fff';
    input.style.fontSize = '14px';
    input.style.outline = 'none';
    input.style.transition = 'border-color 0.2s';
    input.addEventListener('focus', () => { input.style.borderColor = '#3584e4'; });
    input.addEventListener('blur', () => { input.style.borderColor = 'rgba(255, 255, 255, 0.1)'; });
    dialog.appendChild(input);
  }

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '10px';
  btnContainer.style.justifyContent = 'flex-end';
  btnContainer.style.marginTop = '8px';

  const closeDialog = () => {
    window.removeEventListener('keydown', handleKey);
    overlay.style.opacity = '0';
    dialog.style.transform = 'scale(0.9) translateY(10px)';
    setTimeout(() => { overlay.remove(); }, 250);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmBtn.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (type === 'confirm' || type === 'prompt') {
        onCancel?.();
      }
      closeDialog();
    }
  };

  const createButton = (text, isPrimary, onClick) => {
    const btn = document.createElement('button');
    btn.style.padding = '8px 16px';
    btn.style.borderRadius = '8px';
    btn.style.fontSize = '13px';
    btn.style.fontWeight = '500';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.outline = 'none';
    btn.style.transition = 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
    btn.textContent = text;

    if (isPrimary) {
      btn.style.background = 'linear-gradient(135deg, #3584e4, #1b66c9)';
      btn.style.color = '#fff';
      btn.style.boxShadow = '0 2px 8px rgba(53, 132, 228, 0.35)';
      btn.onmouseover = () => { btn.style.transform = 'translateY(-1px)'; btn.style.boxShadow = '0 4px 12px rgba(53, 132, 228, 0.45)'; };
      btn.onmouseout = () => { btn.style.transform = 'translateY(0)'; btn.style.boxShadow = '0 2px 8px rgba(53, 132, 228, 0.35)'; };
    } else {
      btn.style.background = 'var(--bg-hover)';
      btn.style.color = 'var(--text-primary)';
      btn.onmouseover = () => { btn.style.background = 'var(--bg-active)'; btn.style.transform = 'translateY(-1px)'; };
      btn.onmouseout = () => { btn.style.background = 'var(--bg-hover)'; btn.style.transform = 'translateY(0)'; };
    }

    btn.addEventListener('click', () => {
      onClick();
      closeDialog();
    });
    return btn;
  };

  if (extraButtonText) {
    const extraBtn = createButton(extraButtonText, false, () => {
      onExtra?.();
    });
    btnContainer.appendChild(extraBtn);
  }

  if (type === 'confirm' || type === 'prompt') {
    const cancelBtn = createButton(cancelText, false, () => {
      onCancel?.();
    });
    btnContainer.appendChild(cancelBtn);
  }

  const confirmBtn = createButton(confirmText, true, () => {
    if (type === 'prompt') {
      onConfirm?.(input.value);
    } else {
      onConfirm?.();
    }
  });
  btnContainer.appendChild(confirmBtn);

  window.addEventListener('keydown', handleKey);

  dialog.appendChild(btnContainer);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Trigger entering animations
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    dialog.style.transform = 'scale(1) translateY(0)';
    if (input) {
      input.focus();
      input.select();
    }
  });
}
