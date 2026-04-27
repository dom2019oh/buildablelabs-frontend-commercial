// =============================================================================
// CodeEditorTab — Monaco-powered code editor with file tree + save support
// Free users: buildable_core.py is always present and locked
// =============================================================================

import { useState, useMemo, useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Lock, FileCode2, FileText, File, Braces, KeyRound, ChevronRight, Save, Check } from 'lucide-react';

// =============================================================================
// CONSTANTS
// =============================================================================

const F = "'Geist', 'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', 'Fira Mono', 'Consolas', monospace";

// The locked Buildable core file — always injected for free users
export const BUILDABLE_CORE_PATH = 'cogs/buildable_core.py';

export const BUILDABLE_CORE_CONTENT = `# ================================================================
# Buildable Labs Core — Free Plan
# This file is required on the free plan and cannot be modified.
# Upgrade to Pro at buildablelabs.dev to remove this requirement.
# ================================================================

import discord
from discord.ext import commands
from discord import app_commands
import logging

logger = logging.getLogger(__name__)

# Watermark appended to all embed footers on the free plan.
# To remove: upgrade to Pro at buildablelabs.dev
BUILDABLE_FOOTER = "Powered by Buildable Labs • buildablelabs.dev"

class BuildableCore(commands.Cog, name="Buildable"):
    """Buildable Labs integration — included on the free plan."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="buildable", description="About this bot's AI builder")
    async def buildable_info(self, interaction: discord.Interaction):
        """Shows information about Buildable Labs."""
        embed = discord.Embed(
            title="Built with Buildable Labs",
            description=(
                "This bot was built using **[Buildable Labs](https://buildablelabs.dev)** — "
                "the AI-powered Discord bot builder.\\n\\n"
                "Describe your bot in plain English and Buildable writes the code, "
                "sets up the files, and deploys it for you.\\n\\n"
                "**→ buildablelabs.dev**"
            ),
            color=0x5865F2,
        )
        embed.set_footer(text=BUILDABLE_FOOTER)
        await interaction.response.send_message(embed=embed, ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(BuildableCore(bot))
`;

// =============================================================================
// HELPERS
// =============================================================================

function getLang(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    py: 'python', js: 'javascript', ts: 'typescript',
    tsx: 'typescript', jsx: 'javascript', json: 'json',
    md: 'markdown', markdown: 'markdown', txt: 'plaintext',
    yml: 'yaml', yaml: 'yaml', sh: 'shell', css: 'css',
    html: 'html', toml: 'toml', cfg: 'ini', ini: 'ini',
  };
  return map[ext] ?? 'plaintext';
}

function FileIcon({ path, size = 13 }: { path: string; size?: number }) {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const name = path.split('/').pop() ?? '';
  const s = { width: size, height: size, flexShrink: 0 };

  if (name.startsWith('.env')) return <KeyRound style={{ ...s, color: '#f97316' }} />;
  if (ext === 'py')   return <FileCode2 style={{ ...s, color: '#3b82f6' }} />;
  if (ext === 'json') return <Braces style={{ ...s, color: '#22c55e' }} />;
  if (ext === 'md' || ext === 'txt') return <FileText style={{ ...s, color: 'rgba(255,255,255,0.35)' }} />;
  return <File style={{ ...s, color: 'rgba(255,255,255,0.3)' }} />;
}

interface FileEntry {
  path: string;
  content: string;
  locked?: boolean;
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
  file?: FileEntry;
}

function buildTree(files: FileEntry[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const f of files) {
    const parts = f.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;
      let node = current.find(n => n.name === name);

      if (!node) {
        node = {
          name,
          path: parts.slice(0, i + 1).join('/'),
          isDir: !isLast,
          children: [],
          file: isLast ? f : undefined,
        };
        current.push(node);
      }
      current = node.children;
    }
  }

  return root;
}

// =============================================================================
// TREE NODE COMPONENT
// =============================================================================

