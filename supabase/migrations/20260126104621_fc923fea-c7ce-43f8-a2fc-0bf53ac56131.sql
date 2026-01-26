-- =============================================
-- BUILDIFY CREDITS SYSTEM - COMPREHENSIVE SCHEMA
-- =============================================

-- 1. Create enums for plan types and transaction types
CREATE TYPE public.subscription_plan_type AS ENUM ('free', 'pro', 'business', 'enterprise');
CREATE TYPE public.credit_transaction_type AS ENUM ('subscription', 'topup', 'daily_bonus', 'rollover', 'usage', 'refund', 'admin_adjustment');
CREATE TYPE public.credit_action_type AS ENUM ('question_answer', 'page_creation', 'component_generation', 'code_export', 'ai_chat', 'image_generation', 'deployment');

-- 2. Subscription Plans Table (defines available plans)
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    plan_type subscription_plan_type NOT NULL UNIQUE,
    description TEXT,
    base_price_cents INTEGER NOT NULL DEFAULT 0,
    min_credits INTEGER NOT NULL DEFAULT 0,
    max_credits INTEGER NOT NULL DEFAULT 0,
    daily_bonus_credits INTEGER NOT NULL DEFAULT 0,
    allows_rollover BOOLEAN NOT NULL DEFAULT false,
    allows_custom_domain BOOLEAN NOT NULL DEFAULT false,
    allows_remove_branding BOOLEAN NOT NULL DEFAULT false,
    max_team_members INTEGER DEFAULT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Credit Tiers Table (defines pricing for credit amounts per plan)
CREATE TABLE public.credit_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type subscription_plan_type NOT NULL,
    credits INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    is_popular BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(plan_type, credits)
);

-- 4. Credit Action Costs Table (defines how much each action costs)
CREATE TABLE public.credit_action_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type credit_action_type NOT NULL UNIQUE,
    credit_cost DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. User Subscriptions Table (stores user's current subscription)
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type subscription_plan_type NOT NULL DEFAULT 'free',
    selected_credits INTEGER NOT NULL DEFAULT 0,
    price_cents INTEGER NOT NULL DEFAULT 0,
    billing_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    billing_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 month'),
    is_annual BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 6. User Credits Table (stores user's current credit balance)
CREATE TABLE public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monthly_credits DECIMAL(10, 2) NOT NULL DEFAULT 0,
    bonus_credits DECIMAL(10, 2) NOT NULL DEFAULT 0,
    rollover_credits DECIMAL(10, 2) NOT NULL DEFAULT 0,
    topup_credits DECIMAL(10, 2) NOT NULL DEFAULT 0,
    last_daily_bonus_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 7. Credit Transactions Table (logs all credit changes)
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type credit_transaction_type NOT NULL,
    action_type credit_action_type,
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_action_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Subscription Plans: Public read, no user write
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

-- Credit Tiers: Public read, no user write
CREATE POLICY "Anyone can view credit tiers"
ON public.credit_tiers FOR SELECT
USING (true);

-- Credit Action Costs: Public read, no user write
CREATE POLICY "Anyone can view active action costs"
ON public.credit_action_costs FOR SELECT
USING (is_active = true);

-- User Subscriptions: Users can only view/update their own
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User Credits: Users can only view their own, no direct updates (handled by functions)
CREATE POLICY "Users can view their own credits"
ON public.user_credits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
ON public.user_credits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Credit Transactions: Users can only view their own, inserts via function only
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- SECURITY DEFINER FUNCTIONS (for safe credit operations)
-- =============================================

-- Function to get user's total available credits
CREATE OR REPLACE FUNCTION public.get_user_total_credits(p_user_id UUID)
RETURNS DECIMAL(10, 2)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT monthly_credits + bonus_credits + rollover_credits + topup_credits
         FROM public.user_credits
         WHERE user_id = p_user_id),
        0
    );
$$;

-- Function to check if user has enough credits
CREATE OR REPLACE FUNCTION public.user_has_credits(p_user_id UUID, p_amount DECIMAL(10, 2))
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.get_user_total_credits(p_user_id) >= p_amount;
$$;

