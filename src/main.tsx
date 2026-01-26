import "@rainbow-me/rainbowkit/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { config } from "./config/rainbowkit";
import "./index.css";

// Import Routes
import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";

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
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RouterProvider router={router} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
