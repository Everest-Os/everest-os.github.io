/**
 * Notification System
 * Lightweight, toast-style notifications for Everest OS.
 */
import { IconHelper } from './iconHelper.js';

let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.id = 'os-notification-center';
  container.style.cssText = `
    position: fixed;
    bottom: calc(var(--panel-height) + 20px);
    right: 20px;
    z-index: 99999;
    display: flex;
    flex-direction: column-reverse;
    gap: 12px;
    pointer-events: none;
    max-width: 360px;
  `;
  // Adjust for panel placement
  const isTop = getComputedStyle(document.documentElement).getPropertyValue('--panel-margin-y') === '0';
  // (Actually runtime sets panel css variables like --panel-height, assume bottom unless main.js explicitly passes config)
  document.body.appendChild(container);
  return container;
}

export function showNotification({
  title = 'Notification',
  message = '',
  icon = 'info,ℹ️',
  duration = 5000,
  action = null,
  actionText = 'View'
}) {
  const host = ensureContainer();

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: var(--bg-elevated);
    backdrop-filter: blur(18px) saturate(160%);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    padding: 16px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
    pointer-events: auto;
    cursor: default;
    transform: translateX(120%);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    color: var(--text-primary);
    font-family: system-ui, sans-serif;
  `;

  toast.innerHTML = `
    <div class="notif-icon" style="font-size: 24px; flex-shrink: 0; background: rgba(255,255,255,0.1); border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
      ${IconHelper.getIcon(icon, { size: 24 })}
    </div>
    <div style="flex: 1; min-width: 0;">
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #fff;">${title}</div>
      <div style="font-size: 13px; color: rgba(255, 255, 255, 0.7); line-height: 1.4; word-wrap: break-word;">${message}</div>
      ${action ? `<button class="notif-action" style="margin-top: 10px; background: var(--accent); border: none; color: #fff; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">${actionText}</button>` : ''}
    </div>
    <button class="notif-close" style="background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 16px; padding: 0; line-height: 1;">✕</button>
  `;

  const close = () => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 400);
  };

  toast.querySelector('.notif-close').onclick = close;

  if (action) {
    toast.querySelector('.notif-action').onclick = (e) => {
      e.stopPropagation();
      action();
      close();
    };
  }

  host.appendChild(toast);

  // Force layout recalculation to trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  if (duration > 0) {
    setTimeout(close, duration);
  }
}
