SELECT 'CREATE DATABASE olla_indexer_testnet'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'olla_indexer_testnet')\gexec
SELECT 'CREATE DATABASE olla_indexer_mainnet'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'olla_indexer_mainnet')\gexec
