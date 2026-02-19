import { useTheme } from "@/hooks/useTheme";
import moonIcon from "@/assets/icons/moon.svg";
import sunIcon from "@/assets/icons/sun.svg";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="ring-offset-background focus-visible:ring-ring border-input inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      aria-label="Toggle theme"
    >
      <img
        src={theme === "dark" ? moonIcon : sunIcon}
        alt={theme === "dark" ? "Dark Mode" : "Light Mode"}
        className="h-[1.2rem] w-[1.2rem]"
        width="20"
        height="20"
      />
    </button>
  );
}
