// Usage: node scripts/read-logs.mjs [limit] [--clear]
// Fetches recent debug logs from the Buildable backend and prints them.

const SECRET = 'buildable-debug-2026';
const BASE   = 'https://api.buildablelabs.dev';
const ROUTE  = '/api/internal/logs';
const limit  = process.argv.find(a => /^\d+$/.test(a)) ?? '50';
const clear  = process.argv.includes('--clear');

const COLORS = {
  reset:    '\x1b[0m',
  red:      '\x1b[31m',
  yellow:   '\x1b[33m',
  cyan:     '\x1b[36m',
  grey:     '\x1b[90m',
  white:    '\x1b[97m',
  bold:     '\x1b[1m',
};

function color(c, str) { return `${COLORS[c]}${str}${COLORS.reset}`; }

if (clear) {
  const res = await fetch(`${BASE}${ROUTE}/logs`, { method: 'DELETE', headers: { 'x-log-key': SECRET } });
  const data = await res.json();
  console.log(color('cyan', `Cleared ${data.deleted} log entries.`));
  process.exit(0);
}

let data;
try {
  const res = await fetch(`${BASE}${ROUTE}/logs?limit=${limit}`, { headers: { 'x-log-key': SECRET } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  data = await res.json();
} catch (e) {
  console.error(color('red', `Failed to fetch logs: ${e.message}`));
  process.exit(1);
}

if (!data.logs.length) {
  console.log(color('grey', 'No logs found.'));
  process.exit(0);
}

console.log(color('bold', `\n── Buildable Debug Logs (${data.count}) ──────────────────────────\n`));

for (const log of [...data.logs].reverse()) {
  const ts   = new Date(log.timestamp).toLocaleString('en-GB');
  const type = log.type === 'backend_error' ? color('red', '[BE ERROR]')
             : log.type === 'frontend_error' ? color('yellow', '[FE ERROR]')
             : color('cyan', '[BE WARN ]');

  const status = log.status ? color('grey', ` ${log.status}`) : '';
  const path   = color('white', log.path ?? '');
  const uid    = log.userId ? color('grey', ` uid:${log.userId.slice(0, 8)}`) : '';

  console.log(`${color('grey', ts)}  ${type}${status}  ${path}${uid}`);
  console.log(`  ${log.message}`);

  if (log.details?.stack) {
    const stack = String(log.details.stack).split('\n').slice(0, 4).join('\n    ');
    console.log(color('grey', `    ${stack}`));
  }
  console.log();
}
