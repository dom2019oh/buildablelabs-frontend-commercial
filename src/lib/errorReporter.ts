// =============================================================================
// Error Reporter — sends frontend errors to the backend debug endpoint
// =============================================================================

import { API_BASE } from './urls';

let _userId: string | null = null;
export const setReporterUser = (uid: string | null) => { _userId = uid; };

function post(message: string, details: Record<string, unknown>) {
  fetch(`${API_BASE}/api/internal/logs/client-error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      path: window.location.pathname,
      url: window.location.href,
      userId: _userId,
      ...details,
    }),
  }).catch(() => { /* never throw */ });
}

export function reportError(message: string, stack?: string, component?: string) {
  post(message, { stack, component });
}

export function initGlobalErrorHandlers() {
  window.onerror = (msg, _src, _line, _col, err) => {
    post(String(msg), { stack: err?.stack });
    return false;
  };
  window.onunhandledrejection = (e) => {
    const msg = e.reason instanceof Error ? e.reason.message : String(e.reason);
    post(`Unhandled promise rejection: ${msg}`, { stack: e.reason?.stack });
  };
}
