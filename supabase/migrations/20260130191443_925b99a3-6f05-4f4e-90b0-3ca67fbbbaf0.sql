-- Create table for file version history
CREATE TABLE public.file_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  label TEXT,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  preview_html TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message_id UUID REFERENCES public.project_messages(id) ON DELETE SET NULL
);

-- Add index for fast lookups
CREATE INDEX idx_file_versions_project ON public.file_versions(project_id, version_number DESC);

-- Enable RLS
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own file versions"
  ON public.file_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own file versions"
  ON public.file_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file versions"
  ON public.file_versions FOR DELETE
  USING (auth.uid() = user_id);

-- Add preview_html column to projects table for persistence
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS preview_html TEXT;