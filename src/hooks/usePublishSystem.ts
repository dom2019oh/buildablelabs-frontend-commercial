import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useCredits } from './useCredits';
import { toast } from './use-toast';

export type ProjectState = 'draft' | 'preview' | 'publishing' | 'live';

export interface PublishState {
  projectId: string;
  state: ProjectState;
  draftVersion: number;
  liveVersion: number | null;
  lastPublishedAt: string | null;
  deployedUrl: string | null;
}

export interface PublishResult {
  success: boolean;
  deployedUrl?: string;
  error?: string;
}

function generateSubdomain(projectName: string): string {
  return projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 63);
}

function generateProjectUrl(subdomain: string): string {
  return `https://${subdomain}.buildablelabs.dev`;
}

function generateBrandingScript(): string {
  return `
<!-- Buildable Labs Branding - Free Plan -->
<style>
  .buildable-badge {
    position: fixed;
    bottom: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    border-radius: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .buildable-badge:hover { transform: translateY(-2px); }
  .buildable-badge-logo { width: 20px; height: 20px; border-radius: 4px; }
  .buildable-badge-text { color: #fff; font-size: 12px; font-weight: 500; text-decoration: none; }
  .buildable-badge-text:hover { text-decoration: underline; }
</style>
<div class="buildable-badge">
  <img src="https://buildablelabs.dev/logo.png" alt="Buildable" class="buildable-badge-logo" />
  <a href="https://buildablelabs.dev?ref=badge" target="_blank" rel="noopener noreferrer" class="buildable-badge-text">
    Built with Buildable Labs
  </a>
</div>
`;
}

function injectBranding(html: string, shouldInject: boolean): string {
  if (!shouldInject) return html;
  return html.replace('</body>', `${generateBrandingScript()}\n</body>`);
}

function tsToString(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return String(ts);
}

export function usePublishSystem(projectId: string | undefined) {
  const { user } = useAuth();
  const { subscription } = useCredits();
  const queryClient = useQueryClient();
  const [publishState, setPublishState] = useState<ProjectState>('draft');

  const isFreeplan = !subscription || subscription.plan_type === 'free';

  // Fetch project from Firestore (source of truth)
  const { data: project, isLoading } = useQuery({
    queryKey: ['project-publish-state', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const snap = await getDoc(doc(db, 'projects', projectId));
      if (!snap.exists()) return null;
      const d = snap.data();
      return {
        id: snap.id,
        ...d,
        created_at: tsToString(d.created_at),
        updated_at: tsToString(d.updated_at),
      };
    },
    enabled: !!projectId,
  });

  // Publish — uploads to Firebase Storage, updates Firestore
  const publishMutation = useMutation({
    mutationFn: async (previewHtml: string): Promise<PublishResult> => {
      if (!projectId || !user || !project) throw new Error('Missing required data');

      setPublishState('publishing');

      const subdomain    = generateSubdomain(project.name);
      const deployedUrl  = generateProjectUrl(subdomain);
      const productionHtml = injectBranding(previewHtml, isFreeplan);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `published-sites/${user.uid}/${projectId}/index.html`);
      const htmlBlob   = new Blob([productionHtml], { type: 'text/html' });
      await uploadBytes(storageRef, htmlBlob, { contentType: 'text/html' });

      // Update project document in Firestore
      await updateDoc(doc(db, 'projects', projectId), {
        subdomain,
        deployed_url: deployedUrl,
        status: 'ready',
        updated_at: serverTimestamp(),
      });

      // Create build record
      await addDoc(collection(db, 'projectBuilds'), {
        project_id: projectId,
        user_id: user.uid,
        status: 'completed',
        completed_at: serverTimestamp(),
        duration_seconds: 3,
        build_logs: `✓ Build completed\n✓ Uploaded to Firebase Storage\n✓ Deployed to: ${deployedUrl}\n${
          isFreeplan ? '✓ Branding badge injected (Free plan)' : '✓ No branding (Paid plan)'
        }`,
        created_at: serverTimestamp(),
      });

      setPublishState('live');
      return { success: true, deployedUrl };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['project-publish-state', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast({ title: 'Published Successfully!', description: `Your project is live at ${result.deployedUrl}` });
    },
    onError: (error) => {
      setPublishState('draft');
      toast({
        title: 'Publish Failed',
        description: error instanceof Error ? error.message : 'Failed to publish project',
        variant: 'destructive',
      });
    },
  });

  // Unpublish — removes from Firebase Storage, clears Firestore fields
  const unpublishMutation = useMutation({
    mutationFn: async () => {
      if (!projectId || !user) throw new Error('No project ID');

      const storageRef = ref(storage, `published-sites/${user.uid}/${projectId}/index.html`);
      await deleteObject(storageRef).catch(() => {}); // ignore if file doesn't exist

      await updateDoc(doc(db, 'projects', projectId), {
        deployed_url: null,
        subdomain: null,
        updated_at: serverTimestamp(),
      });

      setPublishState('draft');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-publish-state', projectId] });
      toast({ title: 'Project Unpublished', description: 'Your project is no longer live.' });
    },
  });

  const publish   = useCallback((html: string) => publishMutation.mutateAsync(html), [publishMutation]);
  const unpublish = useCallback(() => unpublishMutation.mutateAsync(), [unpublishMutation]);

  return {
    publishState,
    isPublishing:   publishMutation.isPending,
    isUnpublishing: unpublishMutation.isPending,
    isLoading,

    project,
    deployedUrl:  (project as any)?.deployed_url,
    subdomain:    (project as any)?.subdomain,
    isFreeplan,

    publish,
    unpublish,

    generateBrandingScript,
    injectBranding: (html: string) => injectBranding(html, isFreeplan),
  };
}
