package indexer

import (
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

type EventHandler struct {
	abi        *abi.ABI // OllaVault ABI
	coreABI    *abi.ABI // OllaCore ABI (for AccountingUpdated)
	signatures *EventSignatures
}

func NewEventHandler(contractABI *abi.ABI) *EventHandler {
	return &EventHandler{
		abi:        contractABI,
		signatures: GetEventSignatures(),
	}
}

// SetCoreABI attaches the OllaCore ABI so AccountingUpdated events can be parsed.
func (h *EventHandler) SetCoreABI(coreABI *abi.ABI) {
	h.coreABI = coreABI
}

func bigIntToStringPtr(val *big.Int) *string {
	if val == nil {
		return nil
	}
	s := val.String()
	return &s
}

func (h *EventHandler) ParseDeposit(log types.Log, contractAddr string) (*models.Deposit, error) {
	if len(log.Topics) < 3 {
		return nil, fmt.Errorf("invalid Deposit event: expected at least 3 topics, got %d", len(log.Topics))
	}

	caller := common.BytesToAddress(log.Topics[1].Bytes())
	recipient := common.BytesToAddress(log.Topics[2].Bytes())

	event, ok := h.abi.Events["Deposit"]
	if !ok {
		return nil, fmt.Errorf("Deposit event not found in ABI")
	}

	unpacked, err := event.Inputs.Unpack(log.Data)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack Deposit event: %w", err)
	}

	if len(unpacked) < 2 {
		return nil, fmt.Errorf("invalid Deposit event: expected 2 non-indexed fields, got %d", len(unpacked))
	}

	assets, ok := unpacked[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid Deposit event: assets is not *big.Int")
	}

	shares, ok := unpacked[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid Deposit event: shares is not *big.Int")
	}

	return &models.Deposit{
		Contract:    contractAddr,
		TxHash:      log.TxHash.Hex(),
		BlockNumber: int64(log.BlockNumber),
		LogIndex:    int(log.Index),
		Caller:      caller.Hex(),
		Recipient:   recipient.Hex(),
		Assets:      assets.String(),
		Shares:      shares.String(),
	}, nil
}

func (h *EventHandler) ParseWithdrawalClaimed(log types.Log, contractAddr string) (*models.WithdrawalRequest, error) {
	event, ok := h.abi.Events["WithdrawalClaimed"]
	if !ok {
		return nil, fmt.Errorf("WithdrawalClaimed event not found in ABI")
	}

	unpacked, err := event.Inputs.Unpack(log.Data)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack WithdrawalClaimed event: %w", err)
	}

	if len(unpacked) < 3 {
		return nil, fmt.Errorf("invalid WithdrawalClaimed event: expected 3 fields, got %d", len(unpacked))
	}

	requestID, ok := unpacked[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid WithdrawalClaimed event: requestID is not *big.Int")
	}

	recipient, ok := unpacked[1].(common.Address)
	if !ok {
		return nil, fmt.Errorf("invalid WithdrawalClaimed event: recipient is not common.Address")
	}

	assets, ok := unpacked[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid WithdrawalClaimed event: assets is not *big.Int")
	}

	reqID := requestID.Int64()
	return &models.WithdrawalRequest{
		Contract:      contractAddr,
		RequestID:     &reqID,
		TxHash:        log.TxHash.Hex(),
		BlockNumber:   int64(log.BlockNumber),
		LogIndex:      int(log.Index),
		EventType:     models.EventTypeWithdrawalClaimed,
		Recipient:     recipient.Hex(),
		AssetsClaimed: bigIntToStringPtr(assets),
		Status:        models.StatusCompleted,
	}, nil
}

func (h *EventHandler) ParseInstantRedemption(log types.Log, contractAddr string) (*models.WithdrawalRequest, error) {
	if len(log.Topics) < 3 {
		return nil, fmt.Errorf("invalid InstantRedemption event: expected at least 3 topics, got %d", len(log.Topics))
	}

	owner := common.BytesToAddress(log.Topics[1].Bytes())
	recipient := common.BytesToAddress(log.Topics[2].Bytes())

	event, ok := h.abi.Events["InstantRedemption"]
	if !ok {
		return nil, fmt.Errorf("InstantRedemption event not found in ABI")
	}

	unpacked, err := event.Inputs.Unpack(log.Data)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack InstantRedemption event: %w", err)
	}

	if len(unpacked) < 5 {
		return nil, fmt.Errorf("invalid InstantRedemption event: expected 5 non-indexed fields, got %d", len(unpacked))
	}

	shares, ok := unpacked[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid InstantRedemption event: shares is not *big.Int")
	}

	grossAssets, ok := unpacked[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid InstantRedemption event: grossAssets is not *big.Int")
	}

	fee, ok := unpacked[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid InstantRedemption event: fee is not *big.Int")
	}

	netAssets, ok := unpacked[3].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid InstantRedemption event: netAssets is not *big.Int")
	}

	exchangeRate, ok := unpacked[4].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid InstantRedemption event: exchangeRate is not *big.Int")
	}

	return &models.WithdrawalRequest{
		Contract:     contractAddr,
		TxHash:       log.TxHash.Hex(),
		BlockNumber:  int64(log.BlockNumber),
		LogIndex:     int(log.Index),
		EventType:    models.EventTypeInstantRedemption,
		Owner:        owner.Hex(),
		Recipient:    recipient.Hex(),
		Shares:       bigIntToStringPtr(shares),
		GrossAssets:  bigIntToStringPtr(grossAssets),
		Fee:          bigIntToStringPtr(fee),
		NetAssets:    bigIntToStringPtr(netAssets),
		ExchangeRate: bigIntToStringPtr(exchangeRate),
		Status:       models.StatusCompleted,
	}, nil
}

