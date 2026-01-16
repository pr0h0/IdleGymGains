"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { formatNumber } from "@/lib/format-number";
import { cn } from "@/lib/utils";

interface ClickButtonProps {
  points: number;
  clickPower: number;
  onCick: () => void;
}

interface FloatingNumber {
  id: number;
  value: number;
  x: number;
  y: number;
}

export function ClickButton({ points, clickPower, onCick }: ClickButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 100);

      // Create floating number
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const id = Date.now() + Math.random();
      setFloatingNumbers((prev) => [...prev, { id, value: clickPower, x, y }]);

      setTimeout(() => {
        setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
      }, 1000);

      onCick();
    },
    [clickPower, onCick],
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-1">Points</p>
        <p className="text-5xl md:text-6xl font-bold text-foreground font-mono tracking-tight">
          {formatNumber(points)}
        </p>
      </div>

      <div className="relative">
        <button
          onClick={handleClick}
          className={cn(
            "relative w-40 h-40 md:w-48 md:h-48 rounded-full",
            "bg-linear-to-br from-primary to-primary/70",
            "shadow-[0_0_60px_rgba(74,222,128,0.3)]",
            "hover:shadow-[0_0_80px_rgba(74,222,128,0.5)]",
            "transition-all duration-150",
            "flex items-center justify-center",
            "select-none cursor-pointer",
            "active:scale-95",
            isPressed && "scale-95",
          )}
        >
          <div className="absolute inset-2 rounded-full bg-linear-to-br from-primary/30 to-transparent" />
          <span className="text-6xl md:text-7xl z-10">💎</span>
        </button>

        {/* Floating numbers */}
        {floatingNumbers.map((num) => (
          <div
            key={num.id}
            className="absolute pointer-events-none animate-float-up text-primary font-bold text-xl"
            style={{
              left: num.x,
              top: num.y,
            }}
          >
            +{formatNumber(num.value)}
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        +{formatNumber(clickPower)} per click
      </p>

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) scale(1.2);
          }
        }
        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
