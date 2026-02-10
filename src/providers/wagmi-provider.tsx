import {
  APP_ENV,
  RPC_URL_FOUNDRY,
  RPC_URL_MAINNET,
  RPC_URL_SEPOLIA,
  WALLET_CONNECT_PROJECT_ID,
} from "@/constants/environment";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  ledgerWallet,
  metaMaskWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { foundry, mainnet, sepolia } from "viem/chains";
import { createConfig, http, WagmiProvider as WagmiProviderLib } from "wagmi";
import { injected } from "wagmi/connectors";

const isProduction = APP_ENV === "production";

// In production, only allow Mainnet.
// In dev/test, allow Foundry (local), Sepolia, and Mainnet.
const chains = isProduction
  ? ([mainnet] as const)
  : ([foundry, sepolia, mainnet] as const);

const transports = {
  [mainnet.id]: http(RPC_URL_MAINNET),
  [sepolia.id]: http(RPC_URL_SEPOLIA),
  [foundry.id]: http(RPC_URL_FOUNDRY),
};

const config = WALLET_CONNECT_PROJECT_ID
  ? getDefaultConfig({
      appName: "Olla Finance",
      appDescription: "Liquid Staking Protocol",
      appUrl: "https://olla.finance",
      appIcon: "https://olla.finance/logo.png",
      projectId: WALLET_CONNECT_PROJECT_ID,
      chains,
      transports,
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
    })
  : createConfig({
      chains,
      transports,
      connectors: [injected()],
    });

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProviderLib config={config}>{children}</WagmiProviderLib>;
}
