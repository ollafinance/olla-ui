-- Accounting updates table
-- Tracks AccountingUpdated events from OllaCore contract
-- Used to compute protocol APY from historical exchange rate data

CREATE TABLE accounting_updates (
    id                  BIGSERIAL PRIMARY KEY,
    contract            VARCHAR(42) NOT NULL REFERENCES contracts(address),
    tx_hash             VARCHAR(66) NOT NULL,
    block_number        BIGINT NOT NULL,
    log_index           INTEGER NOT NULL,
    total_assets        NUMERIC(78, 0) NOT NULL,
    exchange_rate       NUMERIC(78, 0) NOT NULL,
    gross_rewards       NUMERIC(78, 0) NOT NULL,
    net_flows           NUMERIC(78, 0) NOT NULL,
    protocol_fee_assets NUMERIC(78, 0) NOT NULL,
    treasury_shares     NUMERIC(78, 0) NOT NULL,
    provider_shares     NUMERIC(78, 0) NOT NULL,
    event_timestamp     BIGINT NOT NULL,
    created_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(tx_hash, log_index)
);

CREATE INDEX idx_accounting_updates_contract ON accounting_updates(contract);
CREATE INDEX idx_accounting_updates_block ON accounting_updates(block_number);
CREATE INDEX idx_accounting_updates_contract_event_timestamp_desc ON accounting_updates(contract, event_timestamp DESC);
