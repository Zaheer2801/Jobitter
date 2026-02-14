import { useEffect } from "react";

// Map friendly color names to HSL hue values
const COLOR_HUES: Record<string, number> = {
  red: 0,
  orange: 25,
  yellow: 45,
  green: 152,
  teal: 175,
  blue: 215,
  indigo: 240,
  purple: 270,
  pink: 330,
};

export const AVAILABLE_COLORS = Object.keys(COLOR_HUES);

export function useColorTheme(colorName: string) {
  useEffect(() => {
    if (!colorName || !COLOR_HUES[colorName] && colorName !== "green") return;

    const hue = COLOR_HUES[colorName];
    if (hue === undefined) return;

    // Default green hue is 152 — skip if unchanged
    if (hue === 152) {
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--ring");
      return;
    }

    document.documentElement.style.setProperty("--primary", `${hue} 68% 42%`);
    document.documentElement.style.setProperty("--ring", `${hue} 68% 42%`);

    return () => {
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--ring");
    };
  }, [colorName]);
}
