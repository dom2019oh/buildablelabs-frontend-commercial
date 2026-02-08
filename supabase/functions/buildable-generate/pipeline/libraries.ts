// =============================================================================
// LIBRARIES - Server-side catalog of backgrounds, components, and pages
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export interface LibraryMatch {
  type: "background" | "component" | "page";
  id: string;
  name: string;
  confidence: number;
  code?: string;
  className?: string;
  style?: Record<string, string>;
  path?: string;
  category: string;
}

// =============================================================================
// BACKGROUND LIBRARY (mirrors src/lib/background-library.ts)
// =============================================================================

interface BackgroundEntry {
  id: string;
  name: string;
  category: string;
  className: string;
  style?: Record<string, string>;
}

const BACKGROUNDS: BackgroundEntry[] = [
  {
    id: "purple-pink",
    name: "Purple Pink",
    category: "gradient",
    className: "bg-gradient-to-br from-purple-900 via-zinc-900 to-pink-900",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    category: "gradient",
    className: "bg-gradient-to-br from-blue-900 via-zinc-900 to-cyan-900",
  },
  {
    id: "emerald-teal",
    name: "Emerald Teal",
    category: "gradient",
    className: "bg-gradient-to-br from-emerald-900 via-zinc-900 to-teal-900",
  },
  {
    id: "sunset",
    name: "Sunset",
    category: "gradient",
    className: "bg-gradient-to-br from-orange-900 via-red-900 to-pink-900",
  },
  {
    id: "mesh-gradient",
    name: "Mesh Gradient",
    category: "mesh",
    className: "",
    style: {
      background:
        "radial-gradient(at 40% 20%, hsla(288,80%,42%,0.5) 0px, transparent 50%), " +
        "radial-gradient(at 80% 0%, hsla(340,80%,42%,0.4) 0px, transparent 50%), " +
        "radial-gradient(at 0% 50%, hsla(220,80%,50%,0.3) 0px, transparent 50%), " +
        "radial-gradient(at 80% 100%, hsla(180,80%,40%,0.3) 0px, transparent 50%)",
      backgroundColor: "#0a0a0a",
    },
  },
  {
    id: "dot-pattern",
    name: "Dot Pattern",
    category: "pattern",
    className: "bg-zinc-900",
    style: {
      backgroundImage:
        "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    },
  },
  {
    id: "grid-pattern",
    name: "Grid Pattern",
    category: "pattern",
    className: "bg-zinc-900",
    style: {
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), " +
        "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
      backgroundSize: "30px 30px",
    },
  },
];

// =============================================================================
// COMPONENT LIBRARY (mirrors src/lib/component-library.ts)
// =============================================================================

interface ComponentEntry {
  id: string;
  name: string;
  category: string;
  code: string;
}

