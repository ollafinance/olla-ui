import { http } from "wagmi";
import { foundry } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  trustWallet,
  ledgerWallet,
  safeWallet,
} from "@rainbow-me/rainbowkit/wallets";

export const config = getDefaultConfig({
  appName: "Olla Finance",
  appDescription: "Liquid Staking Protocole",
  appUrl: "https://olla.finance",
  appIcon: "https://olla.finance/logo.png",
  projectId: import.meta.env.WALLET_CONNECT_PROJECT_ID,
  chains: [foundry],
  transports: {
    [foundry.id]: http(import.meta.env.VITE_RPC_URL),
  },
  wallets: [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, walletConnectWallet],
    },
    {
      groupName: "More",
      wallets: [trustWallet, ledgerWallet, safeWallet],
    },
  ],
});
