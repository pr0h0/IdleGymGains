export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  effectType: "lift" | "passive" | "multiplier";
  icon: string;
  level: number;
  maxLevel: number;
  unlockAt: number;
  hasMilestones?: boolean;
  synergyGroup?: string;
}

export interface OneTimeUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: number;
  effectType:
    | "lift_mult"
    | "passive_mult"
    | "cost_reduction"
    | "all_mult"
    | "prestige_bonus"
    | "combo_max";
  icon: string;
  purchased: boolean;
  unlockAt: number;
}

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  effectType:
    | "lift_mult"
    | "passive_mult"
    | "cost_reduction"
    | "prestige_mult"
    | "all_mult";
  icon: string;
  level: number;
  maxLevel: number;
}

export interface AscensionUpgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  effectType:
    | "lift_mult"
    | "passive_mult"
    | "cost_reduction"
    | "prestige_mult"
    | "all_mult"
    | "ascension_mult"
    | "pp_mult";
  icon: string;
  level: number;
  maxLevel: number;
}

export interface GymRank {
  name: string;
  minCalories: number;
  icon: string;
  color: string;
  bonus: number; // Multiplier bonus for reaching this rank
}

export const GYM_RANKS: GymRank[] = [
  {
    name: "Couch Potato",
    minCalories: 0,
    icon: "🥔",
    color: "text-stone-400",
    bonus: 1,
  },
  {
    name: "Gym Newbie",
    minCalories: 100,
    icon: "🏃",
    color: "text-green-400",
    bonus: 1.1,
  },
  {
    name: "Regular Lifter",
    minCalories: 10000,
    icon: "🏋️",
    color: "text-blue-400",
    bonus: 1.2,
  },
  {
    name: "Fitness Enthusiast",
    minCalories: 100000,
    icon: "💪",
    color: "text-cyan-400",
    bonus: 1.35,
  },
  {
    name: "Iron Addict",
    minCalories: 1000000,
    icon: "🔩",
    color: "text-yellow-400",
    bonus: 1.5,
  },
  {
    name: "Beast Mode",
    minCalories: 10000000,
    icon: "🦁",
    color: "text-orange-400",
    bonus: 1.7,
  },
  {
    name: "Titan",
    minCalories: 100000000,
    icon: "⚡",
    color: "text-red-400",
    bonus: 2,
  },
  {
    name: "Olympian",
    minCalories: 1000000000,
    icon: "🏆",
    color: "text-amber-300",
    bonus: 2.5,
  },
  {
    name: "Ascended",
    minCalories: 10000000000,
    icon: "👑",
    color: "text-purple-400",
    bonus: 3,
  },
  {
    name: "Legend",
    minCalories: 100000000000,
    icon: "🌟",
    color: "text-pink-400",
    bonus: 4,
  },
  {
    name: "Immortal",
    minCalories: 1000000000000,
    icon: "♾️",
    color: "text-fuchsia-300",
    bonus: 5,
  },
];

export function getRankBonus(totalCalories: number): number {
  for (let i = GYM_RANKS.length - 1; i >= 0; i--) {
    if (totalCalories >= GYM_RANKS[i].minCalories) {
      return GYM_RANKS[i].bonus;
    }
  }
  return 1;
}

export const MILESTONE_THRESHOLDS = [10, 25, 50, 75, 100];

export function getMilestoneMultiplier(level: number): number {
  if (level < 10) return 1;

  let multiplier = 1;

  if (level >= 10) multiplier *= 1.5;
  if (level >= 25) multiplier *= 1.4;
  if (level >= 50) multiplier *= 1.3;
  if (level >= 75) multiplier *= 1.2;
  if (level >= 100) multiplier *= 1.5;

  if (level >= 150) {
    const additionalMilestones = Math.floor((level - 100) / 50);
    multiplier *= Math.pow(1.05, additionalMilestones);
  }

  return Math.round(multiplier * 100) / 100;
}