-- Function to get credit cost for an action
CREATE OR REPLACE FUNCTION public.get_action_credit_cost(p_action_type credit_action_type)
RETURNS DECIMAL(10, 2)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT credit_cost FROM public.credit_action_costs WHERE action_type = p_action_type AND is_active = true),
        0
    );
$$;

-- Function to deduct credits (CRITICAL: This is the ONLY way credits should be deducted)
CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_action_type credit_action_type,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(success BOOLEAN, message TEXT, remaining_credits DECIMAL(10, 2))
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cost DECIMAL(10, 2);
    v_current_credits DECIMAL(10, 2);
    v_remaining DECIMAL(10, 2);
    v_monthly DECIMAL(10, 2);
    v_bonus DECIMAL(10, 2);
    v_rollover DECIMAL(10, 2);
    v_topup DECIMAL(10, 2);
    v_to_deduct DECIMAL(10, 2);
BEGIN
    -- Get the cost for this action
    SELECT credit_cost INTO v_cost
    FROM public.credit_action_costs
    WHERE action_type = p_action_type AND is_active = true;
    
    IF v_cost IS NULL THEN
        RETURN QUERY SELECT false, 'Invalid action type'::TEXT, 0::DECIMAL(10, 2);
        RETURN;
    END IF;
    
    -- Get current credits
    SELECT monthly_credits, bonus_credits, rollover_credits, topup_credits
    INTO v_monthly, v_bonus, v_rollover, v_topup
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE; -- Lock the row
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'No credits found for user'::TEXT, 0::DECIMAL(10, 2);
        RETURN;
    END IF;
    
    v_current_credits := v_monthly + v_bonus + v_rollover + v_topup;
    
    IF v_current_credits < v_cost THEN
        RETURN QUERY SELECT false, 'Insufficient credits'::TEXT, v_current_credits;
        RETURN;
    END IF;
    
    -- Deduct in order: bonus -> rollover -> topup -> monthly
    v_to_deduct := v_cost;
    
    -- Deduct from bonus first
    IF v_to_deduct > 0 AND v_bonus > 0 THEN
        IF v_bonus >= v_to_deduct THEN
            v_bonus := v_bonus - v_to_deduct;
            v_to_deduct := 0;
        ELSE
            v_to_deduct := v_to_deduct - v_bonus;
            v_bonus := 0;
        END IF;
    END IF;
    
    -- Deduct from rollover
    IF v_to_deduct > 0 AND v_rollover > 0 THEN
        IF v_rollover >= v_to_deduct THEN
            v_rollover := v_rollover - v_to_deduct;
            v_to_deduct := 0;
        ELSE
            v_to_deduct := v_to_deduct - v_rollover;
            v_rollover := 0;
        END IF;
    END IF;
    
    -- Deduct from topup
    IF v_to_deduct > 0 AND v_topup > 0 THEN
        IF v_topup >= v_to_deduct THEN
            v_topup := v_topup - v_to_deduct;
            v_to_deduct := 0;
        ELSE
            v_to_deduct := v_to_deduct - v_topup;
            v_topup := 0;
        END IF;
    END IF;
    
    -- Deduct from monthly
    IF v_to_deduct > 0 THEN
        v_monthly := v_monthly - v_to_deduct;
    END IF;
    
    v_remaining := v_monthly + v_bonus + v_rollover + v_topup;
    
    -- Update credits
    UPDATE public.user_credits
    SET 
        monthly_credits = v_monthly,
        bonus_credits = v_bonus,
        rollover_credits = v_rollover,
        topup_credits = v_topup,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Log transaction
    INSERT INTO public.credit_transactions (user_id, transaction_type, action_type, amount, balance_after, description, metadata)
    VALUES (p_user_id, 'usage', p_action_type, -v_cost, v_remaining, COALESCE(p_description, 'Credit usage'), p_metadata);
    
    RETURN QUERY SELECT true, 'Credits deducted successfully'::TEXT, v_remaining;
