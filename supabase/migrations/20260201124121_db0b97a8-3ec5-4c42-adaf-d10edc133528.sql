-- Step 1: Create all enums first
CREATE TYPE public.workspace_status AS ENUM ('initializing', 'ready', 'generating', 'error', 'archived');
CREATE TYPE public.generation_session_status AS ENUM ('pending', 'planning', 'scaffolding', 'generating', 'validating', 'completed', 'failed');
CREATE TYPE public.file_operation_type AS ENUM ('create', 'update', 'delete', 'rename', 'move');

-- Step 2: Create workspaces table
CREATE TABLE public.workspaces (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status public.workspace_status NOT NULL DEFAULT 'initializing',
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_url TEXT,
    preview_status TEXT DEFAULT 'stopped',
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(project_id)
);

-- Step 3: Create workspace_files table
CREATE TABLE public.workspace_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    file_path TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    file_type TEXT,
    size_bytes INTEGER DEFAULT 0,
    hash TEXT,
    is_generated BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, file_path)
);

-- Step 4: Create generation_sessions table (before file_operations since it references this)
CREATE TABLE public.generation_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    prompt TEXT NOT NULL,
    status public.generation_session_status NOT NULL DEFAULT 'pending',
    plan JSONB DEFAULT NULL,
    plan_created_at TIMESTAMP WITH TIME ZONE,
    files_planned INTEGER DEFAULT 0,
    files_generated INTEGER DEFAULT 0,
    validation_passed BOOLEAN,
    validation_errors JSONB DEFAULT '[]'::jsonb,
    model_used TEXT,
    tokens_used INTEGER DEFAULT 0,
    credits_used NUMERIC(10, 2) DEFAULT 0,
    duration_ms INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 5: Create file_operations table
CREATE TABLE public.file_operations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.generation_sessions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    operation public.file_operation_type NOT NULL,
    file_path TEXT NOT NULL,
    previous_content TEXT,
    new_content TEXT,
    previous_path TEXT,
    ai_model TEXT,
    ai_reasoning TEXT,
    validated BOOLEAN NOT NULL DEFAULT false,
    validation_errors JSONB DEFAULT '[]'::jsonb,
    applied BOOLEAN NOT NULL DEFAULT false,
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 6: Enable RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_operations ENABLE ROW LEVEL SECURITY;