export function getNextMilestone(level: number): number | null {
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (level < threshold) return threshold;
  }

  // After 100, milestones are every 50
  if (level >= 100) {
    // If level is exactly on a milestone, return next one
    const currentMilestoneBlock = Math.floor((level - 100) / 50);
    return 100 + (currentMilestoneBlock + 1) * 50;
  }

  return 150;
}

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: "lift1",
    name: "Better Form",
    description: "+1 cal per lift",
    baseCost: 15,
    costMultiplier: 1.2,
    effect: 1,
    effectType: "lift",
    icon: "🎯",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 0,
    hasMilestones: true,
    synergyGroup: "form",
  },
  {
    id: "food1",
    name: "Protein Shake",
    description: "+0.5 cal/sec",
    baseCost: 50,
    costMultiplier: 1.22,
    effect: 0.5,
    effectType: "passive",
    icon: "🥤",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 0,
    hasMilestones: true,
    synergyGroup: "protein",
  },
  {
    id: "lift2",
    name: "Heavier Dumbbells",
    description: "+5 cal per lift",
    baseCost: 400,
    costMultiplier: 1.24,
    effect: 5,
    effectType: "lift",
    icon: "🏋️",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 100,
    hasMilestones: true,
    synergyGroup: "weights",
  },
  {
    id: "food2",
    name: "Chicken & Rice",
    description: "+3 cal/sec",
    baseCost: 2000,
    costMultiplier: 1.25,
    effect: 3,
    effectType: "passive",
    icon: "🍗",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 500,
    hasMilestones: true,
    synergyGroup: "protein",
  },
  {
    id: "mult1",
    name: "Pre-Workout",
    description: "x1.05 lift power",
    baseCost: 8000,
    costMultiplier: 1.8,
    effect: 1.05,
    effectType: "multiplier",
    icon: "⚡",
    level: 0,
    maxLevel: 50,
    unlockAt: 2000,
    hasMilestones: false,
  },
  {
    id: "lift3",
    name: "Barbell Training",
    description: "+25 cal per lift",
    baseCost: 35000,
    costMultiplier: 1.22,
    effect: 25,
    effectType: "lift",
    icon: "🔩",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 10000,
    hasMilestones: true,
    synergyGroup: "weights",
  },
  {
    id: "food3",
    name: "Meal Prep Service",
    description: "+20 cal/sec",
    baseCost: 150000,
    costMultiplier: 1.25,
    effect: 20,
    effectType: "passive",
    icon: "🥡",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 50000,
    hasMilestones: true,
    synergyGroup: "meals",
  },
  {
    id: "lift4",
    name: "Olympic Lifts",
    description: "+150 cal per lift",
    baseCost: 800000,
    costMultiplier: 1.28,
    effect: 150,
    effectType: "lift",
    icon: "🏅",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 250000,
    hasMilestones: true,
    synergyGroup: "olympic",
  },
  {
    id: "food4",
    name: "Personal Chef",
    description: "+150 cal/sec",
    baseCost: 5000000,
    costMultiplier: 1.3,
    effect: 150,
    effectType: "passive",
    icon: "👨‍🍳",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 1000000,
    hasMilestones: true,
    synergyGroup: "meals",
  },
  {
    id: "mult2",
    name: "Anabolic Kitchen",
    description: "x1.1 all income",
    baseCost: 50000000,
    costMultiplier: 2.2,
    effect: 1.1,
    effectType: "multiplier",
    icon: "🧪",
    level: 0,
    maxLevel: 30,
    unlockAt: 10000000,
    hasMilestones: false,
  },
  {
    id: "lift5",
    name: "Strongman Training",
    description: "+1K cal per lift",
    baseCost: 500000000,
    costMultiplier: 1.32,
    effect: 1000,
    effectType: "lift",
    icon: "🦍",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 100000000,
    hasMilestones: true,
    synergyGroup: "strongman",
  },
  {
    id: "food5",
    name: "Nutrition Empire",
    description: "+1K cal/sec",
    baseCost: 2000000000,
    costMultiplier: 1.35,
    effect: 1000,
    effectType: "passive",
    icon: "🏰",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 500000000,
    hasMilestones: true,
    synergyGroup: "empire",
  },
  {
    id: "lift6",
    name: "Titan Lifts",
    description: "+10K cal per lift",
    baseCost: 50000000000,
    costMultiplier: 1.38,
    effect: 10000,
    effectType: "lift",
    icon: "⚔️",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 10000000000,
    hasMilestones: true,
    synergyGroup: "titan",
  },
  {
    id: "food6",
    name: "Divine Feast",
    description: "+10K cal/sec",
    baseCost: 200000000000,
    costMultiplier: 1.4,
    effect: 10000,
    effectType: "passive",
    icon: "🍖",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 50000000000,
    hasMilestones: true,
    synergyGroup: "divine",
  },
  {
    id: "mult3",
    name: "Peak Performance",
    description: "x1.15 all income",
    baseCost: 1000000000000,
    costMultiplier: 2.5,
    effect: 1.15,
    effectType: "multiplier",
    icon: "👁️",
    level: 0,
    maxLevel: 25,
    unlockAt: 100000000000,
    hasMilestones: false,
  },
  {
    id: "lift7",
    name: "Cosmic Strength",
    description: "+100K cal per lift",
    baseCost: 10000000000000,
    costMultiplier: 1.42,
    effect: 100000,
    effectType: "lift",
    icon: "🌟",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 1000000000000,
    hasMilestones: true,
    synergyGroup: "cosmic",
  },
  {
    id: "food7",
    name: "Celestial Nutrients",
    description: "+100K cal/sec",
    baseCost: 50000000000000,
    costMultiplier: 1.45,
    effect: 100000,
    effectType: "passive",
    icon: "✨",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 5000000000000,
    hasMilestones: true,
    synergyGroup: "cosmic",
  },
  {
    id: "lift8",
    name: "Universal Power",
    description: "+1M cal per lift",
    baseCost: 1e15,
    costMultiplier: 1.48,
    effect: 1000000,
    effectType: "lift",
    icon: "🌌",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 1e14,
    hasMilestones: true,
    synergyGroup: "universal",
  },
  {
    id: "food8",
    name: "Infinite Sustenance",
    description: "+1M cal/sec",
    baseCost: 5e15,
    costMultiplier: 1.5,
    effect: 1000000,
    effectType: "passive",
    icon: "♾️",
    level: 0,
    maxLevel: Number.POSITIVE_INFINITY,
    unlockAt: 5e14,
    hasMilestones: true,
    synergyGroup: "universal",
  },
];