const COMPONENTS: ComponentEntry[] = [
  {
    id: "glass-navbar",
    name: "Glass Navbar",
    category: "navbar",
    code: `<nav className="fixed top-0 left-0 w-full bg-white/5 backdrop-blur-xl border-b border-white/10 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
    <span className="font-bold text-lg text-white">Brand</span>
    <div className="hidden md:flex items-center gap-8">
      <a href="#features" className="text-zinc-400 hover:text-white transition">Features</a>
      <a href="#pricing" className="text-zinc-400 hover:text-white transition">Pricing</a>
      <a href="#contact" className="text-zinc-400 hover:text-white transition">Contact</a>
    </div>
    <a href="/sign-up" className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm hover:opacity-90">
      Get Started
    </a>
  </div>
</nav>`,
  },
  {
    id: "gradient-hero",
    name: "Gradient Hero",
    category: "hero",
    code: `<section className="relative py-32 px-4 text-center bg-gradient-to-br from-purple-900/40 via-zinc-900 to-pink-900/30">
  <h1 className="text-5xl md:text-6xl font-bold max-w-3xl mx-auto leading-tight text-white">
    Build Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Amazing</span>
  </h1>
  <p className="text-zinc-400 text-lg md:text-xl mt-6 max-w-xl mx-auto">
    The all-in-one platform to ship your next project in record time.
  </p>
  <div className="mt-8 flex justify-center gap-4">
    <a href="/sign-up" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-white hover:opacity-90">
      Get Started
    </a>
    <a href="/learn-more" className="px-6 py-3 rounded-xl border border-zinc-600 font-semibold text-white hover:bg-zinc-800">
      Learn More
    </a>
  </div>
</section>`,
  },
  {
    id: "bento-features",
    name: "Bento Grid Features",
    category: "features",
    code: `<section className="py-24 px-4 max-w-6xl mx-auto">
  <h2 className="text-3xl font-bold text-center text-white mb-12">Features</h2>
  <div className="grid md:grid-cols-3 gap-6">
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6">
      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">⚡</div>
      <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
      <p className="text-zinc-400 text-sm">Built for speed from the ground up.</p>
    </div>
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6">
      <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4">🔒</div>
      <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
      <p className="text-zinc-400 text-sm">Enterprise-grade security.</p>
    </div>
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6">
      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">✨</div>
      <h3 className="text-lg font-semibold text-white mb-2">AI Powered</h3>
      <p className="text-zinc-400 text-sm">Smart features that learn from you.</p>
    </div>
  </div>
</section>`,
  },
  {
    id: "pricing-cards",
    name: "Pricing Cards",
    category: "pricing",
    code: `<section id="pricing" className="py-24 px-4 max-w-5xl mx-auto">
  <h2 className="text-3xl font-bold text-center text-white mb-12">Pricing</h2>
  <div className="grid md:grid-cols-3 gap-6">
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-white">Free</h3>
      <p className="text-3xl font-bold text-white mt-2">$0</p>
      <ul className="mt-6 space-y-3 text-zinc-400 text-sm flex-1"><li>✓ 1 project</li><li>✓ Community support</li></ul>
      <button className="mt-6 w-full py-3 rounded-lg border border-zinc-600 text-white font-medium hover:bg-zinc-700">Get Started</button>
    </div>
    <div className="bg-gradient-to-b from-purple-900/30 to-zinc-800/60 border border-purple-500/50 rounded-2xl p-6 flex flex-col relative">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">Popular</span>
      <h3 className="text-lg font-semibold text-white">Pro</h3>
      <p className="text-3xl font-bold text-white mt-2">$19<span className="text-sm text-zinc-400">/mo</span></p>
      <ul className="mt-6 space-y-3 text-zinc-400 text-sm flex-1"><li>✓ Unlimited projects</li><li>✓ Priority support</li><li>✓ Advanced analytics</li></ul>
      <button className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90">Upgrade</button>
    </div>
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-white">Enterprise</h3>
      <p className="text-3xl font-bold text-white mt-2">Custom</p>
      <ul className="mt-6 space-y-3 text-zinc-400 text-sm flex-1"><li>✓ Dedicated support</li><li>✓ Custom integrations</li><li>✓ SLA</li></ul>
      <button className="mt-6 w-full py-3 rounded-lg border border-zinc-600 text-white font-medium hover:bg-zinc-700">Contact Sales</button>
    </div>
  </div>
</section>`,
  },
  {
    id: "gradient-cta",
    name: "Gradient CTA",
    category: "cta",
    code: `<section className="py-24 px-4 bg-gradient-to-r from-purple-600/20 via-pink-600/10 to-purple-600/20">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
    <p className="text-zinc-400 mb-8">Join thousands of creators building with us.</p>
    <a href="/sign-up" className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90">
      Start Free Trial
    </a>
  </div>
</section>`,
  },
  {
    id: "simple-footer",
    name: "Simple Footer",
    category: "footer",
    code: `<footer className="py-12 px-4 bg-zinc-900 border-t border-zinc-800">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
    <span className="font-bold text-lg text-white">Brand</span>
    <div className="flex gap-6 text-sm text-zinc-400">
      <a href="/privacy" className="hover:text-white">Privacy</a>
      <a href="/terms" className="hover:text-white">Terms</a>
      <a href="/contact" className="hover:text-white">Contact</a>
    </div>
    <span className="text-zinc-500 text-sm">© 2026 Brand. All rights reserved.</span>
  </div>
</footer>`,
  },
];

// =============================================================================
// PAGE LIBRARY (mirrors src/lib/page-library.ts)
// =============================================================================

interface PageEntry {
  id: string;
  name: string;
  category: string;
  path: string;
  code: string;
}

const PAGES: PageEntry[] = [
  { id: "login-page", name: "Login Page", category: "auth", path: "src/pages/Login.tsx", code: "/* login page template */" },
  { id: "signup-page", name: "Sign Up Page", category: "auth", path: "src/pages/SignUp.tsx", code: "/* signup page template */" },
  { id: "dashboard-page", name: "Dashboard", category: "dashboard", path: "src/pages/Dashboard.tsx", code: "/* dashboard template */" },
  { id: "settings-page", name: "Settings Page", category: "settings", path: "src/pages/Settings.tsx", code: "/* settings template */" },
  { id: "landing-page", name: "Landing Page", category: "landing", path: "src/pages/Index.tsx", code: "/* landing page template */" },
  { id: "not-found-page", name: "404 Page", category: "error", path: "src/pages/NotFound.tsx", code: "/* 404 template */" },
];

