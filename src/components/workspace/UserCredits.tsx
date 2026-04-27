import { Coins, AlertTriangle, Loader2 } from "lucide-react";
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
    currentPlanType,
    isLoading,
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

  const isFree         = currentPlanType === 'free';
  const lifetimeLimit  = credits.free_lifetime_limit ?? 10;
  const lifetimeUsed   = credits.lifetime_builds_used ?? 0;
  const lifetimeLeft   = Math.max(0, lifetimeLimit - lifetimeUsed);
  const isLowBalance   = isFree ? lifetimeLeft < 3 : totalCredits < 10;
  const maxCredits     = isFree ? lifetimeLimit : 500;
  const displayCount   = isFree ? lifetimeLeft : totalCredits;
  const progressPercent = Math.min((displayCount / maxCredits) * 100, 100);

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
          <span className="font-medium">
            {isFree ? `${lifetimeLeft}/${lifetimeLimit}` : totalCredits.toFixed(0)}
          </span>
          {isLowBalance && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFree ? 'Running low on lifetime builds' : 'Low credit balance'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
              {isFree
                ? `${lifetimeLeft} of ${lifetimeLimit} lifetime builds remaining`
                : `${totalCredits.toFixed(0)} credits remaining · resets monthly`}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {isFree ? (
              <>
                <div className="flex justify-between text-muted-foreground">
                  <span>Builds used</span>
                  <span className="font-mono">{lifetimeUsed}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Lifetime limit</span>
                  <span className="font-mono">{lifetimeLimit}</span>
                </div>
                {Number(credits.topup_credits) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Top-up</span>
                    <span className="font-mono">{Number(credits.topup_credits).toFixed(1)}</span>
                  </div>
                )}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

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
            <a href="/dashboard/settings?tab=billing">Upgrade Plan →</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