function TreeEntry({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedPath: string;
  onSelect: (f: FileEntry) => void;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = !node.isDir && selectedPath === node.path;

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            width: '100%', padding: `3px 8px 3px ${8 + depth * 12}px`,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontFamily: MONO, fontSize: 12,
            textAlign: 'left',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronRight style={{
            width: 11, height: 11, flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.12s',
            color: 'rgba(255,255,255,0.3)',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>{node.name}</span>
        </button>
        {open && node.children.map(child => (
          <TreeEntry key={child.path} node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => node.file && onSelect(node.file)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        width: '100%', padding: `3px 8px 3px ${8 + depth * 12}px`,
        background: isSelected ? 'rgba(37,99,235,0.18)' : 'transparent',
        border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 12,
        color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
        textAlign: 'left', borderLeft: isSelected ? '2px solid #2563eb' : '2px solid transparent',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
    >
      <FileIcon path={node.path} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {node.name}
      </span>
      {node.file?.locked && (
        <Lock style={{ width: 10, height: 10, color: '#f97316', flexShrink: 0, opacity: 0.8 }} />
      )}
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface CodeEditorTabProps {
  workspaceFiles: Array<{ file_path: string; content: string }>;
  isFree: boolean;
  onSave?: (newCode: string, filePath: string) => Promise<void>;
}

export default function CodeEditorTab({ workspaceFiles, isFree, onSave }: CodeEditorTabProps) {
  // Merge workspace files + locked core file for free users
  const allFiles: FileEntry[] = useMemo(() => {
    const files: FileEntry[] = workspaceFiles.map(f => ({
      path: f.file_path,
      content: f.content,
      locked: false,
    }));

    if (isFree) {
      const idx = files.findIndex(f => f.path === BUILDABLE_CORE_PATH);
      const coreEntry: FileEntry = { path: BUILDABLE_CORE_PATH, content: BUILDABLE_CORE_CONTENT, locked: true };
      if (idx >= 0) files[idx] = coreEntry;
      else files.push(coreEntry);
    }

    return files;
  }, [workspaceFiles, isFree]);

  const [selected, setSelected] = useState<FileEntry | null>(allFiles[0] ?? null);
  // editedContent tracks unsaved changes per file path
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const tree = useMemo(() => buildTree(allFiles), [allFiles]);

  const currentFile = selected
    ? allFiles.find(f => f.path === selected.path) ?? allFiles[0] ?? null
    : allFiles[0] ?? null;

  // The content currently shown in editor (edited or original)
  const displayContent = currentFile
    ? (editedContent[currentFile.path] ?? currentFile.content)
    : '';

  const hasUnsaved = currentFile
    ? (editedContent[currentFile.path] !== undefined && editedContent[currentFile.path] !== currentFile.content)
    : false;

  const isEmpty = allFiles.length === 0;

  const handleSelect = useCallback((f: FileEntry) => {
    setSelected(f);
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!currentFile || currentFile.locked) return;
    setEditedContent(prev => ({ ...prev, [currentFile.path]: value ?? '' }));
  }, [currentFile]);

  const handleSave = useCallback(async () => {
    if (!currentFile || !onSave || saving) return;
    const content = editedContent[currentFile.path] ?? currentFile.content;
    setSaving(true);
    try {
      await onSave(content, currentFile.path);
      // Clear the unsaved state for this file
      setEditedContent(prev => {
        const next = { ...prev };
        delete next[currentFile.path];
        return next;
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } finally {
      setSaving(false);
    }
  }, [currentFile, editedContent, onSave, saving]);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    // Cmd+S / Ctrl+S to save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
  }, [handleSave]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', borderRadius: 12 }}>

      {/* ── File Tree ── */}
      <div style={{
        width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        {/* Header */}
        <div style={{
          padding: '10px 12px 8px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.25)', fontFamily: F, textTransform: 'uppercase',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          Explorer
        </div>

        {/* Tree */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }} className="custom-scrollbar">
          {isEmpty ? (
            <div style={{ padding: '20px 12px', color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: F, lineHeight: 1.5 }}>
              No files yet.<br />Send a message to generate your bot.
            </div>
          ) : (
            tree.map(node => (
              <TreeEntry
                key={node.path}
                node={node}
                depth={0}
                selectedPath={currentFile?.path ?? ''}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>

        {/* Free plan badge */}
        {isFree && (
          <div style={{
            padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Lock style={{ width: 11, height: 11, color: '#f97316' }} />
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontFamily: F }}>
              1 file locked · Free plan
            </span>
          </div>
        )}
      </div>

      {/* ── Editor ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {currentFile ? (
          <>
            {/* Tab bar */}
            <div style={{
              height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingLeft: 12, paddingRight: 8, gap: 6,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.015)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '3px 10px', borderRadius: 5,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <FileIcon path={currentFile.path} size={12} />
                  <span style={{ fontSize: 12, fontFamily: MONO, color: 'rgba(255,255,255,0.75)' }}>
                    {currentFile.path.split('/').pop()}
                  </span>
                  {currentFile.locked && (
                    <Lock style={{ width: 10, height: 10, color: '#f97316' }} />
                  )}
                </div>
                {hasUnsaved && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                )}
                {currentFile.locked && (
                  <span style={{ fontSize: 11, color: 'rgba(249,115,22,0.7)', fontFamily: F }}>
                    Read-only · Upgrade to Pro to remove
                  </span>
                )}
              </div>

              {/* Save button */}
              {!currentFile.locked && onSave && (
                <button
                  onClick={handleSave}
                  disabled={saving || (!hasUnsaved && !savedFlash)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 5, border: 'none', cursor: hasUnsaved ? 'pointer' : 'default',
                    background: savedFlash ? 'rgba(34,197,94,0.15)' : hasUnsaved ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)',
                    color: savedFlash ? '#4ade80' : hasUnsaved ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                    fontSize: 12, fontFamily: F, fontWeight: 500,
                    transition: 'all 0.15s',
                    border: savedFlash ? '1px solid rgba(34,197,94,0.3)' : hasUnsaved ? '1px solid rgba(37,99,235,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  } as React.CSSProperties}
                >
                  {savedFlash ? (
                    <><Check style={{ width: 11, height: 11 }} /> Saved</>
                  ) : (
                    <><Save style={{ width: 11, height: 11 }} /> Save</>
                  )}
                </button>
              )}
            </div>

            {/* Monaco — key forces remount on file switch so content is always fresh */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Editor
                key={currentFile.path}
                height="100%"
                language={getLang(currentFile.path)}
                value={displayContent}
                theme="vs-dark"
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={{
                  readOnly: currentFile.locked,
                  fontSize: 13,
                  fontFamily: MONO,
                  fontLigatures: true,
                  lineHeight: 22,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: 'gutter',
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  tabSize: 4,
                  wordWrap: 'on',
                  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                  overviewRulerBorder: false,
                }}
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontFamily: F }}>
              Select a file to view
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
