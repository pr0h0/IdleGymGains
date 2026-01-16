"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { BuyMultiplier } from "@/lib/game-data";

interface BuyMultiplierSelectorProps {
  value: BuyMultiplier;
  onChange: (value: BuyMultiplier) => void;
}

const OPTIONS: { value: BuyMultiplier; label: string }[] = [
  { value: 1, label: "x1" },
  { value: 10, label: "x10" },
  { value: 25, label: "x25" },
  { value: 50, label: "x50" },
  { value: 100, label: "x100" },
  { value: "next", label: "Next" },
  { value: "max", label: "Max" },
];

function BuyMultiplierSelectorBase({
  value,
  onChange,
}: BuyMultiplierSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 p-1 bg-secondary/50 rounded-lg whitespace-nowrap">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-2 sm:px-2 px-1.5 py-1 text-[10px] sm:text-xs font-medium rounded transition-all",
            value === option.value
              ? "bg-orange-500 text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const MemoizedBuyMultiplierSelector = memo(BuyMultiplierSelectorBase);

export function BuyMultiplierSelector(props: BuyMultiplierSelectorProps) {
  return <MemoizedBuyMultiplierSelector {...props} />;
}
