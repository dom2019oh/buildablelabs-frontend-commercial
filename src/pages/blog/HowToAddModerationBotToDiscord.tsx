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

const stepNum = (n: number) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '26px', height: '26px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    fontFamily: "'Geist', sans-serif", fontSize: '12px', fontWeight: 700,
    color: 'rgba(255,255,255,0.6)', flexShrink: 0, marginRight: '12px',
  }}>{n}</span>
);

const FAQ = [
  {
    q: 'Will the moderation bot be online 24/7?',
    a: 'Yes. Buildable Labs hosts the bot on its own infrastructure. It runs continuously without you needing to keep a browser tab open or run anything on your machine.',
  },
  {
    q: 'Can I customise the warning thresholds and mute durations?',
    a: 'Completely. Describe exactly how your warning system should work — for example, "warn on first offense, 1-hour mute on second, 24-hour mute on third, permanent ban on fourth" — and Buildable generates the bot with those exact rules built in.',
  },
  {
    q: 'Can the bot filter specific words or phrases?',
    a: 'Yes. Tell Buildable what words or phrases to filter, which channels to apply the filter to, and what action to take (delete the message, warn the user, or both). The keyword list can be updated later by describing the changes.',
  },
  {
    q: 'What permissions does a moderation bot need?',
    a: 'At minimum: Manage Messages (to delete content), Kick Members, Ban Members, Manage Roles (for mute roles), and View Audit Log. Buildable will list the required permissions when your bot is generated.',
  },
  {
    q: 'Can I have multiple mods use the bot commands?',
    a: 'Yes. You can restrict commands to specific roles — for example, only users with the Moderator or Admin role can use /ban or /mute. Describe your role hierarchy and Buildable will implement the permission checks.',
  },
];

const SOFTWARE_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Buildable Labs',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Build and deploy a custom Discord moderation bot without coding. AI generates warn, mute, ban, and auto-mod systems tailored to your server rules.',
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

