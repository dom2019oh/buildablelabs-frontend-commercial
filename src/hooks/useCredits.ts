import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  doc, getDoc, collection, query, where, orderBy, limit, getDocs,
  onSnapshot, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/urls";

export type CreditActionType =
  | 'full_build'
  | 'edit_iterate'
  | 'plan_mode'
  | 'architect_mode'
  | 'mermaid_diagram'
  | 'file_repair'
  | 'validate_review'
  | 'clarify'
  | 'chat';

export interface UserCredits {
  id: string;
  user_id: string;
  // Free tier lifetime model
  lifetime_builds_used: number;
  free_lifetime_limit: number;
  // Paid tier fields
  monthly_credits: number;
  bonus_credits: number;
  rollover_credits: number;
  topup_credits: number;
  last_daily_bonus_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro' | 'max' | 'lite';
  selected_credits: number;
  price_cents: number;
  billing_period_start: string;
  billing_period_end: string;
  is_annual: boolean;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: string;
  action_type: CreditActionType | null;
  amount: number;
  balance_after: number;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreditActionCost {
  action_type: CreditActionType;
  credit_cost: number;
  description: string;
}

const ACTION_COSTS: Record<CreditActionType, CreditActionCost> = {
  full_build:      { action_type: 'full_build',      credit_cost: 2, description: 'Full bot build' },
  edit_iterate:    { action_type: 'edit_iterate',    credit_cost: 1, description: 'Edit & iterate' },
  plan_mode:       { action_type: 'plan_mode',       credit_cost: 1, description: 'Plan mode' },
  architect_mode:  { action_type: 'architect_mode',  credit_cost: 1, description: 'Architect mode' },
  mermaid_diagram: { action_type: 'mermaid_diagram', credit_cost: 1, description: 'Diagram generation' },
  file_repair:     { action_type: 'file_repair',     credit_cost: 1, description: 'File repair' },
  validate_review: { action_type: 'validate_review', credit_cost: 1, description: 'Validate & review' },
  clarify:         { action_type: 'clarify',         credit_cost: 0, description: 'Clarifying question (free)' },
  chat:            { action_type: 'chat',            credit_cost: 0, description: 'Chat message (free)' },
};

const FREE_LIFETIME_LIMIT = 10;

// ── UTC helpers ────────────────────────────────────────────────────────────────

/** Returns "YYYY-MM-DD" in UTC for a given date (defaults to now). */
export function getUTCDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Returns true if the given ISO timestamp was claimed on today's UTC date. */
export function isClaimedToday(lastClaimedAt: string | null): boolean {
  if (!lastClaimedAt) return false;
  return getUTCDateString(new Date(lastClaimedAt)) === getUTCDateString();
}

/** Returns milliseconds until the next UTC midnight. */
export function msUntilUTCMidnight(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1,
  ));
  return midnight.getTime() - now.getTime();
}