export const ONE_TIME_UPGRADES: OneTimeUpgrade[] = [
  {
    id: "ot1",
    name: "Gym Membership",
    description: "x2 lift power permanently",
    cost: 500,
    effect: 2,
    effectType: "lift_mult",
    icon: "🎫",
    purchased: false,
    unlockAt: 200,
  },
  {
    id: "ot2",
    name: "Weightlifting Belt",
    description: "x1.5 lift power",
    cost: 5000,
    effect: 1.5,
    effectType: "lift_mult",
    icon: "🥋",
    purchased: false,
    unlockAt: 2000,
  },
  {
    id: "ot3",
    name: "Protein Sponsorship",
    description: "x2 passive income",
    cost: 25000,
    effect: 2,
    effectType: "passive_mult",
    icon: "📝",
    purchased: false,
    unlockAt: 10000,
  },
  {
    id: "ot4",
    name: "Home Gym Setup",
    description: "20% cheaper upgrades",
    cost: 100000,
    effect: 0.8,
    effectType: "cost_reduction",
    icon: "🏠",
    purchased: false,
    unlockAt: 50000,
  },
  {
    id: "combo1",
    name: "Focus Training",
    description: "+10 Max Combo",
    cost: 5000,
    effect: 10,
    effectType: "combo_max",
    icon: "🧘",
    purchased: false,
    unlockAt: 1000,
  },
  {
    id: "combo2",
    name: "Rhythm Control",
    description: "+15 Max Combo",
    cost: 50000,
    effect: 15,
    effectType: "combo_max",
    icon: "🎵",
    purchased: false,
    unlockAt: 25000,
  },
  {
    id: "combo3",
    name: "Flow State",
    description: "+25 Max Combo",
    cost: 500000,
    effect: 25,
    effectType: "combo_max",
    icon: "🌊",
    purchased: false,
    unlockAt: 250000,
  },
  {
    id: "combo4",
    name: "Zen Mind",
    description: "+40 Max Combo",
    cost: 5000000,
    effect: 40,
    effectType: "combo_max",
    icon: "☯️",
    purchased: false,
    unlockAt: 1000000,
  },
  {
    id: "ot5",
    name: "Personal Trainer",
    description: "x2 all calorie gains",
    cost: 500000,
    effect: 2,
    effectType: "all_mult",
    icon: "🧑‍🏫",
    purchased: false,
    unlockAt: 200000,
  },
  {
    id: "ot6",
    name: "Fitness Influencer",
    description: "x3 passive income",
    cost: 2500000,
    effect: 3,
    effectType: "passive_mult",
    icon: "📱",
    purchased: false,
    unlockAt: 1000000,
  },
  {
    id: "ot7",
    name: "Competition Prep Coach",
    description: "x2.5 lift power",
    cost: 15000000,
    effect: 2.5,
    effectType: "lift_mult",
    icon: "🏆",
    purchased: false,
    unlockAt: 5000000,
  },
  {
    id: "ot8",
    name: "Elite Gym Access",
    description: "30% cheaper upgrades",
    cost: 75000000,
    effect: 0.7,
    effectType: "cost_reduction",
    icon: "⭐",
    purchased: false,
    unlockAt: 25000000,
  },
  {
    id: "ot9",
    name: "Supplement Empire",
    description: "+25% prestige gains",
    cost: 500000000,
    effect: 1.25,
    effectType: "prestige_bonus",
    icon: "💊",
    purchased: false,
    unlockAt: 100000000,
  },
  {
    id: "ot10",
    name: "Legendary Genetics",
    description: "x5 all calorie gains",
    cost: 5000000000,
    effect: 5,
    effectType: "all_mult",
    icon: "🧬",
    purchased: false,
    unlockAt: 1000000000,
  },
];

export const PRESTIGE_UPGRADES: PrestigeUpgrade[] = [
  {
    id: "p1",
    name: "Muscle Memory",
    description: "+20% lift power per level",
    baseCost: 1,
    costMultiplier: 1.5,
    effect: 1.2,
    effectType: "lift_mult",
    icon: "🧠",
    level: 0,
    maxLevel: 100,
  },
  {
    id: "p2",
    name: "Fast Metabolism",
    description: "+20% passive income per level",
    baseCost: 1,
    costMultiplier: 1.5,
    effect: 1.2,
    effectType: "passive_mult",
    icon: "🔥",
    level: 0,
    maxLevel: 100,
  },
  {
    id: "p3",
    name: "Bulk Discount",
    description: "-5% upgrade costs per level",
    baseCost: 2,
    costMultiplier: 1.8,
    effect: 0.95,
    effectType: "cost_reduction",
    icon: "💰",
    level: 0,
    maxLevel: 50,
  },
  {
    id: "p4",
    name: "Power Surge",
    description: "+50% lift power per level",
    baseCost: 5,
    costMultiplier: 2,
    effect: 1.5,
    effectType: "lift_mult",
    icon: "💥",
    level: 0,
    maxLevel: 50,
  },
  {
    id: "p5",
    name: "Macro Master",
    description: "+50% passive income per level",
    baseCost: 5,
    costMultiplier: 2,
    effect: 1.5,
    effectType: "passive_mult",
    icon: "📊",
    level: 0,
    maxLevel: 50,
  },
  {
    id: "p6",
    name: "Gym Rat Fame",
    description: "+10% protein points per level",
    baseCost: 10,
    costMultiplier: 2.5,
    effect: 1.1,
    effectType: "prestige_mult",
    icon: "🐀",
    level: 0,
    maxLevel: 100,
  },
  {
    id: "p7",
    name: "Wholesale Gains",
    description: "-10% costs per level",
    baseCost: 15,
    costMultiplier: 2.2,
    effect: 0.9,
    effectType: "cost_reduction",
    icon: "📦",
    level: 0,
    maxLevel: 30,
  },
  {
    id: "p8",
    name: "Strongman Secrets",
    description: "+100% lift power per level",
    baseCost: 25,
    costMultiplier: 2.5,
    effect: 2,
    effectType: "lift_mult",
    icon: "🦍",
    level: 0,
    maxLevel: 25,
  },
  {
    id: "p9",
    name: "Infinite Appetite",
    description: "+100% passive per level",
    baseCost: 25,
    costMultiplier: 2.5,
    effect: 2,
    effectType: "passive_mult",
    icon: "🍽️",
    level: 0,
    maxLevel: 25,
  },
  {
    id: "p10",
    name: "Champion Mindset",
    description: "+25% protein points per level",
    baseCost: 50,
    costMultiplier: 3,
    effect: 1.25,
    effectType: "prestige_mult",
    icon: "👑",
    level: 0,
    maxLevel: 20,
  },
  {
    id: "p11",
    name: "Total Body Gains",
    description: "+30% all income per level",
    baseCost: 100,
    costMultiplier: 3,
    effect: 1.3,
    effectType: "all_mult",
    icon: "💎",
    level: 0,
    maxLevel: 20,
  },
  {
    id: "p12",
    name: "Legendary Lifter",
    description: "x3 lift power per level",
    baseCost: 200,
    costMultiplier: 4,
    effect: 3,
    effectType: "lift_mult",
    icon: "🏆",
    level: 0,
    maxLevel: 10,
  },
  {
    id: "p13",
    name: "Nutrition Mastery",
    description: "x3 passive per level",
    baseCost: 200,
    costMultiplier: 4,
    effect: 3,
    effectType: "passive_mult",
    icon: "🌟",
    level: 0,
    maxLevel: 10,
  },
  {
    id: "p14",
    name: "Prestige Master",
    description: "+50% PP per level",
    baseCost: 500,
    costMultiplier: 5,
    effect: 1.5,
    effectType: "prestige_mult",
    icon: "✨",
    level: 0,
    maxLevel: 10,
  },
];

