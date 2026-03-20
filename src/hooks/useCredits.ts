import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs,
  runTransaction, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export type CreditActionType =
  | 'question_answer'
  | 'page_creation'
  | 'component_generation'
  | 'code_export'
  | 'ai_chat'
  | 'image_generation'
  | 'deployment';

export interface UserCredits {
  id: string;
  user_id: string;
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
  plan_type: 'free' | 'pro' | 'business' | 'enterprise';
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

// Static action costs — no DB read needed. Update here when pricing changes.
const ACTION_COSTS: Record<CreditActionType, CreditActionCost> = {
  question_answer:      { action_type: 'question_answer',      credit_cost: 1,  description: 'Q&A' },
  page_creation:        { action_type: 'page_creation',        credit_cost: 5,  description: 'Page creation' },
  component_generation: { action_type: 'component_generation', credit_cost: 3,  description: 'Component generation' },
  code_export:          { action_type: 'code_export',          credit_cost: 2,  description: 'Code export' },
  ai_chat:              { action_type: 'ai_chat',              credit_cost: 1,  description: 'AI chat message' },
  image_generation:     { action_type: 'image_generation',     credit_cost: 10, description: 'Image generation' },
  deployment:           { action_type: 'deployment',           credit_cost: 5,  description: 'Deployment' },
};

// Default credits for new users (free plan)
const FREE_MONTHLY_CREDITS = 100;
const DAILY_BONUS_CREDITS  = 10;

function tsToString(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return String(ts);
}

export function useCredits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // User credits document
  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ["user-credits", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;

      const snap = await getDoc(doc(db, "userCredits", user.uid));
      if (!snap.exists()) {
        // Auto-create on first read
        const now = new Date().toISOString();
        const defaultCredits = {
          user_id: user.uid,
          monthly_credits: FREE_MONTHLY_CREDITS,
          bonus_credits: 0,
          rollover_credits: 0,
          topup_credits: 0,
          last_daily_bonus_at: null,
          created_at: now,
          updated_at: now,
        };
        await setDoc(doc(db, "userCredits", user.uid), defaultCredits);
        return { id: user.uid, ...defaultCredits } as UserCredits;
      }

      const d = snap.data();
      return {
        id: snap.id,
        user_id: d.user_id ?? user.uid,
        monthly_credits: d.monthly_credits ?? 0,
        bonus_credits: d.bonus_credits ?? 0,
        rollover_credits: d.rollover_credits ?? 0,
        topup_credits: d.topup_credits ?? 0,
        last_daily_bonus_at: d.last_daily_bonus_at ? tsToString(d.last_daily_bonus_at) : null,
        created_at: tsToString(d.created_at),
        updated_at: tsToString(d.updated_at),
      } as UserCredits;
    },
    enabled: !!user?.uid,
  });

  // Subscription document
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["user-subscription", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const snap = await getDoc(doc(db, "subscriptions", user.uid));
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

  // Credit transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["credit-transactions", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, "creditTransactions"),
        where("user_id", "==", user.uid),
        orderBy("created_at", "desc"),
        limit(50)
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

  const totalCredits = credits
    ? Number(credits.monthly_credits) +
      Number(credits.bonus_credits) +
      Number(credits.rollover_credits) +
      Number(credits.topup_credits)
    : 0;

  // Deduct credits via Firestore transaction
  const deductCreditsMutation = useMutation({
    mutationFn: async ({
      actionType,
      description,
      metadata,
    }: {
      actionType: CreditActionType;
      description?: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user?.uid) throw new Error("Not authenticated");

      const cost = ACTION_COSTS[actionType]?.credit_cost ?? 0;
      const creditsRef = doc(db, "userCredits", user.uid);

      const result = await runTransaction(db, async (tx) => {
        const snap = await tx.get(creditsRef);
        if (!snap.exists()) throw new Error("Credits not found");

        const d = snap.data();
        let remaining =
          Number(d.monthly_credits) +
          Number(d.bonus_credits) +
          Number(d.rollover_credits) +
          Number(d.topup_credits);

        if (remaining < cost) {
          return { success: false, message: "Insufficient credits", remaining_credits: remaining };
        }

        // Deduct from bonus first, then monthly
        let toDeduce = cost;
        let newBonus = Number(d.bonus_credits);
        let newMonthly = Number(d.monthly_credits);

        if (newBonus >= toDeduce) {
          newBonus -= toDeduce;
          toDeduce = 0;
        } else {
          toDeduce -= newBonus;
          newBonus = 0;
        }
        if (toDeduce > 0) newMonthly -= toDeduce;

        remaining = newMonthly + newBonus + Number(d.rollover_credits) + Number(d.topup_credits);

        tx.update(creditsRef, {
          monthly_credits: newMonthly,
          bonus_credits: newBonus,
          updated_at: serverTimestamp(),
        });

        // Log transaction
        const txRef = doc(collection(db, "creditTransactions"));
        tx.set(txRef, {
          user_id: user.uid,
          transaction_type: "deduction",
          action_type: actionType,
          amount: -cost,
          balance_after: remaining,
          description: description ?? null,
          metadata: metadata ?? {},
          created_at: serverTimestamp(),
        });

        return { success: true, message: "Credits deducted", remaining_credits: remaining };
      });

      return [result];
    },
    onSuccess: (data) => {
      const result = data?.[0];
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["user-credits"] });
        queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
      } else {
        toast({
          title: "Insufficient Credits",
          description: result?.message || "You don't have enough credits for this action.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Claim daily bonus via Firestore transaction
  const claimDailyBonusMutation = useMutation({
    mutationFn: async () => {
      if (!user?.uid) throw new Error("Not authenticated");

      const creditsRef = doc(db, "userCredits", user.uid);

      const result = await runTransaction(db, async (tx) => {
        const snap = await tx.get(creditsRef);
        if (!snap.exists()) throw new Error("Credits not found");

        const d = snap.data();
        const lastBonus = d.last_daily_bonus_at
          ? (d.last_daily_bonus_at instanceof Timestamp
              ? d.last_daily_bonus_at.toDate()
              : new Date(d.last_daily_bonus_at))
          : null;

        const today = new Date();
        if (lastBonus && lastBonus.toDateString() === today.toDateString()) {
          return { success: false, message: "Already claimed today", credits_added: 0 };
        }

        tx.update(creditsRef, {
          bonus_credits: Number(d.bonus_credits) + DAILY_BONUS_CREDITS,
          last_daily_bonus_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });

        return { success: true, message: "Bonus claimed!", credits_added: DAILY_BONUS_CREDITS };
      });

      return [result];
    },
    onSuccess: (data) => {
      const result = data?.[0];
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["user-credits"] });
        toast({
          title: "Daily Bonus Claimed!",
          description: `You received ${result.credits_added} bonus credits.`,
        });
      } else {
        toast({ title: "Daily Bonus", description: result?.message || "Not available yet." });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const canPerformAction = (actionType: CreditActionType): boolean => {
    const cost = ACTION_COSTS[actionType]?.credit_cost ?? 0;
    return totalCredits >= cost;
  };

  const getActionCost = (actionType: CreditActionType): number =>
    ACTION_COSTS[actionType]?.credit_cost ?? 0;

  const canClaimDailyBonus = (): boolean => {
    if (!credits?.last_daily_bonus_at) return true;
    const lastBonus = new Date(credits.last_daily_bonus_at);
    return lastBonus.toDateString() !== new Date().toDateString();
  };

  return {
    credits,
    subscription,
    transactions,
    actionCosts,
    totalCredits,
    isLoading: creditsLoading || subscriptionLoading,
    transactionsLoading,
    deductCredits: deductCreditsMutation.mutate,
    deductCreditsAsync: deductCreditsMutation.mutateAsync,
    isDeducting: deductCreditsMutation.isPending,
    claimDailyBonus: claimDailyBonusMutation.mutate,
    isClaimingBonus: claimDailyBonusMutation.isPending,
    canPerformAction,
    getActionCost,
    canClaimDailyBonus,
  };
}
