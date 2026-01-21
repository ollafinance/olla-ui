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

## Setup

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start the local Anvil chain (from the [core](https://github.com/ollafinance/core) repo):
   ```bash
   yarn dev:chain
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn preview` | Preview production build |
| `yarn lint` | Run ESLint |

## Project Structure

```
src/
├── abis/           # Contract ABIs and addresses
├── components/     # React components
├── constants/      # Contract configurations
├── hooks/          # Custom React hooks (useAztecToken, useOllaCore)
├── App.tsx         # Main application component
├── main.tsx        # Entry point
└── wagmi.ts        # Wagmi configuration
```

## Related

- [olla-core](https://github.com/ollafinance/core) - Smart contracts
