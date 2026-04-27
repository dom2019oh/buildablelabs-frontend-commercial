import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Check, ChevronDown, Loader2, Infinity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

const FONT = "'Geist', 'DM Sans', sans-serif";
const FREE_LIFETIME_LIMIT = 10;

export default function BillingView() {
  const navigate = useNavigate();
  const { credits, totalCredits, currentPlanType, subscription } = useCredits();
  const { getTiersForPlan } = useSubscriptionPlans();
  const { startCheckout, openBillingPortal, isLoading: checkoutLoading } = useStripeCheckout();
  const [proTierIdx, setProTierIdx] = useState(0);
  const [maxTierIdx, setMaxTierIdx] = useState(0);

  const proTiers = getTiersForPlan('pro');
  const maxTiers = getTiersForPlan('max');

  const isFree = currentPlanType === 'free';
  const lifetimeLimit = credits?.free_lifetime_limit ?? FREE_LIFETIME_LIMIT;
  const lifetimeUsed  = credits?.lifetime_builds_used ?? 0;
  const lifetimeLeft  = Math.max(0, lifetimeLimit - lifetimeUsed);

  // Progress: for free = builds used out of limit; for paid = credits remaining out of plan total
  const paidMax     = subscription?.selected_credits ?? 30;
  const progressPct = isFree
    ? Math.min(100, (lifetimeUsed / lifetimeLimit) * 100)
    : Math.min(100, (totalCredits / paidMax) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="flex items-center gap-2 text-sm mb-4 transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: FONT }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          ← Settings
        </button>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Geist', sans-serif", color: 'rgba(255,255,255,0.9)' }}>
          Plans &amp; Credits
        </h1>
        <p className="text-sm mt-1" style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.35)' }}>
          Manage your subscription and credit usage
        </p>
      </div>

      {/* ── Credit status bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {isFree ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: FONT }}>
                Lifetime builds
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: FONT }}>
                {lifetimeUsed} used · {lifetimeLeft} remaining of {lifetimeLimit}
              </p>
            </div>
            {/* Progress shows consumption */}
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: lifetimeLeft <= 2
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                    : lifetimeLeft <= 5
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                }}
              />
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: FONT }}>
              Free plan includes {lifetimeLimit} builds total — no daily reset, no expiry. Each build = 1 full pipeline run.
            </p>
            {lifetimeLeft === 0 && (
              <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: 'rgba(252,165,165,0.9)', fontFamily: FONT }}>
                You've used all {lifetimeLimit} lifetime free builds. Upgrade to Pro to keep building.
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: FONT }}>Credits remaining</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: FONT }}>
                {totalCredits} of {paidMax} · resets monthly
              </p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: FONT }}>
              1 credit = 1 full bot pipeline run. Credits reset monthly with your billing cycle.
            </p>
          </>
        )}
      </motion.div>

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          {
            key: 'free',
            name: 'Free',
            price: '$0',
            period: 'forever',
            description: `${lifetimeLimit} lifetime builds · 2 bots max`,
            features: [
              `${lifetimeLimit} lifetime builds total (no reset)`,
              '2 bots max',
              'Simplified pipeline (Haiku)',
              'Buildable watermark on bots',
              'Community support',
            ],
          },
          {
            key: 'pro',
            name: 'Pro',
            price: proTiers[proTierIdx] ? `$${(proTiers[proTierIdx].price_cents / 100).toFixed(0)}` : 'From $18',
            period: 'per month',
            description: '30–300 credits/mo · 10 bots max',
            features: [
              '30–300 credits/month',
              '10 bots max',
              'Full 8-stage pipeline (Haiku + Sonnet)',
              'No watermark · No /buildable',
              '1 month credit rollover',
              'Email support',
            ],
          },
          {
            key: 'max',
            name: 'Max',
            price: maxTiers[maxTierIdx] ? `$${(maxTiers[maxTierIdx].price_cents / 100).toFixed(0)}` : 'From $59',
            period: 'per month',
            description: '100–1,000 credits/mo · Unlimited bots',
            features: [
              '100–1,000 credits/month',
              'Unlimited bots',
              'Priority pipeline queue',
              'REST API access (headless)',
              'White-label embed domain',
              'Priority support',
            ],
          },
        ] as const).map((plan, i) => {
          const isCurrent = plan.key === currentPlanType;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5 flex flex-col"
              style={{
                background: isCurrent ? 'rgba(255,255,255,0.04)' : '#0c0c0c',
                border: `1px solid ${isCurrent ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.88)', fontFamily: FONT }}>{plan.name}</p>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(109,40,217,0.2)', color: '#a78bfa', fontFamily: FONT }}>
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: FONT }}>{plan.description}</p>
              </div>

              <div className="mb-4 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'Geist', sans-serif" }}>{plan.price}</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: FONT }}>{plan.period}</span>
              </div>

              {/* Credit tier selector for Pro/Max */}
              {plan.key !== 'free' && (
                <div className="relative mb-3">
                  <select
                    value={plan.key === 'pro' ? proTierIdx : maxTierIdx}
                    onChange={e => plan.key === 'pro' ? setProTierIdx(Number(e.target.value)) : setMaxTierIdx(Number(e.target.value))}
                    className="w-full appearance-none rounded-lg px-3 py-2 text-xs pr-7 outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: FONT, cursor: 'pointer' }}
                  >
                    {(plan.key === 'pro' ? proTiers : maxTiers).map((t, idx) => (
                      <option key={t.id} value={idx} style={{ background: '#111' }}>{t.credits} credits / month</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                </div>
              )}

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: FONT }}>
                    <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.key === 'free' ? (
                <button
                  disabled
                  className="w-full py-2 rounded-xl text-sm font-medium"
                  style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', border: '1px solid transparent', cursor: 'default' }}
                >
                  {isCurrent ? 'Current plan' : 'Get started free'}
                </button>
              ) : isCurrent ? (
                <button
                  onClick={openBillingPortal}
                  disabled={checkoutLoading}
                  className="w-full py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                >
                  {checkoutLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Manage subscription'}
                </button>
              ) : (
                <button
                  onClick={() => startCheckout(plan.key === 'pro' ? (proTiers[proTierIdx]?.id ?? '') : (maxTiers[maxTierIdx]?.id ?? ''))}
                  disabled={checkoutLoading}
                  className="w-full py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ fontFamily: FONT, background: 'rgba(109,40,217,0.18)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(109,40,217,0.3)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.28)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.18)'; }}
                >
                  {checkoutLoading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                    : <span className="flex items-center justify-center gap-1.5"><Zap className="w-3.5 h-3.5" />Upgrade to {plan.name}</span>
                  }
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── What happens when you run out (free only) ── */}
      {isFree && lifetimeLeft <= 5 && lifetimeLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 rounded-2xl p-4"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(251,191,36,0.85)', fontFamily: FONT }}>
            {lifetimeLeft} build{lifetimeLeft !== 1 ? 's' : ''} remaining
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: FONT }}>
            When you hit 0, builds pause permanently on the free plan. Upgrade to Pro to keep building without limits.
          </p>
        </motion.div>
      )}
    </div>
  );
}
