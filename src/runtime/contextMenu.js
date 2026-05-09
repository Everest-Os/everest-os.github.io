/**
 * Shared context menu system for applets and desklets.
 * Creates a native-looking right-click menu with icons, toggles, and separators.
 */

import { IconHelper } from './iconHelper.js';

let _activeContextMenu = null;

export function closeActiveContextMenu() {
  if (_activeContextMenu) {
    _activeContextMenu.remove();
    _activeContextMenu = null;
  }
}

/**
 * Show a context menu at (x, y) with the given items.
 * @param {Array} items - Menu items: { icon, label, action, toggle, danger, disabled, separator }
 * @param {number} x - Client X position
 * @param {number} y - Client Y position
 */
export function showContextMenu(items, x, y, isSubmenu = false, avoidElement = null) {
  if (!isSubmenu) closeActiveContextMenu();

  const menu = document.createElement('div');
  menu.classList.add('desklet-context-menu');
  if (!isSubmenu) {
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
  }

  for (const item of items) {
    if (item.separator) {
      const sep = document.createElement('div');
      sep.classList.add('ctx-separator');
      menu.appendChild(sep);
      continue;
    }

    const row = document.createElement('div');
    row.classList.add('ctx-item');
    if (item.danger) row.classList.add('ctx-danger');
    if (item.disabled) {
      row.classList.add('ctx-disabled');
    }

    const icon = document.createElement('div');
    icon.classList.add('ctx-icon');

    // Use IconHelper to get the icon (handles both emojis and paths)
    if (item.icon) {
      icon.innerHTML = IconHelper.getIcon(item.icon, { size: 16, symbolic: false });
    }


    const label = document.createElement('span');
    label.classList.add('ctx-label');
    label.textContent = item.label;

    row.appendChild(icon);
    row.appendChild(label);

    if (item.toggle !== undefined) {
      const toggle = document.createElement('span');
      toggle.classList.add('ctx-toggle');
      toggle.innerHTML = item.toggle ? IconHelper.getIcon('success,✅', { size: 14 }) : '';
      row.appendChild(toggle);
    }

    if (item.submenu) {
      const arrow = document.createElement('span');
      arrow.classList.add('ctx-arrow');
      arrow.innerHTML = IconHelper.getIcon('next,▶️', { size: 10 });
      row.appendChild(arrow);

      const sub = showContextMenu(item.submenu, 0, 0, true);
      sub.classList.add('ctx-submenu');
      row.appendChild(sub);
    } else if (!item.disabled) {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        closeActiveContextMenu();
        item.action?.();
      });
    }

    menu.appendChild(row);
  }

  if (isSubmenu) return menu;

  document.body.appendChild(menu);
  _activeContextMenu = menu;

  // Synchronously compute size and place menu immediately
  // Use offsetWidth/offsetHeight to ignore the scale/translate animations
  const menuWidth = menu.offsetWidth;
  const menuHeight = menu.offsetHeight;

  let left = x;
  let top = y;

  // Horizontal bounds: don't let it overflow right edge of window
  if (left + menuWidth > window.innerWidth) {
    left = x - menuWidth;
    if (left < 8) left = window.innerWidth - menuWidth - 8;
  } else {
    if (left < 8) left = 8;
  }

  // Vertical bounds:
  let maxBottom = window.innerHeight - 8;
  let originatedFromPanel = false;

  if (avoidElement) {
    let avoidRect = avoidElement.getBoundingClientRect();

    // If the element is inside the panel, we want to clear the entire panel,
    // not just the inner applet, to prevent the menu from overlapping the dock's borders.
    const panelContainer = avoidElement.closest('.everest-panel');
    if (panelContainer) {
      avoidRect = panelContainer.getBoundingClientRect();
    }

    const xOverlaps = !(left + menuWidth < avoidRect.left || left > avoidRect.right);
    if (xOverlaps) {
      if (avoidRect.top > window.innerHeight / 2) {
        originatedFromPanel = true;
        top = avoidRect.top - menuHeight - 4;
      } else {
        originatedFromPanel = true;
        if (top < avoidRect.bottom + 4) {
          top = avoidRect.bottom + 4;
        }
      }
    }
  }

  if (!originatedFromPanel) {
    // Pop upwards from mouse click instead of shifting down when near bottom edge
    if (top + menuHeight > maxBottom) {
      top = y - menuHeight;
      menu.classList.add('ctx-menu-upwards');
    } else {
      menu.classList.add('ctx-menu-downwards');
    }
  } else {
    if (top < y) {
      menu.classList.add('ctx-menu-upwards');
    } else {
      menu.classList.add('ctx-menu-downwards');
    }
  }

  if (top < 8) {
    top = 8;
    if (top + menuHeight > maxBottom) {
      menu.style.maxHeight = (maxBottom - 8) + 'px';
      menu.style.overflowY = 'auto';
    }
  }

  menu.style.left = left + 'px';
  menu.style.top = top + 'px';

  // Close on outside click
  const closer = (e) => {
    if (!menu.contains(e.target)) {
      closeActiveContextMenu();
      document.removeEventListener('mousedown', closer);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closer), 50);
}