/** Returns "Xh Ym" string for display countdown. */
export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function tsToString(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return String(ts);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCredits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Real-time credits via onSnapshot — cannot be spoofed (backend owns all writes)
  const [credits, setCredits] = useState<UserCredits | null | undefined>(undefined);
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setCredits(null);
      setCreditsLoading(false);
      return;
    }
    setCreditsLoading(true);

    const unsub = onSnapshot(
      doc(db, 'userCredits', user.uid),
      async (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setCredits({
            id: snap.id,
            user_id: d.user_id ?? user.uid,
            lifetime_builds_used: d.lifetime_builds_used ?? 0,
            free_lifetime_limit:  d.free_lifetime_limit  ?? FREE_LIFETIME_LIMIT,
            monthly_credits:  d.monthly_credits  ?? 0,
            bonus_credits:    d.bonus_credits    ?? 0,
            rollover_credits: d.rollover_credits ?? 0,
            topup_credits:    d.topup_credits    ?? 0,
            last_daily_bonus_at: d.last_daily_bonus_at ? tsToString(d.last_daily_bonus_at) : null,
            created_at: tsToString(d.created_at),
            updated_at: tsToString(d.updated_at),
          });
        } else {
          // Doc doesn't exist — auto-initialize via backend
          setCredits(null);
          try {
            const token = await user.getIdToken();
            await fetch(`${API_BASE}/api/credits/initialize`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
            // onSnapshot fires again once backend creates the doc
          } catch {
            // Silently ignore — will retry on next render
          }
        }
        setCreditsLoading(false);
      },
      () => {
        setCredits(null);
        setCreditsLoading(false);
      },
    );

    return () => unsub();
  }, [user?.uid]);

  // Subscription document (read-only)
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['user-subscription', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const snap = await getDoc(doc(db, 'subscriptions', user.uid));
      if (!snap.exists()) return null;
      const d = snap.data();
      return {
        id: snap.id,
        user_id: user.uid,
        plan_type: d.plan_type ?? 'free',
        selected_credits: d.selected_credits ?? 0,
        price_cents: d.price_cents ?? 0,
        billing_period_start: tsToString(d.billing_period_start),
        billing_period_end: tsToString(d.billing_period_end),
        is_annual: d.is_annual ?? false,
        status: d.status ?? 'active',
        stripe_customer_id: d.stripe_customer_id ?? null,
        stripe_subscription_id: d.stripe_subscription_id ?? null,
        stripe_price_id: d.stripe_price_id ?? null,
        created_at: tsToString(d.created_at),
        updated_at: tsToString(d.updated_at),
      } as UserSubscription;
    },
    enabled: !!user?.uid,
  });

  // Credit transactions (read-only — backend writes these)
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['credit-transactions', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, 'creditTransactions'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc'),
        limit(50),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        created_at: tsToString(d.data().created_at),
      })) as CreditTransaction[];
    },
    enabled: !!user?.uid,
  });

  const actionCosts = Object.values(ACTION_COSTS);
  const currentPlanType = subscription?.plan_type ?? 'free';

  const effectiveBonusCredits = 0; // deprecated for free tier

  const totalCredits = currentPlanType === 'free'
    ? Math.max(0, (credits?.free_lifetime_limit ?? FREE_LIFETIME_LIMIT) - (credits?.lifetime_builds_used ?? 0))
      + Number(credits?.topup_credits ?? 0)
    : Number(credits?.monthly_credits  ?? 0) +
      Number(credits?.bonus_credits    ?? 0) +
      Number(credits?.rollover_credits ?? 0) +
      Number(credits?.topup_credits    ?? 0);

  // Free tier has no daily claim — lifetime credits are assigned at signup
  const canClaimDailyBonus = (): boolean => false;

  // Claim daily credits via backend — server enforces UTC date, cannot be bypassed
  const claimDailyBonusMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/credits/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.status === 409) {
        return [{ success: false, message: data.message || 'Already claimed today', credits_added: 0 }];
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim credits');
      }
      return [{ success: true, message: 'Credits claimed!', credits_added: data.credits_added }];
    },
    onSuccess: (data) => {
      const result = data?.[0];
      if (!result?.success) {
        toast({ title: 'Free Plan', description: result?.message || 'No claimable credits.' });
      }
    },
    onError: (error) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    },
  });

  const canPerformAction = (actionType: CreditActionType): boolean => {
    const cost = ACTION_COSTS[actionType]?.credit_cost ?? 1;
    return totalCredits >= cost;
  };

  const getActionCost = (actionType: CreditActionType): number =>
    ACTION_COSTS[actionType]?.credit_cost ?? 1;

  return {
    credits,
    subscription,
    transactions,
    actionCosts,
    totalCredits,
    effectiveBonusCredits,
    currentPlanType,
    isLoading: creditsLoading || subscriptionLoading,
    transactionsLoading,
    // All credit deductions are handled server-side (generate.ts → checkAndDeductCredits)
    deductCredits: () => {},
    deductCreditsAsync: async () => [{ success: true, message: 'Handled server-side', remaining_credits: totalCredits }],
    isDeducting: false,
    claimDailyBonus: claimDailyBonusMutation.mutate,
    isClaimingBonus: claimDailyBonusMutation.isPending,
    canPerformAction,
    getActionCost,
    canClaimDailyBonus,
  };
}
