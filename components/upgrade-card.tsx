"use client";

import { memo } from "react";
import { formatNumber } from "@/lib/format-number";
import type { Upgrade, BuyMultiplier } from "@/lib/game-data";
import {
  getMilestoneMultiplier,
  getNextMilestone,
  calculateBulkPurchase,
} from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, TrendingUp } from "lucide-react";

interface UpgradeCardProps {
  upgrade: Upgrade;
  currentCost: number;
  canAfford: boolean;
  isUnlocked: boolean;
  onPurchase: () => void;
  buyMultiplier: BuyMultiplier;
  currentCalories: number;
  costReduction: number;
  onBulkPurchase: (count: number, totalCost: number) => void;
}

function UpgradeCardBase({
  upgrade,
  currentCost,
  canAfford,
  isUnlocked,
  onPurchase,
  buyMultiplier,
  currentCalories,
  costReduction,
  onBulkPurchase,
}: UpgradeCardProps) {
  const isMaxed = upgrade.level >= upgrade.maxLevel;

  const currentMultiplier = upgrade.hasMilestones
    ? getMilestoneMultiplier(upgrade.level)
    : 1;
  const nextMilestone = upgrade.hasMilestones
    ? getNextMilestone(upgrade.level)
    : null;
  const nextMultiplier =
    nextMilestone && upgrade.hasMilestones
      ? getMilestoneMultiplier(nextMilestone)
      : null;

  const effectiveValue = upgrade.effect * currentMultiplier;
  const totalEffect = effectiveValue * upgrade.level;

  const bulkInfo = calculateBulkPurchase(
    upgrade,
    currentCalories,
    buyMultiplier,
    costReduction,
  );
  const displayCount = buyMultiplier === 1 ? 1 : bulkInfo.count;
  const displayCost = buyMultiplier === 1 ? currentCost : bulkInfo.totalCost;
  const canAffordBulk =
    buyMultiplier === 1
      ? canAfford
      : bulkInfo.count > 0 && currentCalories >= bulkInfo.totalCost;

  const handlePurchase = () => {
    if (buyMultiplier === 1) {
      onPurchase();
    } else if (bulkInfo.count > 0) {
      onBulkPurchase(bulkInfo.count, bulkInfo.totalCost);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="bg-card/50 rounded-lg p-4 border border-border opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-muted-foreground">Locked</h3>
            <p className="text-xs text-muted-foreground">
              Reach {formatNumber(upgrade.unlockAt)} total cal
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card rounded-lg p-4 border transition-all duration-200",
        canAffordBulk && !isMaxed
          ? "border-primary/50 hover:border-primary shadow-lg shadow-primary/10"
          : "border-border",
        !canAffordBulk && !isMaxed && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center text-2xl shrink-0">
          {upgrade.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {upgrade.name}
            </h3>
            <span className="text-xs text-muted-foreground shrink-0">
              Lv.{upgrade.level}
              {upgrade.maxLevel !== Number.POSITIVE_INFINITY &&
                `/${upgrade.maxLevel}`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {upgrade.effectType === "multiplier" ? (
              upgrade.description
            ) : (
              <>
                +{formatNumber(effectiveValue)}{" "}
                {upgrade.effectType === "lift" ? "cal/lift" : "cal/sec"}
                {upgrade.level > 0 && (
                  <span className="text-muted-foreground/80 ml-1.5 font-medium">
                    (Total: +{formatNumber(totalEffect)})
                  </span>
                )}
                {currentMultiplier > 1 && (
                  <span className="text-orange-400 ml-1">
                    (x{currentMultiplier})
                  </span>
                )}
              </>
            )}
          </p>
          {upgrade.hasMilestones && nextMilestone && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-cyan-400">
                Lv.{nextMilestone}: x{nextMultiplier} power
              </span>
              <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-linear-to-r from-cyan-500 to-cyan-400 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (upgrade.level / nextMilestone) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
          {upgrade.maxLevel !== Number.POSITIVE_INFINITY && (
            <Progress
              value={(upgrade.level / upgrade.maxLevel) * 100}
              className="h-1 mt-2"
            />
          )}
        </div>
      </div>
      <Button
        onClick={handlePurchase}
        disabled={!canAffordBulk || isMaxed}
        size="sm"
        className={cn(
          "w-full mt-3",
          canAffordBulk && !isMaxed
            ? "bg-linear-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            : "bg-secondary text-muted-foreground",
        )}
      >
        {isMaxed ? (
          "MAXED"
        ) : (
          <span className="flex items-center gap-2">
            {displayCount > 1 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                +{displayCount}
              </span>
            )}
            <span>{formatNumber(displayCost)} cal</span>
          </span>
        )}
      </Button>
    </div>
  );
}

function arePropsEqual(prev: UpgradeCardProps, next: UpgradeCardProps) {
  if (
    prev.upgrade.id !== next.upgrade.id ||
    prev.upgrade.level !== next.upgrade.level ||
    prev.buyMultiplier !== next.buyMultiplier ||
    prev.costReduction !== next.costReduction ||
    prev.isUnlocked !== next.isUnlocked
  ) {
    return false;
  }

  if (next.buyMultiplier === "max") {
    return prev.currentCalories === next.currentCalories;
  }

  const bulkInfo = calculateBulkPurchase(
    next.upgrade,
    0,
    next.buyMultiplier,
    next.costReduction,
  );
  const cost = next.buyMultiplier === 1 ? next.currentCost : bulkInfo.totalCost;

  const prevCanAfford = prev.currentCalories >= cost;
  const nextCanAfford = next.currentCalories >= cost;

  return prevCanAfford === nextCanAfford;
}

const MemoizedUpgradeCard = memo(UpgradeCardBase, arePropsEqual);

export function UpgradeCard(props: UpgradeCardProps) {
  return <MemoizedUpgradeCard {...props} />;
}