export const ASCENSION_UPGRADES: AscensionUpgrade[] = [
  {
    id: "a1",
    name: "Eternal Strength",
    description: "x2 lift power per level",
    baseCost: 1,
    costMultiplier: 2,
    effect: 2,
    effectType: "lift_mult",
    icon: "💪",
    level: 0,
    maxLevel: 50,
  },
  {
    id: "a2",
    name: "Perpetual Growth",
    description: "x2 passive income per level",
    baseCost: 1,
    costMultiplier: 2,
    effect: 2,
    effectType: "passive_mult",
    icon: "📈",
    level: 0,
    maxLevel: 50,
  },
  {
    id: "a3",
    name: "Titan Economy",
    description: "-20% costs per level",
    baseCost: 2,
    costMultiplier: 2.5,
    effect: 0.8,
    effectType: "cost_reduction",
    icon: "💎",
    level: 0,
    maxLevel: 20,
  },
  {
    id: "a4",
    name: "Protein Synthesis",
    description: "x2 PP gains per level",
    baseCost: 3,
    costMultiplier: 3,
    effect: 2,
    effectType: "pp_mult",
    icon: "🧬",
    level: 0,
    maxLevel: 25,
  },
  {
    id: "a5",
    name: "Transcendent Power",
    description: "x5 all income per level",
    baseCost: 5,
    costMultiplier: 4,
    effect: 5,
    effectType: "all_mult",
    icon: "⚡",
    level: 0,
    maxLevel: 15,
  },
  {
    id: "a6",
    name: "Ascension Mastery",
    description: "+50% Titan Tokens per level",
    baseCost: 10,
    costMultiplier: 5,
    effect: 1.5,
    effectType: "ascension_mult",
    icon: "🌌",
    level: 0,
    maxLevel: 10,
  },
  {
    id: "a7",
    name: "Infinite Potential",
    description: "x10 lift power per level",
    baseCost: 25,
    costMultiplier: 5,
    effect: 10,
    effectType: "lift_mult",
    icon: "♾️",
    level: 0,
    maxLevel: 10,
  },
  {
    id: "a8",
    name: "Cosmic Metabolism",
    description: "x10 passive per level",
    baseCost: 25,
    costMultiplier: 5,
    effect: 10,
    effectType: "passive_mult",
    icon: "🌠",
    level: 0,
    maxLevel: 10,
  },
];

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: AchievementStats) => boolean;
  reward: {
    type:
      | "lift_mult"
      | "passive_mult"
      | "all_mult"
      | "crit_chance"
      | "crit_mult"
      | "pp_mult";
    value: number;
  };
  unlocked: boolean;
}

