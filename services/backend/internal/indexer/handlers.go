package indexer

import (
	"context"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

type EventHandler struct {
	abi        *abi.ABI
	signatures *EventSignatures
}

func NewEventHandler(contractABI *abi.ABI) *EventHandler {
	return &EventHandler{
		abi:        contractABI,
		signatures: GetEventSignatures(),
	}
}

func (h *EventHandler) ParseDeposit(log types.Log) (*models.Deposit, error) {
	if len(log.Topics) < 3 {
		return nil, fmt.Errorf("invalid Deposit event: expected at least 3 topics")
	}

	caller := common.BytesToAddress(log.Topics[1].Bytes())
	recipient := common.BytesToAddress(log.Topics[2].Bytes())

	event, ok := h.abi.Events["Deposit"]
	if !ok {
		return nil, fmt.Errorf("Deposit event not found in ABI")
	}

	var data struct {
		Assets *big.Int
		Shares *big.Int
	}

	if err := UnpackEventData(event, log.Data, &data); err != nil {
		return nil, fmt.Errorf("failed to unpack Deposit event: %w", err)
	}

	return &models.Deposit{
		TxHash:      log.TxHash.Hex(),
		BlockNumber: int64(log.BlockNumber),
		LogIndex:    int(log.Index),
		Caller:      caller.Hex(),
		Recipient:   recipient.Hex(),
		Assets:      data.Assets.String(),
		Shares:      data.Shares.String(),
	}, nil
}

func (h *EventHandler) ParseWithdrawalRequested(log types.Log) (*models.WithdrawalRequest, error) {
	if len(log.Topics) < 4 {
		return nil, fmt.Errorf("invalid WithdrawalRequested event: expected at least 4 topics")
	}

	requestID := new(big.Int).SetBytes(log.Topics[1].Bytes())
	owner := common.BytesToAddress(log.Topics[2].Bytes())
	recipient := common.BytesToAddress(log.Topics[3].Bytes())

	event, ok := h.abi.Events["WithdrawalRequested"]
	if !ok {
		return nil, fmt.Errorf("WithdrawalRequested event not found in ABI")
	}

	var data struct {
		Shares         *big.Int
		AssetsExpected *big.Int
		ExchangeRate   *big.Int
	}

	if err := UnpackEventData(event, log.Data, &data); err != nil {
		return nil, fmt.Errorf("failed to unpack WithdrawalRequested event: %w", err)
	}

	reqID := requestID.Int64()
	return &models.WithdrawalRequest{
		RequestID:      &reqID,
		TxHash:         log.TxHash.Hex(),
		BlockNumber:    int64(log.BlockNumber),
		LogIndex:       int(log.Index),
		EventType:      models.EventTypeWithdrawalRequested,
		Owner:          owner.Hex(),
		Recipient:      recipient.Hex(),
		Shares:         data.Shares.String(),
		AssetsExpected: data.AssetsExpected.String(),
		ExchangeRate:   data.ExchangeRate.String(),
		Status:         models.StatusPending,
	}, nil
}

func (h *EventHandler) ParseWithdrawalClaimed(log types.Log) (*models.WithdrawalRequest, error) {
	event, ok := h.abi.Events["WithdrawalClaimed"]
	if !ok {
		return nil, fmt.Errorf("WithdrawalClaimed event not found in ABI")
	}

	var data struct {
		RequestID *big.Int
		Recipient common.Address
		Assets    *big.Int
	}

	if err := UnpackEventData(event, log.Data, &data); err != nil {
		return nil, fmt.Errorf("failed to unpack WithdrawalClaimed event: %w", err)
	}

	requestID := data.RequestID.Int64()
	return &models.WithdrawalRequest{
		RequestID:     &requestID,
		TxHash:        log.TxHash.Hex(),
		BlockNumber:   int64(log.BlockNumber),
		LogIndex:      int(log.Index),
		EventType:     models.EventTypeWithdrawalClaimed,
		Recipient:     data.Recipient.Hex(),
		AssetsClaimed: data.Assets.String(),
		Status:        models.StatusCompleted,
	}, nil
}

func (h *EventHandler) ParseInstantRedemption(log types.Log) (*models.WithdrawalRequest, error) {
	if len(log.Topics) < 3 {
		return nil, fmt.Errorf("invalid InstantRedemption event: expected at least 3 topics")
	}

	owner := common.BytesToAddress(log.Topics[1].Bytes())
	recipient := common.BytesToAddress(log.Topics[2].Bytes())

	event, ok := h.abi.Events["InstantRedemption"]
	if !ok {
		return nil, fmt.Errorf("InstantRedemption event not found in ABI")
	}

	var data struct {
		Shares       *big.Int
		GrossAssets  *big.Int
		Fee          *big.Int
		NetAssets    *big.Int
		ExchangeRate *big.Int
	}

	if err := UnpackEventData(event, log.Data, &data); err != nil {
		return nil, fmt.Errorf("failed to unpack InstantRedemption event: %w", err)
	}

	return &models.WithdrawalRequest{
		TxHash:       log.TxHash.Hex(),
		BlockNumber:  int64(log.BlockNumber),
		LogIndex:     int(log.Index),
		EventType:    models.EventTypeInstantRedemption,
		Owner:        owner.Hex(),
		Recipient:    recipient.Hex(),
		Shares:       data.Shares.String(),
		GrossAssets:  data.GrossAssets.String(),
		Fee:          data.Fee.String(),
		NetAssets:    data.NetAssets.String(),
		ExchangeRate: data.ExchangeRate.String(),
		Status:       models.StatusCompleted,
	}, nil
}

func (h *EventHandler) ParseRedeemRequest(log types.Log) (*models.WithdrawalRequest, error) {
	if len(log.Topics) < 4 {
		return nil, fmt.Errorf("invalid RedeemRequest event: expected at least 4 topics")
	}

	controller := common.BytesToAddress(log.Topics[1].Bytes())
	owner := common.BytesToAddress(log.Topics[2].Bytes())
	requestID := new(big.Int).SetBytes(log.Topics[3].Bytes())

	event, ok := h.abi.Events["RedeemRequest"]
	if !ok {
		return nil, fmt.Errorf("RedeemRequest event not found in ABI")
	}

	var data struct {
		Sender common.Address
		Assets *big.Int
	}

	if err := UnpackEventData(event, log.Data, &data); err != nil {
		return nil, fmt.Errorf("failed to unpack RedeemRequest event: %w", err)
	}

	reqID := requestID.Int64()
	return &models.WithdrawalRequest{
		RequestID:      &reqID,
		TxHash:         log.TxHash.Hex(),
		BlockNumber:    int64(log.BlockNumber),
		LogIndex:       int(log.Index),
		EventType:      models.EventTypeRedeemRequest,
		Owner:          owner.Hex(),
		Recipient:      controller.Hex(),
		AssetsExpected: data.Assets.String(),
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
	case h.signatures.IsWithdrawalRequested(topicHash):
		return "WithdrawalRequested"
	case h.signatures.IsWithdrawalClaimed(topicHash):
		return "WithdrawalClaimed"
	case h.signatures.IsInstantRedemption(topicHash):
		return "InstantRedemption"
	case h.signatures.IsRedeemRequest(topicHash):
		return "RedeemRequest"
	default:
		return ""
	}
}

func (h *EventHandler) HandleLog(ctx context.Context, log types.Log) error {
	return nil
}

// UnpackEventData unpacks the non-indexed data portion of an event log
func UnpackEventData(event abi.Event, data []byte, v interface{}) error {
	unpacked, err := event.Inputs.Unpack(data)
	if err != nil {
		return err
	}
	return event.Inputs.Copy(v, unpacked)
}
