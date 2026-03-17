import ollaLogoBlack from "@/assets/logo/olla-logo-black.svg";
import ollaLogoWhite from "@/assets/logo/olla-logo-white.svg";
import { useTheme } from "@/hooks/useTheme";

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className="mt-auto w-full pt-8">
      <div className="border-border/50 mb-6 w-full border-t" />
      <div className="mx-auto flex w-full items-center justify-between px-4 pb-6">
        <div className="flex items-center gap-10">
          <img
            src={isDark ? ollaLogoWhite : ollaLogoBlack}
            alt="Olla"
            width="54"
            height="21"
            className="h-5 w-auto"
          />
          <a
            href="/terms"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Terms of Use
          </a>
          <a
            href="/privacy"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Privacy Notice
          </a>
        </div>
        <span className="text-muted-foreground text-sm font-medium">v0.1.0</span>
      </div>
    </footer>
  );
}
