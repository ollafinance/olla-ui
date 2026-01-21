import { useAccount } from "wagmi";
import { Header } from "./components/Header";
import { StatusPanel } from "./components/StatusPanel";
import { ActionButtons } from "./components/ActionButtons";
import { useAztecToken } from "./hooks/useAztecToken";
import { useOllaCore } from "./hooks/useOllaCore";

function App() {
  const { isConnected } = useAccount();
  
  // Custom Hooks
  const { 
    balance, 
    allowance, 
    mint, 
    approve,
    refetchBalance,
    refetchAllowance 
  } = useAztecToken();

  const { deposit } = useOllaCore();

  // Refresh data when transactions complete
  if (mint.isConfirmed) refetchBalance();
  if (approve.isConfirmed) refetchAllowance();
  if (deposit.isConfirmed) {
      refetchBalance();
      refetchAllowance();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        
        <Header />

        <div className="space-y-6">
          
          <StatusPanel balance={balance} allowance={allowance} />

          <ActionButtons 
            isConnected={isConnected}
            allowance={allowance}
            mint={mint}
            approve={approve}
            deposit={deposit}
          />

          {/* Transaction Feedback */}
          <div className="space-y-2">
             {(mint.hash || approve.hash || deposit.hash) && (
              <div className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded border border-gray-200">
                <span className="font-semibold">Tx Hash:</span> {mint.hash || approve.hash || deposit.hash}
              </div>
            )}
            
            {(mint.isConfirmed || approve.isConfirmed || deposit.isConfirmed) && (
               <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200 text-center font-medium">
                 Transaction Successful!
               </div>
            )}

            {deposit.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                Error: {(deposit.error as any).shortMessage || deposit.error.message}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
