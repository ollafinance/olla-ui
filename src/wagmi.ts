import { http, createConfig } from 'wagmi';
import { foundry } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [foundry],
    transports: {
      // RPC URL for each chain
      [foundry.id]: http(import.meta.env.VITE_RPC_URL),
    },

    // Required API Keys
    walletConnectProjectId: "YOUR_PROJECT_ID", // Replace with valid ID if needed, optional for local

    // Required App Info
    appName: "LSP React Standard",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);
