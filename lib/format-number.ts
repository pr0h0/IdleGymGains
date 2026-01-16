// Number formatting utilities for very large numbers up to Number.MAX_VALUE

const SUFFIXES = [
  "",
  "K",
  "M",
  "B",
  "T",
  "Qa",
  "Qi",
  "Sx",
  "Sp",
  "Oc",
  "No",
  "Dc",
  "UDc",
  "DDc",
  "TDc",
  "QaDc",
  "QiDc",
  "SxDc",
  "SpDc",
  "OcDc",
  "NoDc",
  "Vg",
  "UVg",
  "DVg",
  "TVg",
  "QaVg",
  "QiVg",
  "SxVg",
  "SpVg",
  "OcVg",
  "NoVg",
  "Tg",
  "UTg",
  "DTg",
  "TTg",
  "QaTg",
  "QiTg",
  "SxTg",
  "SpTg",
  "OcTg",
  "NoTg",
  "Qd",
  "UQd",
  "DQd",
  "TQd",
  "QaQd",
  "QiQd",
  "SxQd",
  "SpQd",
  "OcQd",
  "NoQd",
  "Qq",
  "UQq",
  "DQq",
  "TQq",
  "QaQq",
  "QiQq",
  "SxQq",
  "SpQq",
  "OcQq",
  "NoQq",
  "Sg",
  "USg",
  "DSg",
  "TSg",
  "QaSg",
  "QiSg",
  "SxSg",
  "SpSg",
  "OcSg",
  "NoSg",
  "St",
  "USt",
  "DSt",
  "TSt",
  "QaSt",
  "QiSt",
  "SxSt",
  "SpSt",
  "OcSt",
  "NoSt",
  "Og",
  "UOg",
  "DOg",
  "TOg",
  "QaOg",
  "QiOg",
  "SxOg",
  "SpOg",
  "OcOg",
  "NoOg",
  "Ng",
  "UNg",
  "DNg",
  "TNg",
  "QaNg",
  "QiNg",
  "SxNg",
  "SpNg",
  "OcNg",
  "NoNg",
  "Ce",
];

export type NumberNotation = "standard" | "scientific";

export function formatNumber(
  num: number,
  decimals = 2,
  notation: NumberNotation = "standard",
): string {
  if (!isFinite(num)) return "∞";
  if (num === 0) return "0";
  if (num < 0) return "-" + formatNumber(-num, decimals, notation);

  if (num < 1000) {
    return num % 1 === 0 ? num.toString() : num.toFixed(decimals);
  }

  if (notation === "scientific") {
    return num.toExponential(decimals).replace("+", "");
  }

  const exponent = Math.floor(Math.log10(num));
  const suffixIndex = Math.floor(exponent / 3);

  if (suffixIndex >= SUFFIXES.length) {
    // Scientific notation for extremely large numbers
    return num.toExponential(decimals);
  }

  const divisor = Math.pow(10, suffixIndex * 3);
  const value = num / divisor;

  return value.toFixed(decimals) + SUFFIXES[suffixIndex];
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
