import { useState } from "react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnection } from "wagmi";
import { Button } from "@/components/ui/Button";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { TermsAcceptanceDialog } from "@/components/TermsAcceptanceDialog";

export function ConnectButtonWithTerms() {
  const { isConnected } = useConnection();
  const { openConnectModal } = useConnectModal();
  const { accepted, accept } = useTermsAcceptance();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isConnected) {
    return <ConnectButton />;
  }

  const handleClick = () => {
    if (accepted) {
      openConnectModal?.();
    } else {
      setDialogOpen(true);
    }
  };

  const handleAccept = () => {
    accept();
    setDialogOpen(false);
    openConnectModal?.();
  };

  return (
    <>
      <Button variant="primary" size="md" onClick={handleClick} className="font-bold">
        Connect Wallet
      </Button>
      {dialogOpen && (
        <TermsAcceptanceDialog onClose={() => setDialogOpen(false)} onAccept={handleAccept} />
      )}
    </>
  );
}
