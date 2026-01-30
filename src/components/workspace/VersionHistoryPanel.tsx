import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  RotateCcw, 
  Eye, 
  X, 
  Clock,
  FileCode,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface FileVersion {
  id: string;
  version_number: number;
  label: string | null;
  files: Array<{ path: string; content: string }>;
  preview_html: string | null;
  created_at: string;
}

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versions: FileVersion[];
  currentVersion: number;
  onPreviewVersion: (version: FileVersion) => void;
  onRestoreVersion: (version: FileVersion) => void;
  isRestoring?: boolean;
}

export default function VersionHistoryPanel({
  isOpen,
  onClose,
  versions,
  currentVersion,
  onPreviewVersion,
  onRestoreVersion,
  isRestoring = false,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<FileVersion | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<FileVersion | null>(null);
  const [previewingVersion, setPreviewingVersion] = useState<FileVersion | null>(null);

  const handlePreview = (version: FileVersion) => {
    setPreviewingVersion(version);
    onPreviewVersion(version);
  };

  const handleRestoreClick = (version: FileVersion) => {
    setConfirmRestore(version);
  };

  const handleConfirmRestore = () => {
    if (confirmRestore) {
      onRestoreVersion(confirmRestore);
      setConfirmRestore(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Version History</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Version List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {versions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No versions saved yet
                  </div>
                ) : (
                  versions.map((version) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'rounded-lg p-3 cursor-pointer transition-colors border',
                        version.version_number === currentVersion
                          ? 'bg-primary/10 border-primary/30'
                          : selectedVersion?.id === version.id
                          ? 'bg-muted border-border'
                          : 'bg-transparent border-transparent hover:bg-muted/50'
                      )}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                              v{version.version_number}
                            </span>
                            {version.version_number === currentVersion && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium mt-1 truncate">
                            {version.label || `Version ${version.version_number}`}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {selectedVersion?.id === version.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 mt-3 border-t border-border">
                              {/* Files list */}
                              <div className="mb-3">
                                <p className="text-xs text-muted-foreground mb-1.5">
                                  {version.files.length} file{version.files.length !== 1 ? 's' : ''}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {version.files.slice(0, 4).map((file) => (
                                    <span
                                      key={file.path}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono"
                                    >
                                      {file.path.split('/').pop()}
                                    </span>
                                  ))}
                                  {version.files.length > 4 && (
                                    <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                                      +{version.files.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1 flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreview(version);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                  Preview
                                </Button>
                                {version.version_number !== currentVersion && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-7 text-xs gap-1 flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRestoreClick(version);
                                    }}
                                    disabled={isRestoring}
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                    Restore
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Preview indicator */}
            <AnimatePresence>
              {previewingVersion && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="border-t border-border p-3 bg-amber-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-amber-500">
                        Previewing v{previewingVersion.version_number}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setPreviewingVersion(null)}
                    >
                      Exit Preview
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!confirmRestore} onOpenChange={() => setConfirmRestore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Restore Version {confirmRestore?.version_number}?
            </DialogTitle>
            <DialogDescription>
              This will replace your current files with the files from version {confirmRestore?.version_number}.
              Your current work will be saved as a new version before restoring.
            </DialogDescription>
          </DialogHeader>
          
          {confirmRestore && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Files to restore:
              </p>
              <div className="flex flex-wrap gap-1">
                {confirmRestore.files.map((file) => (
                  <span
                    key={file.path}
                    className="text-xs px-2 py-1 rounded bg-muted font-mono flex items-center gap-1"
                  >
                    <FileCode className="h-3 w-3" />
                    {file.path.split('/').pop()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRestore(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRestore} disabled={isRestoring}>
              {isRestoring ? 'Restoring...' : 'Restore Version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
