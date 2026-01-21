import { http, createConfig } from "wagmi";
import { foundry } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [foundry],
    transports: {
      // RPC URL for each chain
      [foundry.id]: http(import.meta.env.VITE_RPC_URL),
    },

    // Required API Keys
    walletConnectProjectId: import.meta.env.WALLET_CONNECT_PROJECT_ID,

    // Required App Info
    appName: "Olla Finance",

    // Optional App Info
    appDescription: "Liquid Staking Protocole",
    appUrl: "https://olla.finance",
    appIcon: "https://olla.finance/logo.png",
  }),
);
