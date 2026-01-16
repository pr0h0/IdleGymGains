"use client";

import { formatNumber, type NumberNotation } from "@/lib/format-number";
import { GYM_RANKS, type GymRank } from "@/lib/game-data";
import { Flame } from "lucide-react";
import { memo } from "react";

interface GymStatsProps {
  calories: number;
  totalCalories: number;
  liftPower: number;
  passiveIncome: number;
  proteinPoints: number;
  titanTokens: number;
  divinityPoints?: number;
  rankBonus: number;
  numberNotation?: NumberNotation;
}

function getCurrentRank(totalCalories: number): GymRank {
  for (let i = GYM_RANKS.length - 1; i >= 0; i--) {
    if (totalCalories >= GYM_RANKS[i].minCalories) {
      return GYM_RANKS[i];
    }
  }
  return GYM_RANKS[0];
}

function getNextRank(totalCalories: number): GymRank | null {
  for (let i = 0; i < GYM_RANKS.length; i++) {
    if (totalCalories < GYM_RANKS[i].minCalories) {
      return GYM_RANKS[i];
    }
  }
  return null;
}

const GymStatsBase = ({
  calories,
  totalCalories,
  liftPower: _liftPower,
  passiveIncome: _passiveIncome,
  proteinPoints: _proteinPoints,
  titanTokens: _titanTokens,
  divinityPoints: _divinityPoints = 0,
  rankBonus,
  numberNotation = "standard",
}: GymStatsProps) => {
  const currentRank = getCurrentRank(totalCalories);
  const nextRank = getNextRank(totalCalories);
  const progress = nextRank
    ? ((totalCalories - currentRank.minCalories) /
        (nextRank.minCalories - currentRank.minCalories)) *
      100
    : 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Main calories display */}
      <div className="rounded-xl bg-linear-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="h-6 w-6 text-orange-400" />
          <span className="text-sm font-medium text-orange-300 uppercase tracking-wider">
            Calories Burned
          </span>
        </div>
        <div className="text-4xl md:text-5xl font-bold text-foreground mb-1">
          {formatNumber(calories, 2, numberNotation)}
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {formatNumber(totalCalories, 2, numberNotation)} burned
          lifetime
        </div>
      </div>

      {/* Rank display */}
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentRank.icon}</span>
            <div>
              <span className={`font-bold ${currentRank.color}`}>
                {currentRank.name}
              </span>
              {rankBonus > 1 && (
                <div className="text-xs text-green-400">
                  x{rankBonus.toFixed(1)} rank bonus
                </div>
              )}
            </div>
          </div>
          {nextRank && (
            <div className="flex flex-col items-end text-sm text-muted-foreground">
              <span>
                Next: {nextRank.icon} {nextRank.name}
              </span>
              <span className="text-xs text-green-400/70">
                x{nextRank.bonus.toFixed(1)} bonus
              </span>
            </div>
          )}
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-orange-500 to-red-500 transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {nextRank && (
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {formatNumber(
              nextRank.minCalories - totalCalories,
              2,
              numberNotation,
            )}{" "}
            cal to next rank
          </div>
        )}
      </div>

      {/* Stats grid */}
      {/* <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <Zap className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">Per Lift</div>
          <div className="font-bold text-foreground">{formatNumber(liftPower)}</div>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <TrendingUp className="h-4 w-4 text-green-400 mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">Per Second</div>
          <div className="font-bold text-foreground">{formatNumber(passiveIncome)}/s</div>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <Award className="h-4 w-4 text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">Protein Pts</div>
          <div className="font-bold text-foreground">{formatNumber(proteinPoints)}</div>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <Sparkles className="h-4 w-4 text-amber-400 mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">Titan Tokens</div>
          <div className="font-bold text-foreground">{formatNumber(titanTokens)}</div>
        </div>
        {divinityPoints > 0 && (
          <div className="rounded-lg bg-card border border-border p-3 text-center col-span-2">
            <Star className="h-4 w-4 text-fuchsia-400 mx-auto mb-1" />
            <div className="text-xs text-muted-foreground">Divinity Points</div>
            <div className="font-bold text-fuchsia-400">{formatNumber(divinityPoints)}</div>
          </div>
        )}
      </div> */}
    </div>
  );
};

export const GymStats = memo(GymStatsBase);
