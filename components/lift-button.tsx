"use client";

import type React from "react";
import { useRef, useCallback } from "react";
import { formatNumber, type NumberNotation } from "@/lib/format-number";

interface LiftButtonProps {
  liftPower: number;
  onLift: () => { damage: number; isCrit: boolean };
  combo: number;
  isCritical?: boolean;
  showFloatingText?: boolean;
  numberNotation?: NumberNotation;
}

const FLOAT_COLORS = [
  "#fde047", // yellow
  "#4ade80", // green
  "#f97316", // orange
  "#22d3ee", // cyan
  "#a78bfa", // purple
];

const CRIT_COLOR = "#ef4444"; // red

export function LiftButton({
  liftPower,
  onLift,
  combo: _combo,
  isCritical: _isCritical,
  showFloatingText = true,
  numberNotation = "standard",
}: LiftButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const createFloatingNumber = useCallback(
    (x: number, y: number, value: number, isCrit: boolean) => {
      if (!containerRef.current) return;

      const span = document.createElement("span");
      const color = isCrit
        ? CRIT_COLOR
        : FLOAT_COLORS[Math.floor(Math.random() * FLOAT_COLORS.length)];

      // Variety in movement
      const randomOffsetX = (Math.random() - 0.5) * 60;
      const randomRotation = (Math.random() - 0.5) * 30;

      span.textContent = isCrit
        ? `💥 +${formatNumber(value, 0, numberNotation)}`
        : `+${formatNumber(value, 0, numberNotation)}`;

      const fontSize = isCrit ? "1.25rem" : "1.1rem";
      const fontWeight = isCrit ? "900" : "800";

      span.style.cssText = `
      position: absolute;
      left: ${x + randomOffsetX}px;
      top: ${y}px;
      font-size: ${fontSize};
      font-weight: ${fontWeight};
      color: ${color};
      pointer-events: none;
      text-shadow: 0 2px 8px rgba(0,0,0,0.7), 0 0 20px ${color}40;
      z-index: 50;
      white-space: nowrap;
      transform: translateX(-50%) rotate(${randomRotation}deg);
      animation: floatUp ${
        isCrit ? "1.2s" : "0.9s"
      } cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    `;

      containerRef.current.appendChild(span);

      setTimeout(
        () => {
          span.remove();
        },
        isCrit ? 1200 : 900,
      );
    },
    [numberNotation],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const { damage: actualDamage, isCrit: wasCrit } = onLift();

      if (buttonRef.current) {
        buttonRef.current.style.transform = "scale(0.95)";
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.style.transform = "";
          }
        }, 100);
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (showFloatingText) {
        createFloatingNumber(x, y, actualDamage, wasCrit);
      }
    },
    [onLift, liftPower, createFloatingNumber, showFloatingText],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const { damage: actualDamage, isCrit: wasCrit } = onLift();

      if (buttonRef.current) {
        buttonRef.current.style.transform = "scale(0.95)";
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.style.transform = "";
          }
        }, 100);
      }

      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      if (showFloatingText) {
        createFloatingNumber(x, y, actualDamage, wasCrit);
      }
    },
    [onLift, liftPower, createFloatingNumber, showFloatingText],
  );

  return (
    <div className="flex flex-col items-center gap-4 relative w-fit mx-auto">
      <div className="relative z-10">
        <button
          ref={buttonRef}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          className="
            relative w-40 h-40 md:w-48 md:h-48 rounded-full 
            bg-linear-to-br from-orange-500 via-red-500 to-orange-600
            shadow-[0_0_40px_rgba(249,115,22,0.4)]
            hover:shadow-[0_0_60px_rgba(249,115,22,0.6)]
            transition-shadow duration-200
            flex flex-col items-center justify-center gap-2
            border-4 border-orange-400/50
            hover:scale-105 select-none touch-manipulation
          "
        >
          <span className="text-6xl md:text-7xl select-none pointer-events-none">
            🏋️
          </span>
          <span className="text-sm font-bold text-white/90 uppercase tracking-wider pointer-events-none">
            Lift!
          </span>
        </button>
        <div
          ref={containerRef}
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: "visible" }}
          aria-hidden="true"
        />
      </div>

      <div className="text-center">
        <div className="text-sm text-muted-foreground">Calories per lift</div>
        <div className="text-2xl font-bold text-orange-400">
          +{formatNumber(liftPower, 2, numberNotation)} cal
        </div>
      </div>
    </div>
  );
}