func (h *EventHandler) ParseRedeemRequest(log types.Log, contractAddr string) (*models.WithdrawalRequest, error) {
	if len(log.Topics) < 4 {
		return nil, fmt.Errorf("invalid RedeemRequest event: expected at least 4 topics, got %d", len(log.Topics))
	}

	controller := common.BytesToAddress(log.Topics[1].Bytes())
	owner := common.BytesToAddress(log.Topics[2].Bytes())
	requestID := new(big.Int).SetBytes(log.Topics[3].Bytes())

	event, ok := h.abi.Events["RedeemRequest"]
	if !ok {
		return nil, fmt.Errorf("RedeemRequest event not found in ABI")
	}

	unpacked, err := event.Inputs.Unpack(log.Data)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack RedeemRequest event: %w", err)
	}

	if len(unpacked) < 2 {
		return nil, fmt.Errorf("invalid RedeemRequest event: expected 2 non-indexed fields, got %d", len(unpacked))
	}

	assets, ok := unpacked[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid RedeemRequest event: assets is not *big.Int")
	}

	reqID := requestID.Int64()
	return &models.WithdrawalRequest{
		Contract:       contractAddr,
		RequestID:      &reqID,
		TxHash:         log.TxHash.Hex(),
		BlockNumber:    int64(log.BlockNumber),
		LogIndex:       int(log.Index),
		EventType:      models.EventTypeRedeemRequest,
		Owner:          owner.Hex(),
		Recipient:      controller.Hex(),
		AssetsExpected: bigIntToStringPtr(assets),
		Status:         models.StatusPending,
	}, nil
}

func (h *EventHandler) IdentifyEventType(log types.Log) string {
	if len(log.Topics) == 0 {
		return ""
	}

	topicHash := log.Topics[0].Hex()
	switch {
	case h.signatures.IsDeposit(topicHash):
		return "Deposit"
	case h.signatures.IsWithdrawalClaimed(topicHash):
		return "WithdrawalClaimed"
	case h.signatures.IsInstantRedemption(topicHash):
		return "InstantRedemption"
	case h.signatures.IsRedeemRequest(topicHash):
		return "RedeemRequest"
	case h.signatures.IsAccountingUpdated(topicHash):
		return "AccountingUpdated"
	default:
		return ""
	}
}

// ParseAccountingUpdated parses an AccountingUpdated event from OllaCore.
// All 8 fields are non-indexed (packed into log.Data).
func (h *EventHandler) ParseAccountingUpdated(log types.Log, contractAddr string) (*models.AccountingUpdate, error) {
	if h.coreABI == nil {
		return nil, fmt.Errorf("OllaCore ABI not loaded; call SetCoreABI first")
	}

	event, ok := h.coreABI.Events["AccountingUpdated"]
	if !ok {
		return nil, fmt.Errorf("AccountingUpdated event not found in OllaCore ABI")
	}

	unpacked, err := event.Inputs.Unpack(log.Data)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack AccountingUpdated event: %w", err)
	}

	if len(unpacked) < 8 {
		return nil, fmt.Errorf("invalid AccountingUpdated event: expected 8 fields, got %d", len(unpacked))
	}

	totalAssets, ok := unpacked[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid AccountingUpdated: totalAssets is not *big.Int")
	}
	exchangeRate, ok := unpacked[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid AccountingUpdated: exchangeRate is not *big.Int")
	}
	grossRewards, ok := unpacked[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid AccountingUpdated: grossRewards is not *big.Int")
	}
	// netFlows is int256 — go-ethereum decodes it as *big.Int (signed)
	netFlows, ok := unpacked[3].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid AccountingUpdated: netFlows is not *big.Int")
	}
	protocolFeeAssets, ok := unpacked[4].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid AccountingUpdated: protocolFeeAssets is not *big.Int")
	}
	treasuryShares, ok := unpacked[5].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid AccountingUpdated: treasuryShares is not *big.Int")
	}
	providerShares, ok := unpacked[6].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid AccountingUpdated: providerShares is not *big.Int")
	}
	timestamp, ok := unpacked[7].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("invalid AccountingUpdated: timestamp is not *big.Int")
	}

	return &models.AccountingUpdate{
		Contract:          contractAddr,
		TxHash:            log.TxHash.Hex(),
		BlockNumber:       int64(log.BlockNumber),
		LogIndex:          int(log.Index),
		TotalAssets:       totalAssets.String(),
		ExchangeRate:      exchangeRate.String(),
		GrossRewards:      grossRewards.String(),
		NetFlows:          netFlows.String(),
		ProtocolFeeAssets: protocolFeeAssets.String(),
		TreasuryShares:    treasuryShares.String(),
		ProviderShares:    providerShares.String(),
		EventTimestamp:    timestamp.Int64(),
	}, nil
}
