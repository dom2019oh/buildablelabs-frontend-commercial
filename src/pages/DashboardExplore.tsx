import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Globe, Zap, Users, Star, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const FONT = "'Geist', 'DM Sans', sans-serif";
const BORDER = '1px solid rgb(39,39,37)';

type Tab = 'discover' | 'templates';

// Placeholder community bots
const COMMUNITY_BOTS = [
  { name: 'ModGuard',      author: 'by @xrexo',       desc: 'Auto-moderates toxic messages, warns users, and logs incidents.',          tags: ['moderation', 'safety'],  stars: 214 },
  { name: 'EventBot',      author: 'by @kalvin_d',    desc: 'Lets members RSVP to events, get reminders, and see countdowns.',          tags: ['events', 'community'],   stars: 189 },
  { name: 'LevelUp',       author: 'by @synthwave99',  desc: 'XP system with custom rank cards, leaderboards and role rewards.',         tags: ['levels', 'engagement'],  stars: 341 },
  { name: 'TicketPro',     author: 'by @dorian_w',    desc: 'Support ticket system with staff assignment and transcript logging.',       tags: ['support', 'tickets'],    stars: 127 },
  { name: 'MusicMaestro',  author: 'by @bassline',    desc: 'Play music from YouTube and Spotify with queue, skip, and vote controls.', tags: ['music', 'entertainment'],stars: 502 },
  { name: 'WelcomeKit',    author: 'by @nova_dev',    desc: 'Onboards new members with custom messages, roles and rules verification.', tags: ['welcome', 'onboarding'], stars: 298 },
];

// Placeholder templates
const TEMPLATES = [
  { name: 'Moderation Bot',    desc: 'Auto-mod, warn, kick, ban with full logging.',           tags: ['moderation'],          icon: '🛡️' },
  { name: 'Music Bot',         desc: 'Full music player with queue and playlist support.',     tags: ['music'],               icon: '🎵' },
  { name: 'Welcome Bot',       desc: 'Greet members and assign roles on join.',                tags: ['onboarding'],          icon: '👋' },
  { name: 'Ticket System',     desc: 'Support tickets with categories and transcripts.',       tags: ['support'],             icon: '🎫' },
  { name: 'Levelling System',  desc: 'XP, ranks, role rewards and leaderboards.',              tags: ['engagement'],          icon: '⭐' },
  { name: 'Economy Bot',       desc: 'Virtual currency, shop, daily rewards, gambling.',       tags: ['economy', 'fun'],      icon: '💰' },
  { name: 'Poll & Voting',     desc: 'Create polls, votes and anonymous surveys.',             tags: ['community'],           icon: '📊' },
  { name: 'Event Scheduler',   desc: 'Schedule events, send reminders, manage RSVPs.',        tags: ['events'],              icon: '📅' },
];

export default function DashboardExplore() {
  const [tab, setTab] = useState<Tab>('discover');

  return (
    <DashboardLayout noPadding>
      <div className="h-screen flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-0 flex-shrink-0">
          <h1 className="text-[26px] font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif", color: 'rgb(252,251,248)' }}>
            Explore
          </h1>
          <p className="text-[14px] mb-6" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>
            Discover community bots or start from a template.
          </p>

          {/* Tabs */}
          <div className="flex items-center gap-1 relative">
            {(['discover', 'templates'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative px-4 py-2 rounded-lg text-[13px] capitalize"
                style={{ fontFamily: FONT, color: tab === t ? 'rgb(252,251,248)' : 'rgb(120,116,110)', transition: 'color 0.2s' }}
              >
                {tab === t && (
                  <motion.span
                    layoutId="explore-tab-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgb(24,24,24)', border: BORDER }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t === 'discover' ? 'Discover' : 'Templates'}</span>
              </button>
            ))}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'rgb(39,39,37)', marginTop: '8px' }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {tab === 'discover' ? (
            <DiscoverTab />
          ) : (
            <TemplatesTab />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function DiscoverTab() {
  return (
    <div>
      {/* Banner */}
      <div
        className="rounded-2xl p-6 mb-8 flex items-center justify-between"
        style={{ background: 'rgb(16,16,16)', border: BORDER }}
      >
        <div>
          <p className="text-[18px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: "'Syne', sans-serif" }}>
            Publish your bot to the community
          </p>
          <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>
            Share what you've built. Let others discover, use and fork your bot.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium flex-shrink-0 transition-all"
          style={{ background: 'rgb(255,255,255)', color: '#0c0c0c', fontFamily: FONT }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.88)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgb(255,255,255)')}
        >
          <Globe className="w-4 h-4" />
          Publish a bot
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMMUNITY_BOTS.map((bot, i) => (
          <motion.div
            key={bot.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all"
            style={{ background: 'rgb(14,14,14)', border: BORDER }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgb(60,60,58)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgb(39,39,37)')}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgb(24,24,24)', border: BORDER }}>
                <Bot className="w-5 h-5" style={{ color: 'rgb(197,193,186)' }} />
              </div>
              <div className="flex items-center gap-1" style={{ color: 'rgb(120,116,110)' }}>
                <Star className="w-3.5 h-3.5" />
                <span className="text-[12px]" style={{ fontFamily: FONT }}>{bot.stars}</span>
              </div>
            </div>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>{bot.name}</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{bot.author}</p>
            </div>
            <p className="text-[12.5px] leading-relaxed flex-1" style={{ color: 'rgb(155,152,147)', fontFamily: FONT }}>{bot.desc}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {bot.tags.map(tag => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgb(24,24,24)', color: 'rgb(120,116,110)', border: BORDER, fontFamily: FONT }}>
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TemplatesTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {TEMPLATES.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all"
          style={{ background: 'rgb(14,14,14)', border: BORDER }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgb(60,60,58)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgb(39,39,37)')}
        >
          <div className="text-3xl">{t.icon}</div>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>{t.name}</p>
            <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{t.desc}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {t.tags.map(tag => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgb(24,24,24)', color: 'rgb(120,116,110)', border: BORDER, fontFamily: FONT }}>
                {tag}
              </span>
            ))}
          </div>
          <button
            className="flex items-center gap-1.5 text-[12px] mt-auto transition-all"
            style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgb(252,251,248)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgb(120,116,110)')}
          >
            Use template <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
