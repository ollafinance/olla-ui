import {
  RainbowKitProvider as RainbowKitProviderLib,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { merge } from "lodash";
import { useTheme } from "@/hooks/useTheme";

const ollaColors = {
  accentColor: "#FFB0F1",
  accentColorForeground: "#1F1F1F",
  borderRadius: "medium",
};

const ollaLightTheme = merge(lightTheme(), {
  colors: {
    accentColor: ollaColors.accentColor,
    accentColorForeground: ollaColors.accentColorForeground,
    connectButtonBackground: "#FFB0F1",
    connectButtonText: "#1F1F1F",
    connectButtonInnerBackground: "#FFB0F1",
    modalBackground: "#F8F7F1",
    modalText: "#1F1F1F",
    modalTextDim: "#6C6C6C",
    modalTextSecondary: "#6C6C6C",
    generalBorder: "#313131",
  },
  radii: {
    actionButton: "100px",
    connectButton: "100px",
    modal: "30px",
    modalMobile: "30px",
  },
  fonts: {
    body: "Season Sans, sans-serif",
  },
});

const ollaDarkTheme = merge(darkTheme(), {
  colors: {
    accentColor: ollaColors.accentColor,
    accentColorForeground: ollaColors.accentColorForeground,
    connectButtonBackground: "#FFB0F1",
    connectButtonText: "#1F1F1F",
    connectButtonInnerBackground: "#FFB0F1",
    modalBackground: "#111111",
    modalText: "#F8F7F1",
    modalTextDim: "#6C6C6C",
    modalTextSecondary: "#6C6C6C",
    generalBorder: "#313131",
  },
  radii: {
    actionButton: "100px",
    connectButton: "100px",
    modal: "30px",
    modalMobile: "30px",
  },
  fonts: {
    body: "Season Sans, sans-serif",
  },
});

export function RainbowKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

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
