-- Workspaces RLS policies
CREATE POLICY "Users can view their own workspaces"
ON public.workspaces FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspaces"
ON public.workspaces FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspaces"
ON public.workspaces FOR DELETE
USING (auth.uid() = user_id);

-- Workspace files RLS policies
CREATE POLICY "Users can view their own workspace files"
ON public.workspace_files FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workspace files"
ON public.workspace_files FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspace files"
ON public.workspace_files FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspace files"
ON public.workspace_files FOR DELETE
USING (auth.uid() = user_id);

-- Generation sessions RLS policies
CREATE POLICY "Users can view their own generation sessions"
ON public.generation_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generation sessions"
ON public.generation_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation sessions"
ON public.generation_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- File operations RLS policies
CREATE POLICY "Users can view their own file operations"
ON public.file_operations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own file operations"
ON public.file_operations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_workspaces_project_id ON public.workspaces(project_id);
CREATE INDEX idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX idx_workspaces_status ON public.workspaces(status);

CREATE INDEX idx_workspace_files_workspace_id ON public.workspace_files(workspace_id);
CREATE INDEX idx_workspace_files_file_path ON public.workspace_files(file_path);

CREATE INDEX idx_file_operations_workspace_id ON public.file_operations(workspace_id);
CREATE INDEX idx_file_operations_session_id ON public.file_operations(session_id);
CREATE INDEX idx_file_operations_created_at ON public.file_operations(created_at DESC);

CREATE INDEX idx_generation_sessions_workspace_id ON public.generation_sessions(workspace_id);
CREATE INDEX idx_generation_sessions_status ON public.generation_sessions(status);

-- Triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_files_updated_at
BEFORE UPDATE ON public.workspace_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get or create workspace for a project
CREATE OR REPLACE FUNCTION public.get_or_create_workspace(p_project_id UUID, p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workspace_id UUID;
BEGIN
    SELECT id INTO v_workspace_id
    FROM public.workspaces
    WHERE project_id = p_project_id AND user_id = p_user_id;
    
    IF v_workspace_id IS NULL THEN
        INSERT INTO public.workspaces (project_id, user_id, status)
        VALUES (p_project_id, p_user_id, 'ready')
        RETURNING id INTO v_workspace_id;
    END IF;
    
    RETURN v_workspace_id;
END;
$$;

-- Function to apply a file operation
CREATE OR REPLACE FUNCTION public.apply_file_operation(p_operation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_op RECORD;
BEGIN
    SELECT * INTO v_op FROM public.file_operations WHERE id = p_operation_id;
    
    IF v_op IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Operation not found');
    END IF;
    
    IF v_op.applied THEN
        RETURN jsonb_build_object('success', false, 'error', 'Operation already applied');
    END IF;
    
    CASE v_op.operation
        WHEN 'create' THEN
            INSERT INTO public.workspace_files (workspace_id, user_id, file_path, content, file_type, is_generated)
            VALUES (v_op.workspace_id, v_op.user_id, v_op.file_path, v_op.new_content, 
                    split_part(v_op.file_path, '.', -1), true)
            ON CONFLICT (workspace_id, file_path) DO UPDATE SET
                content = EXCLUDED.content,
                updated_at = now();
                
        WHEN 'update' THEN
            UPDATE public.workspace_files
            SET content = v_op.new_content, updated_at = now()
            WHERE workspace_id = v_op.workspace_id AND file_path = v_op.file_path;
            
        WHEN 'delete' THEN
            DELETE FROM public.workspace_files
            WHERE workspace_id = v_op.workspace_id AND file_path = v_op.file_path;
            
        WHEN 'rename', 'move' THEN
            UPDATE public.workspace_files
            SET file_path = v_op.file_path, updated_at = now()
            WHERE workspace_id = v_op.workspace_id AND file_path = v_op.previous_path;
    END CASE;
    
    UPDATE public.file_operations
    SET applied = true, applied_at = now()
    WHERE id = p_operation_id;
    
    RETURN jsonb_build_object('success', true);
END;
$$;