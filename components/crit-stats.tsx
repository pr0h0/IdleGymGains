"use client";

import { Zap, Target } from "lucide-react";

interface CritStatsProps {
  critChance: number;
  critMultiplier: number;
}

export function CritStats({ critChance, critMultiplier }: CritStatsProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
        <Target className="h-4 w-4 text-red-400 mx-auto mb-1" />
        <div className="text-xs text-muted-foreground">Crit Chance</div>
        <div className="font-bold text-red-400">
          {(critChance * 100).toFixed(1)}%
        </div>
      </div>
      <div className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
        <Zap className="h-4 w-4 text-red-400 mx-auto mb-1" />
        <div className="text-xs text-muted-foreground">Crit Mult</div>
        <div className="font-bold text-red-400">
          x{critMultiplier.toFixed(1)}
        </div>
      </div>
    </div>
  );
}
