import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import BlogArticleLayout from '@/components/BlogArticleLayout';

const h1: React.CSSProperties = {
  fontFamily: "'Geist', sans-serif", fontSize: 'clamp(28px, 5vw, 42px)',
  fontWeight: 800, color: 'rgba(255,255,255,0.92)', lineHeight: 1.2,
  letterSpacing: '-0.02em', margin: '0 0 20px',
};
const h2: React.CSSProperties = {
  fontFamily: "'Geist', sans-serif", fontSize: '20px',
  fontWeight: 700, color: 'rgba(255,255,255,0.88)', lineHeight: 1.35,
  margin: '44px 0 14px',
};
const h3: React.CSSProperties = {
  fontFamily: "'Geist', sans-serif", fontSize: '15px',
  fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: '24px 0 8px',
};
const p: React.CSSProperties = {
  fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '15px',
  color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: '0 0 16px',
};
const li: React.CSSProperties = {
  fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '15px',
  color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '6px',
};
const code: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '6px', padding: '2px 8px', fontSize: '13px',
  fontFamily: "'Geist Mono', monospace", color: 'rgba(255,255,255,0.75)',
};
const divider: React.CSSProperties = {
  borderTop: '1px solid rgba(255,255,255,0.07)', margin: '40px 0',
};
const faqItem: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px', padding: '20px 22px', marginBottom: '12px',
};

const FAQ = [
  {
    q: 'Do I need to install Python or anything on my computer?',
    a: 'No. Buildable Labs handles everything in the cloud. You don\'t install any software locally — the bot is written, built, and hosted entirely on Buildable\'s infrastructure.',
  },
  {
    q: 'Will my bot stay online 24/7?',
    a: 'Yes. Buildable Labs hosts your bot on persistent servers. It stays online without you needing to keep a browser tab open or run anything on your own machine.',
  },
  {
    q: 'Can I add the bot to multiple Discord servers?',
    a: 'Yes. Once deployed, you can generate an invite link and add the same bot to multiple servers. Each server gets the same commands and functionality.',
  },
  {
    q: 'What happens if I want to change something after the bot is live?',
    a: 'Just type what you want to change in the Buildable workspace — for example, "Add a /announce command" — and the bot rebuilds and redeploys automatically. No code editing required.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. Buildable Labs has a free tier that lets you build and deploy a bot. Check the pricing page for current credit limits and plan details.',
  },
];

const SOFTWARE_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Buildable Labs',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'AI-powered Discord bot generator. Describe your bot in plain English and get a fully deployed, hosted Discord bot in minutes — no coding required.',
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

