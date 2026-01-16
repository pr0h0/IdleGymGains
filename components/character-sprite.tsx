"use client";

import { cn } from "@/lib/utils";

interface CharacterSpriteProps {
  rankIndex: number;
  className?: string;
}

export function CharacterSprite({
  rankIndex,
  className,
}: CharacterSpriteProps) {
  // Map rankIndex (0-10) to sprite files (1.png - 11.png)
  // Ensure we don't go below 1 or above 11 (in case ranks expand but sprites don't)
  const maxSprite = 11;
  const spriteNum = Math.min(Math.max(rankIndex + 1, 1), maxSprite);

  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        className,
      )}
    >
      <img
        src={`/sprites/${spriteNum}.png`}
        alt={`Character Rank ${rankIndex}`}
        className="h-1/2 w-auto object-contain object-bottom drop-shadow-md transition-all duration-500"
      />
    </div>
  );
}
