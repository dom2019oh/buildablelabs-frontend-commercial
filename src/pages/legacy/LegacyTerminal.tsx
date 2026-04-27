import { useState, useEffect, useRef } from 'react';
import {
  FolderOpen, Folder, FileText, Terminal, Lock, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, ChevronDown, Shield,
  HardDrive, Cpu, Wifi, Clock, Crown,
} from 'lucide-react';

// ─── Auth credentials ─────────────────────────────────────────────────────────
// Regular users: VITE_LEGACY_ACCESS_KEY (step 1) + VITE_LEGACY_CODE_WORD (step 2)
// Owner bypass:  OWNER_KEY skips both gates and grants elevated access
const ACCESS_KEY  = import.meta.env.VITE_LEGACY_ACCESS_KEY  ?? '';
const CODE_WORD   = import.meta.env.VITE_LEGACY_CODE_WORD   ?? '';
const OWNER_KEY   = '1176071547476262986-2010';
const SESSION_KEY = 'legacy_auth_v1';
const OWNER_FLAG  = 'legacy_owner_v1';

// ─── Boot sequence ────────────────────────────────────────────────────────────
const BOOT_LINES: { text: string; ok?: boolean; bright?: boolean; dim?: boolean; gap?: boolean }[] = [
  { text: 'BUILDABLE LEGACY SYSTEM v2.4.1',                    bright: true  },
  { text: 'Copyright (c) 2024 Buildable Labs. All rights reserved.', dim: true },
  { text: '',                                                    gap: true    },
  { text: 'Initializing kernel modules...',                      dim: true    },
  { text: 'Loading filesystem drivers...               [ OK ]', ok: true     },
  { text: 'Mounting /dev/legacy/vault...               [ OK ]', ok: true     },
  { text: 'Starting authentication services...         [ OK ]', ok: true     },
  { text: 'Verifying vault integrity checksums...      [ OK ]', ok: true     },
  { text: 'Decryption module initialized...            [ OK ]', ok: true     },
  { text: 'Network interface ready...                  [ OK ]', ok: true     },
  { text: '',                                                    gap: true    },
  { text: 'SYSTEM READY.',                                       bright: true },
  { text: '',                                                    gap: true    },
  { text: '  ┌──────────────────────────────────────────────────┐', bright: true },
  { text: '  │   ACCESS RESTRICTED  —  AUTHORIZED ONLY         │', bright: true },
  { text: '  └──────────────────────────────────────────────────┘', bright: true },
  { text: '',                                                    gap: true    },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = 'boot' | 'auth-key' | 'auth-code' | 'vault';

type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
};

// ─── File tree placeholder (content to be populated later) ────────────────────
const FILE_TREE: FileNode[] = [
  {
    id: 'readme',
    name: 'README.md',
    type: 'file',
    content:
`LEGACY VAULT — BUILDABLE LABS
==============================

Welcome to the internal legacy archive.

This system is restricted to authorized personnel only.
Content is currently being migrated into this vault.

Navigate the file tree on the left to browse available documents.

────────────────────────────────────────
  STATUS:  ACTIVE
  CLASSIFICATION: INTERNAL
  LAST UPDATED: 2026-04-17
────────────────────────────────────────`,
  },
  {
    id: 'projects',
    name: 'projects',
    type: 'folder',
    children: [
      {
        id: 'project-atlas',
        name: 'atlas',
        type: 'folder',
        children: [
          {
            id: 'atlas-overview',
            name: 'overview.md',
            type: 'file',
            content: 'ATLAS — OVERVIEW\n================\n\nContent coming soon.',
          },
          {
            id: 'atlas-roadmap',
            name: 'roadmap.md',
            type: 'file',
            content: 'ATLAS — ROADMAP\n===============\n\nContent coming soon.',
          },
        ],
      },
      {
        id: 'project-buildable',
        name: 'buildable',
        type: 'folder',
        children: [
          {
            id: 'buildable-overview',
            name: 'overview.md',
            type: 'file',
            content: 'BUILDABLE LABS — OVERVIEW\n=========================\n\nContent coming soon.',
          },
          {
            id: 'buildable-notes',
            name: 'notes.md',
            type: 'file',
            content: 'BUILDABLE LABS — NOTES\n======================\n\nContent coming soon.',
          },
        ],
      },
    ],
  },
  {
    id: 'archive',
    name: 'archive',
    type: 'folder',
    children: [
      {
        id: 'archive-logs',
        name: 'system-logs.md',
        type: 'file',
        content: 'SYSTEM LOGS\n===========\n\nLog archive coming soon.',
      },
      {
        id: 'archive-history',
        name: 'history.md',
        type: 'file',
        content: 'HISTORY\n=======\n\nHistory archive coming soon.',
      },
    ],
  },
];

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:     '#000000',
  green:  '#00ff41',
  dim:    'rgba(0,255,65,0.30)',
  bright: '#ffffff',
  red:    '#ff3333',
  gold:   '#fbbf24',
  goldDim:'rgba(251,191,36,0.35)',
  border: 'rgba(0,255,65,0.18)',
  font:   "'Courier New', 'Lucida Console', Monaco, 'Andale Mono', monospace",
};