// =============================================================================
// CATALOG - All library item names for AI prompt injection
// =============================================================================

export function getLibraryCatalog(): string {
  const bgNames = BACKGROUNDS.map(b => `  - "${b.name}" (${b.category})`).join("\n");
  const compNames = COMPONENTS.map(c => `  - "${c.name}" (${c.category})`).join("\n");
  const pageNames = PAGES.map(p => `  - "${p.name}" (${p.category})`).join("\n");

  return `## AVAILABLE LIBRARY ASSETS

### Backgrounds:
${bgNames}

### Components:
${compNames}

### Page Templates:
${pageNames}

When a user requests any of these by name, use the EXACT code from the library. Do not recreate or improvise.`;
}

// =============================================================================
// FUZZY MATCHING - Find library items from user prompt
// =============================================================================

export function findLibraryMatches(prompt: string): LibraryMatch[] {
  const matches: LibraryMatch[] = [];
  const p = prompt.toLowerCase();

  // Check backgrounds
  for (const bg of BACKGROUNDS) {
    const confidence = scoreMatch(p, bg.id, bg.name, bg.category);
    if (confidence > 0) {
      matches.push({
        type: "background",
        id: bg.id,
        name: bg.name,
        confidence,
        className: bg.className,
        style: bg.style,
        category: bg.category,
      });
    }
  }

  // Check components
  for (const comp of COMPONENTS) {
    const confidence = scoreMatch(p, comp.id, comp.name, comp.category);
    if (confidence > 0) {
      matches.push({
        type: "component",
        id: comp.id,
        name: comp.name,
        confidence,
        code: comp.code,
        category: comp.category,
      });
    }
  }

  // Check pages
  for (const page of PAGES) {
    const confidence = scoreMatch(p, page.id, page.name, page.category);
    if (confidence > 0) {
      matches.push({
        type: "page",
        id: page.id,
        name: page.name,
        confidence,
        code: page.code,
        path: page.path,
        category: page.category,
      });
    }
  }

  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence);
}

// =============================================================================
// SCORING
// =============================================================================

function scoreMatch(prompt: string, id: string, name: string, category: string): number {
  const nameLower = name.toLowerCase();
  const idNorm = id.replace(/-/g, " ");

  // Exact name match
  if (prompt.includes(nameLower)) return 0.95;

  // ID match (e.g., "ocean-blue" or "ocean blue")
  if (prompt.includes(id) || prompt.includes(idNorm)) return 0.9;

  // Partial word match — all words of the name appear in the prompt
  const nameWords = nameLower.split(" ");
  const allWordsPresent = nameWords.every(w => prompt.includes(w));
  if (allWordsPresent && nameWords.length >= 2) return 0.8;

  // Category + adjective match (e.g., "gradient background" matches gradient category)
  const categoryAliases: Record<string, string[]> = {
    gradient: ["gradient", "gradients"],
    mesh: ["mesh"],
    pattern: ["pattern", "dotted", "grid"],
    aurora: ["aurora", "northern lights"],
    navbar: ["navbar", "nav", "navigation", "header"],
    hero: ["hero", "banner", "header section"],
    features: ["features", "feature grid", "bento"],
    pricing: ["pricing", "price", "plans"],
    cta: ["cta", "call to action"],
    footer: ["footer"],
    testimonials: ["testimonials", "reviews", "testimonial"],
    auth: ["auth", "login", "sign in", "sign up", "register"],
    dashboard: ["dashboard", "admin"],
    settings: ["settings", "preferences", "profile"],
    landing: ["landing page", "home page"],
    error: ["404", "not found", "error page"],
  };

  const aliases = categoryAliases[category] || [category];
  if (aliases.some(a => prompt.includes(a))) {
    // Category match — lower confidence unless name words also partially match
    const partialMatch = nameWords.some(w => prompt.includes(w));
    return partialMatch ? 0.6 : 0.3;
  }

  return 0;
}

// =============================================================================
// GET FULL CODE FOR A MATCH
// =============================================================================

export function getLibraryCode(match: LibraryMatch): string {
  if (match.type === "background") {
    const bg = BACKGROUNDS.find(b => b.id === match.id);
    if (!bg) return "";

    if (bg.style) {
      const styleStr = Object.entries(bg.style)
        .map(([k, v]) => `${k}: '${v}'`)
        .join(", ");
      return `className="${bg.className}" style={{${styleStr}}}`;
    }
    return `className="${bg.className}"`;
  }

  if (match.type === "component") {
    const comp = COMPONENTS.find(c => c.id === match.id);
    return comp?.code || "";
  }

  if (match.type === "page") {
    const page = PAGES.find(p => p.id === match.id);
    return page?.code || "";
  }

  return "";
}
