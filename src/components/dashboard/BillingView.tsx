import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Check, ArrowLeft, ChevronDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCredits, msUntilUTCMidnight, formatCountdown } from '@/hooks/useCredits';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

export default function BillingView() {
  const navigate = useNavigate();
  const { totalCredits, currentPlanType, subscription, canClaimDailyBonus } = useCredits();
  const { getTiersForPlan } = useSubscriptionPlans();
  const { startCheckout, openBillingPortal, isLoading: checkoutLoading } = useStripeCheckout();
  const [proTierIdx, setProTierIdx] = useState(0);
  const [maxTierIdx, setMaxTierIdx] = useState(0);
  const proTiers = getTiersForPlan('pro');
  const maxTiers = getTiersForPlan('max');

  const maxCredits = currentPlanType === 'free' ? 5 : (subscription?.selected_credits ?? 30);
  const progressPct = Math.min(100, (totalCredits / maxCredits) * 100);
  const resetsLabel = currentPlanType === 'free'
    ? `resets in ${formatCountdown(msUntilUTCMidnight())}`
    : 'resets monthly';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="flex items-center gap-2 text-sm mb-4 transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Settings
        </button>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Geist', sans-serif", color: 'rgba(255,255,255,0.9)' }}>
          Plans &amp; Credits
        </h1>
        <p className="text-sm mt-1" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", color: 'rgba(255,255,255,0.35)' }}>
          Manage your subscription plan
        </p>
      </div>

      {/* Credits bar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Credits remaining</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {totalCredits} of {maxCredits} · {resetsLabel}
            {currentPlanType === 'free' && canClaimDailyBonus() && (
              <span style={{ color: '#4ade80', marginLeft: 6 }}>· ready to claim</span>
            )}
          </p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          1 credit = 1 full bot pipeline run. Credits reset daily (Free) or monthly (paid plans).
        </p>
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          {
            key: 'free',
            name: 'Free',
            price: '$0',
            period: 'forever',
            description: '5 credits/day · 2 bots max',
            features: ['5 credits/day (resets midnight)', '2 bots max', 'Simplified pipeline (Haiku)', 'Buildable watermark on bots', 'Community support'],
          },
          {
            key: 'pro',
            name: 'Pro',
            price: proTiers[proTierIdx] ? `$${(proTiers[proTierIdx].price_cents / 100).toFixed(0)}` : 'From $18',
            period: 'per month',
            description: '30–300 credits/mo · 10 bots max',
            features: ['30–300 credits/month', '10 bots max', 'Full 8-stage pipeline (Haiku + Sonnet)', 'No watermark · No /buildable', '1 month credit rollover', 'Email support'],
          },
          {
            key: 'max',
            name: 'Max',
            price: maxTiers[maxTierIdx] ? `$${(maxTiers[maxTierIdx].price_cents / 100).toFixed(0)}` : 'From $59',
            period: 'per month',
            description: '100–1,000 credits/mo · Unlimited bots',
            features: ['100–1,000 credits/month', 'Unlimited bots', 'Priority pipeline queue', 'REST API access (headless)', 'White-label embed domain', 'Priority support'],
          },
        ] as const).map((plan, i) => {
          const isCurrent = plan.key === currentPlanType;
          const FONT = "'Geist', 'DM Sans', sans-serif";
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
                <p className="text-sm font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.88)', fontFamily: FONT }}>{plan.name}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: FONT }}>{plan.description}</p>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'Geist', sans-serif" }}>{plan.price}</span>
                <span className="text-xs ml-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{plan.period}</span>
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
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: FONT }}>
                    <Check className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
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
                  style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
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
    </div>
  );
}
