import {
  RainbowKitProvider as RainbowKitProviderLib,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { merge } from "lodash";
import type { Theme } from "@rainbow-me/rainbowkit";
import { useTheme } from "@/hooks/useTheme";

// Define Olla Custom Theme Colors
const ollaColors = {
  accentColor: "#FFB0F1", // Primary Pink
  accentColorForeground: "#1F1F1F", // Dark Text
  borderRadius: "medium",
};

// Create Custom Themes
const ollaLightTheme: Theme = merge(lightTheme(), {
  colors: {
    accentColor: ollaColors.accentColor,
    accentColorForeground: ollaColors.accentColorForeground,
    connectButtonBackground: "#FFFFFF", // White background
    connectButtonText: "#1F1F1F", // Dark text
    connectButtonInnerBackground: "#F8F6EF", // Light background
  },
  radii: {
    actionButton: "8px",
    connectButton: "8px",
    modal: "16px",
    modalMobile: "16px",
  },
  fonts: {
    body: "Season Sans, sans-serif",
  },
} as Theme);

const ollaDarkTheme: Theme = merge(darkTheme(), {
  colors: {
    accentColor: ollaColors.accentColor,
    accentColorForeground: ollaColors.accentColorForeground,
    connectButtonBackground: "#18181b", // Zinc 900
    connectButtonText: "#F8F6EF", // Light text
    connectButtonInnerBackground: "#27272a", // Zinc 800
  },
  radii: {
    actionButton: "8px",
    connectButton: "8px",
    modal: "16px",
    modalMobile: "16px",
  },
  fonts: {
    body: "Season Sans, sans-serif",
  },
} as Theme);

export function RainbowKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  // Resolve "system" theme
  const activeTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? ollaDarkTheme
        : ollaLightTheme
      : theme === "dark"
        ? ollaDarkTheme
        : ollaLightTheme;

  return (
    <RainbowKitProviderLib theme={activeTheme}>{children}</RainbowKitProviderLib>
  );
}
