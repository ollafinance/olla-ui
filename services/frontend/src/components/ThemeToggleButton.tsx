import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import sunIcon from "@/assets/icons/sun.svg";
import moonIcon from "@/assets/icons/moon.svg";
import { ActionButton } from "@/components/ui/ActionButton";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);

  return (
    <ActionButton
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      size="lg"
    >
      <img
        src={isDark ? sunIcon : moonIcon}
        alt={isDark ? "Sun" : "Moon"}
        className="h-5 w-5"
        width={20}
        height={20}
      />
    </ActionButton>
  );
}
