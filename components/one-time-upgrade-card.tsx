"use client";

import { memo } from "react";
import { formatNumber } from "@/lib/format-number";
import type { OneTimeUpgrade } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lock, Check } from "lucide-react";

interface OneTimeUpgradeCardProps {
  upgrade: OneTimeUpgrade;
  canAfford: boolean;
  isUnlocked: boolean;
  onPurchase: () => void;
}

function OneTimeUpgradeCardBase({
  upgrade,
  canAfford,
  isUnlocked,
  onPurchase,
}: OneTimeUpgradeCardProps) {
  if (!isUnlocked && !upgrade.purchased) {
    return (
      <div className="bg-card/50 rounded-lg p-4 border border-border opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-muted-foreground text-sm">
              Locked
            </h3>
            <p className="text-xs text-muted-foreground">
              Reach {formatNumber(upgrade.unlockAt)} total cal
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (upgrade.purchased) {
    return (
      <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl shrink-0">
            {upgrade.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-green-400 truncate text-sm">
                {upgrade.name}
              </h3>
              <Check className="h-4 w-4 text-green-400 shrink-0" />
            </div>
            <p className="text-xs text-green-400/70">{upgrade.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card rounded-lg p-4 border transition-all duration-200",
        canAfford
          ? "border-yellow-500/50 hover:border-yellow-500 shadow-lg shadow-yellow-500/10"
          : "border-border opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center text-xl shrink-0">
          {upgrade.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate text-sm">
            {upgrade.name}
          </h3>
          <p className="text-xs text-muted-foreground">{upgrade.description}</p>
        </div>
      </div>
      <Button
        onClick={onPurchase}
        disabled={!canAfford}
        size="sm"
        className={cn(
          "w-full mt-3",
          canAfford
            ? "bg-linear-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-600 hover:to-amber-600"
            : "bg-secondary text-muted-foreground",
        )}
      >
        {formatNumber(upgrade.cost)} cal
      </Button>
    </div>
  );
}

function arePropsEqual(
  prev: OneTimeUpgradeCardProps,
  next: OneTimeUpgradeCardProps,
) {
  return (
    prev.upgrade.id === next.upgrade.id &&
    prev.upgrade.purchased === next.upgrade.purchased &&
    prev.canAfford === next.canAfford &&
    prev.isUnlocked === next.isUnlocked
  );
}

const MemoizedOneTimeUpgradeCard = memo(OneTimeUpgradeCardBase, arePropsEqual);

export function OneTimeUpgradeCard(props: OneTimeUpgradeCardProps) {
  return <MemoizedOneTimeUpgradeCard {...props} />;
}
