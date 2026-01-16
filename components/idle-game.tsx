"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { LiftButton } from "./lift-button";
import { UpgradeCard } from "./upgrade-card";
import { OneTimeUpgradeCard } from "./one-time-upgrade-card";
import { PrestigePanel } from "./prestige-panel";
import { AscensionPanel } from "./ascension-panel";
import { GymStats } from "./gym-stats";
import { BuyMultiplierSelector } from "./buy-multiplier-selector";
import { ComboDisplay } from "./combo-display";
import { SynergyPanel } from "./synergy-panel";
import { StatsPanel } from "./stats-panel";
import { DailyChallengePanel } from "./daily-challenge";
import { GymBrosPanel } from "./gym-bros-panel";
import { SettingsPanel } from "./settings-panel";
import { AchievementsPanel } from "./achievements-panel";
import {
  INITIAL_UPGRADES,
  PRESTIGE_UPGRADES,
  ASCENSION_UPGRADES,
  TRANSCENDENCE_UPGRADES,
  ONE_TIME_UPGRADES,
  EQUIPMENT,
  GYM_LOCATIONS,
  CONSUMABLES,
  ACHIEVEMENTS,
  GYM_RANKS,
  getMilestoneMultiplier,
  getNextMilestone,
  getRankBonus,
  getPrestigeUpgradeCost,
  getAscensionUpgradeCost,
  getTranscendenceUpgradeCost,
  getActiveSynergies,
  generateDailyChallenge,
  getNextMilestoneForBuy,
  ASCENSION_PP_THRESHOLD,
  TRANSCENDENCE_TT_THRESHOLD,
  type Upgrade,
  type PrestigeUpgrade,
  type AscensionUpgrade,
  type TranscendenceUpgrade,
  type OneTimeUpgrade,
  type Equipment,
  type GymLocation,
  type Achievement,
  type DailyChallenge,
  type BuyMultiplier,
  type GymBro,
  GYM_BROS,
  getBroCost,
} from "@/lib/game-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AnalyticsPanel } from "./analytics-panel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  ShoppingCart,
  Sparkles,
  Dumbbell,
  Rocket,
  Settings,
  Trophy,
  Infinity as InfinityIcon,
  LineChart as ChartIcon,
  Users,
  ClipboardList,
  Lock,
} from "lucide-react";
import {
  formatNumber,
  formatTime,
  type NumberNotation,
} from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/sound-manager";

interface GameState {
  calories: number;
  totalCalories: number;
  lifetimeCalories: number;
  upgrades: Upgrade[];
  oneTimeUpgrades: OneTimeUpgrade[];
  proteinPoints: number;
  prestigeUpgrades: PrestigeUpgrade[];
  titanTokens: number;
  ascensionUpgrades: AscensionUpgrade[];
  divinityPoints: number;
  transcendenceUpgrades: TranscendenceUpgrade[];
  equipment: Equipment[];
  gymLocations: GymLocation[];
  currentGymId: string;
  achievements: Achievement[];
  totalLifts: number;
  playTime: number;
  prestigeCount: number;
  ascensionCount: number;
  transcendenceCount: number;
  maxCombo: number;
  criticalHits: number;
  totalUpgradesPurchased: number;
  lastSaveTime: number;
  // Active consumables
  activeConsumables: { id: string; endTime: number }[];
  consumableCooldowns: { [id: string]: number };
  consumablesPurchased: { [id: string]: number };
  // Daily challenge
  dailyChallenge: DailyChallenge | null;
  lastChallengeDate: string;
  // Gym Bros
  gymBros: GymBro[];
  // Analytics
  calorieHistory: { time: string; calories: number }[];
}

const SAVE_KEY = "gym-gains-save-v3";
const TICK_RATE = 250;
const LOW_PERF_TICK_RATE = 1000;
const COMBO_DECAY_TIME = 1000; // 1 second
const BASE_CRIT_CHANCE = 0.05;
const BASE_CRIT_MULT = 2;

function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
}

function saveGame(state: GameState): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...state, lastSaveTime: Date.now() }),
    );
    return true;
  } catch (error) {
    console.error("Save failed:", error);
    return false;
  }
}

function getInitialState(): GameState {
  return {
    calories: 0,
    totalCalories: 0,
    lifetimeCalories: 0,
    upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
    oneTimeUpgrades: ONE_TIME_UPGRADES.map((u) => ({ ...u })),
    proteinPoints: 0,
    prestigeUpgrades: PRESTIGE_UPGRADES.map((u) => ({ ...u })),
    titanTokens: 0,
    ascensionUpgrades: ASCENSION_UPGRADES.map((u) => ({ ...u })),
    divinityPoints: 0,
    transcendenceUpgrades: TRANSCENDENCE_UPGRADES.map((u) => ({ ...u })),
    equipment: EQUIPMENT.map((u) => ({ ...u })),
    gymLocations: GYM_LOCATIONS.map((u) => ({ ...u })),
    currentGymId: "loc1",
    achievements: ACHIEVEMENTS.map((u) => ({ ...u })),
    totalLifts: 0,
    playTime: 0,
    prestigeCount: 0,
    ascensionCount: 0,
    transcendenceCount: 0,
    maxCombo: 0,
    criticalHits: 0,
    totalUpgradesPurchased: 0,
    lastSaveTime: Date.now(),
    activeConsumables: [],
    consumableCooldowns: {},
    consumablesPurchased: {},
    dailyChallenge: null,
    lastChallengeDate: "",
    gymBros: GYM_BROS.map((b) => ({ ...b })),
    calorieHistory: [],
  };
}

function processLoadedGame(saved: Partial<GameState>): GameState {
  // Merge with defaults for any new fields
  const merged = { ...getInitialState(), ...saved };

  // Helper to restore array items by merging saved state into current definitions
  const restoreItems = <T extends { id: string }>(
    defaults: T[],
    savedItems: T[] | undefined,
    mergeFn: (def: T, saved: T) => T,
  ) => {
    return defaults.map((def) => {
      const savedItem = savedItems?.find((s) => s.id === def.id);
      return savedItem ? mergeFn(def, savedItem) : def;
    });
  };

  // Restore Upgrades (level)
  merged.upgrades = restoreItems(
    INITIAL_UPGRADES,
    saved.upgrades,
    (def, saved) => ({
      ...def,
      level: saved.level ?? 0,
    }),
  );

  // Restore OneTime (purchased)
  merged.oneTimeUpgrades = restoreItems(
    ONE_TIME_UPGRADES,
    saved.oneTimeUpgrades,
    (def, saved) => ({
      ...def,
      purchased: saved.purchased ?? false,
    }),
  );

  // Restore Prestige (level)
  merged.prestigeUpgrades = restoreItems(
    PRESTIGE_UPGRADES,
    saved.prestigeUpgrades,
    (def, saved) => ({
      ...def,
      level: saved.level ?? 0,
    }),
  );

  // Restore Ascension (level)
  merged.ascensionUpgrades = restoreItems(
    ASCENSION_UPGRADES,
    saved.ascensionUpgrades,
    (def, saved) => ({
      ...def,
      level: saved.level ?? 0,
    }),
  );

  // Restore Transcendence (level)
  merged.transcendenceUpgrades = restoreItems(
    TRANSCENDENCE_UPGRADES,
    saved.transcendenceUpgrades,
    (def, saved) => ({
      ...def,
      level: saved.level ?? 0,
    }),
  );

  // Restore Equipment (purchased)
  merged.equipment = restoreItems(EQUIPMENT, saved.equipment, (def, saved) => ({
    ...def,
    purchased: saved.purchased ?? false,
  }));

  // Restore Gym Locations (unlocked)
  merged.gymLocations = restoreItems(
    GYM_LOCATIONS,
    saved.gymLocations,
    (def, saved) => ({
      ...def,
      unlocked: saved.unlocked ?? false,
    }),
  );

  // Restore achievement functions lost during serialization
  merged.achievements = restoreItems(
    ACHIEVEMENTS,
    saved.achievements,
    (def, saved) => ({
      ...def,
      unlocked: saved.unlocked ?? false,
    }),
  );

  // Restore Gym Bros (level)
  merged.gymBros = restoreItems(GYM_BROS, saved.gymBros, (def, saved) => ({
    ...def,
    level: saved.level ?? 0,
  }));

  // Restore Consumables Purchased
  merged.consumablesPurchased = { ...saved.consumablesPurchased };

  return merged;
}