export interface AchievementStats {
  totalCalories: number;
  totalLifts: number;
  prestigeCount: number;
  ascensionCount: number;
  playTime: number;
  maxCombo: number;
  criticalHits: number;
  totalUpgradesPurchased: number;
  divinityPoints: number;
  titanTokens: number;
  achievementsUnlocked: number;
  gymLocationsUnlocked: number;
  totalGymBrosHired: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach1",
    name: "First Rep",
    description: "Do your first lift",
    icon: "🎯",
    requirement: (s) => s.totalLifts >= 1,
    reward: { type: "lift_mult", value: 1.05 },
    unlocked: false,
  },
  {
    id: "ach2",
    name: "Warm Up",
    description: "Burn 1,000 total calories",
    icon: "🔥",
    requirement: (s) => s.totalCalories >= 1000,
    reward: { type: "passive_mult", value: 1.05 },
    unlocked: false,
  },
  {
    id: "ach3",
    name: "Getting Serious",
    description: "Burn 1 million total calories",
    icon: "💪",
    requirement: (s) => s.totalCalories >= 1e6,
    reward: { type: "all_mult", value: 1.1 },
    unlocked: false,
  },
  {
    id: "ach4",
    name: "Click Machine",
    description: "Do 10,000 lifts",
    icon: "🤖",
    requirement: (s) => s.totalLifts >= 10000,
    reward: { type: "lift_mult", value: 1.15 },
    unlocked: false,
  },
  {
    id: "ach5",
    name: "First Prestige",
    description: "Prestige for the first time",
    icon: "⭐",
    requirement: (s) => s.prestigeCount >= 1,
    reward: { type: "pp_mult", value: 1.1 },
    unlocked: false,
  },
  {
    id: "ach6",
    name: "Combo Master",
    description: "Reach a 50x combo",
    icon: "🔥",
    requirement: (s) => s.maxCombo >= 50,
    reward: { type: "crit_chance", value: 0.05 },
    unlocked: false,
  },
  {
    id: "ach7",
    name: "Critical Hitter",
    description: "Land 100 critical hits",
    icon: "💥",
    requirement: (s) => s.criticalHits >= 100,
    reward: { type: "crit_mult", value: 0.25 },
    unlocked: false,
  },
  {
    id: "ach8",
    name: "Billionaire Gains",
    description: "Burn 1 billion total calories",
    icon: "💎",
    requirement: (s) => s.totalCalories >= 1e9,
    reward: { type: "all_mult", value: 1.25 },
    unlocked: false,
  },
  {
    id: "ach9",
    name: "Ascended One",
    description: "Ascend for the first time",
    icon: "🚀",
    requirement: (s) => s.ascensionCount >= 1,
    reward: { type: "all_mult", value: 1.5 },
    unlocked: false,
  },
  {
    id: "ach10",
    name: "Marathon Lifter",
    description: "Play for 1 hour total",
    icon: "⏱️",
    requirement: (s) => s.playTime >= 3600,
    reward: { type: "passive_mult", value: 1.2 },
    unlocked: false,
  },
  {
    id: "ach11",
    name: "Trillionaire",
    description: "Burn 1 trillion total calories",
    icon: "👑",
    requirement: (s) => s.totalCalories >= 1e12,
    reward: { type: "all_mult", value: 2 },
    unlocked: false,
  },
  {
    id: "ach12",
    name: "Upgrade Addict",
    description: "Purchase 1000 total upgrade levels",
    icon: "🛒",
    requirement: (s) => s.totalUpgradesPurchased >= 1000,
    reward: { type: "all_mult", value: 1.5 },
    unlocked: false,
  },
  {
    id: "ach13",
    name: "Gym Tycoon",
    description: "Unlock 5 Gym Locations",
    icon: "🏢",
    requirement: (s) => s.gymLocationsUnlocked >= 5,
    reward: { type: "passive_mult", value: 1.3 },
    unlocked: false,
  },
  {
    id: "ach14",
    name: "Bro Army",
    description: "Hire 3 Gym Bros",
    icon: "👥",
    requirement: (s) => s.totalGymBrosHired >= 3,
    reward: { type: "passive_mult", value: 1.2 },
    unlocked: false,
  },
  {
    id: "ach15",
    name: "Olympian",
    description: "Earn 1,000 Mr. Olympia Tokens (Divinity Points)",
    icon: "🔱",
    requirement: (s) => s.divinityPoints >= 1000,
    reward: { type: "all_mult", value: 5.0 },
    unlocked: false,
  },
  {
    id: "ach16",
    name: "Strongest Man Alive",
    description: "Unlock all other achievements",
    icon: "🏆",
    requirement: (s) => s.achievementsUnlocked >= 15, // 15 other achievements
    reward: { type: "all_mult", value: 10.0 },
    unlocked: false,
  },
];

export interface Equipment {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  unlockAt: number;
  purchased: boolean;
  bonuses: {
    type:
      | "lift_mult"
      | "passive_mult"
      | "crit_chance"
      | "crit_mult"
      | "combo_mult";
    value: number;
  }[];
}

export const EQUIPMENT: Equipment[] = [
  {
    id: "eq1",
    name: "Basic Dumbbells",
    description: "+10% lift power",
    cost: 5000,
    icon: "🏋️",
    unlockAt: 500,
    purchased: false,
    bonuses: [{ type: "lift_mult", value: 1.1 }],
  },
  {
    id: "eq2",
    name: "Workout Gloves",
    description: "+5% crit chance",
    cost: 25000,
    icon: "🧤",
    unlockAt: 2000,
    purchased: false,
    bonuses: [{ type: "crit_chance", value: 0.05 }],
  },
  {
    id: "eq3",
    name: "Adjustable Bench",
    description: "+15% passive income",
    cost: 100000,
    icon: "🛋️",
    unlockAt: 10000,
    purchased: false,
    bonuses: [{ type: "passive_mult", value: 1.15 }],
  },
  {
    id: "eq4",
    name: "Olympic Barbell",
    description: "+25% lift power, +0.5x crit mult",
    cost: 500000,
    icon: "🔩",
    unlockAt: 50000,
    purchased: false,
    bonuses: [
      { type: "lift_mult", value: 1.25 },
      { type: "crit_mult", value: 0.5 },
    ],
  },
  {
    id: "eq5",
    name: "Power Rack",
    description: "+20% all income",
    cost: 2500000,
    icon: "🏗️",
    unlockAt: 200000,
    purchased: false,
    bonuses: [
      { type: "lift_mult", value: 1.2 },
      { type: "passive_mult", value: 1.2 },
    ],
  },
  {
    id: "eq6",
    name: "Cable Machine",
    description: "+10% crit chance, +20% combo mult",
    cost: 10000000,
    icon: "🔌",
    unlockAt: 1000000,
    purchased: false,
    bonuses: [
      { type: "crit_chance", value: 0.1 },
      { type: "combo_mult", value: 1.2 },
    ],
  },
  {
    id: "eq7",
    name: "Leg Press Machine",
    description: "+50% passive income",
    cost: 50000000,
    icon: "🦵",
    unlockAt: 5000000,
    purchased: false,
    bonuses: [{ type: "passive_mult", value: 1.5 }],
  },
  {
    id: "eq8",
    name: "Competition Plates",
    description: "+1x crit multiplier",
    cost: 250000000,
    icon: "🥇",
    unlockAt: 25000000,
    purchased: false,
    bonuses: [{ type: "crit_mult", value: 1 }],
  },
];

