package indexer

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ollafinance/ui/services/backend/internal/config"
	"github.com/ollafinance/ui/services/backend/internal/database"
)

type Indexer struct {
	client       *ethclient.Client
	store        *database.Store
	handler      *EventHandler
	contractAddr common.Address
	abi          *abi.ABI
	pollInterval time.Duration
	startBlock   int64
	stopCh       chan struct{}
}

func NewIndexer(
	cfg *config.Config,
	deployment *config.Deployment,
	store *database.Store,
	contractABI *abi.ABI,
) (*Indexer, error) {
	client, err := ethclient.Dial(cfg.RPCURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Ethereum client: %w", err)
	}

	vaultAddr, err := deployment.OllaVaultAddress()
	if err != nil {
		client.Close()
		return nil, fmt.Errorf("failed to get vault address: %w", err)
	}

	startBlock, err := deployment.GetStartBlock(cfg.StartBlock)
	if err != nil {
		client.Close()
		return nil, fmt.Errorf("failed to determine start block: %w", err)
	}

	return &Indexer{
		client:       client,
		store:        store,
		handler:      NewEventHandler(contractABI),
		contractAddr: common.HexToAddress(vaultAddr),
		abi:          contractABI,
		pollInterval: cfg.PollInterval,
		startBlock:   startBlock,
		stopCh:       make(chan struct{}),
	}, nil
}

func (i *Indexer) Start(ctx context.Context) error {
	if err := i.store.Contracts.Upsert(ctx, i.contractAddr.Hex(), nil); err != nil {
		return fmt.Errorf("failed to upsert contract: %w", err)
	}

	lastBlock, err := i.store.IndexerState.GetLastBlock(ctx, i.contractAddr.Hex())
	if err != nil {
		log.Printf("Warning: could not get last block: %v", err)
	}

	if lastBlock == 0 {
		lastBlock = i.startBlock
		if lastBlock == 0 {
			currentBlock, err := i.client.BlockNumber(ctx)
			if err != nil {
				return fmt.Errorf("failed to get current block: %w", err)
			}
			lastBlock = int64(currentBlock)
		}
		log.Printf("Starting indexer from block %d", lastBlock)
	} else {
		log.Printf("Resuming indexer from block %d", lastBlock)
	}

	ticker := time.NewTicker(i.pollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Indexer stopped by context")
			return ctx.Err()
		case <-i.stopCh:
			log.Println("Indexer stopped by signal")
			return nil
		case <-ticker.C:
			newBlock, err := i.poll(ctx, lastBlock)
			if err != nil {
				log.Printf("Error polling for events: %v", err)
				continue
			}
			if newBlock > lastBlock {
				lastBlock = newBlock
			}
		}
	}
}

func (i *Indexer) Stop() {
	close(i.stopCh)
	i.client.Close()
}

func (i *Indexer) poll(ctx context.Context, fromBlock int64) (int64, error) {
	currentBlock, err := i.client.BlockNumber(ctx)
	if err != nil {
		return fromBlock, fmt.Errorf("failed to get current block: %w", err)
	}

	if int64(currentBlock) <= fromBlock {
		return fromBlock, nil
	}

	toBlock := int64(currentBlock)
	if toBlock-fromBlock > 10000 {
		toBlock = fromBlock + 10000
	}

	logs, err := i.getLogs(ctx, fromBlock+1, toBlock)
	if err != nil {
		return fromBlock, fmt.Errorf("failed to get logs: %w", err)
	}

	if len(logs) == 0 {
		if err := i.store.IndexerState.Upsert(ctx, i.contractAddr.Hex(), toBlock); err != nil {
			return fromBlock, fmt.Errorf("failed to update indexer state: %w", err)
		}
		return toBlock, nil
	}

	for _, vLog := range logs {
		if err := i.processLog(ctx, vLog); err != nil {
			log.Printf("Error processing log %s: %v", vLog.TxHash.Hex(), err)
			continue
		}
	}

	if err := i.store.IndexerState.Upsert(ctx, i.contractAddr.Hex(), toBlock); err != nil {
		return fromBlock, fmt.Errorf("failed to update indexer state: %w", err)
	}

	log.Printf("Processed blocks %d to %d, %d events found", fromBlock+1, toBlock, len(logs))
	return toBlock, nil
}

