// =============================================================================
// WORKSPACE API - AI Generation Gateway
// =============================================================================
// Handles AI generation requests that require server-side API keys.
// CRUD operations are handled directly by the frontend via Supabase SDK.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const MODELS = {
  architect: "google/gemini-2.5-pro",
  code: "google/gemini-2.5-pro",
};

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

const BUILDABLE_IDENTITY = `You are Buildable — a professional AI code architect.

CORE PRINCIPLES:
- Build REAL software, not demos
- Make surgical, minimal changes
- Never break existing functionality
- Use React + TypeScript + Tailwind

FILE STRUCTURE:
- src/pages/ for page components
- src/components/ for reusable components
- src/components/layout/ for Navbar, Footer, etc.
- src/hooks/ for custom hooks
- src/lib/ for utilities

OUTPUT FORMAT:
\`\`\`language:path/to/file.ext
// Complete file content
\`\`\``;

const ARCHITECT_PROMPT = `${BUILDABLE_IDENTITY}

You are the ARCHITECT phase. Analyze the request and create a structured plan.

OUTPUT (JSON only, no markdown):
{
  "understanding": "Brief summary of what user wants",
  "plan": [{"step": 1, "action": "create|update|delete", "path": "src/...", "description": "What this does"}],
  "filesRequired": ["src/file1.tsx", "src/file2.tsx"]
}`;

const CODE_PROMPT = `${BUILDABLE_IDENTITY}

You are the CODE phase. Generate production-ready code.

OUTPUT EACH FILE AS:
\`\`\`tsx:src/path/to/File.tsx
// Complete file content here
\`\`\`

RULES:
- Use Tailwind semantic tokens: bg-background, text-foreground, etc.
- Include ALL imports
- Make responsive with Tailwind classes
- TypeScript with proper types`;

// =============================================================================
// HELPERS
// =============================================================================