export function IdleGame() {
  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const [loaded, setLoaded] = useState(false);
  const [buyMultiplier, setBuyMultiplier] = useState<BuyMultiplier>(1);
  const [combo, setCombo] = useState(1);
  const [comboTimer, setComboTimer] = useState(0);
  const [autoBuy, setAutoBuy] = useState<"OFF" | "x1" | "xNext">("OFF");
  const [clickLimiterEnabled, setClickLimiterEnabled] = useState(true);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importString, setImportString] = useState("");
  const [exportString, setExportString] = useState("");
  const [lowPerformanceMode, setLowPerformanceMode] = useState(false);
  const [showFloatingText, setShowFloatingText] = useState(true);
  const [toastsEnabled, setToastsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [numberNotation, setNumberNotation] =
    useState<NumberNotation>("standard");
  const [activeTab, setActiveTab] = useState("upgrades");
  const [activeUpgradeTab, setActiveUpgradeTab] = useState<
    "lift" | "passive" | "multiplier"
  >("lift");
  const [activeGearTab, setActiveGearTab] = useState("milestones");
  const { toast: originalToast } = useToast();

  const toast = useCallback(
    (props: any) => {
      if (toastsEnabled) {
        originalToast(props);
      }
    },
    [toastsEnabled, originalToast],
  );

  const pendingCaloriesRef = useRef(0);
  const pendingLiftsRef = useRef(0);
  const pendingCritsRef = useRef(0);
  const lastTickRef = useRef(Date.now());
  const isResettingRef = useRef(false);
  const lastComboClickRef = useRef(Date.now());
  const clickTimestampsRef = useRef<number[]>([]);
  const lastLiftDamageRef = useRef(0);
  const offlineTimeRef = useRef(0);
  const statsForBrosRef = useRef<any>({ liftPower: 0, multipliers: {} });

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Check if running on localhost
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLocalhost(
        window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1",
      );
    }
  }, []);

  // Load game on mount
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      const merged = processLoadedGame(saved);

      // Handle offline progress
      if (saved.lastSaveTime) {
        const offlineTime = Math.min(
          (Date.now() - saved.lastSaveTime) / 1000,
          3600 * 8,
        ); // Max 8 hours
        if (offlineTime > 60) {
          // Only calculate if away for > 1 minute
          // We'll calculate offline earnings after multipliers are computed
          merged.playTime += offlineTime;
          offlineTimeRef.current = offlineTime;
        }
      }
      setGameState(merged);
    }
    setLoaded(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      if (!isResettingRef.current) {
        saveGame(gameStateRef.current);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [loaded]);

  // Get current gym location
  const currentGym = useMemo(() => {
    return (
      gameState.gymLocations.find((g) => g.id === gameState.currentGymId) ||
      gameState.gymLocations[0]
    );
  }, [gameState.gymLocations, gameState.currentGymId]);

  // Calculate all multipliers
  const multipliers = useMemo(() => {
    let liftMult = 1;
    let passiveMult = 1;
    let upgradeMultiplier = 1;
    let costReduction = 1;
    let prestigeMult = 1;
    let ppMult = 1;
    let ttMult = 1;
    let ascensionMult = 1;
    let transcendenceMult = 1;
    let allMult = 1;
    let critChance = BASE_CRIT_CHANCE;
    let critMult = BASE_CRIT_MULT;
    let comboMult = 1;
    let maxComboCap = 10; // Base max combo

    // Apply Upgrade Multipliers (Standard Upgrades with effectType 'multiplier')
    // Note: Currently applies to both Lift and Passive regardless of description, matching legacy behavior.
    gameState.upgrades.forEach((up) => {
      if (up.effectType === "multiplier" && up.level > 0) {
        upgradeMultiplier *= Math.pow(up.effect, up.level);
      }
    });

    // Apply Gym Bros Effects
    gameState.gymBros.forEach((bro) => {
      if (bro.level > 0) {
        if (bro.effectType === "crit_chance") {
          critChance += bro.effect * bro.level;
        } else if (bro.effectType === "passive_mult") {
          // e.g. 1.1^level vs 1 + (0.1 * level). Going with compounding for "strong" feel or linear for balance?
          // Using linear based on description in panel: 1 + (effect-1)*level
          passiveMult *= 1 + (bro.effect - 1) * bro.level;
        } else if (bro.effectType === "speed_boost") {
          // "Speed" boosts both Lift and Passive
          const speedFactor = 1 + (bro.effect - 1) * bro.level;
          liftMult *= speedFactor;
          passiveMult *= speedFactor;
        }
      }
    });

    // Prestige upgrades
    gameState.prestigeUpgrades.forEach((up) => {
      if (up.level > 0) {
        const totalEffect = Math.pow(up.effect, up.level);
        switch (up.effectType) {
          case "lift_mult":
            liftMult *= totalEffect;
            break;
          case "passive_mult":
            passiveMult *= totalEffect;
            break;
          case "cost_reduction":
            costReduction *= totalEffect;
            break;
          case "prestige_mult":
            prestigeMult *= totalEffect;
            break;
          case "all_mult":
            allMult *= totalEffect;
            break;
        }
      }
    });

    // Ascension upgrades
    gameState.ascensionUpgrades.forEach((up) => {
      if (up.level > 0) {
        const totalEffect = Math.pow(up.effect, up.level);
        switch (up.effectType) {
          case "lift_mult":
            liftMult *= totalEffect;
            break;
          case "passive_mult":
            passiveMult *= totalEffect;
            break;
          case "cost_reduction":
            costReduction *= totalEffect;
            break;
          case "prestige_mult":
            prestigeMult *= totalEffect;
            break;
          case "all_mult":
            allMult *= totalEffect;
            break;
          case "pp_mult":
            ppMult *= totalEffect;
            break;
          case "ascension_mult":
            ascensionMult *= totalEffect;
            break;
        }
      }
    });

    // Transcendence upgrades
    gameState.transcendenceUpgrades.forEach((up) => {
      if (up.level > 0) {
        const totalEffect =
          up.effectType === "crit_chance" || up.effectType === "crit_mult"
            ? up.effect * up.level
            : Math.pow(up.effect, up.level);
        switch (up.effectType) {
          case "lift_mult":
            liftMult *= totalEffect;
            break;
          case "passive_mult":
            passiveMult *= totalEffect;
            break;
          case "all_mult":
            allMult *= totalEffect;
            break;
          case "pp_mult":
            ppMult *= totalEffect;
            break;
          case "tt_mult":
            ttMult *= totalEffect;
            break;
          case "crit_chance":
            critChance += totalEffect;
            break;
          case "crit_mult":
            critMult += totalEffect;
            break;
          case "transcendence_mult":
            transcendenceMult *= totalEffect;
            break;
        }
      }
    });

    // Gym Bros bonuses
    gameState.gymBros.forEach((bro) => {
      if (bro.level > 0) {
        switch (bro.effectType) {
          case "passive_mult":
            passiveMult *= Math.pow(bro.effect, bro.level);
            break;
          case "all_mult":
            allMult *= Math.pow(bro.effect, bro.level);
            break;
          case "crit_chance":
            critChance += bro.effect * bro.level;
            break;
        }
      }
    });

    // One-time upgrades
    gameState.oneTimeUpgrades.forEach((up) => {
      if (up.purchased) {
        switch (up.effectType) {
          case "lift_mult":
            liftMult *= up.effect;
            break;
          case "passive_mult":
            passiveMult *= up.effect;
            break;
          case "cost_reduction":
            costReduction *= up.effect;
            break;
          case "prestige_bonus":
            prestigeMult *= up.effect;
            break;
          case "all_mult":
            allMult *= up.effect;
            break;
          case "combo_max":
            maxComboCap += up.effect;
            break;
        }
      }
    });

    // Equipment bonuses
    gameState.equipment.forEach((eq) => {
      if (eq.purchased) {
        eq.bonuses.forEach((bonus) => {
          switch (bonus.type) {
            case "lift_mult":
              liftMult *= bonus.value;
              break;
            case "passive_mult":
              passiveMult *= bonus.value;
              break;
            case "crit_chance":
              critChance += bonus.value;
              break;
            case "crit_mult":
              critMult += bonus.value;
              break;
            case "combo_mult":
              comboMult *= bonus.value;
              break;
          }
        });
      }
    });

    // Gym location bonuses
    if (currentGym.unlocked) {
      liftMult *= currentGym.bonuses.lift_mult;
      passiveMult *= currentGym.bonuses.passive_mult;
      ppMult *= currentGym.bonuses.pp_mult;
    }

    // Achievement bonuses
    gameState.achievements.forEach((ach) => {
      if (ach.unlocked) {
        switch (ach.reward.type) {
          case "lift_mult":
            liftMult *= ach.reward.value;
            break;
          case "passive_mult":
            passiveMult *= ach.reward.value;
            break;
          case "all_mult":
            allMult *= ach.reward.value;
            break;
          case "crit_chance":
            critChance += ach.reward.value;
            break;
          case "crit_mult":
            critMult += ach.reward.value;
            break;
          case "pp_mult":
            ppMult *= ach.reward.value;
            break;
        }
      }
    });

    // Active consumables
    const now = Date.now();
    gameState.activeConsumables.forEach((ac) => {
      if (ac.endTime > now) {
        const consumable = CONSUMABLES.find((c) => c.id === ac.id);
        if (consumable) {
          switch (consumable.effect.type) {
            case "lift_mult":
              liftMult *= consumable.effect.value;
              break;
            case "passive_mult":
              passiveMult *= consumable.effect.value;
              break;
            case "all_mult":
              allMult *= consumable.effect.value;
              break;
            case "crit_chance":
              critChance += consumable.effect.value;
              break;
          }
        }
      }
    });

    // Synergy bonuses
    const activeSynergies = getActiveSynergies(gameState.upgrades);
    activeSynergies.forEach((syn) => {
      switch (syn.bonus.type) {
        case "lift_mult":
          liftMult *= syn.bonus.value;
          break;
        case "passive_mult":
          passiveMult *= syn.bonus.value;
          break;
        case "all_mult":
          allMult *= syn.bonus.value;
          break;
        case "crit_mult":
          critMult += syn.bonus.value;
          break;
      }
    });

    return {
      liftMult,
      passiveMult,
      costReduction,
      prestigeMult,
      ppMult,
      ttMult,
      ascensionMult,
      transcendenceMult,
      allMult,
      critChance: Math.min(critChance, 1), // Cap at 100%
      critMult,
      comboMult,
      upgradeMultiplier,
      maxComboCap,
    };
  }, [
    gameState.prestigeUpgrades,
    gameState.ascensionUpgrades,
    gameState.transcendenceUpgrades,
    gameState.oneTimeUpgrades,
    gameState.equipment,
    gameState.achievements,
    gameState.activeConsumables,
    gameState.upgrades,
    currentGym,
  ]);

  const rankBonus = useMemo(
    () => getRankBonus(gameState.totalCalories),
    [gameState.totalCalories],
  );
  const _currentRankIndex = useMemo(() => {
    for (let i = GYM_RANKS.length - 1; i >= 0; i--) {
      if (gameState.totalCalories >= GYM_RANKS[i].minCalories) {
        return i;
      }
    }
    return 0;
  }, [gameState.totalCalories]);

  const activeSynergies = useMemo(
    () => getActiveSynergies(gameState.upgrades),
    [gameState.upgrades],
  );

  // Calculate lift power
  const liftPower = useMemo(() => {
    const { liftMult, allMult, upgradeMultiplier } = multipliers;
    let basePower = 1;

    gameState.upgrades.forEach((up) => {
      if (up.effectType === "lift") {
        const milestoneMult = up.hasMilestones
          ? getMilestoneMultiplier(up.level)
          : 1;
        basePower += up.effect * up.level * milestoneMult;
      }
    });

    return basePower * upgradeMultiplier * liftMult * allMult * rankBonus;
  }, [gameState.upgrades, multipliers, rankBonus]);

  // Calculate passive income
  const passiveIncome = useMemo(() => {
    const { passiveMult, allMult, upgradeMultiplier } = multipliers;
    let baseIncome = 0;

    gameState.upgrades.forEach((up) => {
      if (up.effectType === "passive") {
        const milestoneMult = up.hasMilestones
          ? getMilestoneMultiplier(up.level)
          : 1;
        baseIncome += up.effect * up.level * milestoneMult;
      }
    });

    return baseIncome * upgradeMultiplier * passiveMult * allMult * rankBonus;
  }, [gameState.upgrades, multipliers, rankBonus]);

  const autoLiftsPerSec = useMemo(() => {
    let totalLiftsPer5s = 0;
    gameState.gymBros.forEach((bro) => {
      if (bro.effectType === "auto_lift" && bro.level > 0) {
        totalLiftsPer5s += bro.effect * bro.level;
      }
    });
    return totalLiftsPer5s / 5;
  }, [gameState.gymBros]);

  // Offline earnings
  useEffect(() => {
    if (loaded && offlineTimeRef.current > 0) {
      const earned = passiveIncome * offlineTimeRef.current;
      if (earned > 0) {
        setGameState((prev) => ({
          ...prev,
          calories: Math.min(prev.calories + earned, Number.MAX_VALUE),
          totalCalories: Math.min(
            prev.totalCalories + earned,
            Number.MAX_VALUE,
          ),
          lifetimeCalories: Math.min(
            prev.lifetimeCalories + earned,
            Number.MAX_VALUE,
          ),
        }));
        toast({
          title: "Welcome Back!",
          description: `You were offline for ${formatTime(
            offlineTimeRef.current,
          )} and earned ${formatNumber(earned)} calories!`,
        });
      }
      offlineTimeRef.current = 0;
    }
  }, [loaded, passiveIncome, toast]);

  // Calculate potential prestige/ascension/transcendence
  const potentialPrestige = useMemo(() => {
    const { prestigeMult, ppMult } = multipliers;
    if (gameState.totalCalories < 10e6) return 0;
    return Math.floor(
      Math.pow(gameState.totalCalories / 10e6, 0.45) * prestigeMult * ppMult,
    );
  }, [gameState.totalCalories, multipliers]);

  const potentialAscension = useMemo(() => {
    const { ascensionMult, ttMult } = multipliers;
    if (gameState.proteinPoints < ASCENSION_PP_THRESHOLD) return 0;
    return Math.floor(
      Math.pow(gameState.proteinPoints / ASCENSION_PP_THRESHOLD, 0.6) *
        ascensionMult *
        ttMult,
    );
  }, [gameState.proteinPoints, multipliers]);

  const potentialTranscendence = useMemo(() => {
    const { transcendenceMult } = multipliers;
    if (gameState.titanTokens < TRANSCENDENCE_TT_THRESHOLD) return 0;
    return Math.floor(
      Math.pow(gameState.titanTokens / TRANSCENDENCE_TT_THRESHOLD, 0.5) *
        transcendenceMult,
    );
  }, [gameState.titanTokens, multipliers]);

  // Calculate next point thresholds
  const caloriesForNextPP = useMemo(() => {
    const { prestigeMult, ppMult } = multipliers;
    const totalMult = prestigeMult * ppMult;
    if (totalMult === 0) return 0;

    // Formula: PP = sqrt(cal/1e6) * mult
    // Target PP = potentialPrestige + 1
    // (Target/mult)^2 * 1e6 = cal

    const targetPP = potentialPrestige + 1;
    return Math.pow(targetPP / totalMult, 2) * 1e6;
  }, [potentialPrestige, multipliers]);

  const ppForNextTT = useMemo(() => {
    const { ascensionMult, ttMult } = multipliers;
    const totalMult = ascensionMult * ttMult;
    if (totalMult === 0) return 0;

    // Formula: TT = (pp/1000)^0.6 * mult
    // Target TT = potentialAscension + 1
    // (Target/mult)^(1/0.6) * 1000 = pp

    const targetTT = potentialAscension + 1;
    return Math.pow(targetTT / totalMult, 1 / 0.6) * ASCENSION_PP_THRESHOLD;
  }, [potentialAscension, multipliers]);

  const ttForNextDP = useMemo(() => {
    const { transcendenceMult } = multipliers;
    if (transcendenceMult === 0) return 0;

    // Formula: DP = sqrt(tt/1000) * mult
    // Target DP = potentialTranscendence + 1
    // (Target/mult)^2 * 1000 = tt

    const targetDP = potentialTranscendence + 1;
    return (
      Math.pow(targetDP / transcendenceMult, 2) * TRANSCENDENCE_TT_THRESHOLD
    );
  }, [potentialTranscendence, multipliers]);

  const getUpgradeCost = useCallback(
    (upgrade: Upgrade) => {
      const { costReduction } = multipliers;
      return Math.floor(
        upgrade.baseCost *
          Math.pow(upgrade.costMultiplier, upgrade.level) *
          costReduction,
      );
    },
    [multipliers],
  );

  const handleBuyAvailable = useCallback(
    (type: "lift" | "passive" | "multiplier") => {
      setGameState((prev) => {
        let currentCalories = prev.calories;
        const newUpgrades = [...prev.upgrades];
        let totalBought = 0;
        const { costReduction } = multipliers;

        const candidates = newUpgrades
          .map((u, index) => ({ ...u, index }))
          .filter(
            (u) =>
              u.effectType === type &&
              (prev.totalCalories >= u.unlockAt || u.level > 0),
          );

        if (candidates.length === 0) return prev;

        // Buying loop based on buyMultiplier
        // x1: Buy 1 affordable level for each available upgrade (cheapest checks first?)
        // xMax: Buy max levels for each available upgrade
        // xNext: Buy until next milestone for each

        // Sorting strategy: Always process cheapest upgrades first within each cycle to maximize efficiency
        // For x1: Loop through all sorted candidates, buy 1 if affordable.
        // For xMax: Just keep looping buying cheapest until out of money.
        // For xNext: Check distance to milestone for each. Sort by cost to reach that milestone? Or sort by next level cost?
        // Simplicity: Iterative approach. Sort by current cost. Buy 1 level. Repeat.
        // Limits:
        // x1: Each candidate can be bought at most once.
        // xMax: Updates until money runs out.
        // xNext: Each candidate can be bought until it hits a milestone, then it is removed from pool.

        // Helper to calculate total cost to reach a target level
        const getCostToTarget = (u: (typeof candidates)[0], target: number) => {
          let totalCost = 0;
          let tempLevel = u.level;
          while (tempLevel < target) {
            totalCost += Math.floor(
              u.baseCost *
                Math.pow(u.costMultiplier, tempLevel) *
                costReduction,
            );
            tempLevel++;
          }
          return totalCost;
        };

        if (buyMultiplier !== "max") {
          // Atomic Buying Logic (Next, x1, x10, etc.)
          // 1. Calculate target and total cost for each candidate
          const purchaseOptions = candidates
            .map((c) => {
              let targetLevel: number;

              if (buyMultiplier === "next") {
                const next = getNextMilestone(c.level);
                targetLevel = next ?? c.level;
              } else {
                targetLevel = c.level + (buyMultiplier as number);
              }

              // Cap at max level if applicable
              if (targetLevel > c.maxLevel) {
                targetLevel = c.maxLevel;
              }

              // If maxed or no milestone/progress possible
              if (targetLevel <= c.level) return null;

              const cost = getCostToTarget(c, targetLevel);
              return { ...c, targetLevel, costToTarget: cost };
            })
            .filter((c): c is NonNullable<typeof c> => c !== null);

          // 2. Sort by cheapest milestone package
          purchaseOptions.sort((a, b) => a.costToTarget - b.costToTarget);

          // 3. Buy affordable packages fully
          for (const opt of purchaseOptions) {
            // Re-check affordability against remaining calories
            if (currentCalories >= opt.costToTarget) {
              currentCalories -= opt.costToTarget;
              // Apply upgrade levels - IMMUTABLE UPDATE
              // Ensure we get the latest version of the upgrade object if it was modified (though unique IDs prevent overlap)
              const originalUpgrade = newUpgrades[opt.index];
              newUpgrades[opt.index] = {
                ...originalUpgrade,
                level: opt.targetLevel,
              };
              totalBought += opt.targetLevel - opt.level;
            }
            // Explicitly do nothing if we can't afford the full package
          }
        } else {
          // Iterative Logic for "Max" only
          const activeCandidates = candidates.map((c) => ({
            ...c,
            boughtThisCycle: 0,
          }));

          // Loop until broken
          while (true) {
            // Filter out candidates that shouldn't be bought anymore
            // For MAX, we don't limit boughtThisCycle

            if (activeCandidates.length === 0) break;

            // Calculate current costs for all active candidates
            // Sort by cost ASC
            const affordable = activeCandidates
              .map((c) => {
                const cost = Math.floor(
                  c.baseCost *
                    Math.pow(c.costMultiplier, c.level) *
                    costReduction,
                );
                return { ...c, currentCost: cost };
              })
              .sort((a, b) => a.currentCost - b.currentCost);

            // Try to buy the cheapest one
            const best = affordable[0];
            if (!best || best.currentCost > currentCalories) break;

            // Buy
            currentCalories -= best.currentCost;
            best.level++;
            best.boughtThisCycle++;
            totalBought++;

            // Update state array
            newUpgrades[best.index] = { ...best };

            // Update local candidate for next loop iteration
            // 'best' is a copy, we need to update the entry in 'activeCandidates'
            const activeIdx = activeCandidates.findIndex(
              (a) => a.id === best.id,
            );
            if (activeIdx !== -1) {
              activeCandidates[activeIdx] = best;
            }
          }
        }

        if (totalBought === 0) return prev;

        soundManager.playBuy();

        toast({
          title: "Bulk Purchase",
          description: `Bought ${totalBought} upgrades for ${type} tab!`,
        });

        return {
          ...prev,
          calories: currentCalories,
          upgrades: newUpgrades,
          totalUpgradesPurchased: prev.totalUpgradesPurchased + totalBought,
        };
      });
    },
    [multipliers, toast, buyMultiplier],
  );

  const handleBuyAllGear = useCallback(
    (type: "milestones" | "equipment" | "locations") => {
      setGameState((prev) => {
        let currentCalories = prev.calories;
        let boughtCount = 0;
        let newCurrentGymId = prev.currentGymId;

        if (type === "milestones") {
          // Clone and sort to find buy order
          const sorted = [...prev.oneTimeUpgrades].sort(
            (a, b) => a.cost - b.cost,
          );
          // Track updates
          const updates = new Map();

          sorted.forEach((u) => {
            if (
              !u.purchased &&
              prev.totalCalories >= u.unlockAt &&
              currentCalories >= u.cost
            ) {
              currentCalories -= u.cost;
              boughtCount++;
              updates.set(u.id, true);
            }
          });

          if (boughtCount === 0) return prev;

          soundManager.playBuy();

          // Return new array with updated items to trigger re-render
          const newOneTime = prev.oneTimeUpgrades.map((u) =>
            updates.has(u.id) ? { ...u, purchased: true } : u,
          );

          toast({
            title: "Gear Bulk Purchase",
            description: `Bought ${boughtCount} items in ${type}!`,
          });

          return {
            ...prev,
            calories: currentCalories,
            oneTimeUpgrades: newOneTime,
          };
        } else if (type === "equipment") {
          const sorted = [...prev.equipment].sort((a, b) => a.cost - b.cost);
          const updates = new Map();

          sorted.forEach((eq) => {
            if (
              !eq.purchased &&
              prev.totalCalories >= eq.unlockAt &&
              currentCalories >= eq.cost
            ) {
              currentCalories -= eq.cost;
              boughtCount++;
              updates.set(eq.id, true);
            }
          });

          if (boughtCount === 0) return prev;

          soundManager.playBuy();

          const newEquipment = prev.equipment.map((eq) =>
            updates.has(eq.id) ? { ...eq, purchased: true } : eq,
          );

          toast({
            title: "Gear Bulk Purchase",
            description: `Bought ${boughtCount} items in ${type}!`,
          });

          return {
            ...prev,
            calories: currentCalories,
            equipment: newEquipment,
          };
        } else if (type === "locations") {
          const sorted = [...prev.gymLocations].sort((a, b) => a.cost - b.cost);
          const updates = new Map();
          // Re-approach for locations:
          // Just iterate the sorted list to buy, map updates by ID.
          // Then map the original list, update unlocked status.
          // Then find the last unlocked gym in the original list to switch to.

          sorted.forEach((loc) => {
            if (
              !loc.unlocked &&
              prev.totalCalories >= loc.unlockAt &&
              currentCalories >= loc.cost
            ) {
              currentCalories -= loc.cost;
              boughtCount++;
              updates.set(loc.id, true);
            }
          });

          if (boughtCount === 0) return prev;

          soundManager.playBuy();

          const newLocations = prev.gymLocations.map((loc) => {
            if (updates.has(loc.id)) return { ...loc, unlocked: true };
            return loc;
          });

          // Auto-equip best location
          // findLast is not always available in all envs (ES2023), use loop or filter
          for (let i = newLocations.length - 1; i >= 0; i--) {
            if (newLocations[i].unlocked) {
              // Only switch if it's "better" (higher index) than current?
              // Or just switch to best available always?
              // User said "if higher than current location, switch to it".
              const currentIdx = newLocations.findIndex(
                (l) => l.id === prev.currentGymId,
              );
              if (i > currentIdx) {
                newCurrentGymId = newLocations[i].id;
                toast({
                  title: "New Gym Moved In!",
                  description: `Auto-equipped ${newLocations[i].name}!`,
                });
              }
              break;
            }
          }

          toast({
            title: "Gear Bulk Purchase",
            description: `Bought ${boughtCount} new locations!`,
          });

          return {
            ...prev,
            calories: currentCalories,
            gymLocations: newLocations,
            currentGymId: newCurrentGymId,
          };
        }

        return prev;
      });
    },
    [toast],
  );

  // Lift handler with crits and combo
  const handleGymBroHire = (broId: string) => {
    setGameState((prev) => {
      const updatedBros = [...prev.gymBros];
      const broIndex = updatedBros.findIndex((b) => b.id === broId);
      if (broIndex === -1) return prev;

      const bro = updatedBros[broIndex];
      const { amount: cost, currency } = getBroCost(bro);

      let canAfford = false;
      if (currency === "calories") canAfford = prev.calories >= cost;
      else if (currency === "protein") canAfford = prev.proteinPoints >= cost;
      else if (currency === "titan") canAfford = prev.titanTokens >= cost;
      else if (currency === "divinity") canAfford = prev.divinityPoints >= cost;

      if (!canAfford) return prev;

      soundManager.playLevelUp();

      updatedBros[broIndex] = {
        ...bro,
        level: bro.level + 1,
      };

      // Since we are inside the state updater, we can't easily toast conditionally based on success
      // without side effects, but for this fix we prioritize state integrity.
      // We'll trigger a separate effect or just accept the toast might trigger in the handler slightly eagerly
      // (or we move toast logic ref).
      // For now, I will move the toast OUTSIDE this updater, firing it based on the PRE-CHECK,
      // which assumes success. This aligns with the "optimistic" UI.

      return {
        ...prev,
        calories:
          currency === "calories" ? prev.calories - cost : prev.calories,
        proteinPoints:
          currency === "protein"
            ? prev.proteinPoints - cost
            : prev.proteinPoints,
        titanTokens:
          currency === "titan" ? prev.titanTokens - cost : prev.titanTokens,
        divinityPoints:
          currency === "divinity"
            ? prev.divinityPoints - cost
            : prev.divinityPoints,
        gymBros: updatedBros,
      };
    });

    // We can iterate the current bros to find the name for the toast
    const bro = gameState.gymBros.find((b) => b.id === broId);
    if (bro) {
      toast({
        title: bro.level === 0 ? "Bro Hired!" : "Bro Promoted!",
        description: `${bro.name} is now level ${bro.level + 1}!`,
      });
    }
  };

  const handleLift = useCallback(() => {
    // Rate Limiter
    if (clickLimiterEnabled) {
      const now = Date.now();
      const MAX_CPS = 12; // Maximum clicks per second

      // Filter out clicks older than 1 second
      clickTimestampsRef.current = clickTimestampsRef.current.filter(
        (t) => now - t < 1000,
      );

      if (clickTimestampsRef.current.length >= MAX_CPS) {
        return { damage: 0, isCrit: false }; // Exceeded limit, return safe empty object
      }

      clickTimestampsRef.current.push(now);
    }

    const now = Date.now();
    // const timeSinceLastClick = now - lastComboClickRef.current;
    lastComboClickRef.current = now;

    soundManager.playLift(); // Play Lift Sound

    // Update combo
    setCombo((c) => {
      const newCombo = Math.min(c + 1, multipliers.maxComboCap);

      // Challenge: reach_combo
      if (
        gameStateRef.current?.dailyChallenge?.requirement?.type ===
          "reach_combo" &&
        !gameStateRef.current.dailyChallenge.completed
      ) {
        setGameState((prev) => {
          if (!prev.dailyChallenge || prev.dailyChallenge.completed)
            return prev;

          if (newCombo > prev.dailyChallenge.progress) {
            return {
              ...prev,
              dailyChallenge: {
                ...prev.dailyChallenge,
                progress: newCombo,
              },
            };
          }
          return prev;
        });
      }

      return newCombo;
    });
    setComboTimer(COMBO_DECAY_TIME);

    // Calculate damage with crits
    const { critChance, critMult, comboMult } = multipliers;
    const isCrit = Math.random() < critChance;
    const comboBonus = 1 + combo * 0.02 * comboMult; // 2% per combo level

    let damage = liftPower * comboBonus;
    if (isCrit) {
      damage *= critMult;
      pendingCritsRef.current += 1;
      soundManager.playCrit(); // Play Crit Sound
    }

    // update challenge progress refs
    if (
      gameStateRef.current.dailyChallenge &&
      !gameStateRef.current.dailyChallenge.completed
    ) {
      const type = gameStateRef.current.dailyChallenge.requirement.type;
      if (type === "do_lifts") {
        // handled in tick mainly but we can track here
      }
    }

    pendingCaloriesRef.current += damage;
    pendingLiftsRef.current += 1;
    lastLiftDamageRef.current = damage;

    return { damage, isCrit };
  }, [liftPower, multipliers, combo]);

  // Keyboard shortcut for lifting and navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no modal/dialog is open (basic check)
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      // Allow Space or Enter to lift
      if (e.code === "Space" || e.code === "Enter") {
        // Prevent default scrolling for Space
        if (e.code === "Space") {
          e.preventDefault();
        }

        // Prevent holding down the key (require individual presses)
        if (e.repeat) return;

        handleLift();
        return;
      }

      // Main Tab Navigation
      if (e.code === "KeyQ") setActiveTab("upgrades");
      if (e.code === "KeyW") setActiveTab("equipment");
      if (e.code === "KeyE") setActiveTab("gym-bros");
      if (e.code === "KeyR") setActiveTab("prestige");
      if (e.code === "KeyT") setActiveTab("ascension");
      if (e.code === "KeyY") setActiveTab("transcend");
      if (e.code === "KeyU") setActiveTab("achievements");
      if (e.code === "KeyI") setActiveTab("stats");
      if (e.code === "KeyO") setActiveTab("analytics");
      if (e.code === "KeyP") setActiveTab("settings");

      // Sub-tab Navigation (Context Sensitive)
      if (activeTab === "upgrades") {
        if (e.key === "1") setActiveUpgradeTab("lift");
        if (e.key === "2") setActiveUpgradeTab("passive");
        if (e.key === "3") setActiveUpgradeTab("multiplier");
      }

      if (activeTab === "equipment") {
        if (e.key === "1") setActiveGearTab("milestones");
        if (e.key === "2") setActiveGearTab("gym-equipment");
        if (e.key === "3") setActiveGearTab("locations");
        if (e.key === "4") setActiveGearTab("consumables");
      }

      // Buy All Shortcut (B)
      if (e.code === "KeyB") {
        if (activeTab === "upgrades") {
          handleBuyAvailable(activeUpgradeTab);
        } else if (activeTab === "equipment") {
          if (activeGearTab === "milestones") handleBuyAllGear("milestones");
          // Note: Tab value 'gym-equipment' maps to function arg 'equipment'
          if (activeGearTab === "gym-equipment") handleBuyAllGear("equipment");
          if (activeGearTab === "locations") handleBuyAllGear("locations");
        }
      }

      // Save Shortcut (S)
      if (e.code === "KeyS") {
        e.preventDefault(); // Prevent default save dialog if browser has one
        if (saveGame(gameStateRef.current)) {
          toast({
            title: "Game Saved",
            description:
              "Your progress has been manually saved (Shortcut 'S').",
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleLift,
    activeTab,
    activeUpgradeTab,
    activeGearTab,
    handleBuyAvailable,
    handleBuyAllGear,
    toast, // Add toast to dep
  ]);

  // Analytics Tick (1s interval)
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setGameState((prev) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        // Keep last 20 data points for chart
        const newHistory = [
          ...(prev.calorieHistory || []),
          { time: timeString, calories: Math.floor(prev.totalCalories) },
        ].slice(-20);

        return {
          ...prev,
          calorieHistory: newHistory,
        };
      });
    }, 1000); // 1 Second tick for consistent graph
    return () => clearInterval(interval);
  }, [loaded]);

  // Main game loop
  useEffect(() => {
    if (!loaded) return;

    const tick = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const passiveEarned = passiveIncome * delta;
      const clickCalories = pendingCaloriesRef.current;
      const clickLifts = pendingLiftsRef.current;
      const newCrits = pendingCritsRef.current;

      pendingCaloriesRef.current = 0;
      pendingLiftsRef.current = 0;
      pendingCritsRef.current = 0;

      const totalEarned = clickCalories + passiveEarned;

      setGameState((prev) => {
        const newState = { ...prev };

        // Daily Challenge Progress
        if (newState.dailyChallenge && !newState.dailyChallenge.completed) {
          let progressToAdd = 0;
          const type = newState.dailyChallenge.requirement.type;

          if (type === "burn_calories") progressToAdd = totalEarned;
          else if (type === "do_lifts") progressToAdd = clickLifts;
          else if (type === "get_crits") progressToAdd = newCrits;

          if (progressToAdd > 0) {
            const newProgress =
              newState.dailyChallenge.progress + progressToAdd;
            newState.dailyChallenge = {
              ...newState.dailyChallenge,
              progress: newProgress,
            };
          }
        }

        if (totalEarned > 0 || clickLifts > 0) {
          newState.calories = Math.min(
            prev.calories + totalEarned,
            Number.MAX_VALUE,
          );
          newState.totalCalories = Math.min(
            prev.totalCalories + totalEarned,
            Number.MAX_VALUE,
          );
          newState.lifetimeCalories = Math.min(
            prev.lifetimeCalories + totalEarned,
            Number.MAX_VALUE,
          );
        }

        if (clickLifts > 0) {
          newState.totalLifts = prev.totalLifts + clickLifts;
        }

        if (newCrits > 0) {
          newState.criticalHits = prev.criticalHits + newCrits;
        }

        newState.playTime = prev.playTime + delta;

        // Clean up expired consumables
        newState.activeConsumables = prev.activeConsumables.filter(
          (ac) => ac.endTime > now,
        );

        // Check achievements
        const unlockedCount = prev.achievements.filter(
          (a) => a.unlocked,
        ).length;
        const locationsUnlocked = prev.gymLocations.filter(
          (l) => l.unlocked,
        ).length;
        const brosHired = prev.gymBros.filter((b) => b.level > 0).length;

        const stats = {
          totalCalories: newState.lifetimeCalories,
          totalLifts: newState.totalLifts,
          prestigeCount: newState.prestigeCount,
          ascensionCount: newState.ascensionCount,
          playTime: newState.playTime,
          maxCombo: newState.maxCombo,
          criticalHits: newState.criticalHits,
          totalUpgradesPurchased: newState.totalUpgradesPurchased,
          divinityPoints: newState.divinityPoints,
          titanTokens: newState.titanTokens,
          achievementsUnlocked: unlockedCount,
          gymLocationsUnlocked: locationsUnlocked,
          totalGymBrosHired: brosHired,
        };

        newState.achievements = prev.achievements.map((ach) => {
          if (!ach.unlocked && ach.requirement(stats)) {
            return { ...ach, unlocked: true };
          }
          return ach;
        });

        return newState;
      });

      // Update combo timer
      setComboTimer((t) => Math.max(0, t - delta * 1000));

      // Decay combo
      if (now - lastComboClickRef.current > COMBO_DECAY_TIME) {
        setCombo((c) => Math.max(1, c - 1));
      }

      // Track max combo
      setCombo((c) => {
        if (c > gameStateRef.current.maxCombo) {
          setGameState((prev) => ({ ...prev, maxCombo: c }));
        }
        return c;
      });
    };

    const tickInterval = lowPerformanceMode ? LOW_PERF_TICK_RATE : TICK_RATE;
    const interval = setInterval(tick, tickInterval);
    return () => clearInterval(interval);
  }, [loaded, passiveIncome, lowPerformanceMode]);

  // Auto-buy
  useEffect(() => {
    if (autoBuy === "OFF" || !loaded) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newUpgrades = prev.upgrades.map((u) => ({ ...u }));
        let newCalories = prev.calories;
        let purchased = 0;

        for (const upgrade of newUpgrades) {
          if (
            upgrade.level < upgrade.maxLevel &&
            prev.totalCalories >= upgrade.unlockAt
          ) {
            const r = upgrade.costMultiplier;
            const currentCost = Math.floor(
              upgrade.baseCost *
                Math.pow(r, upgrade.level) *
                multipliers.costReduction,
            );

            if (autoBuy === "x1") {
              if (newCalories >= currentCost) {
                upgrade.level += 1;
                newCalories -= currentCost;
                purchased += 1;
              }
            } else if (autoBuy === "xNext") {
              const targetLevel = getNextMilestoneForBuy(upgrade.level);
              const count = targetLevel - upgrade.level;

              if (count > 0 && upgrade.level + count <= upgrade.maxLevel) {
                // Calculate total cost for 'count' levels
                let totalCost = 0;

                // Use geometric series formula for efficiency
                // Sum = a * (r^n - 1) / (r - 1)
                // where a = first term cost, r = ratio, n = count
                if (r === 1) {
                  totalCost = currentCost * count;
                } else {
                  // We need precise integer math here, but for game values standard float is usually ok
                  // except very large numbers.
                  // Math.pow might drift for huge numbers, but likely fine here.
                  totalCost = Math.floor(
                    (currentCost * (Math.pow(r, count) - 1)) / (r - 1),
                  );
                }

                if (newCalories >= totalCost) {
                  upgrade.level += count;
                  newCalories -= totalCost;
                  purchased += count;
                }
              }
            }
          }
        }

        if (purchased > 0) {
          return {
            ...prev,
            calories: newCalories,
            upgrades: newUpgrades,
            totalUpgradesPurchased: prev.totalUpgradesPurchased + purchased,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoBuy, loaded, multipliers.costReduction]);

  // Daily Challenge Generation
  useEffect(() => {
    if (!loaded) return;

    const today = new Date().toDateString();

    setGameState((prev) => {
      if (prev.lastChallengeDate !== today || !prev.dailyChallenge) {
        return {
          ...prev,
          dailyChallenge: generateDailyChallenge(prev.totalCalories),
          lastChallengeDate: today,
        };
      }
      return prev;
    });
  }, [loaded]);

  const purchaseUpgrade = useCallback(
    (upgradeId: string) => {
      setGameState((prev) => {
        const upgrade = prev.upgrades.find((u) => u.id === upgradeId);
        if (!upgrade) return prev;

        const cost = Math.floor(
          upgrade.baseCost *
            Math.pow(upgrade.costMultiplier, upgrade.level) *
            multipliers.costReduction,
        );

        if (prev.calories < cost || upgrade.level >= upgrade.maxLevel) {
          return prev;
        }

        const newLevel = upgrade.level + 1;
        const milestones = [10, 25, 50, 75, 100];
        const isMilestone =
          milestones.includes(newLevel) ||
          (newLevel > 100 && (newLevel - 100) % 50 === 0);

        if (isMilestone) soundManager.playMilestone();
        else soundManager.playBuy();

        return {
          ...prev,
          calories: prev.calories - cost,
          upgrades: prev.upgrades.map((u) =>
            u.id === upgradeId ? { ...u, level: u.level + 1 } : u,
          ),
          totalUpgradesPurchased: prev.totalUpgradesPurchased + 1,
        };
      });
    },
    [multipliers.costReduction],
  );

  const bulkPurchaseUpgrade = useCallback(
    (upgradeId: string, count: number, totalCost: number) => {
      setGameState((prev) => {
        if (prev.calories < totalCost || count <= 0) return prev;

        return {
          ...prev,
          calories: prev.calories - totalCost,
          upgrades: prev.upgrades.map((u) =>
            u.id === upgradeId
              ? { ...u, level: Math.min(u.level + count, u.maxLevel) }
              : u,
          ),
          totalUpgradesPurchased: prev.totalUpgradesPurchased + count,
        };
      });
    },
    [],
  );

  // Keep latest stats for background loops
  useEffect(() => {
    statsForBrosRef.current = { liftPower, multipliers };
  }, [liftPower, multipliers]);

  // Auto-Lift from Gym Bros
  useEffect(() => {
    if (!loaded) return;

    // Calculate total auto-lift power
    // Bro effect is "lifts per 5 seconds"
    let totalLiftsPer5s = 0;
    gameState.gymBros.forEach((bro) => {
      if (bro.effectType === "auto_lift" && bro.level > 0) {
        totalLiftsPer5s += bro.effect * bro.level;
      }
    });

    if (totalLiftsPer5s <= 0) return;

    // We want to distribute these lifts smoothly
    // Lifts per second = totalLiftsPer5s / 5
    const liftsPerSecond = totalLiftsPer5s / 5;
    const intervalMs = 1000 / liftsPerSecond;

    // If it's too fast (e.g. > 10 lifts/sec), we should batch them to avoid lag
    // Clamping to max 10 ticks per second (100ms)
    const safeInterval = Math.max(100, intervalMs);
    const liftsPerTick = safeInterval / intervalMs;

    const interval = setInterval(() => {
      // Use ref to access latest stats without restarting the interval
      const { liftPower: currentLiftPower, multipliers: currentMultipliers } =
        statsForBrosRef.current;

      if (!currentMultipliers) return;

      // Base lift IS the player's lift power (excluding combo, but including everything else)
      // This fixes the issue where Bros were using base damage of 1 instead of actual power
      const baseDmg = currentLiftPower;

      const { critChance, critMult } = currentMultipliers;
      // Average crit multiplier
      // damage = base * (1 + chance * (mult - 1))
      const avgCritFactor = 1 + critChance * (critMult - 1);

      const dmgPerLift = baseDmg * avgCritFactor;
      const totalDmg = dmgPerLift * liftsPerTick;

      pendingCaloriesRef.current += totalDmg;
      pendingLiftsRef.current += liftsPerTick; // For stats
    }, safeInterval);

    return () => clearInterval(interval);
  }, [loaded, gameState.gymBros]); // Removed stable deps to prevent interval reset

  // Main Loop to flush pending refs
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      if (pendingCaloriesRef.current > 0 || pendingLiftsRef.current > 0) {
        setGameState((prev) => ({
          ...prev,
          calories: prev.calories + pendingCaloriesRef.current,
          totalCalories: prev.totalCalories + pendingCaloriesRef.current,
          lifetimeCalories: prev.lifetimeCalories + pendingCaloriesRef.current,
          totalLifts: prev.totalLifts + Math.floor(pendingLiftsRef.current),
        }));
        pendingCaloriesRef.current = 0;
        pendingLiftsRef.current = 0;
      }
    }, 100); // Flush every 100ms
    return () => clearInterval(interval);
  }, [loaded]);

  const purchaseOneTimeUpgrade = useCallback((upgradeId: string) => {
    setGameState((prev) => {
      const upgrade = prev.oneTimeUpgrades.find((u) => u.id === upgradeId);
      if (!upgrade || upgrade.purchased || prev.calories < upgrade.cost)
        return prev;

      return {
        ...prev,
        calories: prev.calories - upgrade.cost,
        oneTimeUpgrades: prev.oneTimeUpgrades.map((u) =>
          u.id === upgradeId ? { ...u, purchased: true } : u,
        ),
      };
    });
  }, []);

  const purchaseEquipment = useCallback((equipmentId: string) => {
    setGameState((prev) => {
      const equipment = prev.equipment.find((e) => e.id === equipmentId);
      if (!equipment || equipment.purchased || prev.calories < equipment.cost)
        return prev;

      return {
        ...prev,
        calories: prev.calories - equipment.cost,
        equipment: prev.equipment.map((e) =>
          e.id === equipmentId ? { ...e, purchased: true } : e,
        ),
      };
    });
  }, []);

  const purchaseGymLocation = useCallback((locationId: string) => {
    setGameState((prev) => {
      const location = prev.gymLocations.find((l) => l.id === locationId);
      if (!location || location.unlocked || prev.calories < location.cost)
        return prev;

      return {
        ...prev,
        calories: prev.calories - location.cost,
        gymLocations: prev.gymLocations.map((l) =>
          l.id === locationId ? { ...l, unlocked: true } : l,
        ),
        currentGymId: locationId,
      };
    });
  }, []);

  const selectGymLocation = useCallback((locationId: string) => {
    setGameState((prev) => {
      const location = prev.gymLocations.find((l) => l.id === locationId);
      if (!location || !location.unlocked) return prev;
      return { ...prev, currentGymId: locationId };
    });
  }, []);

  const useConsumable = useCallback((consumableId: string) => {
    setGameState((prev) => {
      const consumable = CONSUMABLES.find((c) => c.id === consumableId);
      if (!consumable) return prev;

      const count = prev.consumablesPurchased[consumableId] || 0;
      const currentCost = Math.floor(consumable.cost * Math.pow(1.15, count));

      if (prev.calories < currentCost) return prev;

      const now = Date.now();
      let newCalories = prev.calories - currentCost;
      const newCount = count + 1;
      const newPurchased = {
        ...prev.consumablesPurchased,
        [consumableId]: newCount,
      };

      // Handle instant effect
      if (consumable.effect.type === "instant_calories") {
        newCalories += consumable.effect.value;
        return {
          ...prev,
          calories: Math.min(newCalories, Number.MAX_VALUE),
          totalCalories: Math.min(
            prev.totalCalories + consumable.effect.value,
            Number.MAX_VALUE,
          ),
          lifetimeCalories: Math.min(
            prev.lifetimeCalories + consumable.effect.value,
            Number.MAX_VALUE,
          ),
          consumablesPurchased: newPurchased,
          consumableCooldowns: {
            ...prev.consumableCooldowns,
            [consumableId]: now + consumable.cooldown * 1000,
          },
        };
      }

      // Handle timed effect
      const existing = prev.activeConsumables.find(
        (ac) => ac.id === consumableId,
      );
      let newActiveConsumables = [...prev.activeConsumables];

      if (existing && existing.endTime > now) {
        newActiveConsumables = newActiveConsumables.map((ac) =>
          ac.id === consumableId
            ? { ...ac, endTime: ac.endTime + consumable.duration * 1000 }
            : ac,
        );
      } else {
        newActiveConsumables = [
          ...newActiveConsumables.filter((ac) => ac.id !== consumableId),
          { id: consumableId, endTime: now + consumable.duration * 1000 },
        ];
      }

      return {
        ...prev,
        calories: newCalories,
        activeConsumables: newActiveConsumables,
        consumablesPurchased: newPurchased,
        consumableCooldowns: {
          ...prev.consumableCooldowns,
          [consumableId]: now + consumable.cooldown * 1000,
        },
      };
    });
  }, []);

  const claimDailyChallenge = useCallback(() => {
    setGameState((prev) => {
      const challenge = prev.dailyChallenge;
      if (!challenge || challenge.completed) return prev;
      if (challenge.progress < challenge.requirement.value) return prev;

      const reward = challenge.reward;
      const updates: Partial<GameState> = {};

      if (reward.type === "pp")
        updates.proteinPoints = prev.proteinPoints + reward.value;
      else if (reward.type === "tt")
        updates.titanTokens = prev.titanTokens + reward.value;
      else if (reward.type === "calories")
        updates.calories = prev.calories + reward.value;

      return {
        ...prev,
        ...updates,
        dailyChallenge: { ...challenge, completed: true },
      };
    });
  }, []);

  const purchasePrestigeUpgrade = useCallback((upgradeId: string) => {
    setGameState((prev) => {
      const upgrade = prev.prestigeUpgrades.find((u) => u.id === upgradeId);
      if (!upgrade || upgrade.level >= upgrade.maxLevel) return prev;

      const cost = getPrestigeUpgradeCost(upgrade);
      if (prev.proteinPoints < cost) return prev;

      return {
        ...prev,
        proteinPoints: prev.proteinPoints - cost,
        prestigeUpgrades: prev.prestigeUpgrades.map((u) =>
          u.id === upgradeId ? { ...u, level: u.level + 1 } : u,
        ),
      };
    });
  }, []);

  const purchaseAscensionUpgrade = useCallback((upgradeId: string) => {
    setGameState((prev) => {
      const upgrade = prev.ascensionUpgrades.find((u) => u.id === upgradeId);
      if (!upgrade || upgrade.level >= upgrade.maxLevel) return prev;

      const cost = getAscensionUpgradeCost(upgrade);
      if (prev.titanTokens < cost) return prev;

      return {
        ...prev,
        titanTokens: prev.titanTokens - cost,
        ascensionUpgrades: prev.ascensionUpgrades.map((u) =>
          u.id === upgradeId ? { ...u, level: u.level + 1 } : u,
        ),
      };
    });
  }, []);

  const purchaseTranscendenceUpgrade = useCallback((upgradeId: string) => {
    setGameState((prev) => {
      const upgrade = prev.transcendenceUpgrades.find(
        (u) => u.id === upgradeId,
      );
      if (!upgrade || upgrade.level >= upgrade.maxLevel) return prev;

      const cost = getTranscendenceUpgradeCost(upgrade);
      if (prev.divinityPoints < cost) return prev;

      return {
        ...prev,
        divinityPoints: prev.divinityPoints - cost,
        transcendenceUpgrades: prev.transcendenceUpgrades.map((u) =>
          u.id === upgradeId ? { ...u, level: u.level + 1 } : u,
        ),
      };
    });
  }, []);

  const prestige = useCallback(() => {
    if (potentialPrestige < 1) return;

    setGameState((prev) => ({
      ...prev,
      proteinPoints: prev.proteinPoints + potentialPrestige,
      calories: 0,
      totalCalories: 0,
      upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
      oneTimeUpgrades: ONE_TIME_UPGRADES.map((u) => ({ ...u })),
      equipment: EQUIPMENT.map((u) => ({ ...u })),
      gymLocations: GYM_LOCATIONS.map((u) => ({ ...u })),
      currentGymId: "loc1",
      activeConsumables: [],
      consumableCooldowns: {},
      consumablesPurchased: {},
      prestigeCount: prev.prestigeCount + 1,
    }));

    pendingCaloriesRef.current = 0;
    pendingLiftsRef.current = 0;
    setCombo(1);
  }, [potentialPrestige]);

  const ascend = useCallback(() => {
    if (
      potentialAscension < 1 ||
      gameState.proteinPoints < ASCENSION_PP_THRESHOLD
    )
      return;

    setGameState((prev) => ({
      ...prev,
      titanTokens: prev.titanTokens + potentialAscension,
      calories: 0,
      totalCalories: 0,
      upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
      oneTimeUpgrades: ONE_TIME_UPGRADES.map((u) => ({ ...u })),
      equipment: EQUIPMENT.map((u) => ({ ...u })),
      gymLocations: GYM_LOCATIONS.map((u) => ({ ...u })),
      currentGymId: "loc1",
      activeConsumables: [],
      consumableCooldowns: {},
      proteinPoints: 0,
      prestigeUpgrades: PRESTIGE_UPGRADES.map((u) => ({ ...u })),
      gymBros: GYM_BROS.map((b) => ({ ...b })),
      prestigeCount: 0,
      ascensionCount: prev.ascensionCount + 1,
    }));

    pendingCaloriesRef.current = 0;
    pendingLiftsRef.current = 0;
    setCombo(1);
  }, [potentialAscension, gameState.proteinPoints]);

  const transcend = useCallback(() => {
    if (
      potentialTranscendence < 1 ||
      gameState.titanTokens < TRANSCENDENCE_TT_THRESHOLD
    )
      return;

    setGameState((prev) => ({
      ...prev,
      divinityPoints: prev.divinityPoints + potentialTranscendence,
      calories: 0,
      totalCalories: 0,
      upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
      oneTimeUpgrades: ONE_TIME_UPGRADES.map((u) => ({ ...u })),
      equipment: EQUIPMENT.map((u) => ({ ...u })),
      gymLocations: GYM_LOCATIONS.map((u) => ({ ...u })),
      currentGymId: "loc1",
      activeConsumables: [],
      consumableCooldowns: {},
      proteinPoints: 0,
      prestigeUpgrades: PRESTIGE_UPGRADES.map((u) => ({ ...u })),
      titanTokens: 0,
      ascensionUpgrades: ASCENSION_UPGRADES.map((u) => ({ ...u })),
      gymBros: GYM_BROS.map((b) => ({ ...b })),
      prestigeCount: 0,
      ascensionCount: 0,
      transcendenceCount: prev.transcendenceCount + 1,
    }));

    pendingCaloriesRef.current = 0;
    pendingLiftsRef.current = 0;
    setCombo(1);
  }, [potentialTranscendence, gameState.titanTokens]);

  const handleExportOpen = () => {
    const saveData = JSON.stringify(gameState);
    // Unicode-safe base64 encoding
    const encoded = btoa(
      encodeURIComponent(saveData).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(parseInt(p1, 16)),
      ),
    );
    setExportString(encoded);
    setShowExportModal(true);
  };

  const copyExportString = () => {
    navigator.clipboard.writeText(exportString);
    toast({
      title: "Export Success",
      description: "Save data copied to clipboard!",
    });
  };

  const handleImportOpen = () => {
    setImportString("");
    setShowImportModal(true);
  };

  const handleImportSubmit = () => {
    if (!importString) return;
    try {
      // Unicode-safe base64 decoding
      const decoded = decodeURIComponent(
        atob(importString)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const data = JSON.parse(decoded);
      setGameState(processLoadedGame(data));
      setShowImportModal(false);
      toast({
        title: "Import Success",
        description: "Game loaded successfully!",
      });
    } catch {
      toast({
        title: "Import Failed",
        description: "Invalid save data string.",
        variant: "destructive",
      });
    }
  };

  const hardReset = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to HARD RESET? This will wipe ALL progress including Competition/Pro Cards!",
      )
    ) {
      if (confirm("Really? There is no going back!")) {
        isResettingRef.current = true;
        // Clear all intervals and immediate executions
        const highestId = window.setTimeout(() => {}, 0);
        for (let i = 0; i <= highestId; i++) {
          window.clearTimeout(i);
          window.clearInterval(i);
        }

        localStorage.removeItem(SAVE_KEY);
        // Force state reset to prevent accidental rewrites
        setGameState(getInitialState());
        // Reload to ensure a clean state
        window.location.reload();
      }
    }
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-foreground">
          <Dumbbell className="h-6 w-6 animate-pulse text-orange-400" />
          <span>Loading your gains...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 flex items-center justify-center gap-3">
            <span className="text-4xl">💪</span>
            <span>
              <span className="text-orange-400">Gym</span> Gains
            </span>
            <span className="text-4xl">🔥</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            From Couch Potato to Legend — Lift your way to glory!
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_420px] gap-6">
          <div className="space-y-4">
            {/* Top Action Area: Sprite, Button, Combo, Crit */}
            <div className="bg-card rounded-xl border border-border flex items-center justify-between p-4 md:p-6 relative h-75 md:h-87.5 overflow-hidden">
              {/* Left: Stats */}
              <div className="flex flex-col gap-2 relative z-10 w-20 md:w-25">
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2 md:p-3 text-center">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">
                    Per Lift
                  </div>
                  <div className="font-bold text-yellow-400 text-sm md:text-base">
                    {formatNumber(liftPower, 2, numberNotation)}
                  </div>
                </div>
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2 md:p-3 text-center">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">
                    Per Sec
                  </div>
                  <div className="font-bold text-green-400 text-sm md:text-base">
                    {formatNumber(passiveIncome, 2, numberNotation)}
                  </div>
                </div>
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 md:p-3 text-center">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">
                    Auto Lifts
                  </div>
                  <div className="font-bold text-blue-400 text-sm md:text-base">
                    {autoLiftsPerSec.toFixed(1)}/s
                  </div>
                </div>
                <div className="rounded-lg bg-neutral-500/10 border border-neutral-500/20 p-2 md:p-3 text-center">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">
                    Lifts
                  </div>
                  <div className="font-bold text-neutral-400 text-sm md:text-base">
                    {formatNumber(gameState.totalLifts)}
                  </div>
                </div>
              </div>

              {/* Center: Button */}
              <div className="flex flex-col items-center justify-center gap-4 flex-1 z-20 mb-6">
                <div className="relative">
                  <LiftButton
                    liftPower={liftPower}
                    onLift={handleLift}
                    combo={combo}
                    showFloatingText={showFloatingText}
                    numberNotation={numberNotation}
                  />
                </div>
              </div>

              {/* Right: Crits */}
              <div className="flex flex-col gap-2 relative z-10 w-20 md:w-25">
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 md:p-3 text-center">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">
                    Crit %
                  </div>
                  <div className="font-bold text-red-400 text-sm md:text-base">
                    {(multipliers.critChance * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 md:p-3 text-center">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">
                    Dmg
                  </div>
                  <div className="font-bold text-red-400 text-sm md:text-base">
                    x{multipliers.critMult.toFixed(1)}
                  </div>
                </div>
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-2 md:p-3 text-center">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">
                    Combo
                  </div>
                  <div className="font-bold text-orange-400 text-sm md:text-base">
                    x{combo}/{multipliers.maxComboCap}
                  </div>
                </div>
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2 md:p-3 text-center">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">
                    Bonus
                  </div>
                  <div className="font-bold text-yellow-400 text-sm md:text-base">
                    +{(combo * 2 * multipliers.comboMult).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Combo Bar Absolute Bottom */}
              <div className="absolute bottom-0 left-0 right-0 z-0">
                <ComboDisplay
                  combo={combo}
                  comboTimer={comboTimer}
                  maxComboTime={COMBO_DECAY_TIME}
                />
              </div>
            </div>

            <GymStats
              calories={gameState.calories}
              totalCalories={gameState.totalCalories}
              liftPower={liftPower}
              passiveIncome={passiveIncome}
              proteinPoints={gameState.proteinPoints}
              titanTokens={gameState.titanTokens}
              divinityPoints={gameState.divinityPoints}
              rankBonus={rankBonus}
              numberNotation={numberNotation}
            />
          </div>

          <div className="space-y-6">
            {gameState.dailyChallenge &&
              !gameState.dailyChallenge.completed && (
                <DailyChallengePanel
                  challenge={gameState.dailyChallenge}
                  proteinPoints={gameState.proteinPoints}
                  titanTokens={gameState.titanTokens}
                  onClaim={claimDailyChallenge}
                />
              )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-5 bg-secondary h-auto p-1 gap-1">
                <TabsTrigger
                  value="upgrades"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Train
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="equipment"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Gear
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="gym-bros"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Bros
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="prestige"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Comp
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="ascension"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <Rocket className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Pro
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="transcend"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <InfinityIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Mr. O
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Awards
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Stats
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <ChartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Data
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 h-full data-[state=active]:bg-background"
                >
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden group-data-[state=active]:inline">
                    Settings
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="mt-4">
                <SettingsPanel
                  autoBuy={autoBuy}
                  setAutoBuy={setAutoBuy}
                  clickLimiterEnabled={clickLimiterEnabled}
                  setClickLimiterEnabled={setClickLimiterEnabled}
                  lowPerformanceMode={lowPerformanceMode}
                  setLowPerformanceMode={setLowPerformanceMode}
                  showFloatingText={showFloatingText}
                  setShowFloatingText={setShowFloatingText}
                  toastsEnabled={toastsEnabled}
                  setToastsEnabled={setToastsEnabled}
                  soundEnabled={soundEnabled}
                  setSoundEnabled={(enabled) => {
                    setSoundEnabled(enabled);
                    soundManager.setEnabled(enabled);
                  }}
                  numberNotation={numberNotation}
                  setNumberNotation={setNumberNotation}
                  isLocalhost={isLocalhost}
                  onManualSave={() => {
                    if (saveGame(gameState)) {
                      toast({
                        title: "Game Saved",
                        description: "Your progress has been manually saved.",
                      });
                    } else {
                      toast({
                        title: "Save Failed",
                        description: "Could not save game data.",
                        variant: "destructive",
                      });
                    }
                  }}
                  onExport={handleExportOpen}
                  onImport={handleImportOpen}
                  onHardReset={hardReset}
                />
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <StatsPanel
                  playTime={gameState.playTime}
                  totalLifts={gameState.totalLifts}
                  totalCalories={gameState.totalCalories}
                  lifetimeCalories={gameState.lifetimeCalories}
                  maxCombo={gameState.maxCombo}
                  criticalHits={gameState.criticalHits}
                  totalUpgrades={gameState.totalUpgradesPurchased}
                  prestigeCount={gameState.prestigeCount}
                  ascensionCount={gameState.ascensionCount}
                  transcendenceCount={gameState.transcendenceCount}
                  multipliers={multipliers}
                />
              </TabsContent>

              <TabsContent value="achievements" className="mt-4">
                <AchievementsPanel achievements={gameState.achievements} />
              </TabsContent>

              <TabsContent value="upgrades" className="mt-4">
                <div className="mb-4 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="overflow-x-auto max-w-full -mx-1 px-1">
                      <BuyMultiplierSelector
                        value={buyMultiplier}
                        onChange={setBuyMultiplier}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs h-8 gap-1.5 shrink-0 ml-auto"
                      onClick={() => handleBuyAvailable(activeUpgradeTab)}
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Buy ({buyMultiplier})
                    </Button>
                  </div>

                  <Tabs
                    value={activeUpgradeTab}
                    onValueChange={(v) => setActiveUpgradeTab(v as any)}
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-3 h-9">
                      <TabsTrigger value="lift" className="text-xs">
                        Lift
                      </TabsTrigger>
                      <TabsTrigger value="passive" className="text-xs">
                        Diet
                      </TabsTrigger>
                      <TabsTrigger value="multiplier" className="text-xs">
                        Mults
                      </TabsTrigger>
                    </TabsList>

                    {(["lift", "passive", "multiplier"] as const).map(
                      (type) => (
                        <TabsContent key={type} value={type} className="mt-2">
                          <div className="space-y-3 max-h-112 overflow-y-auto pr-1">
                            {gameState.upgrades
                              .filter((u) => u.effectType === type)
                              .map((upgrade) => {
                                const cost = getUpgradeCost(upgrade);
                                const isUnlocked =
                                  gameState.totalCalories >= upgrade.unlockAt ||
                                  upgrade.level > 0;

                                if (
                                  !isUnlocked &&
                                  upgrade.level === 0 &&
                                  !isUnlocked
                                ) {
                                  // Hide locked upgrades that are not unlocked?
                                  // The original code showed locked ones if isUnlocked check above.
                                  // Original logic: isUnlocked = calories >= unlockAt || level > 0.
                                  // We should preserve rendering if it matches original logic.
                                }

                                // Wait, simple map is fine, render all that match filter.
                                // But we might want to hide completely locked ones if they clutter?
                                // Original code: mapped ALL upgrades, passed isUnlocked prop.
                                // We keep the same behavior.

                                return (
                                  <UpgradeCard
                                    key={upgrade.id}
                                    upgrade={upgrade}
                                    currentCost={cost}
                                    canAfford={gameState.calories >= cost}
                                    isUnlocked={isUnlocked}
                                    onPurchase={() =>
                                      purchaseUpgrade(upgrade.id)
                                    }
                                    buyMultiplier={buyMultiplier}
                                    currentCalories={gameState.calories}
                                    costReduction={multipliers.costReduction}
                                    onBulkPurchase={(count, totalCost) =>
                                      bulkPurchaseUpgrade(
                                        upgrade.id,
                                        count,
                                        totalCost,
                                      )
                                    }
                                  />
                                );
                              })}
                            {gameState.upgrades.filter(
                              (u) => u.effectType === type,
                            ).length === 0 && (
                              <div className="text-center text-muted-foreground text-xs py-8">
                                No upgrades in this category yet.
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      ),
                    )}
                  </Tabs>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <SynergyPanel
                    upgrades={gameState.upgrades}
                    activeSynergies={activeSynergies}
                  />
                </div>
              </TabsContent>

              <TabsContent value="gym-bros" className="mt-4">
                <GymBrosPanel
                  gymBros={gameState.gymBros}
                  calories={gameState.calories}
                  proteinPoints={gameState.proteinPoints}
                  titanTokens={gameState.titanTokens}
                  divinityPoints={gameState.divinityPoints}
                  onHire={handleGymBroHire}
                />
              </TabsContent>

              <TabsContent value="equipment" className="mt-4">
                <Tabs
                  value={activeGearTab}
                  onValueChange={setActiveGearTab}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-4 bg-muted/50 mb-4 h-9">
                    <TabsTrigger
                      value="milestones"
                      className="text-[10px] sm:text-xs"
                    >
                      Milestones
                    </TabsTrigger>
                    <TabsTrigger
                      value="gym-equipment"
                      className="text-[10px] sm:text-xs"
                    >
                      Equipment
                    </TabsTrigger>
                    <TabsTrigger
                      value="locations"
                      className="text-[10px] sm:text-xs"
                    >
                      Locations
                    </TabsTrigger>
                    <TabsTrigger
                      value="consumables"
                      className="text-[10px] sm:text-xs"
                    >
                      Items
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="milestones" className="space-y-4">
                    <div className="flex justify-between items-center bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                      <p className="text-xs text-cyan-300">
                        Milestone upgrades provide powerful permanent bonuses!
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px] h-7 gap-1"
                        onClick={() => handleBuyAllGear("milestones")}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Buy Available
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-125 overflow-y-auto pr-1">
                      {gameState.oneTimeUpgrades.map((upgrade) => {
                        const isUnlocked =
                          gameState.totalCalories >= upgrade.unlockAt ||
                          upgrade.purchased;
                        return (
                          <OneTimeUpgradeCard
                            key={upgrade.id}
                            upgrade={upgrade}
                            canAfford={gameState.calories >= upgrade.cost}
                            isUnlocked={isUnlocked}
                            onPurchase={() =>
                              purchaseOneTimeUpgrade(upgrade.id)
                            }
                          />
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="gym-equipment" className="space-y-4">
                    <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-xs text-green-300">
                        Buy equipment to passively boost your stats!
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px] h-7 gap-1"
                        onClick={() => handleBuyAllGear("equipment")}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Buy Available
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-125 overflow-y-auto pr-1">
                      {gameState.equipment.map((eq) => {
                        const isUnlocked =
                          gameState.totalCalories >= eq.unlockAt ||
                          eq.purchased;
                        return (
                          <div
                            key={eq.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-all",
                              eq.purchased
                                ? "bg-green-500/10 border border-green-500/30"
                                : isUnlocked
                                  ? gameState.calories >= eq.cost
                                    ? "bg-secondary hover:bg-secondary/80 cursor-pointer border border-transparent hover:border-cyan-500/30"
                                    : "bg-secondary/50 opacity-60 border border-transparent"
                                  : "bg-secondary/30 opacity-40",
                            )}
                            onClick={() =>
                              !eq.purchased &&
                              isUnlocked &&
                              gameState.calories >= eq.cost &&
                              purchaseEquipment(eq.id)
                            }
                          >
                            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl">
                              {eq.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground">
                                {eq.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {eq.description}
                              </p>
                            </div>
                            {eq.purchased ? (
                              <Badge className="bg-green-500/20 text-green-300">
                                Owned
                              </Badge>
                            ) : isUnlocked ? (
                              <Badge variant="secondary">
                                {formatNumber(eq.cost)}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-muted-foreground"
                              >
                                {formatNumber(eq.unlockAt)} cal
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="locations" className="space-y-4">
                    <div className="flex justify-between items-center bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <p className="text-xs text-orange-300">
                        Move to better gyms to multiply your gains!
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px] h-7 gap-1"
                        onClick={() => handleBuyAllGear("locations")}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Buy Available
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-125 overflow-y-auto pr-1">
                      {gameState.gymLocations.map((loc) => {
                        const isUnlocked =
                          gameState.totalCalories >= loc.unlockAt ||
                          loc.unlocked;
                        const isCurrent = gameState.currentGymId === loc.id;
                        return (
                          <div
                            key={loc.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer",
                              isCurrent
                                ? "bg-orange-500/10 border border-orange-500/30"
                                : loc.unlocked
                                  ? "bg-secondary hover:bg-secondary/80 border border-transparent"
                                  : isUnlocked && gameState.calories >= loc.cost
                                    ? "bg-secondary hover:bg-secondary/80 border border-transparent hover:border-cyan-500/30"
                                    : "bg-secondary/30 opacity-40",
                            )}
                            onClick={() =>
                              loc.unlocked
                                ? selectGymLocation(loc.id)
                                : isUnlocked &&
                                  gameState.calories >= loc.cost &&
                                  purchaseGymLocation(loc.id)
                            }
                          >
                            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl">
                              {loc.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground">
                                {loc.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                x{loc.bonuses.lift_mult} lift, x
                                {loc.bonuses.passive_mult} passive
                              </p>
                            </div>
                            {isCurrent ? (
                              <Badge className="bg-orange-500/20 text-orange-300">
                                Active
                              </Badge>
                            ) : loc.unlocked ? (
                              <Badge variant="secondary">Select</Badge>
                            ) : isUnlocked ? (
                              <Badge variant="secondary">
                                {formatNumber(loc.cost)}
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                {formatNumber(loc.unlockAt)} cal
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="consumables" className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <p className="text-xs text-purple-300">
                        Use consumables for temporary boosts!
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-125 overflow-y-auto pr-1">
                      {CONSUMABLES.map((con) => {
                        const isUnlocked =
                          gameState.totalCalories >= con.unlockAt;

                        if (!isUnlocked) {
                          return (
                            <div
                              key={con.id}
                              className="bg-card/50 rounded-lg p-3 border border-border opacity-50 flex flex-col items-center justify-center text-center gap-2 h-full min-h-35"
                            >
                              <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-muted-foreground text-xs">
                                  Locked
                                </h3>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  Reach {formatNumber(con.unlockAt)} Cal
                                </p>
                              </div>
                            </div>
                          );
                        }

                        const activeConsumable =
                          gameState.activeConsumables.find(
                            (ac) => ac.id === con.id,
                          );
                        const isActive =
                          !!activeConsumable &&
                          activeConsumable.endTime > Date.now();

                        const count =
                          gameState.consumablesPurchased[con.id] || 0;
                        const currentCost = Math.floor(
                          con.cost * Math.pow(1.15, count),
                        );

                        const remainingTime = isActive
                          ? Math.ceil(
                              (activeConsumable.endTime - Date.now()) / 1000,
                            )
                          : 0;

                        const isPurchased = con.oneTime && count > 0;
                        const canAfford = gameState.calories >= currentCost;

                        return (
                          <Button
                            key={con.id}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            disabled={canAfford === false || isPurchased}
                            onClick={() => useConsumable(con.id)}
                            className={cn(
                              "flex flex-col h-auto py-3 gap-1 relative overflow-hidden",
                              isActive &&
                                "border-purple-500 ring-1 ring-purple-500",
                            )}
                          >
                            {isActive && (
                              <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg font-mono">
                                {remainingTime}s
                              </div>
                            )}
                            {isPurchased && (
                              <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg font-mono">
                                DONE
                              </div>
                            )}
                            <span className="text-xl">{con.icon}</span>
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold">
                                {con.name}
                              </span>
                              {con.oneTime ? (
                                <span className="text-[10px] text-yellow-500 font-bold opacity-90">
                                  One-Time
                                </span>
                              ) : (
                                <span className="text-[10px] text-center text-muted-foreground whitespace-normal leading-tight px-1 opacity-80">
                                  {con.description}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-center mt-1">
                              <span className="text-xs font-medium">
                                {formatNumber(currentCost)}
                              </span>
                              {count > 0 && (
                                <span className="text-[9px] text-muted-foreground">
                                  Lvl {count}
                                </span>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="prestige" className="mt-4">
                <PrestigePanel
                  proteinPoints={gameState.proteinPoints}
                  potentialPrestige={potentialPrestige}
                  caloriesForNextPP={caloriesForNextPP}
                  prestigeUpgrades={gameState.prestigeUpgrades}
                  totalCalories={gameState.totalCalories}
                  onPrestige={prestige}
                  onPurchaseUpgrade={purchasePrestigeUpgrade}
                />
              </TabsContent>

              <TabsContent value="ascension" className="mt-4">
                <AscensionPanel
                  titanTokens={gameState.titanTokens}
                  proteinPoints={gameState.proteinPoints}
                  potentialAscension={potentialAscension}
                  ppForNextTT={ppForNextTT}
                  ascensionUpgrades={gameState.ascensionUpgrades}
                  onAscend={ascend}
                  onPurchaseUpgrade={purchaseAscensionUpgrade}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <AnalyticsPanel
                  calorieHistory={gameState.calorieHistory}
                  currentCalories={gameState.totalCalories}
                  currentLifts={gameState.totalLifts}
                  playTime={gameState.playTime}
                />
              </TabsContent>

              <TabsContent value="transcend" className="mt-4">
                <div className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <InfinityIcon className="w-5 h-5 text-fuchsia-400" />
                    <h2 className="text-lg font-semibold text-foreground">
                      Mr. Olympia
                    </h2>
                  </div>

                  <div className="bg-linear-to-br from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Divinity Points
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30"
                      >
                        {formatNumber(gameState.divinityPoints)} DP
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Current TT
                      </span>
                      <span className="text-sm text-amber-400">
                        {formatNumber(gameState.titanTokens)} TT
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Next DP at
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(ttForNextDP)} TT
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        On Win
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          gameState.titanTokens >= TRANSCENDENCE_TT_THRESHOLD
                            ? "text-fuchsia-400"
                            : "text-muted-foreground",
                        )}
                      >
                        +{formatNumber(potentialTranscendence)} DP
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={transcend}
                    disabled={
                      gameState.titanTokens < TRANSCENDENCE_TT_THRESHOLD
                    }
                    className={cn(
                      "w-full mb-4",
                      gameState.titanTokens >= TRANSCENDENCE_TT_THRESHOLD
                        ? "bg-linear-to-r from-fuchsia-500 to-purple-500 text-white hover:from-fuchsia-600 hover:to-purple-600"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <InfinityIcon className="w-4 h-4 mr-2" />
                    {gameState.titanTokens >= TRANSCENDENCE_TT_THRESHOLD
                      ? `Win title for ${formatNumber(
                          potentialTranscendence,
                        )} DP`
                      : `Need ${formatNumber(TRANSCENDENCE_TT_THRESHOLD)} TT`}
                  </Button>

                  <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-fuchsia-300 text-center">
                      Winning Olympia resets EVERYTHING except Divinity
                      upgrades.
                      <br />
                      Divinity upgrades are permanent forever!
                    </p>
                  </div>

                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Divinity Upgrades
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {gameState.transcendenceUpgrades.map((upgrade) => {
                      const cost = getTranscendenceUpgradeCost(upgrade);
                      const canAfford = gameState.divinityPoints >= cost;
                      const isMaxed = upgrade.level >= upgrade.maxLevel;

                      return (
                        <div
                          key={upgrade.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all",
                            isMaxed
                              ? "bg-fuchsia-500/10 border border-fuchsia-500/30"
                              : canAfford
                                ? "bg-secondary hover:bg-secondary/80 cursor-pointer border border-transparent hover:border-fuchsia-500/30"
                                : "bg-secondary/50 opacity-60 border border-transparent",
                          )}
                          onClick={() =>
                            !isMaxed &&
                            canAfford &&
                            purchaseTranscendenceUpgrade(upgrade.id)
                          }
                        >
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl shrink-0">
                            {upgrade.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {upgrade.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0 text-fuchsia-300 border-fuchsia-500/30"
                              >
                                Lv.{upgrade.level}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {upgrade.description}
                            </p>
                          </div>
                          {!isMaxed ? (
                            <Badge
                              variant="secondary"
                              className={cn(
                                canAfford
                                  ? "bg-fuchsia-500/20 text-fuchsia-300"
                                  : "bg-secondary text-muted-foreground",
                              )}
                            >
                              {formatNumber(cost)} DP
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-fuchsia-500/20 text-fuchsia-300 shrink-0"
                            >
                              MAX
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Save</DialogTitle>
            <DialogDescription>
              Copy this code and save it somewhere safe.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              className="font-mono text-xs h-25"
              value={exportString}
              readOnly
            />
            <Button onClick={copyExportString}>Copy to Clipboard</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Save</DialogTitle>
            <DialogDescription>
              Paste your save code here. This will overwrite your current save!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              className="font-mono text-xs h-25"
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
              placeholder="Paste save string here..."
            />
            <Button onClick={handleImportSubmit} variant="destructive">
              Import & Overwrite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