export default function HowToAddModerationBotToDiscord() {
  return (
    <BlogArticleLayout>
      <SEOHead
        title="How to Add a Moderation Bot to Discord — No Code Required | Buildable Labs"
        description="Step-by-step guide to adding a custom moderation bot to your Discord server. Warn, mute, ban, keyword filters, and auto-mod — built by AI, no coding needed."
        canonical="https://buildablelabs.dev/blog/how-to-add-a-moderation-bot-to-discord"
        jsonLd={[SOFTWARE_LD, FAQ_LD]}
      />

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '999px', padding: '3px 11px', fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 500, color: 'rgba(147,197,253,0.9)' }}>Tutorial</span>
        <span style={{ fontFamily: "'Geist', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>7 min read</span>
      </div>

      <h1 style={h1}>How to Add a Moderation Bot to Discord — No Code Required</h1>

      <p style={{ ...p, fontSize: '16px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px' }}>
        Moderation bots handle the enforcement work so you don't have to be watching your server around the clock. This guide covers what moderation bots do, why generic options often fall short, and how to build and deploy a custom one in minutes using Buildable Labs.
      </p>

      <div style={divider} />

      <h2 style={h2}>What a Moderation Bot Does</h2>
      <p style={p}>
        A moderation bot automates the enforcement of your server rules. Without one, a moderator has to manually respond to every rule break — which means rule enforcement only happens when a mod is online. A bot works 24/7 and applies rules consistently.
      </p>
      <p style={p}>Here's what a well-configured moderation bot handles:</p>
      <ul style={{ margin: '0 0 20px', paddingLeft: '22px' }}>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Warning system</strong> — issues warnings to users that accumulate over time. Three warnings might trigger an auto-mute; five might result in an automatic ban.</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Mute/unmute</strong> — removes a user's ability to send messages for a specified duration. Good for cooling off arguments.</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Kick and ban</strong> — removes users from the server, with reasons logged for accountability.</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Auto-moderation</strong> — automatically deletes messages containing banned keywords, invite links, or mass mentions (pings).</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Anti-spam</strong> — rate-limits users who send too many messages too quickly.</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Anti-raid</strong> — automatically restricts or bans accounts that join in unusually high numbers in a short period.</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Mod logging</strong> — records every moderation action (who did what, to whom, when, and why) in a private channel.</li>
      </ul>

      <h2 style={h2}>Why Generic Moderation Bots Have Limits</h2>
      <p style={p}>
        MEE6, Dyno, and Carl-bot are popular for a reason — they work well for standard use cases and require no setup beyond clicking through a dashboard. But they have real limitations:
      </p>
      <ul style={{ margin: '0 0 20px', paddingLeft: '22px' }}>
        <li style={li}>Custom command logic is locked behind their premium plans</li>
        <li style={li}>Warning thresholds and mute durations are fixed to whatever their dashboard allows</li>
        <li style={li}>You can't add custom commands or behaviours that aren't in their feature set</li>
        <li style={li}>Auto-mod rules are basic — filtering by word lists but not context</li>
        <li style={li}>Integration with your other bots or server systems is limited or impossible</li>
      </ul>
      <p style={p}>
        If your server has specific needs — a three-strike system with escalating punishments, a custom /report command, channel-specific rules, or a command only your staff team can use — you need a custom bot.
      </p>

      <h2 style={h2}>Building a Custom Moderation Bot with Buildable Labs</h2>
      <p style={p}>
        Buildable Labs lets you describe your moderation system in plain English and generates a complete Python bot that implements exactly what you described. Here's an example prompt:
      </p>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px 20px', margin: '0 0 20px', fontFamily: "'Geist Mono', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
        "Build a moderation bot with: /warn [user] [reason] — warns the user. On 3rd warning, auto-mute for 1 hour. On 5th warning, auto-ban. /mute [user] [duration] [reason] — manually mutes. /unmute, /kick, /ban, /unban commands. Auto-delete messages containing invite links in all channels. Auto-delete messages with more than 5 mentions. Log all mod actions to #mod-log with the mod's name, target, reason, and timestamp. Only users with the 'Moderator' or 'Admin' role can use these commands."
      </div>
      <p style={p}>
        That single prompt produces a complete moderation bot. You can refine it — add or remove commands, change thresholds, add a keyword filter — before deploying.
      </p>

      <h2 style={h2}>Step-by-Step: Adding the Bot to Your Server</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '0 0 20px' }}>
        {[
          ['Go to buildablelabs.dev and create a free account.', 'buildablelabs.dev/sign-up'],
          ['In the dashboard, type a description of your moderation system. Be specific about your warning thresholds, which roles can use commands, and any auto-mod rules.', null],
          ['Review the generated bot in the workspace. Add follow-up requests if you want changes — for example, "add a /history command that shows all warnings for a user".', null],
          ['Click Deploy. The bot will be live within 30 seconds.', null],
          ['Copy the invite link Buildable generates. Paste it into a browser, select your server, and authorize the bot with the required permissions.', null],
          ['Test each command in your server. Check that the mod-log channel is receiving entries. Verify auto-mod is triggering correctly.', null],
        ].map(([text, _link], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
            {stepNum(i + 1)}
            <p style={{ ...p, margin: 0 }}>{text as string}</p>
          </div>
        ))}
      </div>

      <h2 style={h2}>Permissions Your Moderation Bot Needs</h2>
      <p style={p}>
        When you authorize the bot on Discord, you'll be asked to grant permissions. For a moderation bot, you typically need:
      </p>
      <ul style={{ margin: '0 0 20px', paddingLeft: '22px' }}>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Manage Messages</strong> — to delete spam and rule-breaking content</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Kick Members</strong></li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Ban Members</strong></li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Manage Roles</strong> — to assign and remove the muted role</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>View Audit Log</strong> — for accurate logging</li>
        <li style={li}><strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Send Messages</strong> — to post in the mod-log channel and respond to commands</li>
      </ul>
      <p style={p}>
        Buildable will tell you exactly which permissions your generated bot needs. Only grant what's required — don't give the bot Administrator unless you have a specific reason.
      </p>

      <h2 style={h2}>Keeping the Bot Updated</h2>
      <p style={p}>
        Server rules change. You might tighten up your anti-spam threshold after a raid, or add a new keyword to the filter after an incident. With Buildable, updates are as simple as typing what you want changed. The AI understands the bot's existing code and adds or modifies features without you having to manage a codebase.
      </p>
      <p style={p}>
        Examples of updates that work with a simple instruction:
      </p>
      <ul style={{ margin: '0 0 20px', paddingLeft: '22px' }}>
        <li style={li}>"Increase the auto-mute threshold from 3 warnings to 4"</li>
        <li style={li}>"Add 'discord.gg' to the blocked link list in addition to invite links"</li>
        <li style={li}>"Add a /slowmode command that sets slowmode in the current channel"</li>
        <li style={li}>"Create a /checkwarns [user] command so mods can see a user's warning history"</li>
      </ul>

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
          Set up your moderation bot today
        </p>
        <p style={{ ...p, margin: '0 0 24px', color: 'rgba(255,255,255,0.45)' }}>
          Describe your rules. Get a working moderation bot. Free to start.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://buildablelabs.dev/sign-up" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: 'rgba(255,255,255,0.95)', color: '#07080d', fontFamily: "'Geist', sans-serif", fontSize: '14px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.04em' }}>
            Build My Moderation Bot →
          </a>
          <Link to="/pricing" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Geist', sans-serif", fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
            View Pricing
          </Link>
        </div>
      </div>
    </BlogArticleLayout>
  );
}
