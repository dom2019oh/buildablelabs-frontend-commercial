// =============================================================================
// PLAN STAGE - Architecture Planning
// =============================================================================

import type { PipelineContext, StageResult, ArchitecturePlan } from "../types.ts";
import { callAI } from "../routing.ts";
import { StageTracer } from "../telemetry.ts";

const PLAN_PROMPT = `You are an architect for a website builder. Create implementation plans.

OUTPUT JSON:
{
  "projectType": "landing-page|portfolio|ecommerce|saas",
  "theme": {"primary":"purple","style":"modern"},
  "pages": [{"path":"src/pages/Index.tsx","purpose":"Main page"}],
  "components": [{"path":"src/components/Hero.tsx","features":["image","gradient"]}],
  "routes": ["/"],
  "images": [{"usage":"hero","url":"https://images.unsplash.com/photo-XXX?w=1920&q=80"}]
}

IMAGE IDS BY NICHE:
- Bakery: photo-1509440159596-0249088772ff
- Cafe: photo-1495474472287-4d71bcdd2085
- Restaurant: photo-1517248135467-4c7edcad34c4
- Fitness: photo-1534438327276-14e5300c3a48
- Tech: photo-1551288049-bebda4e38f71
- E-commerce: photo-1472851294608-062f824d29cc
- Portfolio: photo-1558655146-d09347e92766

Always include: Navbar, Hero, Features, Gallery, Testimonials, CTA, Footer.
Return ONLY valid JSON.`;

export async function executePlanStage(ctx: PipelineContext): Promise<StageResult<ArchitecturePlan>> {
  const start = Date.now();
  const tracer = new StageTracer(ctx);
  tracer.stageStart("plan");

  const existing = ctx.existingFiles.length > 0 
    ? ctx.existingFiles.map(f => f.path).join(", ")
    : "None (new project)";

  try {
    const result = await callAI("planning", [
      { role: "system", content: PLAN_PROMPT },
      { role: "user", content: `Request: "${ctx.originalPrompt}"\nExisting: ${existing}\n\nCreate plan.` },
    ], { temperature: 0.3, maxTokens: 2000 });

    tracer.modelCall(result.provider, result.model, "planning", result.latencyMs, result.tokensUsed);

    const match = result.content.match(/\{[\s\S]*\}/);
    if (match) {
      const plan = JSON.parse(match[0]) as ArchitecturePlan;
      plan.projectType = plan.projectType || "landing-page";
      plan.theme = plan.theme || { primary: "purple", style: "modern" };
      plan.pages = plan.pages || [];
      plan.components = plan.components || [];
      plan.routes = plan.routes || ["/"];
      plan.images = plan.images || [];

      tracer.stageComplete("plan", true, Date.now() - start, {});
      return { success: true, data: plan, duration: Date.now() - start, canRetry: true };
    }

    throw new Error("No JSON in response");
  } catch (e) {
    const plan = getDefaultPlan(ctx.originalPrompt);
    tracer.stageComplete("plan", true, Date.now() - start, { metadata: { fallback: true } });
    return { success: true, data: plan, duration: Date.now() - start, canRetry: false };
  }
}

function getDefaultPlan(prompt: string): ArchitecturePlan {
  const p = prompt.toLowerCase();
  let img = "photo-1557683316-973673baf926";
  if (p.includes("bakery")) img = "photo-1509440159596-0249088772ff";
  else if (p.includes("restaurant")) img = "photo-1517248135467-4c7edcad34c4";
  else if (p.includes("fitness")) img = "photo-1534438327276-14e5300c3a48";
  else if (p.includes("tech") || p.includes("saas")) img = "photo-1551288049-bebda4e38f71";
  else if (p.includes("shop")) img = "photo-1472851294608-062f824d29cc";
  else if (p.includes("portfolio")) img = "photo-1558655146-d09347e92766";

  return {
    projectType: "landing-page",
    theme: { primary: "purple", style: "modern" },
    pages: [{ path: "src/pages/Index.tsx", purpose: "Main" }],
    components: [
      { path: "src/components/layout/Navbar.tsx", features: ["logo", "menu"] },
      { path: "src/components/Hero.tsx", features: ["image", "gradient"] },
      { path: "src/components/Features.tsx", features: ["cards"] },
      { path: "src/components/Gallery.tsx", features: ["grid"] },
      { path: "src/components/Testimonials.tsx", features: ["cards"] },
      { path: "src/components/CTA.tsx", features: ["gradient"] },
      { path: "src/components/layout/Footer.tsx", features: ["links"] },
    ],
    routes: ["/"],
    images: [{ usage: "hero", url: `https://images.unsplash.com/${img}?w=1920&q=80` }],
  };
}
