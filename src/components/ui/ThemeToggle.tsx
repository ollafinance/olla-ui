import { useTheme } from "@/hooks/useTheme";
import moonIcon from "@/assets/icons/moon.svg";
import sunIcon from "@/assets/icons/sun.svg";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 h-9 w-9"
      aria-label="Toggle theme"
    >
      <img 
        src={theme === "dark" ? moonIcon : sunIcon} 
        alt={theme === "dark" ? "Dark Mode" : "Light Mode"}
        className="w-[1.2rem] h-[1.2rem]"
      />
    </button>
  );
}
