"use client";

import { formatNumber, formatTime } from "@/lib/format-number";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Dumbbell,
  Zap,
  TrendingUp,
  Sparkles,
  Rocket,
  Infinity as InfinityIcon,
  Settings2,
} from "lucide-react";

export interface Multipliers {
  liftMult: number;
  passiveMult: number;
  costReduction: number;
  prestigeMult: number;
  ppMult: number;
  ttMult: number;
  ascensionMult: number;
  transcendenceMult: number;
  allMult: number;
  critChance: number;
  critMult: number;
  comboMult: number;
  upgradeMultiplier: number;
}

interface StatsPanelProps {
  playTime: number;
  totalLifts: number;
  totalCalories: number;
  lifetimeCalories: number;
  maxCombo: number;
  criticalHits: number;
  totalUpgrades: number;
  prestigeCount: number;
  ascensionCount: number;
  transcendenceCount: number;
  multipliers?: Multipliers;
}

export function StatsPanel({
  playTime,
  totalLifts,
  totalCalories,
  lifetimeCalories,
  maxCombo,
  criticalHits,
  totalUpgrades,
  prestigeCount,
  ascensionCount,
  transcendenceCount,
  multipliers,
}: StatsPanelProps) {
  return (
    <ScrollArea className="h-[500px] w-full rounded-md border p-4">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            General
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Play Time</span>
              <span className="font-mono">{formatTime(playTime)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-400" />
            Lifting
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Total Lifts</span>
              <span className="font-mono">{formatNumber(totalLifts)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Critical Hits</span>
              <span className="font-mono">{formatNumber(criticalHits)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Max Combo</span>
              <span className="font-mono">{maxCombo}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Earnings
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Current Calories</span>
              <span className="font-mono">{formatNumber(totalCalories)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Lifetime Calories</span>
              <span className="font-mono">
                {formatNumber(lifetimeCalories)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Progression
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Upgrades Purchased</span>
              <span className="font-mono">{formatNumber(totalUpgrades)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Hall of Fame
          </h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col items-center bg-secondary/30 p-2 rounded">
              <Sparkles className="w-4 h-4 mb-1 text-purple-300" />
              <span className="text-xs text-muted-foreground">
                Competitions
              </span>
              <span className="font-mono font-bold">{prestigeCount}</span>
            </div>
            <div className="flex flex-col items-center bg-secondary/30 p-2 rounded">
              <Rocket className="w-4 h-4 mb-1 text-red-400" />
              <span className="text-xs text-muted-foreground">Pro Cards</span>
              <span className="font-mono font-bold">{ascensionCount}</span>
            </div>
            <div className="flex flex-col items-center bg-secondary/30 p-2 rounded">
              <InfinityIcon className="w-4 h-4 mb-1 text-fuchsia-400" />
              <span className="text-xs text-muted-foreground">
                Olympia Wins
              </span>
              <span className="font-mono font-bold">{transcendenceCount}</span>
            </div>
          </div>
        </div>

        {multipliers && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-gray-400" />
              Active Multipliers
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col border p-2 rounded bg-secondary/10">
                <span className="text-muted-foreground text-xs">
                  Total Lift Multiplier
                </span>
                <span className="font-mono text-lg text-orange-400">
                  x
                  {formatNumber(
                    multipliers.liftMult *
                      multipliers.allMult *
                      multipliers.upgradeMultiplier,
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  (Base x Global x Upgrades)
                </span>
              </div>
              <div className="flex flex-col border p-2 rounded bg-secondary/10">
                <span className="text-muted-foreground text-xs">
                  Total Passive Multiplier
                </span>
                <span className="font-mono text-lg text-blue-400">
                  x
                  {formatNumber(
                    multipliers.passiveMult *
                      multipliers.allMult *
                      multipliers.upgradeMultiplier,
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  (Base x Global x Upgrades)
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-muted-foreground">
                  Detailed Breakdown
                </span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 pl-2 border-l-2">
                  <span className="text-muted-foreground text-xs">
                    Upgrade Items Mult:
                  </span>
                  <span className="font-mono text-xs">
                    x{formatNumber(multipliers.upgradeMultiplier)}
                  </span>

                  <span className="text-muted-foreground text-xs">
                    Global Mult:
                  </span>
                  <span className="font-mono text-xs">
                    x{formatNumber(multipliers.allMult)}
                  </span>

                  <span className="text-muted-foreground text-xs">
                    Prestige Mult:
                  </span>
                  <span className="font-mono text-xs">
                    x{formatNumber(multipliers.prestigeMult)}
                  </span>

                  <span className="text-muted-foreground text-xs">
                    Ascension Mult:
                  </span>
                  <span className="font-mono text-xs">
                    x{formatNumber(multipliers.ascensionMult)}
                  </span>

                  <span className="text-muted-foreground text-xs">
                    Transcendence Mult:
                  </span>
                  <span className="font-mono text-xs">
                    x{formatNumber(multipliers.transcendenceMult)}
                  </span>

                  <span className="text-muted-foreground text-xs">
                    Prestige Point Mult:
                  </span>
                  <span className="font-mono text-xs">
                    x{formatNumber(multipliers.ppMult)}
                  </span>

                  <span className="text-muted-foreground text-xs">
                    Cost Reduction:
                  </span>
                  <span className="font-mono text-xs">
                    x{formatNumber(multipliers.costReduction)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-muted-foreground">Combat / Other</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 pl-2 border-l-2">
                  <span className="text-muted-foreground text-xs">
                    Crit Chance:
                  </span>
                  <span className="font-mono text-xs">
                    {(multipliers.critChance * 100).toFixed(1)}%
                  </span>

                  <span className="text-muted-foreground text-xs">
                    Crit Multiplier:
                  </span>
                  <span className="font-mono text-xs">
                    x{formatNumber(multipliers.critMult)}
                  </span>

                  <span className="text-muted-foreground text-xs">
                    Max Combo Mult:
                  </span>
                  <span className="font-mono text-xs">
                    x{formatNumber(multipliers.comboMult)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
