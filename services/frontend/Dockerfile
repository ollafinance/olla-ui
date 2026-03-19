# Build stage
FROM node:22-alpine AS builder

ARG VITE_APP_ENV
ENV VITE_APP_ENV=$VITE_APP_ENV

ARG VITE_CONTRACTS_ENV
ENV VITE_CONTRACTS_ENV=$VITE_CONTRACTS_ENV

ARG VITE_RPC_URL_FOUNDRY
ENV VITE_RPC_URL_FOUNDRY=$VITE_RPC_URL_FOUNDRY

ARG VITE_RPC_URL_MAINNET
ENV VITE_RPC_URL_MAINNET=$VITE_RPC_URL_MAINNET

ARG VITE_RPC_URL_SEPOLIA
ENV VITE_RPC_URL_SEPOLIA=$VITE_RPC_URL_SEPOLIA

ARG VITE_WALLET_CONNECT_PROJECT_ID
ENV VITE_WALLET_CONNECT_PROJECT_ID=$VITE_WALLET_CONNECT_PROJECT_ID

# Enable Corepack for Yarn 4 support
RUN corepack enable

WORKDIR /app

# Copy monorepo root package files (yarn.lock and .yarnrc.yml live at repo root)
COPY package.json yarn.lock .yarnrc.yml ./

# Copy workspace packages needed by the frontend
COPY packages/ ./packages/
COPY services/frontend/ ./services/frontend/

# Install dependencies
RUN yarn install --immutable

# Build the frontend workspace
RUN yarn workspace @olla-ui/frontend build

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/services/frontend/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
COPY services/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
