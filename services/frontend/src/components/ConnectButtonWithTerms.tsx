import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnection } from "wagmi";
import { Button } from "@/components/ui/Button";

export function ConnectButtonWithTerms() {
  const { isConnected } = useConnection();
  const { openConnectModal } = useConnectModal();

  if (isConnected) {
    return <ConnectButton />;
  }

  return (
    <Button
      variant="primary"
      size="md"
      onClick={() => openConnectModal?.()}
      className="font-bold"
    >
      Connect Wallet
    </Button>
  );
}
