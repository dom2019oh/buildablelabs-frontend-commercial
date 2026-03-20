const IS_PROD = window.location.hostname === 'buildablelabs.dev' || window.location.hostname === 'www.buildablelabs.dev';
const DASHBOARD_ORIGIN = IS_PROD ? 'https://dashboard.buildablelabs.dev' : '';

/** Full URL to the dashboard (or relative path on local/subdomain) */
export function getDashboardUrl(path = '') {
  return `${DASHBOARD_ORIGIN}/dashboard${path}`;
}

/** Full URL to login page */
export function getLoginUrl() {
  return `${DASHBOARD_ORIGIN}/log-in`;
}

/** Full URL to sign up page */
export function getSignUpUrl() {
  return `${DASHBOARD_ORIGIN}/sign-up`;
}

/** Redirects to dashboard — uses window.location for cross-domain */
export function redirectToDashboard(path = '') {
  const url = getDashboardUrl(path);
  if (url.startsWith('http')) {
    window.location.href = url;
  }
  return url;
}
