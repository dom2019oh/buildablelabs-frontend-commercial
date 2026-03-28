import { useState } from 'react';

const FONT = "'Geist', 'DM Sans', sans-serif";
const SYNE = "'Syne', sans-serif";

// ── SVG components ─────────────────────────────────────────────────────────────
function StackSVG({ color = '#ffffff' }: { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 29" fill="none" style={{ width: '100%', height: '100%' }}>
      <rect x="0" y="0"  width="36" height="7" rx="3.5" fill={color} />
      <rect x="0" y="11" width="26" height="7" rx="3.5" fill={color} />
      <rect x="0" y="22" width="16" height="7" rx="3.5" fill={color} />
    </svg>
  );
}

function GradientStack({ from, to, uid }: { from: string; to: string; uid: string }) {
  return (
    <svg viewBox="0 0 36 29" fill="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="36" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0"  width="36" height="7" rx="3.5" fill={`url(#${uid})`} />
      <rect x="0" y="11" width="26" height="7" rx="3.5" fill={`url(#${uid})`} />
      <rect x="0" y="22" width="16" height="7" rx="3.5" fill={`url(#${uid})`} />
    </svg>
  );
}

// ── Download helpers ───────────────────────────────────────────────────────────
function makeSolidSVG(fill: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 29" fill="none"><rect x="0" y="0" width="36" height="7" rx="3.5" fill="${fill}"/><rect x="0" y="11" width="26" height="7" rx="3.5" fill="${fill}"/><rect x="0" y="22" width="16" height="7" rx="3.5" fill="${fill}"/></svg>`;
}

function makeGradientSVG(from: string, to: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 29" fill="none"><defs><linearGradient id="g" x1="0" y1="0" x2="36" y2="29" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect x="0" y="0" width="36" height="7" rx="3.5" fill="url(#g)"/><rect x="0" y="11" width="26" height="7" rx="3.5" fill="url(#g)"/><rect x="0" y="22" width="16" height="7" rx="3.5" fill="url(#g)"/></svg>`;
}

function downloadSVG(svgContent: string, filename: string, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 29 / 36);
  const ctx = canvas.getContext('2d')!;
  const img = new Image();
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.download = filename;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = url;
}

