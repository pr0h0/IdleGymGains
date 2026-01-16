"use client";

import { formatNumber } from "@/lib/format-number";
import type { PrestigeUpgrade } from "@/lib/game-data";
import { getPrestigeUpgradeCost } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, RotateCcw, ChevronRight } from "lucide-react";

interface PrestigePanelProps {
  proteinPoints: number;
  potentialPrestige: number;
  caloriesForNextPP: number;
  prestigeUpgrades: PrestigeUpgrade[];
  totalCalories: number;
  onPrestige: () => void;
  onPurchaseUpgrade: (id: string) => void;
}

export function PrestigePanel({
  proteinPoints,
  potentialPrestige,
  caloriesForNextPP,
  prestigeUpgrades,
  totalCalories: _totalCalories,
  onPrestige,
  onPurchaseUpgrade,
}: PrestigePanelProps) {
  const canPrestige = potentialPrestige >= 1;

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-foreground">Competition</h2>
      </div>

      <div className="bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Current PP</span>
          <Badge
            variant="secondary"
            className="bg-purple-500/20 text-purple-300 border-purple-500/30"
          >
            {formatNumber(proteinPoints)} PP
          </Badge>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Next PP at</span>
          <span className="text-sm text-muted-foreground">
            {formatNumber(caloriesForNextPP)} Cal
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">On Compete</span>
          <span
            className={cn(
              "text-sm font-semibold",
              canPrestige ? "text-purple-400" : "text-muted-foreground",
            )}
          >
            +{formatNumber(potentialPrestige)} PP
          </span>
        </div>
      </div>

      <Button
        onClick={onPrestige}
        disabled={!canPrestige}
        className={cn(
          "w-full mb-4",
          canPrestige
            ? "bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            : "bg-secondary text-muted-foreground",
        )}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        {canPrestige
          ? `Compete for ${formatNumber(potentialPrestige)} PP`
          : "Need 1M cal to Compete"}
      </Button>

      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
        <p className="text-xs text-purple-300 text-center">
          Competition resets your calories and training upgrades.
          <br />
          Keep your Protein Points and Gym Bros!
        </p>
      </div>

      <p className="text-xs text-muted-foreground text-center mb-4">
        Burn {formatNumber(1e6)} total calories to unlock competition
      </p>

      <h3 className="text-sm font-medium text-foreground mb-3">
        Repeatable Upgrades
      </h3>
      <div className="space-y-2 max-h-70 overflow-y-auto pr-1">
        {prestigeUpgrades.map((upgrade) => {
          const cost = getPrestigeUpgradeCost(upgrade);
          const canAfford = proteinPoints >= cost;
          const isMaxed = upgrade.level >= upgrade.maxLevel;

          return (
            <div
              key={upgrade.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                isMaxed
                  ? "bg-purple-500/10 border border-purple-500/30"
                  : canAfford
                    ? "bg-secondary hover:bg-secondary/80 cursor-pointer border border-transparent hover:border-purple-500/30"
                    : "bg-secondary/50 opacity-60 border border-transparent",
              )}
              onClick={() =>
                !isMaxed && canAfford && onPurchaseUpgrade(upgrade.id)
              }
            >
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl shrink-0">
                {upgrade.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {upgrade.name}
                  </h4>
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0 text-purple-300 border-purple-500/30"
                  >
                    Lv.{upgrade.level}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {upgrade.description}
                </p>
                {upgrade.level > 0 && (
                  <p className="text-xs text-purple-400">
                    Current: x
                    {Math.pow(upgrade.effect, upgrade.level).toFixed(2)}
                  </p>
                )}
              </div>
              {!isMaxed ? (
                <div className="flex flex-col items-end shrink-0">
                  <Badge
                    variant="secondary"
                    className={cn(
                      canAfford
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {formatNumber(cost)} PP
                  </Badge>
                  <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-0.5">
                    <ChevronRight className="w-3 h-3" />x
                    {Math.pow(upgrade.effect, upgrade.level + 1).toFixed(2)}
                  </span>
                </div>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-300 shrink-0"
                >
                  MAX
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
