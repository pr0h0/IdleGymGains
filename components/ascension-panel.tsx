"use client";

import { formatNumber } from "@/lib/format-number";
import type { AscensionUpgrade } from "@/lib/game-data";
import {
  getAscensionUpgradeCost,
  ASCENSION_PP_THRESHOLD,
} from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Rocket, ChevronRight } from "lucide-react";

interface AscensionPanelProps {
  titanTokens: number;
  proteinPoints: number;
  potentialAscension: number;
  ppForNextTT: number;
  ascensionUpgrades: AscensionUpgrade[];
  onAscend: () => void;
  onPurchaseUpgrade: (id: string) => void;
}

export function AscensionPanel({
  titanTokens,
  proteinPoints,
  potentialAscension,
  ppForNextTT,
  ascensionUpgrades,
  onAscend,
  onPurchaseUpgrade,
}: AscensionPanelProps) {
  const canAscend = proteinPoints >= ASCENSION_PP_THRESHOLD;

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-foreground">Pro Card</h2>
      </div>

      <div className="bg-linear-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Titan Tokens</span>
          <Badge
            variant="secondary"
            className="bg-amber-500/20 text-amber-300 border-amber-500/30"
          >
            {formatNumber(titanTokens)} TT
          </Badge>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Current PP</span>
          <span className="text-sm text-purple-400">
            {formatNumber(proteinPoints)} PP
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Next TT at</span>
          <span className="text-sm text-muted-foreground">
            {formatNumber(ppForNextTT)} PP
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">On Go Pro</span>
          <span
            className={cn(
              "text-sm font-semibold",
              canAscend ? "text-amber-400" : "text-muted-foreground",
            )}
          >
            +{formatNumber(potentialAscension)} TT
          </span>
        </div>
      </div>

      <Button
        onClick={onAscend}
        disabled={!canAscend}
        className={cn(
          "w-full mb-4",
          canAscend
            ? "bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
            : "bg-secondary text-muted-foreground",
        )}
      >
        <Rocket className="w-4 h-4 mr-2" />
        {canAscend
          ? `Go Pro for ${formatNumber(potentialAscension)} TT`
          : `Need ${formatNumber(ASCENSION_PP_THRESHOLD)} PP`}
      </Button>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
        <p className="text-xs text-amber-300 text-center">
          Going Pro resets calories, training upgrades, AND protein points.
          <br />
          Titan Token upgrades are permanent forever!
        </p>
      </div>

      <h3 className="text-sm font-medium text-foreground mb-3">
        Titan Upgrades
      </h3>
      <div className="space-y-2 max-h-62.5 overflow-y-auto pr-1">
        {ascensionUpgrades.map((upgrade) => {
          const cost = getAscensionUpgradeCost(upgrade);
          const canAfford = titanTokens >= cost;
          const isMaxed = upgrade.level >= upgrade.maxLevel;

          return (
            <div
              key={upgrade.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                isMaxed
                  ? "bg-amber-500/10 border border-amber-500/30"
                  : canAfford
                    ? "bg-secondary hover:bg-secondary/80 cursor-pointer border border-transparent hover:border-amber-500/30"
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
                    className="text-xs px-1.5 py-0 text-amber-300 border-amber-500/30"
                  >
                    Lv.{upgrade.level}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {upgrade.description}
                </p>
                {upgrade.level > 0 && (
                  <p className="text-xs text-amber-400">
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
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {formatNumber(cost)} TT
                  </Badge>
                  <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-0.5">
                    <ChevronRight className="w-3 h-3" />x
                    {Math.pow(upgrade.effect, upgrade.level + 1).toFixed(2)}
                  </span>
                </div>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/20 text-amber-300 shrink-0"
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