export interface GymLocation {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  unlockAt: number;
  unlocked: boolean;
  bonuses: {
    lift_mult: number;
    passive_mult: number;
    pp_mult: number;
  };
}

export const GYM_LOCATIONS: GymLocation[] = [
  {
    id: "loc1",
    name: "Home Gym",
    description: "Your basement setup",
    icon: "🏠",
    cost: 0,
    unlockAt: 0,
    unlocked: true,
    bonuses: { lift_mult: 1, passive_mult: 1, pp_mult: 1 },
  },
  {
    id: "loc2",
    name: "Local Gym",
    description: "Planet Fitness vibes",
    icon: "🏢",
    cost: 250000,
    unlockAt: 25000,
    unlocked: false,
    bonuses: { lift_mult: 1.15, passive_mult: 1.15, pp_mult: 1.05 },
  },
  {
    id: "loc3",
    name: "Elite Fitness",
    description: "Premium equipment",
    icon: "⭐",
    cost: 25000000,
    unlockAt: 1000000,
    unlocked: false,
    bonuses: { lift_mult: 1.3, passive_mult: 1.3, pp_mult: 1.1 },
  },
  {
    id: "loc4",
    name: "Pro Athletes Gym",
    description: "Train with the pros",
    icon: "🏆",
    cost: 2500000000,
    unlockAt: 100000000,
    unlocked: false,
    bonuses: { lift_mult: 1.5, passive_mult: 1.5, pp_mult: 1.2 },
  },
  {
    id: "loc5",
    name: "Olympus Gym",
    description: "Where legends train",
    icon: "⚡",
    cost: 500000000000,
    unlockAt: 10000000000,
    unlocked: false,
    bonuses: { lift_mult: 2, passive_mult: 2, pp_mult: 1.5 },
  },
];

export interface Consumable {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  duration: number; // seconds
  cooldown: number; // seconds
  effect: {
    type:
      | "lift_mult"
      | "passive_mult"
      | "all_mult"
      | "crit_chance"
      | "instant_calories";
    value: number;
  };
  unlockAt: number;
  oneTime?: boolean;
}

export const CONSUMABLES: Consumable[] = [
  {
    id: "con1",
    name: "Energy Drink",
    description: "x2 lift power for 30s",
    icon: "🥤",
    cost: 5000,
    duration: 30,
    cooldown: 120,
    effect: { type: "lift_mult", value: 2 },
    unlockAt: 100,
  },
  {
    id: "con2",
    name: "Protein Bar",
    description: "Instant 5K calories",
    icon: "🍫",
    cost: 750,
    duration: 0,
    cooldown: 60,
    effect: { type: "instant_calories", value: 5000 },
    unlockAt: 500,
    oneTime: true,
  },
  {
    id: "con3",
    name: "Pre-Workout Shot",
    description: "+20% crit chance for 45s",
    icon: "💉",
    cost: 100000,
    duration: 45,
    cooldown: 180,
    effect: { type: "crit_chance", value: 0.2 },
    unlockAt: 5000,
  },
  {
    id: "con4",
    name: "Mass Gainer",
    description: "x3 passive income for 60s",
    icon: "🧃",
    cost: 500000,
    duration: 60,
    cooldown: 240,
    effect: { type: "passive_mult", value: 3 },
    unlockAt: 25000,
  },
  {
    id: "con5",
    name: "Creatine Surge",
    description: "x5 all income for 30s",
    icon: "⚡",
    cost: 5000000,
    duration: 30,
    cooldown: 300,
    effect: { type: "all_mult", value: 5 },
    unlockAt: 100000,
  },
  {
    id: "con6",
    name: "Divine Nectar",
    description: "Instant 1B calories",
    icon: "🍯",
    cost: 100000000,
    duration: 0,
    cooldown: 600,
    effect: { type: "instant_calories", value: 1000000000 },
    unlockAt: 50000000,
    oneTime: true,
  },
];

export interface Synergy {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: { upgradeId: string; minLevel: number }[];
  bonus: {
    type: "lift_mult" | "passive_mult" | "all_mult" | "crit_mult";
    value: number;
  };
}

export const SYNERGIES: Synergy[] = [
  {
    id: "syn1",
    name: "Protein Power",
    description: "Protein Shake + Chicken & Rice both at 25+",
    icon: "🥛",
    requirements: [
      { upgradeId: "food1", minLevel: 25 },
      { upgradeId: "food2", minLevel: 25 },
    ],
    bonus: { type: "passive_mult", value: 1.5 },
  },
  {
    id: "syn2",
    name: "Iron Will",
    description: "Dumbbells + Barbell both at 25+",
    icon: "🔩",
    requirements: [
      { upgradeId: "lift2", minLevel: 25 },
      { upgradeId: "lift3", minLevel: 25 },
    ],
    bonus: { type: "lift_mult", value: 1.5 },
  },
  {
    id: "syn3",
    name: "Perfect Form",
    description: "Better Form at 100+",
    icon: "🎯",
    requirements: [{ upgradeId: "lift1", minLevel: 100 }],
    bonus: { type: "crit_mult", value: 0.5 },
  },
  {
    id: "syn4",
    name: "Feast Mode",
    description: "Meal Prep + Personal Chef both at 50+",
    icon: "🍽️",
    requirements: [
      { upgradeId: "food3", minLevel: 50 },
      { upgradeId: "food4", minLevel: 50 },
    ],
    bonus: { type: "passive_mult", value: 2 },
  },
  {
    id: "syn5",
    name: "Olympic Champion",
    description: "Olympic Lifts at 75+",
    icon: "🏅",
    requirements: [{ upgradeId: "lift4", minLevel: 75 }],
    bonus: { type: "lift_mult", value: 1.75 },
  },
  {
    id: "syn6",
    name: "Cosmic Harmony",
    description: "Cosmic Strength + Celestial Nutrients both at 25+",
    icon: "✨",
    requirements: [
      { upgradeId: "lift7", minLevel: 25 },
      { upgradeId: "food7", minLevel: 25 },
    ],
    bonus: { type: "all_mult", value: 3 },
  },
  {
    id: "syn7",
    name: "Universal Balance",
    description: "Universal Power + Infinite Sustenance both at 50+",
    icon: "☯️",
    requirements: [
      { upgradeId: "lift8", minLevel: 50 },
      { upgradeId: "food8", minLevel: 50 },
    ],
    bonus: { type: "all_mult", value: 5 },
  },
];

