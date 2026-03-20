import { Coins, Gift, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useCredits } from "@/hooks/useCredits";

export function UserCredits() {
  const {
    credits,
    totalCredits,
    isLoading,
    canClaimDailyBonus,
    claimDailyBonus,
    isClaimingBonus,
  } = useCredits();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!credits) return null;

  const isLowBalance    = totalCredits < 10;
  const maxCredits      = 500;
  const progressPercent = Math.min((totalCredits / maxCredits) * 100, 100);
  const canClaim        = canClaimDailyBonus();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 h-8 px-3 ${
            isLowBalance
              ? "text-amber-500 hover:text-amber-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Coins className="h-4 w-4" />
          <span className="font-medium">{totalCredits.toFixed(0)}</span>
          {isLowBalance && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Low credit balance</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {canClaim && (
            <Badge
              variant="secondary"
              className="h-4 px-1 text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            >
              FREE
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Credit Balance</h4>
            <Badge variant="outline" className="font-mono">
              {totalCredits.toFixed(1)}
            </Badge>
          </div>

          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {totalCredits.toFixed(0)} credits remaining
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Monthly</span>
              <span className="font-mono">{Number(credits.monthly_credits).toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Bonus</span>
              <span className="font-mono">{Number(credits.bonus_credits).toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Rollover</span>
              <span className="font-mono">{Number(credits.rollover_credits).toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Top-up</span>
              <span className="font-mono">{Number(credits.topup_credits).toFixed(1)}</span>
            </div>
          </div>

          {canClaim && (
            <Button
              onClick={() => claimDailyBonus()}
              disabled={isClaimingBonus}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
              size="sm"
            >
              {isClaimingBonus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Gift className="h-4 w-4" />
              )}
              Claim Daily Bonus
            </Button>
          )}

          {isLowBalance && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-amber-500">Low Balance</p>
                <p className="text-muted-foreground">
                  Consider upgrading your plan for more credits.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t px-4 py-3 bg-muted/50">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <a href="/dashboard/billing">Upgrade Plan →</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