// ─── CSS injected once ────────────────────────────────────────────────────────
const INJECTED_CSS = `
  @keyframes legacy-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .legacy-cursor {
    display: inline-block;
    width: 9px;
    height: 1.1em;
    background: #00ff41;
    animation: legacy-blink 1.1s step-end infinite;
    vertical-align: text-bottom;
    margin-left: 1px;
  }
  .legacy-cursor-owner {
    display: inline-block;
    width: 9px;
    height: 1.1em;
    background: #fbbf24;
    animation: legacy-blink 1.1s step-end infinite;
    vertical-align: text-bottom;
    margin-left: 1px;
  }
  .legacy-tree-item {
    cursor: pointer;
    transition: background 0.08s, color 0.08s;
    user-select: none;
  }
  .legacy-tree-item:hover {
    background: rgba(0,255,65,0.07) !important;
  }
  .legacy-tree-selected {
    background: rgba(0,255,65,0.14) !important;
    color: #ffffff !important;
  }
  .legacy-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
  .legacy-scroll::-webkit-scrollbar-track { background: #000; }
  .legacy-scroll::-webkit-scrollbar-thumb { background: rgba(0,255,65,0.25); border-radius: 2px; }
  body { background: #000 !important; }
`;

// ─── File tree component ──────────────────────────────────────────────────────
function FileTree({
  nodes,
  depth,
  expanded,
  selectedId,
  onToggle,
  onSelect,
}: {
  nodes: FileNode[];
  depth: number;
  expanded: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: FileNode) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        const isFolder   = node.type === 'folder';
        const isOpen     = isFolder && expanded.has(node.id);
        const isSelected = selectedId === node.id;
        const pad        = depth * 14;

        const FolderIcon = isOpen ? FolderOpen : Folder;
        const chevron    = isOpen
          ? <ChevronDown size={10} style={{ color: C.dim, flexShrink: 0 }} />
          : <ChevronRight size={10} style={{ color: C.dim, flexShrink: 0 }} />;

        return (
          <div key={node.id}>
            <div
              className={`legacy-tree-item${isSelected ? ' legacy-tree-selected' : ''}`}
              onClick={() => isFolder ? onToggle(node.id) : onSelect(node)}
              style={{
                fontFamily: C.font,
                fontSize: '12px',
                lineHeight: '1',
                paddingLeft: 12 + pad,
                paddingRight: 12,
                paddingTop: 4,
                paddingBottom: 4,
                color: isSelected ? C.bright : C.green,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {isFolder
                ? <>{chevron}<FolderIcon size={13} style={{ color: isSelected ? C.green : C.dim, flexShrink: 0 }} /></>
                : <><span style={{ width: 10 }} /><FileText size={12} style={{ color: isSelected ? C.green : C.dim, flexShrink: 0 }} /></>
              }
              <span>{node.name}</span>
            </div>
            {isFolder && isOpen && node.children && (
              <FileTree
                nodes={node.children}
                depth={depth + 1}
                expanded={expanded}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LegacyTerminal() {
  const [isOwner, setIsOwner] = useState<boolean>(() => {
    try { return sessionStorage.getItem(OWNER_FLAG) === '1'; }
    catch { return false; }
  });

  const [phase, setPhase] = useState<Phase>(() => {
    try {
      if (sessionStorage.getItem(OWNER_FLAG) === '1') return 'vault';
      return sessionStorage.getItem(SESSION_KEY) === '1' ? 'vault' : 'boot';
    }
    catch { return 'boot'; }
  });

  const [visibleLines, setVisibleLines]     = useState(0);
  const [keyInput, setKeyInput]             = useState('');
  const [codeInput, setCodeInput]           = useState('');
  const [authLines, setAuthLines]           = useState<{ text: string; color?: string }[]>([]);
  const [expanded, setExpanded]             = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode]     = useState<FileNode | null>(null);

  const keyRef     = useRef<HTMLInputElement>(null);
  const codeRef    = useRef<HTMLInputElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Inject CSS once
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = INJECTED_CSS;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  // Boot animation
  useEffect(() => {
    if (phase !== 'boot') return;
    setVisibleLines(0);

    BOOT_LINES.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisibleLines(i + 1);
        if (i === BOOT_LINES.length - 1) {
          const t2 = setTimeout(() => setPhase('auth-key'), 600);
          timersRef.current.push(t2);
        }
      }, i * 75 + (i > 3 ? i * 8 : 0));
      timersRef.current.push(t);
    });

    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  }, [phase]);

  // Focus hidden input on auth phase
  useEffect(() => {
    if (phase === 'auth-key')  { const t = setTimeout(() => keyRef.current?.focus(),  80); return () => clearTimeout(t); }
    if (phase === 'auth-code') { const t = setTimeout(() => codeRef.current?.focus(), 80); return () => clearTimeout(t); }
  }, [phase]);

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleLines, authLines, phase]);

  const submitKey = () => {
    if (!keyInput) return;
    const masked = '*'.repeat(keyInput.length);

    if (keyInput === OWNER_KEY) {
      // Owner bypass — skip second factor, grant elevated access
      setAuthLines(p => [
        ...p,
        { text: `> Access Key: ${masked}` },
        { text: 'Owner credentials recognised.', color: C.gold },
        { text: '' },
        { text: 'OWNER ACCESS GRANTED — Welcome, Dominic S.', color: C.gold },
        { text: 'Bypassing secondary authentication...', color: C.goldDim },
        { text: 'Elevating privileges...', color: C.goldDim },
        { text: '' },
      ]);
      setKeyInput('');
      try {
        sessionStorage.setItem(OWNER_FLAG, '1');
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch { /* ignore */ }
      setIsOwner(true);
      const t = setTimeout(() => setPhase('vault'), 1400);
      timersRef.current.push(t);

    } else if (keyInput === ACCESS_KEY) {
      setAuthLines(p => [
        ...p,
        { text: `> Access Key: ${masked}` },
        { text: 'Key accepted.', color: C.bright },
        { text: '' },
      ]);
      setKeyInput('');
      setPhase('auth-code');

    } else {
      setAuthLines(p => [
        ...p,
        { text: `> Access Key: ${masked}` },
        { text: 'ERROR: Invalid access key.', color: C.red },
        { text: '' },
      ]);
      setKeyInput('');
    }
  };

  const submitCode = () => {
    if (!codeInput) return;
    const masked = '*'.repeat(codeInput.length);
    if (codeInput === CODE_WORD) {
      setAuthLines(p => [
        ...p,
        { text: `> Code Word:  ${masked}` },
        { text: 'Code word accepted.', color: C.bright },
        { text: '' },
        { text: 'Authentication successful.', color: C.bright },
        { text: 'Decrypting vault...', color: C.dim },
        { text: 'Mounting file system...', color: C.dim },
        { text: '' },
      ]);
      setCodeInput('');
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
      const t = setTimeout(() => setPhase('vault'), 1400);
      timersRef.current.push(t);
    } else {
      setAuthLines(p => [
        ...p,
        { text: `> Code Word:  ${masked}` },
        { text: 'ERROR: Invalid code word.', color: C.red },
        { text: '' },
      ]);
      setCodeInput('');
    }
  };

  const toggleFolder = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const focusActive = () => {
    if (phase === 'auth-key')  keyRef.current?.focus();
    if (phase === 'auth-code') codeRef.current?.focus();
  };

  // ── Boot / Auth Screen ───────────────────────────────────────────────────
  if (phase !== 'vault') {
    return (
      <div
        ref={scrollRef}
        onClick={focusActive}
        className="legacy-scroll"
        style={{
          minHeight: '100vh',
          background: C.bg,
          padding: '32px 44px 64px',
          fontFamily: C.font,
          fontSize: '14px',
          color: C.green,
          overflowY: 'auto',
          cursor: 'text',
          boxSizing: 'border-box',
          lineHeight: '1.65',
        }}
      >
        {/* Terminal header icon — shown once boot starts */}
        {visibleLines > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: C.dim }}>
            <Terminal size={14} />
            <span style={{ fontSize: 11, letterSpacing: '0.18em' }}>BUILDABLE LEGACY TERMINAL</span>
          </div>
        )}

        {/* Boot lines */}
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => {
          const hasOk = line.text.includes('[ OK ]');
          const body  = hasOk ? line.text.replace('[ OK ]', '') : line.text;

          return (
            <div
              key={i}
              style={{
                whiteSpace: 'pre',
                color: line.bright ? C.bright
                     : line.dim    ? C.dim
                     : C.green,
                fontWeight: line.bright ? 700 : 400,
                minHeight: line.gap ? '1em' : undefined,
              }}
            >
              {hasOk ? (
                <>
                  <span style={{ color: C.dim }}>{body}</span>
                  <span style={{ color: C.green, fontWeight: 700 }}>[ OK ]</span>
                </>
              ) : line.text}
            </div>
          );
        })}

        {/* Auth log */}
        {authLines.map((line, i) => {
          const isError   = line.color === C.red;
          const isOwnerLine = line.color === C.gold || line.color === C.goldDim;
          const isSuccess = !isOwnerLine && (line.text.includes('accepted') || line.text.includes('successful') || line.text.includes('Loading') || line.text.includes('Mounting') || line.text.includes('Decrypting'));
          return (
            <div key={`a${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: !line.text ? '1em' : undefined, color: line.color ?? C.green }}>
              {isError    && <XCircle      size={12} style={{ color: C.red,   flexShrink: 0 }} />}
              {isOwnerLine && line.text && <Crown    size={12} style={{ color: C.gold, flexShrink: 0 }} />}
              {!isError && !isOwnerLine && isSuccess && <CheckCircle2 size={12} style={{ color: C.bright, flexShrink: 0 }} />}
              {!isError && !isOwnerLine && !isSuccess && line.text && <span style={{ width: 12, flexShrink: 0 }} />}
              <span style={{ whiteSpace: 'pre' }}>{line.text}</span>
            </div>
          );
        })}

        {/* Hidden input for key */}
        {phase === 'auth-key' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Lock size={13} style={{ color: C.dim, flexShrink: 0 }} />
              <span style={{ color: C.dim }}>{'>  '}</span>
              <span>Access Key:&nbsp;</span>
              <span>{'*'.repeat(keyInput.length)}</span>
              <span className="legacy-cursor" />
            </div>
            <div style={{ color: C.dim, fontSize: '11px', marginTop: '10px', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={10} />
              TYPE ACCESS KEY  ·  PRESS ENTER
            </div>
            <input
              ref={keyRef}
              type="text"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitKey(); }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0, width: 1, height: 1 }}
            />
          </>
        )}

        {/* Hidden input for code */}
        {phase === 'auth-code' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Shield size={13} style={{ color: C.dim, flexShrink: 0 }} />
              <span style={{ color: C.dim }}>{'>  '}</span>
              <span>Code Word:&nbsp;&nbsp;</span>
              <span>{'*'.repeat(codeInput.length)}</span>
              <span className="legacy-cursor" />
            </div>
            <div style={{ color: C.dim, fontSize: '11px', marginTop: '10px', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={10} />
              TYPE CODE WORD  ·  PRESS ENTER
            </div>
            <input
              ref={codeRef}
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitCode(); }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0, width: 1, height: 1 }}
            />
          </>
        )}

        {/* Idle cursor during boot */}
        {phase === 'boot' && visibleLines >= BOOT_LINES.length && (
          <div style={{ display: 'flex', alignItems: 'center', height: '1.65em' }}>
            <span className="legacy-cursor" />
          </div>
        )}
      </div>
    );
  }

  // ── Vault Screen ─────────────────────────────────────────────────────────
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  return (
    <div style={{ height: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: C.font, color: C.green, overflow: 'hidden' }}>
      {/* Title bar */}
      <div style={{ height: 38, borderBottom: `1px solid ${isOwner ? 'rgba(251,191,36,0.25)' : C.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 14, flexShrink: 0 }}>
        <Terminal size={13} style={{ color: isOwner ? C.gold : C.green }} />
        <span style={{ fontWeight: 700, letterSpacing: '0.18em', fontSize: 11, color: isOwner ? C.gold : C.green }}>LEGACY VAULT</span>
        <span style={{ color: C.dim, fontSize: 11 }}>BUILDABLE LABS</span>
        {isOwner && (
          <span style={{ fontSize: 10, color: C.goldDim, letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Crown size={10} style={{ color: C.goldDim }} />
            DOMINIC S.
          </span>
        )}
        <div style={{ flex: 1 }} />
        <Cpu       size={11} style={{ color: C.dim }} />
        <span      style={{ color: C.dim, fontSize: 10, letterSpacing: '0.06em' }}>SYS</span>
        <HardDrive size={11} style={{ color: C.dim }} />
        <Wifi      size={11} style={{ color: isOwner ? C.gold : C.green }} />
        <Clock     size={11} style={{ color: C.dim }} />
        <span      style={{ color: C.dim, fontSize: 10, letterSpacing: '0.08em' }}>{now}</span>
        {isOwner ? (
          <>
            <Crown        size={11} style={{ color: C.gold }} />
            <span style={{ color: C.gold, fontSize: 10, letterSpacing: '0.12em', fontWeight: 700 }}>OWNER</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={11} style={{ color: C.green }} />
            <span style={{ color: C.green, fontSize: 10, letterSpacing: '0.12em' }}>AUTHENTICATED</span>
          </>
        )}
        <span className={isOwner ? 'legacy-cursor-owner' : 'legacy-cursor'} style={{ width: 7, height: '0.85em' } as React.CSSProperties} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 220, borderRight: `1px solid ${isOwner ? 'rgba(251,191,36,0.18)' : C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ padding: '7px 12px', fontSize: 9, letterSpacing: '0.22em', color: C.dim, borderBottom: `1px solid rgba(0,255,65,0.09)`, flexShrink: 0, textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6 }}>
            <HardDrive size={10} />
            File System
          </div>
          <div className="legacy-scroll" style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
            <FileTree
              nodes={FILE_TREE}
              depth={0}
              expanded={expanded}
              selectedId={selectedNode?.id ?? null}
              onToggle={toggleFolder}
              onSelect={setSelectedNode}
            />
          </div>
          <div style={{ borderTop: `1px solid rgba(0,255,65,0.09)`, padding: '5px 12px', fontSize: 10, color: C.dim }}>
            {FILE_TREE.length} entries
          </div>
        </div>

        {/* Content pane */}
        <div className="legacy-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {selectedNode ? (
            <>
              {/* File tab */}
              <div style={{ padding: '6px 20px', borderBottom: `1px solid rgba(0,255,65,0.09)`, fontSize: 10, color: C.dim, letterSpacing: '0.14em', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                <FileText size={11} style={{ color: C.green }} />
                <span style={{ color: C.green }}>{selectedNode.name}</span>
                <div style={{ flex: 1 }} />
                <Lock size={9} />
                <span>READ-ONLY</span>
              </div>
              {/* File content */}
              <pre style={{ margin: 0, padding: '28px 28px', fontFamily: C.font, fontSize: 13, color: C.green, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {selectedNode.content}
              </pre>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.dim, gap: 12 }}>
              <FileText size={36} style={{ opacity: 0.2 }} />
              <div style={{ fontSize: 12, letterSpacing: '0.12em' }}>SELECT A FILE TO VIEW CONTENTS</div>
              <div style={{ fontSize: 10, opacity: 0.6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronRight size={10} />use the file tree
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: 22, borderTop: `1px solid ${isOwner ? 'rgba(251,191,36,0.18)' : C.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 10, color: C.dim, gap: 8, flexShrink: 0 }}>
        <Terminal size={9} />
        <span>LEGACY TERMINAL v2.4.1</span>
        {isOwner && <><Crown size={9} style={{ color: C.goldDim }} /><span style={{ color: C.goldDim }}>owner</span></>}
        <div style={{ flex: 1 }} />
        {selectedNode ? (
          <><FileText size={9} /><span>{selectedNode.name}</span></>
        ) : (
          <><AlertCircle size={9} /><span>no file selected</span></>
        )}
      </div>
    </div>
  );
}
