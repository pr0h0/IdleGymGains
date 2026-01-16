"use client";

import { memo } from "react";
import {
  Coins,
  Sparkles,
  Rocket,
  Infinity as InfinityIcon,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/format-number";
import { type GymBro } from "@/lib/game-data";
import { cn } from "@/lib/utils";

interface GymBroCardProps {
  bro: GymBro;
  cost: number;
  currency: string;
  canAfford: boolean;
  isUnlocked: boolean;
  onHire: (id: string) => void;
  showPreview?: boolean;
}

const getCurrencyIcon = (currency: string) => {
  switch (currency) {
    case "protein":
      return <Sparkles className="w-3 h-3 text-fuchsia-400" />;
    case "titan":
      return <Rocket className="w-3 h-3 text-purple-400" />;
    case "divinity":
      return <InfinityIcon className="w-3 h-3 text-cyan-400" />;
    default:
      return <Coins className="w-3 h-3 text-yellow-500" />;
  }
};

const getCurrencyName = (currency: string) => {
  switch (currency) {
    case "protein":
      return "PP (Medals)";
    case "titan":
      return "TT (Pro)";
    case "divinity":
      return "DP (Trophies)";
    default:
      return "Calories";
  }
};

function GymBroCardBase({
  bro,
  cost,
  currency,
  canAfford,
  isUnlocked,
  onHire,
  showPreview,
}: GymBroCardProps) {
  if (!isUnlocked && !showPreview) {
    return (
      <div className="bg-card/50 rounded-lg p-4 border border-border opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-muted-foreground">Locked</h3>
            <p className="text-sm text-muted-foreground">
              Reach {formatNumber(bro.unlockAt)} total calories
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-2 transition-colors relative",
        !isUnlocked ? "border-dashed opacity-80" : "hover:border-primary/50",
      )}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-background/90 border border-border p-3 rounded-lg shadow-lg flex flex-col items-center gap-2">
            <p className="font-bold text-sm">Locked</p>
            <Badge variant="secondary">
              {formatNumber(bro.unlockAt)} Calories
            </Badge>
          </div>
        </div>
      )}
      <CardContent className={cn("p-4", !isUnlocked && "blur-sm")}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-3">
            <div className="text-4xl bg-secondary/30 p-2 rounded-xl h-16 w-16 flex items-center justify-center">
              {bro.icon}
            </div>
            <div>
              <h4 className="font-bold text-lg">{bro.name}</h4>
              <Badge variant="outline" className="mb-1">
                Level {bro.level}
              </Badge>
              <div className="text-xs text-muted-foreground italic max-w-50">
                &quot;{bro.quote}&quot;
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Effect
            </div>
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
            >
              {bro.effectType === "auto_lift" &&
                `+${formatNumber(bro.effect * (bro.level || 1))} Lifts/5s`}
              {bro.effectType === "crit_chance" &&
                `+${(bro.effect * bro.level * 100).toFixed(1)}% Crit Chance`}
              {bro.effectType === "passive_mult" &&
                `x${(1 + (bro.effect - 1) * bro.level).toFixed(2)} Passive`}
              {bro.effectType === "speed_boost" &&
                `x${(1 + (bro.effect - 1) * bro.level).toFixed(2)} Speed`}
            </Badge>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="text-sm flex items-center gap-2">
            <span className="text-muted-foreground">Upgrade Cost:</span>
            <Badge
              variant="outline"
              className={
                canAfford
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }
            >
              <span className="flex items-center gap-1">
                {getCurrencyIcon(currency)}
                {formatNumber(cost)} {getCurrencyName(currency)}
              </span>
            </Badge>
          </div>
          <Button
            size="sm"
            onClick={() => onHire(bro.id)}
            disabled={!canAfford || !isUnlocked}
            variant={canAfford && isUnlocked ? "default" : "secondary"}
          >
            {bro.level === 0 ? "Hire Bro" : "Promote Bro"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function arePropsEqual(prev: GymBroCardProps, next: GymBroCardProps) {
  return (
    prev.bro.id === next.bro.id &&
    prev.bro.level === next.bro.level &&
    prev.canAfford === next.canAfford &&
    prev.isUnlocked === next.isUnlocked &&
    prev.showPreview === next.showPreview
  );
}

const MemoizedGymBroCard = memo(GymBroCardBase, arePropsEqual);

export function GymBroCard(props: GymBroCardProps) {
  return <MemoizedGymBroCard {...props} />;
}
