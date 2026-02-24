# Olla UI

Frontend interface for the Olla liquid staking protocol on Aztec.

## Stack

- **React 19** + **TypeScript**
- **Vite** for development and builds
- **Wagmi** + **ConnectKit** for wallet connections
- **TailwindCSS v4** for styling

## Prerequisites

- **Node.js** >= 18
- **Yarn** >= 4 (see [core](https://github.com/ollafinance/core) for setup)
- **Foundry** (for local chain) - [Install Guide](https://book.getfoundry.sh/getting-started/installation)

## Project Architecture

This project utilizes a **Feature-First Architecture** inspired by Atomic Design and Domain-Driven Design.

### Key Concepts

- **Features (`src/features/`)**: Self-contained vertical slices containing domain logic (hooks for UI state) and specific components.
- **Protocol Layer (`src/hooks/protocol/`)**: A shared kernel of hooks that wrap smart contract interactions, accessible globally.
- **UI System (`src/components/ui/`)**: Reusable, atomic UI components (Buttons, Cards, Inputs) styled with Tailwind CSS.
- **Routing**: Powered by **TanStack Router** for type-safe navigation.

### Directory Structure

```text
src/
├── components/       # Shared UI Atoms & Layouts
├── features/         # Business Logic (Staking, etc.)
├── hooks/            # Shared Hooks (useTheme, etc.)
├── hooks/protocol/   # Shared Contract Hooks
├── providers/        # Global Providers (Wagmi, RainbowKit, Theme)
├── routes/           # TanStack Router Definitions
└── lib/              # Utilities
```

## Setup

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Start the local Anvil chain and deploy contracts (from the [core](https://github.com/ollafinance/core) repo):

   ```bash
   # Terminal 1: Start Anvil
   yarn dev:anvil

   # Terminal 2: Build and deploy contracts
   yarn dev:build
   yarn deploy:local
   ```

3. Sync contract ABIs and addresses:

   ```bash
   yarn sync:contracts
   ```

4. Start the development server:

   ```bash
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Command                       | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `yarn dev`                    | Start development server                         |
| `yarn build`                  | Build for production                             |
| `yarn preview`                | Preview production build                         |
| `yarn lint`                   | Run ESLint                                       |
| `yarn sync:contracts`         | Sync ABIs and addresses from core repo (local)   |
| `yarn sync:contracts:testnet` | Sync ABIs and addresses from core repo (testnet) |

## Contract Sync

The frontend syncs contract ABIs and deployment addresses from the `core` repo using the `sync:contracts` script.

### Configuration

The sync is configured via `contracts.config.json`:

```json
{
  "source": {
    "corePath": "../core"
  },
  "output": {
    "dir": "src/generated"
  },
  "contracts": ["OllaCore", "StAztec", "MockAztec", "MockStakingManager"]
}
```

### Output

After running `yarn sync:contracts`, the following files are generated:

```
src/generated/
├── abis/
│   ├── OllaCore.json
│   ├── StAztec.json
│   ├── MockAztec.json
│   └── MockStakingManager.json
└── deployments/
    ├── local.json        # Full deployment info
    └── addresses.json    # Contract addresses
```

These files are gitignored and must be regenerated after cloning.

## Project Structure

```
src/
├── generated/      # Generated ABIs and addresses (gitignored)
├── components/     # React components
├── constants/      # Contract configurations
├── hooks/          # Custom React hooks
│   ├── protocol/   # Protocol hooks (contract interactions)
│   └── *.ts        # Utility hooks (useTheme, useDebounce, etc.)
├── providers/      # Global application providers
├── App.tsx         # Main application component
├── main.tsx        # Entry point
```

## Protocol Hooks

Located in `src/hooks/protocol/`, these hooks wrap smart contract interactions:

| Hook | Purpose | Contract |
|------|---------|----------|
| `useDeposit` | Deposit assets with EIP-2612 permit, calculates `minSharesOut` for MEV protection | `OllaCore.depositWithPermit` |
| `useRequestRedeem` | Request a queued withdrawal with permit | `OllaCore.requestRedeemWithPermit` |
| `useInstantRedeem` | Instant redemption with permit, calculates `minAssetsOut` (accounts for instant fee) | `OllaCore.redeemWithPermit` |
| `useClaimRequest` | Claim a finalized withdrawal request | `OllaCore.claimRequestById` |
| `useOllaCoreReads` | Read-only: exchange rate, conversions, preview amounts, active requests, available liquidity | `OllaCore` (view functions) |
| `useStAztec` | Read stAztec balance, allowance; approve spender | `StAztec` |
| `useAztecToken` | Read Asset balance, allowance; approve spender | `MockAztec` |
| `useWithdrawalRequest` | Read withdrawal request details by ID | `WithdrawalQueue` |

### Exchange Rate & USD Value Calculations

The contract's `exchangeRate()` returns the ratio in **18-decimal fixed-point** format:
- **Format**: `stAztec / Aztec` (how many Aztec tokens 1 stAztec represents)
- **Example**: Rate of `1.111111111111111111` means 1 stAztec = 1.111... Aztec

**Important**: Do NOT invert the exchange rate. Use the value directly from the contract.

#### USD Value Calculation (Staking)

When displaying USD values in the "You Receive" card:

```
1. Deposit: 10 Aztec tokens
2. Contract previewDeposit(10) → 9 stAztec shares
3. USD value = 9 stAztec × 1.111 (exchange rate) × $2.10 (Aztec price)
              = 10 Aztec × $2.10
              = $21.00
```

**Key insight**: The USD value of stAztec shares should equal the USD value of the deposited Aztec amount. The exchange rate ensures this parity:
- `stAztecToAztec(shares) = shares × exchangeRate`
- `stAztecToUsd(shares) = stAztecToAztec(shares) × AZTEC_PRICE_USD`

#### Implementation

```typescript
// useStakingState.ts - Correct implementation
const exchangeRateNum = reads.exchangeRate
  ? Number(formatEther(reads.exchangeRate))  // Use directly, DON'T invert
  : null;

const { stAztecToUsd } = useCurrency({
  exchangeRate: exchangeRateNum,
});

const previewSharesUsd = stAztecToUsd(previewShares); // Returns correct USD value
```

**Common Pitfall**: Inverting the exchange rate (doing `1 / rate`) causes USD values to be incorrect. When the rate is 1.111, inverting gives 0.9, which makes 9 stAztec appear worth only $17.01 instead of $21.

### Shared Utilities

| File | Purpose |
|------|---------|
| `src/lib/permit.ts` | EIP-2612 permit signing utilities (domain extraction, message building) |
| `src/constants/protocol.ts` | Protocol constants (slippage tolerance, deadline) |

### Usage Example

```typescript
import { useDeposit, useOllaCoreReads } from "@/hooks/protocol";

function StakingForm() {
  const { write: deposit, isSigning, isPending, isConfirming } = useDeposit({
    onSuccess: () => console.log("Deposited!"),
  });
  
  const { exchangeRate, potentialShares, availableForInstantRedemption } = 
    useOllaCoreReads({ amountToConvert: "1.0" });

  const handleDeposit = () => {
    deposit("1.0"); // Deposits 1.0 Aztec, calculates minSharesOut automatically
  };

  // ...
}
```

## Troubleshooting

### Transaction stuck in "Confirming" state

If your transaction gets stuck on "Confirming" indefinitely after the first successful transaction, this is likely a **wallet nonce mismatch** issue.

**Symptoms:**
- First transaction succeeds and is mined
- Second transaction shows "Confirming" forever
- No new blocks are produced on the local chain
- `cast tx <hash>` shows the transaction has a nonce much higher than expected (e.g., nonce 21 when it should be nonce 1)

**Root Cause:**
The wallet (MetaMask) caches the transaction nonce from previous sessions. When you reset the Foundry/Anvil chain, the chain's nonce counter resets to 0, but the wallet still thinks the account has sent many transactions. This creates a gap in nonces that the chain cannot fill.

**Solution:**
Reset your wallet's nonce cache:
1. Open MetaMask
2. Go to Settings → Advanced
3. Click "Reset Account" (this clears the transaction history for the current network)
4. Try the transaction again

**Prevention:**
Always reset your wallet after resetting the local chain:
1. Reset Foundry/Anvil chain
2. Reset MetaMask account (Settings → Advanced → Reset Account)
3. Then start testing

## Related

- [olla-core](https://github.com/ollafinance/core) - Smart contracts
