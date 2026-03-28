import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Loader2, ChevronDown } from 'lucide-react';
import FloatingNav from '@/components/FloatingNav';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TierDisplay {
  credits: number;
  price: number;
  annualPrice: number;
  priceId: string | null;
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const faqs = [
  {
    question: 'What is a credit?',
    answer:
      '1 credit = 1 full bot pipeline run. Each time Buildable Labs builds or rebuilds a bot for you, one credit is consumed — regardless of bot size or complexity.',
  },
  {
    question: 'What is the pipeline?',
    answer:
      'The Buildable pipeline is an 8-stage AI system that plans, writes, tests, and deploys your Discord bot. Free and Lite plans run a simplified version (Claude Haiku). Pro and Max use the full 8-stage pipeline with Haiku + Sonnet for higher quality output.',
  },
  {
    question: 'What happens when I run out of credits?',
    answer:
      'Hard stop — no overages, ever. Free users receive 5 new credits the next midnight. Pro and Max users wait for their monthly reset, or upgrade to a higher tier.',
  },
  {
    question: 'What is credit rollover?',
    answer:
      'Unused monthly credits carry forward. Pro rolls over up to 1 month of credits. Max rolls over up to 2 months. Free credits never roll over.',
  },
  {
    question: 'What is the Buildable watermark?',
    answer:
      'On the Free plan, every bot has a "Powered by Buildable Labs" embed footer and responds to /buildable. Upgrading to Pro or Max removes both.',
  },
  {
    question: 'How does annual billing work?',
    answer:
      'Annual plans are billed upfront for 10 months and give you 12 months of access — 2 months free. No recurring monthly charges. Refunds are not available after the annual charge is made.',
  },
  {
    question: 'Can I downgrade?',
    answer:
      'Yes. Downgrading moves you to the Lite plan ($7/mo), which is only available through the downgrade flow — it will not appear on the public pricing page.',
  },
  {
    question: 'Is my bot code mine?',
    answer:
      'Yes. All generated code is yours. Export it at any time and self-host if you prefer.',
  },
];

// ─── Stack mark ───────────────────────────────────────────────────────────────

const PLAN_COLORS: Record<string, { from: string; to: string }> = {
  free: { from: '#3b3352', to: '#108961' },
  pro:  { from: '#6366f1', to: '#a78bfa' },
  max:  { from: '#f97316', to: '#fbbf24' },
};

function StackMark({ planType, size = 28 }: { planType: string; size?: number }) {
  const { from, to } = PLAN_COLORS[planType] ?? PLAN_COLORS.free;
  const uid = `sm-${planType}`;
  return (
    <svg viewBox="0 0 36 29" fill="none" style={{ width: size, height: Math.round(size * 29 / 36) }}>
      <defs>
        <linearGradient id={uid} x1="18" y1="0" x2="18" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0"  width="36" height="7" rx="3.5" fill={`url(#${uid})`} />
      <rect x="0" y="11" width="26" height="7" rx="3.5" fill={`url(#${uid})`} />
      <rect x="0" y="22" width="16" height="7" rx="3.5" fill={`url(#${uid})`} />
    </svg>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  name: string;
  tagline: string;
  planType: 'free' | 'pro' | 'max';
  features: string[];
  tiers?: TierDisplay[];
  isAnnual: boolean;
  highlighted?: boolean;
  onSubscribe?: (priceId: string | null) => void;
  isCheckoutLoading?: boolean;
  isAuthenticated?: boolean;
  currentPlanType?: string;
}

function PlanCard({
  name,
  tagline,
  planType,
  features,
  tiers,
  isAnnual,
  highlighted,
  onSubscribe,
  isCheckoutLoading,
  isAuthenticated,
  currentPlanType,
}: PlanCardProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedTier = tiers?.[selectedIdx];
  const isFree = planType === 'free';
  const isCurrentPlan = currentPlanType === planType;

  const monthlyPrice = isFree ? 0 : (selectedTier?.price ?? 0);
  const annualPrice  = isFree ? 0 : (selectedTier?.annualPrice ?? 0);

  const featuresHeader =
    isFree
      ? "What's included"
      : planType === 'pro'
      ? 'Everything in Free, plus'
      : 'Everything in Pro, plus';

  const ctaLabel = isCurrentPlan
    ? 'Current Plan'
    : isFree
    ? 'Get Started Free'
    : `Upgrade to ${name}`;

  return (
    <div
      style={{
        background: highlighted
          ? 'rgba(109,40,217,0.10)'
          : 'rgba(255,255,255,0.025)',
        border: `1px solid ${highlighted ? 'rgba(160,120,255,0.30)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '20px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {highlighted && !isCurrentPlan && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, #6d28d9, #4f46e5)',
            borderRadius: '999px',
            padding: '3px 14px',
            fontSize: '0.7rem',
            fontFamily: "'Geist', 'DM Sans', sans-serif",
            fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <StackMark planType={planType} size={28} />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontWeight: 700,
              fontSize: '1.15rem',
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            {name}
          </span>
          {isCurrentPlan && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(109,40,217,0.25)',
                color: '#a78bfa',
                fontFamily: "'Geist', 'DM Sans', sans-serif",
              }}
            >
              Current
            </span>
          )}
        </div>
        <p
          style={{
            fontFamily: "'Geist', 'DM Sans', sans-serif",
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          {tagline}
        </p>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '18px' }}>
        {isFree ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 800,
                fontSize: '2.2rem',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              $0
            </span>
            <span
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              /mo
            </span>
          </div>
        ) : isAnnual ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontWeight: 800,
                  fontSize: '2.2rem',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                ${annualPrice}
              </span>
              <span
                style={{
                  fontFamily: "'Geist', 'DM Sans', sans-serif",
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                /yr
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                fontSize: '0.75rem',
                color: 'rgba(167,139,250,0.75)',
                marginTop: '3px',
              }}
            >
              ${monthlyPrice}/mo · 2 months free
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 800,
                fontSize: '2.2rem',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              ${monthlyPrice}
            </span>
            <span
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              /mo
            </span>
          </div>
        )}
      </div>

      {/* Credit Tier Selector */}
      {tiers && tiers.length > 0 && (
        <div style={{ marginBottom: '18px', position: 'relative' }}>
          <select
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '9px 36px 9px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: "'Geist', 'DM Sans', sans-serif",
              fontSize: '0.82rem',
              cursor: 'pointer',
              appearance: 'none',
              outline: 'none',
            }}
          >
            {tiers.map((t, i) => (
              <option key={i} value={i} style={{ background: '#12131a' }}>
                {t.credits} credits / month
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            color="rgba(255,255,255,0.35)"
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
        </div>
      )}

      {/* CTA */}
      {isFree ? (
        <Link
          to={isAuthenticated ? '/dashboard' : '/sign-up'}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '11px 0',
            borderRadius: '12px',
            fontFamily: "'Geist', 'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: '0.88rem',
            color: isCurrentPlan ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.75)',
            background: isCurrentPlan ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.10)',
            marginBottom: '22px',
            cursor: isCurrentPlan ? 'default' : 'pointer',
            textDecoration: 'none',
            pointerEvents: isCurrentPlan ? 'none' : 'auto',
          }}
        >
          {ctaLabel}
        </Link>
      ) : isAuthenticated ? (
        <button
          onClick={() => onSubscribe?.(selectedTier?.priceId ?? null)}
          disabled={isCheckoutLoading || isCurrentPlan}
          style={{
            width: '100%',
            padding: '11px 0',
            borderRadius: '12px',
            fontFamily: "'Geist', 'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: '0.88rem',
            color: isCurrentPlan ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.95)',
            background: isCurrentPlan
              ? 'rgba(255,255,255,0.04)'
              : highlighted
              ? 'linear-gradient(135deg, #6d28d9, #4f46e5)'
              : 'rgba(109,40,217,0.35)',
            border: isCurrentPlan
              ? '1px solid rgba(255,255,255,0.07)'
              : '1px solid rgba(160,120,255,0.30)',
            marginBottom: '22px',
            cursor: isCurrentPlan || isCheckoutLoading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {isCheckoutLoading ? <Loader2 size={14} className="animate-spin" /> : ctaLabel}
        </button>
      ) : (
        <Link
          to="/sign-up"
          state={{ returnTo: '/pricing' }}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '11px 0',
            borderRadius: '12px',
            fontFamily: "'Geist', 'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: '0.88rem',
            color: 'rgba(255,255,255,0.95)',
            background: highlighted
              ? 'linear-gradient(135deg, #6d28d9, #4f46e5)'
              : 'rgba(109,40,217,0.35)',
            border: '1px solid rgba(160,120,255,0.30)',
            marginBottom: '22px',
            textDecoration: 'none',
          }}
        >
          Get Started
        </Link>
      )}

      {/* Features */}
      <p
        style={{
          fontFamily: "'Geist', 'DM Sans', sans-serif",
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {featuresHeader}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {features.map((f) => (
          <li
            key={f}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontFamily: "'Geist', 'DM Sans', sans-serif",
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            <Check size={13} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { startCheckout, isLoading: isCheckoutLoading } = useStripeCheckout();
  const { subscription } = useCredits();
  const { user } = useAuth();
  const { creditTiers } = useSubscriptionPlans();

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast({
        title: 'Checkout Canceled',
        description: 'Your checkout was canceled. You can try again anytime.',
      });
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, navigate]);

  const proCreditTiers: TierDisplay[] = creditTiers
    .filter((t) => t.plan_type === 'pro')
    .map((t) => ({
      credits: t.credits,
      price: t.price_cents / 100,
      annualPrice: t.annual_price_cents / 100,
      priceId: null,
    }));

  const maxCreditTiers: TierDisplay[] = creditTiers
    .filter((t) => t.plan_type === 'max')
    .map((t) => ({
      credits: t.credits,
      price: t.price_cents / 100,
      annualPrice: t.annual_price_cents / 100,
      priceId: null,
    }));

  const plans = [
    {
      name: 'Free',
      tagline: 'Build your first Discord bot',
      planType: 'free' as const,
      tiers: undefined,
      highlighted: false,
      features: [
        '3 credits/day (resets at midnight)',
        '2 bots max',
        'Simplified pipeline (Claude Haiku)',
        'Buildable Labs watermark on bots',
        '/buildable command active',
        'Community support',
      ],
    },
    {
      name: 'Pro',
      tagline: 'For serious bot builders',
      planType: 'pro' as const,
      tiers: proCreditTiers,
      highlighted: true,
      features: [
        '30–300 credits/month',
        '10 bots max',
        'Full 8-stage pipeline (Haiku + Sonnet)',
        'No Buildable watermark',
        'No /buildable command',
        '1 month credit rollover',
        'Email support',
      ],
    },
    {
      name: 'Max',
      tagline: 'For power users and agencies',
      planType: 'max' as const,
      tiers: maxCreditTiers,
      highlighted: false,
      features: [
        '100–1,000 credits/month',
        'Unlimited bots',
        'Full 8-stage pipeline (Haiku + Sonnet)',
        'Priority queue',
        'No Buildable watermark',
        'No /buildable command',
        '2 month credit rollover',
        'REST API access (headless)',
        'Custom embed domain (white-label)',
        'Early access to new features',
        'Priority support',
      ],
    },
  ];

  const card = {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '28px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080a0c',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top bloom */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '340px',
          background: 'radial-gradient(ellipse at top, rgba(90,30,200,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <FloatingNav hidePricing />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <section
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '120px 24px 96px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '36px' }}
          >
            <h1
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                color: 'rgba(255,255,255,0.92)',
                marginBottom: '14px',
                letterSpacing: '-0.01em',
              }}
            >
              Simple, honest pricing.
            </h1>
            <p
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.38)',
                maxWidth: '480px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              1 credit = 1 full bot pipeline run. No overages. No hidden fees.
            </p>
          </motion.div>

          {/* Annual Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '56px',
            }}
          >
            <Label
              htmlFor="annual-toggle"
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                fontSize: '0.85rem',
                color: !isAnnual ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.30)',
                cursor: 'pointer',
              }}
            >
              Monthly
            </Label>
            <Switch
              id="annual-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label
              htmlFor="annual-toggle"
              style={{
                fontFamily: "'Geist', 'DM Sans', sans-serif",
                fontSize: '0.85rem',
                color: isAnnual ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.30)',
                cursor: 'pointer',
              }}
            >
              Annual
            </Label>
            {isAnnual && (
              <span
                style={{
                  fontFamily: "'Geist', 'DM Sans', sans-serif",
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(109,40,217,0.20)',
                  border: '1px solid rgba(160,120,255,0.25)',
                  color: '#a78bfa',
                  fontWeight: 600,
                }}
              >
                2 months free
              </span>
            )}
          </motion.div>

          {/* Plan Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              width: '100%',
              maxWidth: '960px',
              marginBottom: '64px',
              alignItems: 'start',
            }}
          >
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ height: '100%' }}
              >
                <PlanCard
                  {...plan}
                  isAnnual={isAnnual}
                  onSubscribe={(priceId) => { if (priceId) startCheckout(priceId); }}
                  isCheckoutLoading={isCheckoutLoading}
                  isAuthenticated={!!user}
                  currentPlanType={subscription?.plan_type}
                />
              </motion.div>
            ))}
          </div>

          {/* How Credits Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{ ...card, width: '100%', maxWidth: '860px', marginBottom: '24px' }}
          >
            <h2
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 700,
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '20px',
              }}
            >
              How Credits Work
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              {[
                { title: '1 Credit = 1 Run', body: 'Each full bot pipeline run consumes exactly 1 credit, regardless of bot size or complexity.' },
                { title: 'Hard Limit', body: 'No overages. When you hit your limit, builds pause until credits reset or you upgrade.' },
                { title: 'Per Build, Not Per Bot', body: 'Running the same bot multiple times each consumes 1 credit per run. Not per bot owned.' },
              ].map(({ title, body }) => (
                <div key={title}>
                  <p
                    style={{
                      fontFamily: "'Geist', 'DM Sans', sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'rgba(167,139,250,0.8)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: '6px',
                    }}
                  >
                    {title}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Geist', 'DM Sans', sans-serif",
                      fontSize: '0.83rem',
                      color: 'rgba(255,255,255,0.38)',
                      lineHeight: 1.6,
                    }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fair Usage Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            style={{ ...card, width: '100%', maxWidth: '860px', marginBottom: '24px' }}
          >
            <h2
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 700,
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '20px',
              }}
            >
              Fair Usage Rules
            </h2>
            <ul
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '10px',
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {[
                'Free credits reset at midnight — no rollover',
                'Pro credits roll over for 1 month',
                'Max credits roll over for 2 months',
                'No overages — hard stop at credit limit',
                'Credits consumed per build, not per bot',
                'Lite plan is month-to-month only, no annual',
                'Annual billing is charged upfront for the full year',
                'Cancel anytime — no questions asked',
              ].map((rule) => (
                <li
                  key={rule}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontFamily: "'Geist', 'DM Sans', sans-serif",
                    fontSize: '0.83rem',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#7c3aed',
                      flexShrink: 0,
                      marginTop: '7px',
                    }}
                  />
                  {rule}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            style={{ width: '100%', maxWidth: '860px' }}
          >
            <h2
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 700,
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.85)',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              Frequently Asked Questions
            </h2>
            <div style={{ ...card }}>
              <Accordion type="single" collapsible>
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <AccordionTrigger
                      style={{
                        fontFamily: "'Geist', 'DM Sans', sans-serif",
                        fontSize: '0.88rem',
                        color: 'rgba(255,255,255,0.75)',
                        textAlign: 'left',
                      }}
                      className="hover:no-underline"
                    >
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent
                      style={{
                        fontFamily: "'Geist', 'DM Sans', sans-serif",
                        fontSize: '0.83rem',
                        color: 'rgba(255,255,255,0.38)',
                        lineHeight: 1.65,
                      }}
                    >
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
