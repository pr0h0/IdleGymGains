"use client";

import { formatNumber } from "@/lib/format-number";
import { Zap, TrendingUp, Clock } from "lucide-react";

interface GameStatsProps {
  points: number;
  clickPower: number;
  passiveIncome: number;
  totalClicks: number;
  playTime: number;
}

export function GameStats({
  points: _points,
  clickPower,
  passiveIncome,
  totalClicks,
  playTime,
}: GameStatsProps) {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Click Power</p>
            <p className="text-sm font-semibold text-foreground">
              {formatNumber(clickPower)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Per Second</p>
            <p className="text-sm font-semibold text-foreground">
              {formatNumber(passiveIncome)}/s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
            <span className="text-lg">👆</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Clicks</p>
            <p className="text-sm font-semibold text-foreground">
              {formatNumber(totalClicks)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-chart-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Play Time</p>
            <p className="text-sm font-semibold text-foreground">
              {formatTime(playTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
