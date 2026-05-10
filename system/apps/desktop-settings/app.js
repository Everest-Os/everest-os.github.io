/**
 * Desktop Settings App
 */

export function launch(ctx) {
  document.dispatchEvent(new CustomEvent('launch-app', {
    detail: { id: 'system-settings', args: ['desktop'] }
  }));
}
