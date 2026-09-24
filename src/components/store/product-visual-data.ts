import {
  Bot,
  Gamepad2,
  Globe,
  Code,
  Palette,
  Sparkles,
} from "lucide-react";

export interface CategoryArt {
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  accent: string;
  badge: string;
  chip: string;
}

export const categoryArtMap: Record<string, CategoryArt> = {
  "discord-bots": {
    icon: Bot,
    bg: "bg-gradient-to-br from-[#0f2b3a] via-[#0a1c28] to-[#070d16]",
    accent: "text-cyan-300",
    badge: "from-cyan-500 to-sky-500",
    chip: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  },
  fivem: {
    icon: Gamepad2,
    bg: "bg-gradient-to-br from-[#2b1640] via-[#1c0d2e] to-[#0e0620]",
    accent: "text-fuchsia-400",
    badge: "from-fuchsia-500 to-violet",
    chip: "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-300",
  },
  websites: {
    icon: Globe,
    bg: "bg-gradient-to-br from-[#1b2a4a] via-[#101c38] to-[#0a1024]",
    accent: "text-sky-300",
    badge: "from-sky-500 to-indigo-500",
    chip: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  },
  programming: {
    icon: Code,
    bg: "bg-gradient-to-br from-[#123324] via-[#0c2318] to-[#07130d]",
    accent: "text-emerald-300",
    badge: "from-emerald-500 to-teal-500",
    chip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
  design: {
    icon: Palette,
    bg: "bg-gradient-to-br from-[#3a1c3e] via-[#24122b] to-[#100a1c]",
    accent: "text-pink-300",
    badge: "from-pink-500 to-purple-500",
    chip: "border-pink-400/25 bg-pink-400/10 text-pink-300",
  },
  other: {
    icon: Sparkles,
    bg: "bg-gradient-to-br from-[#2a1650] via-[#1a0c38] to-[#0d0520]",
    accent: "text-purple-300",
    badge: "from-purple-500 to-violet",
    chip: "border-purple-300/25 bg-purple-300/10 text-purple-200",
  },
};

export function getCategoryArt(
  slug?: string | null
): CategoryArt {
  return (
    categoryArtMap[slug || ""] ||
    categoryArtMap["other"]
  );
}
