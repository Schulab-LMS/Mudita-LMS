// Shared label/color maps for catalog surfaces (course cards, bundle cards,
// pathway cards). Single copy so the three card components never drift.

export const categoryGradients: Record<string, string> = {
  math: "from-amber-400 to-orange-500",
  coding: "from-emerald-400 to-green-600",
  science: "from-cyan-400 to-blue-500",
  robotics: "from-violet-400 to-purple-600",
  engineering: "from-orange-400 to-red-500",
  ai: "from-blue-400 to-indigo-600",
  electronics: "from-teal-400 to-cyan-600",
  biology: "from-lime-400 to-emerald-600",
  chemistry: "from-pink-400 to-rose-600",
  physics: "from-slate-400 to-indigo-500",
  mathematics: "from-amber-400 to-orange-500",
  technology: "from-blue-400 to-indigo-600",
  stem: "from-violet-400 to-purple-600",
  arts: "from-pink-400 to-rose-500",
  language: "from-teal-400 to-green-500",
  // real DB categories
  digital_literacy: "from-sky-400 to-cyan-600",
  data_science: "from-purple-500 to-violet-700",
  cybersecurity: "from-slate-600 to-gray-900",
  design: "from-fuchsia-400 to-pink-600",
  entrepreneurship: "from-yellow-400 to-amber-500",
  career: "from-blue-500 to-indigo-700",
  game_design: "from-rose-400 to-pink-600",
  animation: "from-orange-400 to-amber-500",
  web_development: "from-sky-500 to-blue-700",
  app_development: "from-indigo-400 to-violet-600",
};

export const ageGroupLabels: Record<string, string> = {
  AGES_3_5: "Ages 3-5",
  AGES_5_7: "Ages 5-7",
  AGES_8_10: "Ages 8-10",
  AGES_11_13: "Ages 11-13",
  AGES_14_16: "Ages 14-16",
  AGES_17_18: "Ages 17-18",
};

export const ageGroupColors: Record<string, string> = {
  AGES_3_5: "bg-pink-100 text-pink-700 border-pink-200",
  AGES_5_7: "bg-blue-100 text-blue-700 border-blue-200",
  AGES_8_10: "bg-emerald-100 text-emerald-700 border-emerald-200",
  AGES_11_13: "bg-amber-100 text-amber-700 border-amber-200",
  AGES_14_16: "bg-purple-100 text-purple-700 border-purple-200",
  AGES_17_18: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const levelColors: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700 border-green-200",
  INTERMEDIATE: "bg-amber-100 text-amber-700 border-amber-200",
  ADVANCED: "bg-red-100 text-red-700 border-red-200",
};
