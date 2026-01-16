"use client";

import { cn } from "@/lib/utils";

interface ComboDisplayProps {
  combo: number;
  comboTimer: number;
  maxComboTime: number;
}

export function ComboDisplay({
  combo,
  comboTimer,
  maxComboTime,
}: ComboDisplayProps) {
  if (combo <= 1) return null;

  const progress = (comboTimer / maxComboTime) * 100;

  return (
    <div className="h-2 md:h-3 w-full bg-secondary/50">
      <div
        className={cn(
          "h-full transition-all duration-100 ease-linear",
          combo >= 50
            ? "bg-linear-to-r from-red-500 to-pink-500"
            : combo >= 25
              ? "bg-linear-to-r from-orange-500 to-red-500"
              : "bg-linear-to-r from-yellow-500 to-orange-500",
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