export default function HowToCreateDiscordBotWithoutCoding() {
  return (
    <BlogArticleLayout>
      <SEOHead
        title="How to Create a Discord Bot Without Coding (AI-Powered) | Buildable Labs"
        description="A step-by-step guide to creating a Discord bot without writing any code. Use Buildable Labs to describe what you want, and AI generates and deploys the bot for you."
        canonical="https://buildablelabs.dev/blog/how-to-create-a-discord-bot-without-coding"
        jsonLd={[SOFTWARE_LD, FAQ_LD]}
      />

      {/* Meta */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '999px', padding: '3px 11px', fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 500, color: 'rgba(147,197,253,0.9)' }}>Tutorial</span>
        <span style={{ fontFamily: "'Geist', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>6 min read</span>
      </div>

      <h1 style={h1}>How to Create a Discord Bot Without Coding</h1>

      <p style={{ ...p, fontSize: '16px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px' }}>
        Most guides on building Discord bots assume you already know Python. This one doesn't. You'll have a working, hosted bot live in your server by the end of this page — no code editor, no terminal, no Python installation required.
      </p>

      <div style={divider} />

      <h2 style={h2}>What You Actually Need</h2>
      <p style={p}>Before you start, here's what you need — and nothing else:</p>
      <ul style={{ margin: '0 0 16px', paddingLeft: '22px' }}>
        <li style={li}>A Discord account and admin access to your server</li>
        <li style={li}>A free Buildable Labs account</li>
        <li style={li}>A description of what you want the bot to do (in plain English)</li>
      </ul>
      <p style={p}>
        That's genuinely it. Buildable Labs handles the code generation, hosting, and deployment. You focus on telling it what you want.
      </p>

      <h2 style={h2}>Step 1 — Describe Your Bot</h2>
      <p style={p}>
        Go to <a href="https://buildablelabs.dev" style={{ color: 'rgba(147,197,253,0.85)', textDecoration: 'none' }}>buildablelabs.dev</a> and sign up for a free account. Once you're in the dashboard, you'll see a prompt input at the top of the screen. This is where everything starts.
      </p>
      <p style={p}>
        Type a description of your bot. The more specific you are, the better the result. A vague prompt like "make a welcome bot" works, but a detailed one gets you exactly what you need:
      </p>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px 20px', margin: '0 0 20px', fontFamily: "'Geist Mono', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
        "Create a welcome bot that sends a message in #welcome when someone joins, assigns them the 'Member' role automatically, and posts a goodbye message in #general when someone leaves."
      </div>
      <p style={p}>
        Include: the commands you want, how the bot should respond, which channels it should post in, and any roles it should manage. Think of it like briefing a developer — tell it the outcome, not the code.
      </p>

      <h2 style={h2}>Step 2 — Review the Generated Code</h2>
      <p style={p}>
        Buildable Labs uses Claude AI to write a complete Python bot using <span style={code}>discord.py</span>, the most widely used Discord library. Within a few seconds, you'll see the generated code in the workspace view.
      </p>
      <p style={p}>
        You don't need to read the code — but you can. If something looks wrong or you want to add a feature, type a follow-up instruction in the chat panel: <em style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>"Also add a /rules command that posts an embed with our server rules."</em>
      </p>
      <p style={p}>
        The AI will update the bot in place. You can go back and forth until the bot does exactly what you want.
      </p>

      <h2 style={h2}>Step 3 — Deploy Your Bot</h2>
      <p style={p}>
        When you're happy with what's been generated, click <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Deploy</strong>. Buildable spins up the bot on its own hosting infrastructure — you don't need a VPS, a Railway account, or anything external.
      </p>
      <p style={p}>
        Deployment takes around 30 seconds. Once it's done, the bot status shows as <strong style={{ color: 'rgba(52,211,153,0.9)' }}>Live</strong>. It will stay online 24/7 without any action from you.
      </p>

      <h2 style={h2}>Step 4 — Add the Bot to Your Server</h2>
      <p style={p}>
        After deployment, Buildable generates a Discord invite link for your bot. Copy it, paste it into a new browser tab, and you'll be taken to Discord's standard bot authorization screen.
      </p>
      <p style={p}>
        Select the server you want to add it to, grant the required permissions (Buildable tells you which ones the bot needs), and click Authorize. The bot will appear online in your server within seconds.
      </p>

      <h2 style={h2}>Step 5 — Test It</h2>
      <p style={p}>
        Go to your Discord server and test each command you described. Try the slash commands, check the welcome/leave messages work, verify roles are being assigned. If anything needs adjusting, go back to Buildable and type the change — it rebuilds and redeploys without you having to re-invite the bot.
      </p>

      <h2 style={h2}>Updating the Bot Later</h2>
      <p style={p}>
        Bots need to evolve. New rules get added, your server grows, you want new features. With Buildable, updates follow the same process as creation: describe what you want changed, and the AI updates the existing bot. No file editing, no FTP, no terminal.
      </p>
      <p style={p}>
        Examples of update instructions that work well:
      </p>
      <ul style={{ margin: '0 0 16px', paddingLeft: '22px' }}>
        <li style={li}>"Add a ticket system — /ticket opens a private support channel with the staff role"</li>
        <li style={li}>"Change the welcome message to include the member count"</li>
        <li style={li}>"Add auto-moderation — delete messages containing invite links in all channels except #partnerships"</li>
      </ul>

      <div style={divider} />

      {/* FAQ */}
      <h2 style={{ ...h2, margin: '0 0 20px' }}>Frequently Asked Questions</h2>
      {FAQ.map(f => (
        <div key={f.q} style={faqItem}>
          <h3 style={{ ...h3, margin: '0 0 8px', color: 'rgba(255,255,255,0.8)' }}>{f.q}</h3>
          <p style={{ ...p, margin: 0 }}>{f.a}</p>
        </div>
      ))}

      <div style={divider} />

      {/* CTA */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '36px 32px', textAlign: 'center',
      }}>
        <p style={{ fontFamily: "'Geist', sans-serif", fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.88)', margin: '0 0 10px' }}>
          Ready to build your bot?
        </p>
        <p style={{ ...p, margin: '0 0 24px', color: 'rgba(255,255,255,0.45)' }}>
          Free to start. No credit card needed. Your bot is live in minutes.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://buildablelabs.dev/sign-up" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.95)', color: '#07080d',
            fontFamily: "'Geist', sans-serif", fontSize: '14px', fontWeight: 700,
            textDecoration: 'none', letterSpacing: '0.04em',
          }}>
            Get Started Free →
          </a>
          <Link to="/pricing" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Geist', sans-serif", fontSize: '14px', fontWeight: 500,
            textDecoration: 'none',
          }}>
            View Pricing
          </Link>
        </div>
      </div>
    </BlogArticleLayout>
  );
}
