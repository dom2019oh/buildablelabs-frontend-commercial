import { useState } from "react";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/urls";

export interface CreditTierWithStripe {
  id: string;
  plan_type: "free" | "pro" | "business" | "enterprise";
  credits: number;
  price_cents: number;
  is_popular: boolean;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}

export function useStripeCheckout() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/billing/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to start checkout");
      }

      const data = await res.json();

      if (data?.shouldUsePortal) {
        toast({
          title: "Active Subscription",
          description: "You already have an active subscription. Opening billing portal...",
        });
        await openBillingPortal();
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openBillingPortal = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/billing/portal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to open billing portal");
      }

      const data = await res.json();

      if (data?.noSubscription) {
        toast({ title: "No Subscription", description: "You don't have an active subscription yet." });
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      toast({
        title: "Portal Error",
        description: error instanceof Error ? error.message : "Failed to open billing portal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, openBillingPortal, isLoading };
}
