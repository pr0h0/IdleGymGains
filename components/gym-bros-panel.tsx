import { memo } from "react";
import { Users } from "lucide-react";
import { type GymBro, getBroCost } from "@/lib/game-data";
import { GymBroCard } from "./gym-bro-card";

interface GymBrosPanelProps {
  gymBros: GymBro[];
  calories: number;
  proteinPoints: number;
  titanTokens: number;
  divinityPoints: number;
  onHire: (broId: string) => void;
}

const GymBrosPanelBase = ({
  gymBros,
  calories,
  proteinPoints,
  titanTokens,
  divinityPoints,
  onHire,
}: GymBrosPanelProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Gym Bros Network</h3>
            <p className="text-xs text-muted-foreground">
              Hire bros to enhance your gym life
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {gymBros.map((bro, index) => {
          const { amount: cost, currency } = getBroCost(bro);

          let canAfford = false;
          if (currency === "calories") canAfford = calories >= cost;
          else if (currency === "protein") canAfford = proteinPoints >= cost;
          else if (currency === "titan") canAfford = titanTokens >= cost;
          else if (currency === "divinity") canAfford = divinityPoints >= cost;

          const isUnlocked = calories >= bro.unlockAt || bro.level > 0;

          return (
            <GymBroCard
              key={bro.id}
              bro={bro}
              cost={cost}
              currency={currency}
              canAfford={canAfford}
              isUnlocked={isUnlocked}
              onHire={onHire}
              showPreview={index === 0}
            />
          );
        })}
      </div>
    </div>
  );
};

const MemoizedGymBrosPanel = memo(GymBrosPanelBase);

export function GymBrosPanel(props: GymBrosPanelProps) {
  return <MemoizedGymBrosPanel {...props} />;
}
