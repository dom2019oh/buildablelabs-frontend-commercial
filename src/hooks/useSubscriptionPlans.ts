import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export function useSubscriptionPlans() {
  // Fetch all active subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("base_price_cents", { ascending: true });
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Fetch credit tiers
  const { data: creditTiers, isLoading: tiersLoading } = useQuery({
    queryKey: ["credit-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_tiers")
        .select("*")
        .order("credits", { ascending: true });
      
      if (error) throw error;
      return data as CreditTier[];
    },
  });

  // Get tiers for a specific plan
  const getTiersForPlan = (planType: 'pro' | 'business'): CreditTier[] => {
    return creditTiers?.filter((t) => t.plan_type === planType) || [];
  };

  // Get plan by type
  const getPlanByType = (planType: string): SubscriptionPlan | undefined => {
    return plans?.find((p) => p.plan_type === planType);
  };

  // Format price from cents
  const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  return {
    plans,
    creditTiers,
    isLoading: plansLoading || tiersLoading,
    getTiersForPlan,
    getPlanByType,
    formatPrice,
  };
}
