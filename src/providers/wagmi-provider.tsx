import { WALLET_CONNECT_PROJECT_ID, RPC_URL } from "@/config/environment";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  ledgerWallet,
  metaMaskWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { foundry } from "viem/chains";
import { http, WagmiProvider as WagmiProviderLib } from "wagmi";

const config = getDefaultConfig({
  appName: "Olla Finance",
  appDescription: "Liquid Staking Protocole",
  appUrl: "https://olla.finance",
  appIcon: "https://olla.finance/logo.png",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [foundry],
  transports: {
    [foundry.id]: http(RPC_URL),
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

export function WagmiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WagmiProviderLib config={config}>{children}</WagmiProviderLib>;
}