function extractFileOperations(response: string) {
  const operations: Array<{
    operation: string;
    file_path: string;
    content: string;
    ai_model: string;
    ai_reasoning: string;
  }> = [];

  const codeBlockRegex = /```(\w+)?:([^\n]+)\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(response)) !== null) {
    const path = match[2].trim();
    const content = match[3];
    if (path && content) {
      operations.push({
        operation: "create",
        file_path: path.replace(/^\/+/, ""),
        content,
        ai_model: MODELS.code,
        ai_reasoning: "Generated from user prompt",
      });
    }
  }

  return operations;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Authenticate user
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: userData, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const body = await req.json();
    const action = body.action;

    console.log(`Workspace API: action=${action}, user=${userId}`);

    // =====================================================================
    // GET OR CREATE WORKSPACE (lightweight fallback)
    // =====================================================================
    if (action === "getOrCreateWorkspace") {
      const { projectId } = body;
      if (!projectId) throw new Error("projectId required");

      const { data: existing } = await supabase
        .from("workspaces")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ workspace: existing }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: workspace, error } = await supabase
        .from("workspaces")
        .insert({ project_id: projectId, user_id: userId, status: "ready" })
        .select()
        .single();

      if (error) throw error;
      return new Response(
        JSON.stringify({ workspace }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================================
    // GET FILES
    // =====================================================================
    if (action === "getFiles") {
      const { workspaceId } = body;
      if (!workspaceId) throw new Error("workspaceId required");

      const { data } = await supabase
        .from("workspace_files")
        .select("id, file_path, content, file_type, is_generated, updated_at")
        .eq("workspace_id", workspaceId)
        .order("file_path");

      return new Response(
        JSON.stringify({ files: data || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================================
    // GET SESSIONS
    // =====================================================================
    if (action === "getSessions") {
      const { workspaceId } = body;
      if (!workspaceId) throw new Error("workspaceId required");

      const { data } = await supabase
        .from("generation_sessions")
        .select("id, prompt, status, files_generated, created_at, completed_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(20);

      return new Response(
        JSON.stringify({ sessions: data || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================================
    // GET OPERATION HISTORY
    // =====================================================================
    if (action === "getOperationHistory") {
      const { workspaceId } = body;
      if (!workspaceId) throw new Error("workspaceId required");

      const { data } = await supabase
        .from("file_operations")
        .select("id, operation, file_path, ai_model, applied, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(50);

      return new Response(
        JSON.stringify({ operations: data || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================================
    // AI GENERATION
    // =====================================================================
    if (action === "generate") {
      const { workspaceId, data: reqData } = body;
      const prompt = reqData?.prompt;

      if (!workspaceId || !prompt) {
        throw new Error("workspaceId and prompt required");
      }

      const apiKey = Deno.env.get("LOVABLE_API_KEY");
      if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

      // Verify workspace access
      const { data: ws, error: wsErr } = await supabase
        .from("workspaces")
        .select("id")
        .eq("id", workspaceId)
        .eq("user_id", userId)
        .single();
      if (wsErr || !ws) throw new Error("Workspace not found");

      // Check credits
      const { data: hasCredits } = await supabase.rpc("user_has_credits", {
        p_user_id: userId,
        p_amount: 0.3,
      });
      if (hasCredits === false) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create session
      const { data: session } = await supabase
        .from("generation_sessions")
        .insert({ workspace_id: workspaceId, user_id: userId, prompt, status: "planning" })
        .select()
        .single();
      const sessionId = session?.id || "";

      try {
        await supabase
          .from("workspaces")
          .update({ status: "generating" })
          .eq("id", workspaceId);

        // Get existing files
        const { data: existingFiles } = await supabase
          .from("workspace_files")
          .select("file_path, content")
          .eq("workspace_id", workspaceId)
          .limit(10);

        let fileContext = "";
        if (existingFiles && existingFiles.length > 0) {
          fileContext = "\n\nEXISTING FILES:\n";
          for (const f of existingFiles) {
            fileContext += `📄 ${f.file_path}:\n\`\`\`\n${f.content.slice(0, 1500)}\n\`\`\`\n`;
          }
        }

        // Phase 1: Architect
        const architectResp = await fetch(LOVABLE_AI_GATEWAY, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: MODELS.architect,
            messages: [
              { role: "system", content: ARCHITECT_PROMPT + fileContext },
              { role: "user", content: prompt },
            ],
            max_tokens: 2000,
            temperature: 0.3,
          }),
        });

        if (!architectResp.ok) throw new Error(`Architect failed: ${await architectResp.text()}`);
        const architectData = await architectResp.json();
        const plan = architectData.choices?.[0]?.message?.content || "";

        await supabase
          .from("generation_sessions")
          .update({ status: "generating", plan: { raw: plan } })
          .eq("id", sessionId);

        // Phase 2: Code Generation
        const codeResp = await fetch(LOVABLE_AI_GATEWAY, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: MODELS.code,
            messages: [
              { role: "system", content: CODE_PROMPT + fileContext },
              { role: "user", content: prompt },
              { role: "assistant", content: `PLAN:\n${plan}` },
              { role: "user", content: "Now generate the complete code following this plan." },
            ],
            max_tokens: 12000,
            temperature: 0.5,
          }),
        });

        if (!codeResp.ok) throw new Error(`Code generation failed: ${await codeResp.text()}`);
        const codeData = await codeResp.json();
        const codeResponse = codeData.choices?.[0]?.message?.content || "";

        const operations = extractFileOperations(codeResponse);

        // Apply file operations
        for (const op of operations) {
          await supabase.from("file_operations").insert({
            workspace_id: workspaceId,
            session_id: sessionId,
            user_id: userId,
            operation: op.operation,
            file_path: op.file_path,
            new_content: op.content,
            ai_model: op.ai_model,
            validated: true,
            applied: true,
            applied_at: new Date().toISOString(),
          });

          await supabase.from("workspace_files").upsert(
            {
              workspace_id: workspaceId,
              user_id: userId,
              file_path: op.file_path,
              content: op.content,
              file_type: op.file_path.split(".").pop() || "txt",
              is_generated: true,
            },
            { onConflict: "workspace_id,file_path" }
          );
        }

        // Complete
        await supabase
          .from("generation_sessions")
          .update({
            status: "completed",
            files_generated: operations.length,
            validation_passed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", sessionId);

        await supabase.from("workspaces").update({ status: "ready" }).eq("id", workspaceId);

        // Deduct credits
        await supabase.rpc("deduct_credits", {
          p_user_id: userId,
          p_action_type: "ai_chat",
          p_description: "AI Generation",
          p_metadata: { workspaceId, filesGenerated: operations.length },
        });

        return new Response(
          JSON.stringify({ success: true, filesGenerated: operations.length, sessionId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        await supabase
          .from("generation_sessions")
          .update({ status: "failed", error_message: String(error), completed_at: new Date().toISOString() })
          .eq("id", sessionId);

        await supabase.from("workspaces").update({ status: "error" }).eq("id", workspaceId);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Workspace API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Unauthorized") ? 401 : message.includes("not found") ? 404 : 500;

    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
