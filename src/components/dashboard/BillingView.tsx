import { motion } from 'framer-motion';
import { Zap, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started building your first Discord bot',
    features: ['1 bot', '50 AI generations / month', 'Community support'],
    cta: 'Current plan',
    current: true,
    accent: 'rgba(255,255,255,0.12)',
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'For serious bot builders and communities',
    features: ['Up to 10 bots', '500 AI generations / month', 'Priority support', 'Custom domains', 'Analytics'],
    cta: 'Upgrade to Pro',
    current: false,
    accent: 'rgba(109,40,217,0.5)',
  },
  {
    name: 'Business',
    price: '$49',
    period: 'per month',
    description: 'For agencies and large communities',
    features: ['Unlimited bots', 'Unlimited AI generations', 'Dedicated support', 'All Pro features', 'Team access'],
    cta: 'Upgrade to Business',
    current: false,
    accent: 'rgba(37,99,235,0.4)',
  },
];

export default function BillingView() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="flex items-center gap-2 text-sm mb-4 transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Settings
        </button>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.9)' }}>
          Plans &amp; Credits
        </h1>
        <p className="text-sm mt-1" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.35)' }}>
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
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>0 of 50</p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full w-0" style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' }} />
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Credits reset monthly. Upgrade to get more.
        </p>
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-5 flex flex-col"
            style={{
              background: plan.current ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${plan.current ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <div className="mb-4">
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.88)', fontFamily: "'DM Sans', sans-serif" }}>
                {plan.name}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif" }}>
                {plan.description}
              </p>
            </div>

            <div className="mb-4">
              <span className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'Syne', sans-serif" }}>
                {plan.price}
              </span>
              <span className="text-xs ml-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{plan.period}</span>
            </div>

            <ul className="space-y-2 flex-1 mb-5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'DM Sans', sans-serif" }}>
                  <Check className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled={plan.current}
              className="w-full py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: plan.current ? 'rgba(255,255,255,0.07)' : plan.accent,
                color: plan.current ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)',
                border: plan.current ? 'none' : `1px solid ${plan.accent}`,
                cursor: plan.current ? 'default' : 'pointer',
              }}
              onMouseEnter={e => { if (!plan.current) e.currentTarget.style.filter = 'brightness(1.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
            >
              {plan.current ? (
                'Current plan'
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {plan.cta}
                </span>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <p className="text-xs mt-6 text-center" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Sans', sans-serif" }}>
        Billing integration coming soon. Contact us at support@buildablelabs.dev for early access pricing.
      </p>
    </div>
  );
}
