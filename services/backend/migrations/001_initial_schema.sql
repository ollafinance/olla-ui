-- Olla Indexer Schema
-- Tracks deposits and withdrawal requests from OllaVault contract

-- Contracts table: historical record of all contracts we've indexed
CREATE TABLE contracts (
    id               SERIAL PRIMARY KEY,
    address          VARCHAR(42) NOT NULL UNIQUE,
    version          INTEGER NOT NULL DEFAULT 1,
    deployed_at_block BIGINT,
    first_indexed_at TIMESTAMP DEFAULT NOW(),
    notes            TEXT
);

CREATE INDEX idx_contracts_address ON contracts(address);

-- Deposits (staking events)
CREATE TABLE deposits (
    id            BIGSERIAL PRIMARY KEY,
    contract      VARCHAR(42) NOT NULL REFERENCES contracts(address),
    tx_hash       VARCHAR(66) NOT NULL UNIQUE,
    block_number  BIGINT NOT NULL,
    log_index     INTEGER NOT NULL,
    caller        VARCHAR(42) NOT NULL,
    recipient     VARCHAR(42) NOT NULL,
    assets        NUMERIC(78, 0) NOT NULL,
    shares        NUMERIC(78, 0) NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deposits_contract ON deposits(contract);
CREATE INDEX idx_deposits_recipient ON deposits(recipient);
CREATE INDEX idx_deposits_block ON deposits(block_number);
CREATE INDEX idx_deposits_tx_hash ON deposits(tx_hash);

-- Withdrawal requests (pending, claimed, and instant)
-- Note: request_id is NOT unique because multiple events (WithdrawalRequested, RedeemRequest)
-- can share the same request_id for the same withdrawal request
CREATE TABLE withdrawal_requests (
    id               BIGSERIAL PRIMARY KEY,
    contract         VARCHAR(42) NOT NULL REFERENCES contracts(address),
    request_id       BIGINT,
    tx_hash          VARCHAR(66) NOT NULL,
    block_number     BIGINT NOT NULL,
    log_index        INTEGER NOT NULL,
    event_type       VARCHAR(30) NOT NULL,
    owner            VARCHAR(42) NOT NULL,
    recipient        VARCHAR(42) NOT NULL,
    shares           NUMERIC(78, 0),
    assets_expected  NUMERIC(78, 0),
    assets_claimed   NUMERIC(78, 0),
    fee              NUMERIC(78, 0),
    gross_assets     NUMERIC(78, 0),
    net_assets       NUMERIC(78, 0),
    exchange_rate    NUMERIC(78, 0),
    status           VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at       TIMESTAMP DEFAULT NOW(),
    completed_at     TIMESTAMP,
    UNIQUE(tx_hash, log_index)
);

CREATE INDEX idx_wr_contract ON withdrawal_requests(contract);
CREATE INDEX idx_wr_request_id ON withdrawal_requests(request_id);
CREATE INDEX idx_wr_owner ON withdrawal_requests(owner);
CREATE INDEX idx_wr_recipient ON withdrawal_requests(recipient);
CREATE INDEX idx_wr_status ON withdrawal_requests(status);
CREATE INDEX idx_wr_block ON withdrawal_requests(block_number);
CREATE INDEX idx_wr_event_type ON withdrawal_requests(event_type);

-- Indexer state (track last processed block per contract)
CREATE TABLE indexer_state (
    id          SERIAL PRIMARY KEY,
    contract    VARCHAR(42) NOT NULL REFERENCES contracts(address) ON DELETE CASCADE,
    last_block  BIGINT NOT NULL,
    updated_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(contract)
);