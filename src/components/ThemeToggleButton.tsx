import { useTheme } from "@/hooks/useTheme";
import sunIcon from "@/assets/icons/sun.svg";
import moonIcon from "@/assets/icons/moon.svg";
import { ActionButton } from "@/components/ui/ActionButton";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

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
