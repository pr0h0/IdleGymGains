"use client";

import { DailyChallenge } from "@/lib/game-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Check, Gift } from "lucide-react";
import { formatNumber } from "@/lib/format-number";

interface DailyChallengePanelProps {
  challenge: DailyChallenge | null;
  proteinPoints: number;
  titanTokens: number;
  onClaim: () => void;
}

export function DailyChallengePanel({
  challenge,
  proteinPoints: _proteinPoints,
  titanTokens: _titanTokens,
  onClaim,
}: DailyChallengePanelProps) {
  if (!challenge) {
    return (
      <Card className="p-4 border-dashed border-muted bg-muted/20">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">No active challenge</span>
        </div>
      </Card>
    );
  }

  const target = challenge.requirement.value;
  const current = challenge.progress;
  const isCompleted = current >= target;
  const progressPercent = Math.min(100, (current / target) * 100);

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-400">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold">Daily Challenge</h3>
        </div>
        {challenge.completed ? (
          <Badge
            variant="secondary"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            Completed
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            Expires in 24h
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{challenge.description}</span>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {formatNumber(current)} / {formatNumber(target)}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-muted-foreground">Reward:</span>
            <Badge variant="secondary" className="text-xs">
              {challenge.reward.type === "pp" &&
                `${formatNumber(challenge.reward.value)} PP`}
              {challenge.reward.type === "tt" &&
                `${formatNumber(challenge.reward.value)} TT`}
              {challenge.reward.type === "calories" &&
                `${formatNumber(challenge.reward.value)} Cal`}
            </Badge>
          </div>

          <Button
            size="sm"
            variant={
              isCompleted && !challenge.completed ? "default" : "outline"
            }
            disabled={!isCompleted || challenge.completed}
            onClick={onClaim}
            className={
              isCompleted && !challenge.completed ? "animate-pulse" : ""
            }
          >
            {challenge.completed ? (
              <>
                <Check className="w-3 h-3 mr-1" /> Claimed
              </>
            ) : (
              "Claim"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