function DownloadBtn({ svgContent, filename, size = 512, label }: { svgContent: string; filename: string; size?: number; label?: string }) {
  return (
    <button
      onClick={() => downloadSVG(svgContent, filename, size)}
      style={{
        background: 'rgb(30,30,30)', border: '1px solid rgb(39,39,37)',
        color: 'rgb(197,193,186)', borderRadius: '8px', padding: '8px 16px',
        fontSize: '12px', cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgb(44,44,44)'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgb(30,30,30)'; e.currentTarget.style.color = 'rgb(197,193,186)'; }}
    >
      ↓ {label ?? filename}
    </button>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
const SOLID_COLOURS = [
  { label: 'White',   hex: '#ffffff', darkBg: true  },
  { label: 'Black',   hex: '#0c0c0c', darkBg: false },
  { label: 'Violet',  hex: '#7c3aed', darkBg: true  },
  { label: 'Indigo',  hex: '#4f46e5', darkBg: true  },
  { label: 'Blue',    hex: '#2563eb', darkBg: true  },
  { label: 'Sky',     hex: '#0ea5e9', darkBg: true  },
  { label: 'Cyan',    hex: '#06b6d4', darkBg: true  },
  { label: 'Teal',    hex: '#14b8a6', darkBg: true  },
  { label: 'Green',   hex: '#22c55e', darkBg: true  },
  { label: 'Lime',    hex: '#84cc16', darkBg: true  },
  { label: 'Yellow',  hex: '#eab308', darkBg: true  },
  { label: 'Orange',  hex: '#f97316', darkBg: true  },
  { label: 'Red',     hex: '#ef4444', darkBg: true  },
  { label: 'Pink',    hex: '#ec4899', darkBg: true  },
  { label: 'Rose',    hex: '#f43f5e', darkBg: true  },
  { label: 'Slate',   hex: '#64748b', darkBg: true  },
];

const GRADIENT_PRESETS = [
  { label: 'Purple → Indigo', from: '#a78bfa', to: '#6366f1' },
  { label: 'Blue → Cyan',     from: '#60a5fa', to: '#06b6d4' },
  { label: 'Pink → Violet',   from: '#f472b6', to: '#a855f7' },
  { label: 'Green → Teal',    from: '#34d399', to: '#0891b2' },
  { label: 'Orange → Red',    from: '#fb923c', to: '#ef4444' },
  { label: 'Gold → Amber',    from: '#fbbf24', to: '#f97316' },
  { label: 'Indigo → Pink',   from: '#818cf8', to: '#f472b6' },
  { label: 'Teal → Blue',     from: '#2dd4bf', to: '#3b82f6' },
  { label: 'Rose → Orange',   from: '#fb7185', to: '#fb923c' },
  { label: 'Violet → Sky',    from: '#8b5cf6', to: '#38bdf8' },
  { label: 'Lime → Cyan',     from: '#a3e635', to: '#22d3ee' },
  { label: 'Red → Pink',      from: '#f87171', to: '#e879f9' },
];

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LogoPreview() {
  const [gradFrom, setGradFrom] = useState('#a78bfa');
  const [gradTo, setGradTo]     = useState('#6366f1');
  const [direction, setDirection] = useState<'diagonal' | 'horizontal' | 'vertical'>('diagonal');

  const gradAttrs = {
    diagonal:   { x1: '0', y1: '0', x2: '36', y2: '29' },
    horizontal: { x1: '0', y1: '14.5', x2: '36', y2: '14.5' },
    vertical:   { x1: '18', y1: '0', x2: '18', y2: '29' },
  }[direction];

  const customGradSVG = (() => {
    const { x1, y1, x2, y2 } = gradAttrs;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 29" fill="none"><defs><linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${gradFrom}"/><stop offset="100%" stop-color="${gradTo}"/></linearGradient></defs><rect x="0" y="0" width="36" height="7" rx="3.5" fill="url(#g)"/><rect x="0" y="11" width="26" height="7" rx="3.5" fill="url(#g)"/><rect x="0" y="22" width="16" height="7" rx="3.5" fill="url(#g)"/></svg>`;
  })();

  return (
    <div style={{ background: '#0c0c0c', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '72px', padding: '72px 40px', fontFamily: FONT }}>

      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        Buildable Labs — Stack Mark
      </p>

      {/* ── Core variants ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Swatch bg="#161616" bordered label="White — on dark">
          <StackSVG color="#ffffff" />
        </Swatch>
        <Swatch bg="#ffffff" lightBg label="Black — on white">
          <StackSVG color="#0c0c0c" />
        </Swatch>
        <Swatch bg="#161616" bordered label="Purple/Indigo gradient">
          <GradientStack from="#a78bfa" to="#6366f1" uid="core" />
        </Swatch>
      </div>

      {/* ── Solid colours ─────────────────────────────────────────── */}
      <Divider label="Solid colours" />
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
        {SOLID_COLOURS.map(({ label, hex, darkBg }) => (
          <div key={hex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 88, height: 88, borderRadius: 16,
                background: darkBg ? '#161616' : '#ffffff',
                border: darkBg ? '1px solid rgb(39,39,37)' : '1px solid #e5e5e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22,
                cursor: 'pointer',
              }}
              onClick={() => downloadSVG(makeSolidSVG(hex), `buildable-stack-${label.toLowerCase()}.png`)}
              title={`Download ${label}`}
            >
              <StackSVG color={hex} />
            </div>
            <span style={{ color: 'rgb(155,152,147)', fontSize: 11 }}>{label}</span>
            <span style={{ color: 'rgb(80,78,76)', fontSize: 10, fontFamily: 'monospace' }}>{hex}</span>
          </div>
        ))}
      </div>

      {/* ── Gradient presets ──────────────────────────────────────── */}
      <Divider label="Gradient presets" />
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
        {GRADIENT_PRESETS.map(({ label, from, to }, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 88, height: 88, borderRadius: 16, background: '#161616',
                border: '1px solid rgb(39,39,37)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22,
                cursor: 'pointer',
              }}
              onClick={() => downloadSVG(makeGradientSVG(from, to), `buildable-stack-${label.replace(/ → /g, '-to-').replace(/ /g, '-').toLowerCase()}.png`)}
              title={`Download ${label}`}
            >
              <GradientStack from={from} to={to} uid={`preset${i}`} />
            </div>
            <span style={{ color: 'rgb(155,152,147)', fontSize: 11, textAlign: 'center', maxWidth: 90 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Custom gradient builder ────────────────────────────────── */}
      <Divider label="Custom gradient builder" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%', maxWidth: 560 }}>

        {/* Live preview */}
        <div style={{
          width: 180, height: 180, borderRadius: 28, background: '#161616',
          border: '1px solid rgb(39,39,37)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 48,
        }}>
          <svg viewBox="0 0 36 29" fill="none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="custom-live" {...gradAttrs} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={gradFrom} />
                <stop offset="100%" stopColor={gradTo} />
              </linearGradient>
            </defs>
            <rect x="0" y="0"  width="36" height="7" rx="3.5" fill="url(#custom-live)" />
            <rect x="0" y="11" width="26" height="7" rx="3.5" fill="url(#custom-live)" />
            <rect x="0" y="22" width="16" height="7" rx="3.5" fill="url(#custom-live)" />
          </svg>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>

          {/* Color pickers */}
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ color: 'rgb(155,152,147)', fontSize: 12 }}>Start colour</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgb(22,22,22)', border: '1px solid rgb(39,39,37)', borderRadius: 10, padding: '8px 12px' }}>
                <input
                  type="color"
                  value={gradFrom}
                  onChange={e => setGradFrom(e.target.value)}
                  style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 0 }}
                />
                <span style={{ color: 'rgb(197,193,186)', fontSize: 13, fontFamily: 'monospace' }}>{gradFrom}</span>
              </div>
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ color: 'rgb(155,152,147)', fontSize: 12 }}>End colour</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgb(22,22,22)', border: '1px solid rgb(39,39,37)', borderRadius: 10, padding: '8px 12px' }}>
                <input
                  type="color"
                  value={gradTo}
                  onChange={e => setGradTo(e.target.value)}
                  style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 0 }}
                />
                <span style={{ color: 'rgb(197,193,186)', fontSize: 13, fontFamily: 'monospace' }}>{gradTo}</span>
              </div>
            </label>
          </div>

          {/* Direction toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ color: 'rgb(155,152,147)', fontSize: 12 }}>Direction</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['diagonal', 'horizontal', 'vertical'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    fontFamily: FONT, transition: 'all 0.15s', textTransform: 'capitalize',
                    background: direction === d ? 'rgba(255,255,255,0.1)' : 'rgb(22,22,22)',
                    border: direction === d ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgb(39,39,37)',
                    color: direction === d ? '#fff' : 'rgb(155,152,147)',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Quick swap presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ color: 'rgb(155,152,147)', fontSize: 12 }}>Quick presets</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {GRADIENT_PRESETS.slice(0, 6).map(({ label, from, to }, i) => (
                <button
                  key={i}
                  onClick={() => { setGradFrom(from); setGradTo(to); }}
                  style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                    fontFamily: FONT, border: '1px solid rgb(39,39,37)', background: 'rgb(22,22,22)',
                    color: 'rgb(155,152,147)', transition: 'all 0.15s',
                    backgroundImage: `linear-gradient(90deg, ${from}22, ${to}22)`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgb(155,152,147)'; e.currentTarget.style.borderColor = 'rgb(39,39,37)'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Download */}
          <div style={{ display: 'flex', gap: 10 }}>
            <DownloadBtn svgContent={customGradSVG} filename="buildable-stack-custom.png" label="↓ PNG 512px" />
            <DownloadBtn svgContent={customGradSVG} filename="buildable-stack-custom-1024.png" size={1024} label="↓ PNG 1024px" />
            <button
              onClick={() => {
                const blob = new Blob([customGradSVG], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.download = 'buildable-stack-custom.svg';
                a.href = url;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                background: 'rgb(30,30,30)', border: '1px solid rgb(39,39,37)',
                color: 'rgb(197,193,186)', borderRadius: '8px', padding: '8px 16px',
                fontSize: '12px', cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(44,44,44)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(30,30,30)'; e.currentTarget.style.color = 'rgb(197,193,186)'; }}
            >
              ↓ SVG
            </button>
          </div>
        </div>
      </div>

      {/* ── Downloads (standard) ──────────────────────────────────── */}
      <Divider label="Standard downloads" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <p style={{ color: 'rgb(120,116,110)', fontSize: 12, margin: 0 }}>All PNGs have transparent background.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <DownloadBtn svgContent={makeSolidSVG('#ffffff')} filename="buildable-stack-white.png"       label="White 512px" />
          <DownloadBtn svgContent={makeSolidSVG('#0c0c0c')} filename="buildable-stack-black.png"       label="Black 512px" />
          <DownloadBtn svgContent={makeGradientSVG('#a78bfa','#6366f1')} filename="buildable-stack-color.png" label="Color 512px" />
          <DownloadBtn svgContent={makeSolidSVG('#ffffff')} filename="buildable-stack-white-1024.png"  label="White 1024px" size={1024} />
          <DownloadBtn svgContent={makeGradientSVG('#a78bfa','#6366f1')} filename="buildable-stack-color-1024.png" label="Color 1024px" size={1024} />
        </div>
      </div>

      {/* ── Size stress test ──────────────────────────────────────── */}
      <Divider label="Size stress test" />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[16, 24, 32, 48, 64, 96, 128].map(s => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: s, height: Math.round(s * 29 / 36) }}>
              <GradientStack from="#a78bfa" to="#6366f1" uid={`sz${s}`} />
            </div>
            <span style={{ color: 'rgb(80,78,76)', fontSize: 10 }}>{s}</span>
          </div>
        ))}
      </div>

      {/* ── Wordmark ──────────────────────────────────────────────── */}
      <Divider label="Wordmark" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {[32, 48, 64].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: s, height: Math.round(s * 29 / 36) }}>
              <GradientStack from="#a78bfa" to="#6366f1" uid={`wm${s}`} />
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: s * 0.65, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, fontFamily: SYNE, lineHeight: 1 }}>BUILDABLE</p>
              <p style={{ color: 'rgb(100,97,93)', fontSize: s * 0.28, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '3px 0 0' }}>LABS</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── On backgrounds ────────────────────────────────────────── */}
      <Divider label="On backgrounds" />
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { bg: '#0c0c0c', label: 'Brand dark' },
          { bg: '#1c1c1a', label: 'Dashboard' },
          { bg: '#6366f1', label: 'Indigo' },
          { bg: '#ffffff', label: 'White' },
          { bg: '#1a1a2e', label: 'Navy' },
        ].map(({ bg, label }) => (
          <div key={bg} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 100, height: 100, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: bg === '#ffffff' ? '1px solid #eee' : 'none', padding: 24 }}>
              <StackSVG color={bg === '#ffffff' ? '#0c0c0c' : '#ffffff'} />
            </div>
            <span style={{ color: 'rgb(120,116,110)', fontSize: 11 }}>{label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Swatch({ bg, bordered, lightBg, label, children }: {
  bg: string; bordered?: boolean; lightBg?: boolean; label: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 160, height: 160, borderRadius: 24, background: bg,
        border: bordered ? '1px solid rgb(39,39,37)' : lightBg ? '1px solid #e5e5e5' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
      }}>
        {children}
      </div>
      <p style={{ color: 'rgb(220,218,214)', fontSize: 13, fontWeight: 500, margin: 0 }}>{label}</p>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', borderTop: '1px solid rgb(39,39,37)', paddingTop: 28, width: '100%', maxWidth: 900, textAlign: 'center', margin: 0 }}>
      {label}
    </p>
  );
}
