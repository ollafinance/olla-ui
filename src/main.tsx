import "@rainbow-me/rainbowkit/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "@/providers/theme-provider";
import { RainbowKitProvider } from "@/providers/rainbowkit-provider";

import "./index.css";

// Import Routes
import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { WagmiProvider } from "./providers/wagmi-provider";

// Create Router
const routeTree = rootRoute.addChildren([indexRoute]);
const router = createRouter({ routeTree });

// Register Router for Type Safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <WagmiProvider>
          <RainbowKitProvider>
            <RouterProvider router={router} />
          </RainbowKitProvider>
        </WagmiProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
