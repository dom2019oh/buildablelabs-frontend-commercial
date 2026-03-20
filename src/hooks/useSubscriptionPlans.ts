// Subscription plans are static config — no DB read needed until Stripe goes live.
// Update these values when plan pricing changes.

export interface SubscriptionPlan {
  id: string;
  name: string;
  plan_type: 'free' | 'pro' | 'business' | 'enterprise';
  description: string | null;
  base_price_cents: number;
  min_credits: number;
  max_credits: number;
  daily_bonus_credits: number;
  allows_rollover: boolean;
  allows_custom_domain: boolean;
  allows_remove_branding: boolean;
  max_team_members: number | null;
  features: string[];
  is_active: boolean;
}

export interface CreditTier {
  id: string;
  plan_type: 'free' | 'pro' | 'business' | 'enterprise';
  credits: number;
  price_cents: number;
  is_popular: boolean;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    plan_type: 'free',
    description: 'Get started building Discord bots',
    base_price_cents: 0,
    min_credits: 100,
    max_credits: 100,
    daily_bonus_credits: 10,
    allows_rollover: false,
    allows_custom_domain: false,
    allows_remove_branding: false,
    max_team_members: 1,
    features: ['100 monthly credits', '10 daily bonus credits', 'Community bots', 'Buildable badge on hosted bots'],
    is_active: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    plan_type: 'pro',
    description: 'For serious bot builders',
    base_price_cents: 1900,
    min_credits: 500,
    max_credits: 5000,
    daily_bonus_credits: 25,
    allows_rollover: true,
    allows_custom_domain: true,
    allows_remove_branding: true,
    max_team_members: 1,
    features: ['500–5,000 credits/month', '25 daily bonus credits', 'Credit rollover', 'Custom domain', 'No branding'],
    is_active: true,
  },
  {
    id: 'business',
    name: 'Business',
    plan_type: 'business',
    description: 'For teams and agencies',
    base_price_cents: 4900,
    min_credits: 2000,
    max_credits: 20000,
    daily_bonus_credits: 50,
    allows_rollover: true,
    allows_custom_domain: true,
    allows_remove_branding: true,
    max_team_members: 10,
    features: ['2,000–20,000 credits/month', '50 daily bonus credits', 'Team seats (up to 10)', 'Priority support'],
    is_active: true,
  },
];

const CREDIT_TIERS: CreditTier[] = [
  { id: 'pro-500',    plan_type: 'pro',      credits: 500,   price_cents: 1900, is_popular: false },
  { id: 'pro-1000',   plan_type: 'pro',      credits: 1000,  price_cents: 2900, is_popular: true  },
  { id: 'pro-2500',   plan_type: 'pro',      credits: 2500,  price_cents: 5900, is_popular: false },
  { id: 'pro-5000',   plan_type: 'pro',      credits: 5000,  price_cents: 9900, is_popular: false },
  { id: 'biz-2000',   plan_type: 'business', credits: 2000,  price_cents: 4900, is_popular: false },
  { id: 'biz-5000',   plan_type: 'business', credits: 5000,  price_cents: 9900, is_popular: true  },
  { id: 'biz-10000',  plan_type: 'business', credits: 10000, price_cents: 17900, is_popular: false },
  { id: 'biz-20000',  plan_type: 'business', credits: 20000, price_cents: 29900, is_popular: false },
];

export function useSubscriptionPlans() {
  const getTiersForPlan = (planType: 'pro' | 'business'): CreditTier[] =>
    CREDIT_TIERS.filter((t) => t.plan_type === planType);

  const getPlanByType = (planType: string): SubscriptionPlan | undefined =>
    PLANS.find((p) => p.plan_type === planType);

  const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(0)}`;

  return {
    plans: PLANS,
    creditTiers: CREDIT_TIERS,
    isLoading: false,
    getTiersForPlan,
    getPlanByType,
    formatPrice,
  };
}
