"use client";
import type { Synergy, Upgrade } from "@/lib/game-data";
import { SYNERGIES } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Link2, Lock } from "lucide-react";

interface SynergyPanelProps {
  upgrades: Upgrade[];
  activeSynergies: Synergy[];
}

export function SynergyPanel({ upgrades, activeSynergies }: SynergyPanelProps) {
  const activeIds = new Set(activeSynergies.map((s) => s.id));

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-foreground">Synergies</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {activeSynergies.length}/{SYNERGIES.length}
        </Badge>
      </div>

      <div className="space-y-2 max-h-50 overflow-y-auto pr-1">
        {SYNERGIES.map((synergy) => {
          const isActive = activeIds.has(synergy.id);

          // Calculate progress for each requirement
          const progress = synergy.requirements.map((req) => {
            const upgrade = upgrades.find((u) => u.id === req.upgradeId);
            return {
              current: upgrade?.level || 0,
              required: req.minLevel,
              name: upgrade?.name || "Unknown",
            };
          });

          return (
            <div
              key={synergy.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg transition-all",
                isActive
                  ? "bg-cyan-500/10 border border-cyan-500/30"
                  : "bg-secondary/50 opacity-60",
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-lg shrink-0">
                {isActive ? (
                  synergy.icon
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "text-xs font-medium truncate",
                    isActive ? "text-cyan-300" : "text-muted-foreground",
                  )}
                >
                  {synergy.name}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate">
                  {synergy.description}
                </p>
              </div>
              {isActive ? (
                <Badge
                  variant="secondary"
                  className="bg-cyan-500/20 text-cyan-300 text-[10px] shrink-0"
                >
                  {synergy.bonus.type === "all_mult" ? "x" : "+"}
                  {synergy.bonus.type.includes("mult")
                    ? synergy.bonus.value.toFixed(1)
                    : (synergy.bonus.value * 100).toFixed(0) + "%"}
                </Badge>
              ) : (
                <div className="text-[10px] text-muted-foreground shrink-0">
                  {progress.map((p, i) => (
                    <div key={i}>
                      {p.current}/{p.required}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