func (i *Indexer) getLogs(ctx context.Context, fromBlock, toBlock int64) ([]types.Log, error) {
	topics := make([][]common.Hash, 1)
	topics[0] = make([]common.Hash, 4)
	sigs := GetEventSignatures()
	topics[0][0] = common.HexToHash(sigs.Deposit)
	topics[0][1] = common.HexToHash(sigs.WithdrawalClaimed)
	topics[0][2] = common.HexToHash(sigs.InstantRedemption)
	topics[0][3] = common.HexToHash(sigs.RedeemRequest)

	logs, err := i.client.FilterLogs(ctx, ethereum.FilterQuery{
		Addresses: []common.Address{i.contractAddr},
		FromBlock: big.NewInt(fromBlock),
		ToBlock:   big.NewInt(toBlock),
		Topics:    topics,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to filter logs: %w", err)
	}

	return logs, nil
}

func (i *Indexer) processLog(ctx context.Context, vLog types.Log) error {
	eventType := i.handler.IdentifyEventType(vLog)
	if eventType == "" {
		return nil
	}

	switch eventType {
	case "Deposit":
		deposit, err := i.handler.ParseDeposit(vLog, i.contractAddr.Hex())
		if err != nil {
			return fmt.Errorf("failed to parse Deposit: %w", err)
		}
		if err := i.store.Deposits.Insert(ctx, deposit); err != nil {
			return fmt.Errorf("failed to insert Deposit: %w", err)
		}
		log.Printf("Indexed Deposit: tx=%s, recipient=%s, assets=%s", deposit.TxHash, deposit.Recipient, deposit.Assets)

	case "WithdrawalClaimed":
		wr, err := i.handler.ParseWithdrawalClaimed(vLog, i.contractAddr.Hex())
		if err != nil {
			return fmt.Errorf("failed to parse WithdrawalClaimed: %w", err)
		}
		if wr.RequestID != nil {
			if err := i.store.Withdrawals.UpdateToCompleted(ctx, *wr.RequestID, wr.TxHash, wr.AssetsClaimed, wr.BlockNumber, wr.LogIndex); err != nil {
				log.Printf("Warning: failed to update withdrawal status: %v", err)
			}
		}
		if err := i.store.Withdrawals.Insert(ctx, wr); err != nil {
			return fmt.Errorf("failed to insert WithdrawalClaimed: %w", err)
		}
		log.Printf("Indexed WithdrawalClaimed: tx=%s, requestID=%d", wr.TxHash, *wr.RequestID)

	case "InstantRedemption":
		wr, err := i.handler.ParseInstantRedemption(vLog, i.contractAddr.Hex())
		if err != nil {
			return fmt.Errorf("failed to parse InstantRedemption: %w", err)
		}
		if err := i.store.Withdrawals.Insert(ctx, wr); err != nil {
			return fmt.Errorf("failed to insert InstantRedemption: %w", err)
		}
		netAssetsStr := "<nil>"
		if wr.NetAssets != nil {
			netAssetsStr = *wr.NetAssets
		}
		log.Printf("Indexed InstantRedemption: tx=%s, owner=%s, netAssets=%s", wr.TxHash, wr.Owner, netAssetsStr)

	case "RedeemRequest":
		wr, err := i.handler.ParseRedeemRequest(vLog, i.contractAddr.Hex())
		if err != nil {
			return fmt.Errorf("failed to parse RedeemRequest: %w", err)
		}
		if err := i.store.Withdrawals.Insert(ctx, wr); err != nil {
			return fmt.Errorf("failed to insert RedeemRequest: %w", err)
		}
		log.Printf("Indexed RedeemRequest: tx=%s, requestID=%d, owner=%s", wr.TxHash, *wr.RequestID, wr.Owner)
	}

	return nil
}