export interface TranscendenceUpgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  effectType:
    | "lift_mult"
    | "passive_mult"
    | "all_mult"
    | "pp_mult"
    | "tt_mult"
    | "crit_chance"
    | "crit_mult"
    | "transcendence_mult";
  icon: string;
  level: number;
  maxLevel: number;
}

export const TRANSCENDENCE_UPGRADES: TranscendenceUpgrade[] = [
  {
    id: "tr1",
    name: "Eternal Muscle",
    description: "x3 lift power per level",
    baseCost: 1,
    costMultiplier: 2,
    effect: 3,
    effectType: "lift_mult",
    icon: "💪",
    level: 0,
    maxLevel: 100,
  },
  {
    id: "tr2",
    name: "Immortal Metabolism",
    description: "x3 passive income per level",
    baseCost: 1,
    costMultiplier: 2,
    effect: 3,
    effectType: "passive_mult",
    icon: "🔥",
    level: 0,
    maxLevel: 100,
  },
  {
    id: "tr3",
    name: "Divine Critical",
    description: "+2% crit chance per level",
    baseCost: 2,
    costMultiplier: 2.5,
    effect: 0.02,
    effectType: "crit_chance",
    icon: "⚡",
    level: 0,
    maxLevel: 25,
  },
  {
    id: "tr4",
    name: "Devastating Blow",
    description: "+1x crit multiplier per level",
    baseCost: 3,
    costMultiplier: 2.5,
    effect: 1,
    effectType: "crit_mult",
    icon: "💥",
    level: 0,
    maxLevel: 50,
  },
  {
    id: "tr5",
    name: "Protein Overflow",
    description: "x2 PP gains per level",
    baseCost: 5,
    costMultiplier: 3,
    effect: 2,
    effectType: "pp_mult",
    icon: "🧬",
    level: 0,
    maxLevel: 30,
  },
  {
    id: "tr6",
    name: "Titan Forge",
    description: "x2 TT gains per level",
    baseCost: 10,
    costMultiplier: 3.5,
    effect: 2,
    effectType: "tt_mult",
    icon: "⚔️",
    level: 0,
    maxLevel: 20,
  },
  {
    id: "tr7",
    name: "Omnipotent Gains",
    description: "x5 all income per level",
    baseCost: 25,
    costMultiplier: 4,
    effect: 5,
    effectType: "all_mult",
    icon: "🌟",
    level: 0,
    maxLevel: 15,
  },
  {
    id: "tr8",
    name: "Transcendent Echo",
    description: "+50% Divinity per level",
    baseCost: 50,
    costMultiplier: 5,
    effect: 1.5,
    effectType: "transcendence_mult",
    icon: "✨",
    level: 0,
    maxLevel: 10,
  },
];

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: "burn_calories" | "do_lifts" | "reach_combo" | "get_crits";
    value: number;
    timeLimit: number; // seconds
  };
  reward: {
    type: "pp" | "tt" | "calories";
    value: number;
  };
  completed: boolean;
  progress: number;
  startTime: number | null;
}

export function generateDailyChallenge(totalCalories: number): DailyChallenge {
  const types = [
    "burn_calories",
    "do_lifts",
    "reach_combo",
    "get_crits",
  ] as const;
  const type = types[Math.floor(Math.random() * types.length)];

  const baseValue = Math.max(1000, totalCalories * 0.1);

  const challenges: Record<
    typeof type,
    { value: number; time: number; reward: number }
  > = {
    burn_calories: {
      value: baseValue,
      time: 300,
      reward: Math.floor(Math.sqrt(baseValue) * 0.1),
    },
    do_lifts: {
      value: Math.floor(baseValue / 100),
      time: 180,
      reward: Math.floor(Math.sqrt(baseValue) * 0.05),
    },
    reach_combo: {
      value: Math.min(100, 20 + Math.floor(totalCalories / 1e6)),
      time: 60,
      reward: 5,
    },
    get_crits: {
      value: Math.min(50, 5 + Math.floor(totalCalories / 1e7)),
      time: 120,
      reward: 10,
    },
  };

  const config = challenges[type];

  return {
    id: `daily_${Date.now()}`,
    name:
      type === "burn_calories"
        ? "Calorie Crusher"
        : type === "do_lifts"
          ? "Lift Marathon"
          : type === "reach_combo"
            ? "Combo King"
            : "Critical Strike",
    description:
      type === "burn_calories"
        ? `Burn ${formatNumberShort(config.value)} calories`
        : type === "do_lifts"
          ? `Complete ${config.value} lifts`
          : type === "reach_combo"
            ? `Reach a ${config.value}x combo`
            : `Land ${config.value} critical hits`,
    icon:
      type === "burn_calories"
        ? "🔥"
        : type === "do_lifts"
          ? "💪"
          : type === "reach_combo"
            ? "⚡"
            : "💥",
    requirement: {
      type,
      value: config.value,
      timeLimit: config.time,
    },
    reward: {
      type: totalCalories > 1e9 ? "tt" : "pp",
      value: config.reward,
    },
    completed: false,
    progress: 0,
    startTime: null,
  };
}

