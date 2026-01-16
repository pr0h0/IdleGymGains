import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Achievement } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { CheckCircle2, Lock } from "lucide-react";

interface AchievementsPanelProps {
  achievements: Achievement[];
}

export function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progress = Math.round((unlockedCount / achievements.length) * 100);

  // Group achievements by unlock status for sorting
  const sortedAchievements = [...achievements].sort((a, b) => {
    // Unlocked first
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">Progress</h3>
          <Badge variant="secondary" className="font-mono">
            {unlockedCount} / {achievements.length}
          </Badge>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Unlock achievements to gain permanent bonuses!
        </p>
      </div>

      {/* Achievements List */}
      <ScrollArea className="h-125 pr-4">
        <div className="space-y-3">
          {sortedAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { name, description, icon, unlocked, reward } = achievement;

  const getRewardText = () => {
    const val = reward.value;
    switch (reward.type) {
      case "lift_mult":
        return `+${((val - 1) * 100).toFixed(0)}% Lift Power`;
      case "passive_mult":
        return `+${((val - 1) * 100).toFixed(0)}% Passive Income`;
      case "all_mult":
        return `x${val} All Income`;
      case "crit_chance":
        return `+${(val * 100).toFixed(1)}% Crit Chance`;
      case "crit_mult":
        return `+${val}x Crit Damage`;
      case "pp_mult":
        return `x${val} Protein Points`;
      default:
        return "Unknown Bonus";
    }
  };

  return (
    <Card
      className={cn(
        "border transition-colors",
        unlocked
          ? "bg-card border-yellow-500/30 shadow-[0_0_10px_-5px_var(--color-yellow-500)]"
          : "bg-muted/50 border-muted-foreground/20 opacity-70",
      )}
    >
      <CardContent className="p-3 flex items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 border",
            unlocked
              ? "bg-yellow-500/20 border-yellow-500/50"
              : "bg-secondary border-muted-foreground/20 grayscale",
          )}
        >
          {unlocked ? icon : <Lock className="w-5 h-5 text-muted-foreground" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4
              className={cn(
                "font-bold text-sm truncate",
                unlocked ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {name}
            </h4>
            {unlocked && (
              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Reward */}
        <div className="text-right shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] whitespace-nowrap",
              unlocked
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                : "bg-secondary text-muted-foreground border-transparent",
            )}
          >
            {getRewardText()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