END;
$$;

-- Function to add credits (for subscriptions, topups, bonuses)
CREATE OR REPLACE FUNCTION public.add_credits(
    p_user_id UUID,
    p_amount DECIMAL(10, 2),
    p_transaction_type credit_transaction_type,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(success BOOLEAN, message TEXT, new_balance DECIMAL(10, 2))
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_balance DECIMAL(10, 2);
BEGIN
    -- Ensure user_credits row exists
    INSERT INTO public.user_credits (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Add credits based on transaction type
    CASE p_transaction_type
        WHEN 'subscription' THEN
            UPDATE public.user_credits
            SET monthly_credits = monthly_credits + p_amount, updated_at = now()
            WHERE user_id = p_user_id;
        WHEN 'daily_bonus' THEN
            UPDATE public.user_credits
            SET bonus_credits = bonus_credits + p_amount, last_daily_bonus_at = now(), updated_at = now()
            WHERE user_id = p_user_id;
        WHEN 'rollover' THEN
            UPDATE public.user_credits
            SET rollover_credits = rollover_credits + p_amount, updated_at = now()
            WHERE user_id = p_user_id;
        WHEN 'topup' THEN
            UPDATE public.user_credits
            SET topup_credits = topup_credits + p_amount, updated_at = now()
            WHERE user_id = p_user_id;
        WHEN 'refund' THEN
            UPDATE public.user_credits
            SET topup_credits = topup_credits + p_amount, updated_at = now()
            WHERE user_id = p_user_id;
        WHEN 'admin_adjustment' THEN
            UPDATE public.user_credits
            SET topup_credits = topup_credits + p_amount, updated_at = now()
            WHERE user_id = p_user_id;
        ELSE
            RETURN QUERY SELECT false, 'Invalid transaction type'::TEXT, 0::DECIMAL(10, 2);
            RETURN;
    END CASE;
    
    -- Get new balance
    SELECT monthly_credits + bonus_credits + rollover_credits + topup_credits
    INTO v_new_balance
    FROM public.user_credits
    WHERE user_id = p_user_id;
    
    -- Log transaction
    INSERT INTO public.credit_transactions (user_id, transaction_type, amount, balance_after, description, metadata)
    VALUES (p_user_id, p_transaction_type, p_amount, v_new_balance, COALESCE(p_description, 'Credit addition'), p_metadata);
    
    RETURN QUERY SELECT true, 'Credits added successfully'::TEXT, v_new_balance;
END;
$$;

-- Function to claim daily bonus
CREATE OR REPLACE FUNCTION public.claim_daily_bonus(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, credits_added DECIMAL(10, 2))
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_last_bonus TIMESTAMPTZ;
    v_plan_type subscription_plan_type;
    v_daily_bonus INTEGER;
BEGIN
    -- Get user's subscription and last bonus time
    SELECT us.plan_type, uc.last_daily_bonus_at
    INTO v_plan_type, v_last_bonus
    FROM public.user_subscriptions us
    LEFT JOIN public.user_credits uc ON uc.user_id = us.user_id
    WHERE us.user_id = p_user_id;
    
    IF v_plan_type IS NULL THEN
        v_plan_type := 'free';
    END IF;
    
    -- Check if already claimed today
    IF v_last_bonus IS NOT NULL AND v_last_bonus::DATE = CURRENT_DATE THEN
        RETURN QUERY SELECT false, 'Daily bonus already claimed today'::TEXT, 0::DECIMAL(10, 2);
        RETURN;
    END IF;
    
    -- Get daily bonus amount for plan
    SELECT daily_bonus_credits INTO v_daily_bonus
    FROM public.subscription_plans
    WHERE plan_type = v_plan_type;
    
    IF v_daily_bonus IS NULL OR v_daily_bonus = 0 THEN
        RETURN QUERY SELECT false, 'No daily bonus available for your plan'::TEXT, 0::DECIMAL(10, 2);
        RETURN;
    END IF;
    
    -- Add bonus credits
    PERFORM public.add_credits(p_user_id, v_daily_bonus::DECIMAL, 'daily_bonus', 'Daily bonus credits');
    
    RETURN QUERY SELECT true, 'Daily bonus claimed!'::TEXT, v_daily_bonus::DECIMAL(10, 2);
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_action_costs_updated_at
    BEFORE UPDATE ON public.credit_action_costs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create user_credits and user_subscriptions when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create default subscription (free)
    INSERT INTO public.user_subscriptions (user_id, plan_type, selected_credits)
    VALUES (NEW.user_id, 'free', 0);
    
    -- Create credits record
    INSERT INTO public.user_credits (user_id)
    VALUES (NEW.user_id);
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_profile();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert subscription plans
INSERT INTO public.subscription_plans (name, plan_type, description, base_price_cents, min_credits, max_credits, daily_bonus_credits, allows_rollover, allows_custom_domain, allows_remove_branding, max_team_members, features) VALUES
('Free', 'free', 'Get started with Buildify', 0, 0, 0, 0, false, false, false, 1, '["5 credits on signup", "Public projects only", "Community support", "Basic AI generation"]'::jsonb),
('Pro', 'pro', 'For solo builders and creators', 1500, 50, 10000, 5, true, true, true, 1, '["Prompt → website generation", "Prompt → app UI generation", "Code export (React / Vite)", "Unlimited projects", "Private & public projects", "Credit rollover", "Daily bonus credits (5/day)", "Custom domains", "Remove Buildify branding", "On-demand credit top-ups"]'::jsonb),
('Business', 'business', 'For teams and studios', 2900, 100, 10000, 5, true, true, true, 5, '["Everything in Pro", "Team workspaces", "Shared projects", "Up to 5 team members", "Role-based access (Owner/Editor/Viewer)", "Internal preview links", "Personal sandbox projects", "Design templates", "Advanced AI generation modes", "SSO (Google, GitHub)"]'::jsonb),
('Enterprise', 'enterprise', 'For large orgs & platforms', 0, 0, 0, 10, true, true, true, NULL, '["Everything in Business", "Unlimited team members", "Custom credit plans", "Dedicated support", "Onboarding & training", "Group-based access control", "Audit logs", "SCIM provisioning", "Custom design systems", "Private deployments", "SLA & priority infrastructure"]'::jsonb);

-- Insert credit tiers for Pro plan
INSERT INTO public.credit_tiers (plan_type, credits, price_cents, is_popular) VALUES
('pro', 50, 1500, false),
('pro', 100, 2000, false),
('pro', 200, 2500, true),
('pro', 300, 3500, false),
('pro', 400, 4500, false),
('pro', 500, 5500, false),
('pro', 750, 7500, false),
('pro', 1000, 9500, false),
('pro', 1500, 13500, false),
('pro', 2000, 17500, false),
('pro', 3000, 25000, false),
('pro', 5000, 40000, false),
('pro', 10000, 70000, false);

-- Insert credit tiers for Business plan (slightly higher base)
INSERT INTO public.credit_tiers (plan_type, credits, price_cents, is_popular) VALUES
('business', 100, 2900, false),
('business', 200, 3900, true),
('business', 300, 4900, false),
('business', 400, 5900, false),
('business', 500, 6900, false),
('business', 750, 9500, false),
('business', 1000, 12000, false),
('business', 1500, 17000, false),
('business', 2000, 22000, false),
('business', 3000, 32000, false),
('business', 5000, 50000, false),
('business', 10000, 90000, false);

-- Insert credit action costs
INSERT INTO public.credit_action_costs (action_type, credit_cost, description) VALUES
('question_answer', 0.15, 'Answer to a question or simple AI response'),
('page_creation', 1.15, 'Full page creation with UI and functionality'),
('component_generation', 0.50, 'Generate a single component'),
('code_export', 0.25, 'Export code to external format'),
('ai_chat', 0.10, 'Simple AI chat message'),
('image_generation', 0.75, 'Generate an AI image'),
('deployment', 0.00, 'Deploy project (free)');