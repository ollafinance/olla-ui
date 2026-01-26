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

*   **Features (`src/features/`)**: Self-contained vertical slices containing domain logic (hooks for UI state) and specific components.
*   **Protocol Layer (`src/hooks/protocol/`)**: A shared kernel of hooks that wrap smart contract interactions, accessible globally.
*   **UI System (`src/components/ui/`)**: Reusable, atomic UI components (Buttons, Cards, Inputs) styled with Tailwind CSS.
*   **Routing**: Powered by **TanStack Router** for type-safe navigation.

### Directory Structure

```text
src/
├── components/       # Shared UI Atoms & Layouts
├── features/         # Business Logic (Staking, etc.)
├── hooks/protocol/   # Shared Contract Hooks
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

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn preview` | Preview production build |
| `yarn lint` | Run ESLint |
| `yarn sync:contracts` | Sync ABIs and addresses from core repo (local) |
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
├── hooks/          # Custom React hooks (useAztecToken, useOllaCore)
├── App.tsx         # Main application component
├── main.tsx        # Entry point
└── wagmi.ts        # Wagmi configuration
```

## Related

- [olla-core](https://github.com/ollafinance/core) - Smart contracts
