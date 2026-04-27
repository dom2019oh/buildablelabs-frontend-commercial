import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import BlogArticleLayout from '@/components/BlogArticleLayout';

const h1: React.CSSProperties = { fontFamily: "'Geist', sans-serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: 'rgba(255,255,255,0.92)', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 20px' };
const h2: React.CSSProperties = { fontFamily: "'Geist', sans-serif", fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.88)', lineHeight: 1.35, margin: '44px 0 14px' };
const h3: React.CSSProperties = { fontFamily: "'Geist', sans-serif", fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: '24px 0 8px' };
const p: React.CSSProperties = { fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: '0 0 16px' };
const li: React.CSSProperties = { fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '6px' };
const divider: React.CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.07)', margin: '40px 0' };
const faqItem: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px 22px', marginBottom: '12px' };

const comparisonRow = (label: string, template: string, ai: string) => (
  <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <td style={{ padding: '12px 16px 12px 0', fontFamily: "'Geist', sans-serif", fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>{label}</td>
    <td style={{ padding: '12px 16px', fontFamily: "'Geist', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{template}</td>
    <td style={{ padding: '12px 0', fontFamily: "'Geist', sans-serif", fontSize: '13px', color: 'rgba(52,211,153,0.8)' }}>{ai}</td>
  </tr>
);

const FAQ = [
  {
    q: 'What programming language does Buildable Labs use to generate bots?',
    a: 'Buildable generates Python bots using the discord.py library — the most widely used and well-documented Discord library. The code it writes is standard, readable Python that you can export and run independently if needed.',
  },
  {
    q: 'Can AI generate complex bots with databases or external APIs?',
    a: 'Yes. Buildable can generate bots that call external APIs, store data, manage economy systems, handle multi-step workflows, and more. Describe the functionality and the AI will handle the implementation details.',
  },
  {
    q: 'What makes this different from Zapier or Make.com automations?',
    a: 'Zapier and Make are general-purpose automation tools. They don\'t generate native Discord bots — they trigger actions between apps. Buildable writes a real discord.py bot that lives in your server, responds to commands, and reacts to events natively.',
  },
  {
    q: 'Can I see and export the code Buildable generates?',
    a: 'Yes. The full source code is visible in the Buildable workspace. You can read it, copy it, and host it yourself if you prefer — nothing is locked away.',
  },
];

const SOFTWARE_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Buildable Labs',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'AI Discord bot generator — describe your bot in plain English, get working Python discord.py code, deployed and hosted automatically.',
  url: 'https://buildablelabs.dev',
};

const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function AIDiscordBotGenerator() {
  return (
    <BlogArticleLayout>
      <SEOHead
        title="AI Discord Bot Generator — Describe It, Get Working Code | Buildable Labs"
        description="Buildable Labs is an AI Discord bot generator that writes real Python discord.py code from a plain English description. No templates, no drag-and-drop — actual working bots."
        canonical="https://buildablelabs.dev/blog/ai-discord-bot-generator"
        jsonLd={[SOFTWARE_LD, FAQ_LD]}
      />

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '999px', padding: '3px 11px', fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 500, color: 'rgba(253,186,116,0.9)' }}>Product</span>
        <span style={{ fontFamily: "'Geist', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>7 min read</span>
      </div>

      <h1 style={h1}>AI Discord Bot Generator — Describe It, Get Working Code</h1>

      <p style={{ ...p, fontSize: '16px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px' }}>
        There are two types of Discord bot builders. The first type gives you a menu of options and lets you click together a bot from pre-made parts. The second writes a real, custom bot from scratch based on what you describe. Buildable Labs is the second type.
      </p>

      <div style={divider} />

      <h2 style={h2}>What "AI Bot Generator" Actually Means</h2>
      <p style={p}>
        The term gets used loosely, so it's worth being precise. An AI Discord bot generator doesn't give you a template. It doesn't let you fill in a form and generate a slightly customised version of the same bot everyone else has. It writes original code in response to your specific description.
      </p>
      <p style={p}>
        Buildable Labs takes your plain English prompt — however detailed or brief — and uses Claude AI to write a complete Python bot using <code style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '5px', padding: '2px 7px', fontSize: '13px', fontFamily: "'Geist Mono', monospace", color: 'rgba(255,255,255,0.75)' }}>discord.py</code>. That code is then deployed and hosted for you automatically.
      </p>
      <p style={p}>
        The distinction matters: the output is working code, not a configuration file. You're not locked into what a visual interface allows. If you can describe it, Buildable can build it.
      </p>

      <h2 style={h2}>Template Builders vs AI Generation</h2>
      <p style={p}>
        Most Discord bot builders fall into one of three categories. Here's how they compare:
      </p>

      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', margin: '0 0 20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <th style={{ padding: '12px 16px 12px 0', textAlign: 'left', fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}></th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Template / Drag-and-Drop</th>
              <th style={{ padding: '12px 0', textAlign: 'left', fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(52,211,153,0.5)' }}>AI Generation (Buildable)</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRow('Customisation', 'Limited to available options', 'Unlimited — describe anything')}
            {comparisonRow('Output', 'Config or visual workflow', 'Real Python discord.py code')}
            {comparisonRow('Complex logic', 'Often impossible', 'Supported natively')}
            {comparisonRow('Code ownership', 'Usually locked in', 'Fully exportable')}
            {comparisonRow('Hosting', 'Varies', 'Included, 24/7')}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>How Buildable Labs Generates Your Bot</h2>
      <p style={p}>The generation process has three stages:</p>

      <h3 style={h3}>1. Interpret the prompt</h3>
      <p style={p}>
        Claude AI reads your description and breaks it into concrete technical requirements: which Discord events to listen for, what commands to register, what the bot should store, what API calls it needs to make.
      </p>

      <h3 style={h3}>2. Write and validate the code</h3>
      <p style={p}>
        The AI writes the full Python file using <code style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '5px', padding: '2px 7px', fontSize: '13px', fontFamily: "'Geist Mono', monospace", color: 'rgba(255,255,255,0.75)' }}>discord.py</code>. It handles imports, cog structure, error handling, permission checks, and command registration. The code it produces is the same code a developer would write — not auto-generated garbage.
      </p>

      <h3 style={h3}>3. Deploy and host</h3>
      <p style={p}>
        Buildable deploys the bot to its own infrastructure. No Railway, no VPS, no configuration files. Click Deploy, get an invite link, add it to your server.
      </p>

      <h2 style={h2}>What You Can Build</h2>
      <p style={p}>These are examples of bots that Buildable's AI can generate from a single prompt:</p>
      <ul style={{ margin: '0 0 20px', paddingLeft: '22px' }}>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Welcome and role assignment bots</strong> — greet new members, assign roles based on answers to questions</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Moderation systems</strong> — warning counters, auto-mute, anti-spam, keyword filters</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Ticket systems</strong> — /ticket creates a private channel with staff, resolves on close</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Economy bots</strong> — custom currency, /daily reward, /balance, /pay, leaderboards</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>XP and leveling</strong> — message-based or voice-based XP, level-up announcements, role rewards</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Announcement and feed bots</strong> — post updates to a channel on a schedule</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Reaction role systems</strong> — react to a message to get a role</li>
      </ul>
      <p style={p}>
        If it can be done in discord.py, Buildable can write it.
      </p>

      <h2 style={h2}>The Code Is Real — And Yours</h2>
      <p style={p}>
        This is worth emphasising. Some "AI bot builders" generate internal configurations that run on their proprietary platform. You don't own the logic. If the company shuts down, so does your bot.
      </p>
      <p style={p}>
        Buildable generates standard Python code using the open-source discord.py library. You can view the full source at any time from the workspace. You can copy it, host it yourself, or modify it with a developer if you outgrow Buildable's platform.
      </p>

      <h2 style={h2}>Updating and Iterating</h2>
      <p style={p}>
        The same AI that generates your bot is available for updates. Describe the change you want — "add a /giveaway command", "change the embed colour to blue", "add logging to #bot-logs" — and the bot is rebuilt and redeployed. You stay in a conversation with the AI across sessions, so it understands the context of what you've already built.
      </p>

      <div style={divider} />

      <h2 style={{ ...h2, margin: '0 0 20px' }}>Frequently Asked Questions</h2>
      {FAQ.map(f => (
        <div key={f.q} style={faqItem}>
          <h3 style={{ ...h3, margin: '0 0 8px', color: 'rgba(255,255,255,0.8)' }}>{f.q}</h3>
          <p style={{ ...p, margin: 0 }}>{f.a}</p>
        </div>
      ))}

      <div style={divider} />

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '36px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Geist', sans-serif", fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.88)', margin: '0 0 10px' }}>
          Build your Discord bot with AI
        </p>
        <p style={{ ...p, margin: '0 0 24px', color: 'rgba(255,255,255,0.45)' }}>
          Describe what you want. Get working code. Deploy in minutes.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://buildablelabs.dev/sign-up" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: 'rgba(255,255,255,0.95)', color: '#07080d', fontFamily: "'Geist', sans-serif", fontSize: '14px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.04em' }}>
            Start Building Free →
          </a>
          <Link to="/" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Geist', sans-serif", fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
            Learn More
          </Link>
        </div>
      </div>
    </BlogArticleLayout>
  );
}