function formatNumberShort(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

export const ASCENSION_PP_THRESHOLD = 1000;
export const TRANSCENDENCE_TT_THRESHOLD = 1000;

export type BuyMultiplier = 1 | 10 | 25 | 50 | 100 | "next" | "max";

export function getNextMilestoneForBuy(level: number): number {
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (level < threshold) return threshold;
  }
  return Math.ceil((level + 1) / 50) * 50;
}

export function calculateBulkPurchase(
  upgrade: Upgrade,
  currentCalories: number,
  buyMultiplier: BuyMultiplier,
  costReduction: number,
): { count: number; totalCost: number } {
  const getCost = (level: number) =>
    Math.floor(
      upgrade.baseCost *
        Math.pow(upgrade.costMultiplier, level) *
        costReduction,
    );

  let targetCount: number;

  if (buyMultiplier === "next") {
    const nextMilestone = getNextMilestoneForBuy(upgrade.level);
    targetCount = Math.max(1, nextMilestone - upgrade.level);
  } else if (buyMultiplier === "max") {
    targetCount = 1000;
  } else {
    targetCount = buyMultiplier;
  }

  const maxPossible =
    upgrade.maxLevel === Number.POSITIVE_INFINITY
      ? targetCount
      : Math.max(0, upgrade.maxLevel - upgrade.level);

  if (maxPossible === 0) {
    return { count: 0, totalCost: 0 };
  }

  targetCount = Math.min(targetCount, maxPossible);

  let totalCost = 0;
  let count = 0;

  for (let i = 0; i < targetCount; i++) {
    const costAtLevel = getCost(upgrade.level + i);
    if (buyMultiplier === "max" && totalCost + costAtLevel > currentCalories) {
      break;
    }
    totalCost += costAtLevel;
    count++;
  }

  if (buyMultiplier === "max" && count === 0) {
    return { count: 0, totalCost: getCost(upgrade.level) };
  }

  return { count, totalCost };
}

export function getPrestigeUpgradeCost(upgrade: PrestigeUpgrade): number {
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level),
  );
}

export function getAscensionUpgradeCost(upgrade: AscensionUpgrade): number {
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level),
  );
}

export function getTranscendenceUpgradeCost(
  upgrade: TranscendenceUpgrade,
): number {
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level),
  );
}

export interface GymBro {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  effectType:
    | "auto_lift"
    | "crit_chance"
    | "passive_mult"
    | "speed_boost"
    | "all_mult";
  icon: string;
  level: number;
  unlockAt: number; // calorie threshold to see them
  quote: string;
}

export const GYM_BROS: GymBro[] = [
  {
    id: "spotter_steve",
    name: "Spotter Steve",
    description:
      "He won't let the weight crush you. Lifts for you occasionally.",
    baseCost: 1000,
    costMultiplier: 1.5,
    effect: 1, // Lifts per 5 seconds
    effectType: "auto_lift",
    icon: "🤝",
    level: 0,
    unlockAt: 500,
    quote: "It's all you bro!",
  },
  {
    id: "screamer_sam",
    name: "Screamer Sam",
    description:
      "His primal screams scare the weights into moving. Boosts Crits.",
    baseCost: 5000,
    costMultiplier: 1.8,
    effect: 0.02, // +2% Crit Chance
    effectType: "crit_chance",
    icon: "🗣️",
    level: 0,
    unlockAt: 2000,
    quote: "LIGHT WEIGHT BABY!",
  },
  {
    id: "protein_pete",
    name: "Protein Pete",
    description: "Always has a shake ready. Increases all Passive Income.",
    baseCost: 15000,
    costMultiplier: 1.6,
    effect: 1.1, // 10% boost
    effectType: "passive_mult",
    icon: "🥤",
    level: 0,
    unlockAt: 10000,
    quote: "Gotta hit those macros.",
  },
];

export function getActiveSynergies(upgrades: Upgrade[]): Synergy[] {
  return SYNERGIES.filter((synergy) =>
    synergy.requirements.every((req) => {
      const upgrade = upgrades.find((u) => u.id === req.upgradeId);
      return upgrade && upgrade.level >= req.minLevel;
    }),
  );
}

export interface BroCost {
  amount: number;
  currency: "calories" | "protein" | "titan" | "divinity";
}

export function getBroCost(bro: GymBro): BroCost {
  const level = bro.level;
  let currency: BroCost["currency"] = "calories";
  let initialBase = bro.baseCost;

  // Determine currency based on level tiers
  if (level >= 50) {
    currency = "divinity";
    // Scaling: 1 Billion Cal ~ 1 Divinity (Rough approximation for game balance)
    initialBase = Math.max(1, Math.floor(bro.baseCost / 1000000000));
  } else if (level >= 25) {
    currency = "titan";
    // Scaling: 1 Million Cal ~ 1 Titan Token
    initialBase = Math.max(1, Math.floor(bro.baseCost / 1000000));
  } else if (level >= 10) {
    currency = "protein";
    // Scaling: 1000 Cal ~ 1 Protein Point
    initialBase = Math.max(1, Math.floor(bro.baseCost / 1000));
  }

  // Calculate tier-relative level for exponent
  // This prevents costs from being astronomical immediately upon switching currency
  let tierLevel = level;
  if (level >= 50) tierLevel = level - 50;
  else if (level >= 25) tierLevel = level - 25;
  else if (level >= 10) tierLevel = level - 10;

  const amount = Math.floor(
    initialBase * Math.pow(bro.costMultiplier, tierLevel),
  );

  return { amount, currency };
}
