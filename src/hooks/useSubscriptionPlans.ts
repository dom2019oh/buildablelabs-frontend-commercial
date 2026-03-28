// Subscription plans are static config — no DB read needed until Stripe goes live.
// Update these values when plan pricing changes.

export interface SubscriptionPlan {
  id: string;
  name: string;
  plan_type: 'free' | 'lite' | 'pro' | 'max';
  description: string | null;
  monthly_price_cents: number;
  daily_credits: number;        // Free plan only
  monthly_credits: number;      // Non-free plans base tier
  max_bots: number | null;      // null = unlimited
  pipeline: 'simplified' | 'full';
  has_watermark: boolean;
  has_buildable_command: boolean;
  rollover_months: number;
  has_api_access: boolean;
  has_white_label: boolean;
  is_hidden: boolean;           // Lite: downgrade flow only
  priority_queue: boolean;
  support: 'community' | 'email' | 'priority';
  features: string[];
  is_active: boolean;
}

export interface CreditTier {
  id: string;
  plan_type: 'pro' | 'max';
  tier_number: number;
  credits: number;
  price_cents: number;          // monthly
  annual_price_cents: number;   // charged upfront (10x monthly)
  is_popular: boolean;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    plan_type: 'free',
    description: 'Start building Discord bots today',
    monthly_price_cents: 0,
    daily_credits: 3,
    monthly_credits: 0,
    max_bots: 2,
    pipeline: 'simplified',
    has_watermark: true,
    has_buildable_command: true,
    rollover_months: 0,
    has_api_access: false,
    has_white_label: false,
    is_hidden: false,
    priority_queue: false,
    support: 'community',
    features: [
      '3 credits/day (resets at midnight)',
      '2 bots max',
      'Simplified pipeline (Claude Haiku)',
      'Buildable Labs watermark on bots',
      '/buildable command active',
      'Community support',
    ],
    is_active: true,
  },
  {
    id: 'lite',
    name: 'Lite',
    plan_type: 'lite',
    description: 'Light usage, no watermark',
    monthly_price_cents: 700,
    daily_credits: 0,
    monthly_credits: 20,
    max_bots: 2,
    pipeline: 'simplified',
    has_watermark: false,
    has_buildable_command: false,
    rollover_months: 0,
    has_api_access: false,
    has_white_label: false,
    is_hidden: true,
    priority_queue: false,
    support: 'community',
    features: [
      '20 credits/month',
      '2 bots max',
      'Simplified pipeline (Claude Haiku)',
      'No Buildable watermark',
      'No /buildable command',
      'Community support',
    ],
    is_active: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    plan_type: 'pro',
    description: 'For serious bot builders',
    monthly_price_cents: 1800,
    daily_credits: 0,
    monthly_credits: 30,
    max_bots: 10,
    pipeline: 'full',
    has_watermark: false,
    has_buildable_command: false,
    rollover_months: 1,
    has_api_access: false,
    has_white_label: false,
    is_hidden: false,
    priority_queue: false,
    support: 'email',
    features: [
      '30–300 credits/month',
      '10 bots max',
      'Full 8-stage pipeline (Haiku + Sonnet)',
      'No Buildable watermark',
      'No /buildable command',
      '1 month credit rollover',
      'Email support',
    ],
    is_active: true,
  },
  {
    id: 'max',
    name: 'Max',
    plan_type: 'max',
    description: 'For power users and agencies',
    monthly_price_cents: 5900,
    daily_credits: 0,
    monthly_credits: 100,
    max_bots: null,
    pipeline: 'full',
    has_watermark: false,
    has_buildable_command: false,
    rollover_months: 2,
    has_api_access: true,
    has_white_label: true,
    is_hidden: false,
    priority_queue: true,
    support: 'priority',
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
    is_active: true,
  },
];

const CREDIT_TIERS: CreditTier[] = [
  // Pro — 30 base + 30/tier (repriced for 30%+ margin with Sonnet)
  { id: 'pro-t1',  plan_type: 'pro', tier_number: 1,  credits: 30,   price_cents: 1800,  annual_price_cents: 18000,  is_popular: false },
  { id: 'pro-t2',  plan_type: 'pro', tier_number: 2,  credits: 60,   price_cents: 3600,  annual_price_cents: 36000,  is_popular: false },
  { id: 'pro-t3',  plan_type: 'pro', tier_number: 3,  credits: 90,   price_cents: 5500,  annual_price_cents: 55000,  is_popular: true  },
  { id: 'pro-t4',  plan_type: 'pro', tier_number: 4,  credits: 120,  price_cents: 7200,  annual_price_cents: 72000,  is_popular: false },
  { id: 'pro-t5',  plan_type: 'pro', tier_number: 5,  credits: 150,  price_cents: 8900,  annual_price_cents: 89000,  is_popular: false },
  { id: 'pro-t6',  plan_type: 'pro', tier_number: 6,  credits: 180,  price_cents: 10800, annual_price_cents: 108000, is_popular: false },
  { id: 'pro-t7',  plan_type: 'pro', tier_number: 7,  credits: 210,  price_cents: 12500, annual_price_cents: 125000, is_popular: false },
  { id: 'pro-t8',  plan_type: 'pro', tier_number: 8,  credits: 240,  price_cents: 14400, annual_price_cents: 144000, is_popular: false },
  { id: 'pro-t9',  plan_type: 'pro', tier_number: 9,  credits: 270,  price_cents: 16200, annual_price_cents: 162000, is_popular: false },
  { id: 'pro-t10', plan_type: 'pro', tier_number: 10, credits: 300,  price_cents: 17900, annual_price_cents: 179000, is_popular: false },
  // Max — 100 base + 100/tier (repriced for 30%+ margin with Sonnet)
  { id: 'max-t1',  plan_type: 'max', tier_number: 1,  credits: 100,  price_cents: 5900,  annual_price_cents: 59000,  is_popular: false },
  { id: 'max-t2',  plan_type: 'max', tier_number: 2,  credits: 200,  price_cents: 11900, annual_price_cents: 119000, is_popular: false },
  { id: 'max-t3',  plan_type: 'max', tier_number: 3,  credits: 300,  price_cents: 17900, annual_price_cents: 179000, is_popular: true  },
  { id: 'max-t4',  plan_type: 'max', tier_number: 4,  credits: 400,  price_cents: 23900, annual_price_cents: 239000, is_popular: false },
  { id: 'max-t5',  plan_type: 'max', tier_number: 5,  credits: 500,  price_cents: 29900, annual_price_cents: 299000, is_popular: false },
  { id: 'max-t6',  plan_type: 'max', tier_number: 6,  credits: 600,  price_cents: 35900, annual_price_cents: 359000, is_popular: false },
  { id: 'max-t7',  plan_type: 'max', tier_number: 7,  credits: 700,  price_cents: 41900, annual_price_cents: 419000, is_popular: false },
  { id: 'max-t8',  plan_type: 'max', tier_number: 8,  credits: 800,  price_cents: 47900, annual_price_cents: 479000, is_popular: false },
  { id: 'max-t9',  plan_type: 'max', tier_number: 9,  credits: 900,  price_cents: 53900, annual_price_cents: 539000, is_popular: false },
  { id: 'max-t10', plan_type: 'max', tier_number: 10, credits: 1000, price_cents: 59900, annual_price_cents: 599000, is_popular: false },
];

export function useSubscriptionPlans() {
  const getTiersForPlan = (planType: 'pro' | 'max'): CreditTier[] =>
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
