-- =============================================
-- BUILDIFY PROJECTS SYSTEM
-- Tables for projects, prompts, and builds
-- =============================================

-- Project status enum
CREATE TYPE public.project_status AS ENUM ('building', 'ready', 'failed');

-- Build status enum
CREATE TYPE public.build_status AS ENUM ('pending', 'building', 'completed', 'failed');

-- Projects table
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'ready',
    is_archived BOOLEAN NOT NULL DEFAULT false,
    deployed_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- Project prompts table
CREATE TABLE public.project_prompts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    prompt_text TEXT NOT NULL,
    response_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_prompts
ALTER TABLE public.project_prompts ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_prompts
CREATE POLICY "Users can view prompts for their projects"
    ON public.project_prompts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create prompts for their projects"
    ON public.project_prompts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
    ON public.project_prompts FOR DELETE
    USING (auth.uid() = user_id);

-- Project builds table
CREATE TABLE public.project_builds (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status build_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    build_logs TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_builds
ALTER TABLE public.project_builds ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_builds
CREATE POLICY "Users can view builds for their projects"
    ON public.project_builds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create builds for their projects"
    ON public.project_builds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own builds"
    ON public.project_builds FOR UPDATE
    USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_prompts_project_id ON public.project_prompts(project_id);
CREATE INDEX idx_project_builds_project_id ON public.project_builds(project_id);
CREATE INDEX idx_project_builds_status ON public.project_builds(status);