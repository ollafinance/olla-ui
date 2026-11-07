package indexer

import (
	"math/big"
	"strings"
	"testing"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

func TestParseRedeemRequestStoresSharesNotAssetsExpected(t *testing.T) {
	contractABI, err := abi.JSON(strings.NewReader(`[{"type":"event","name":"RedeemRequest","inputs":[{"name":"controller","type":"address","indexed":true},{"name":"owner","type":"address","indexed":true},{"name":"requestId","type":"uint256","indexed":true},{"name":"sender","type":"address","indexed":false},{"name":"shares","type":"uint256","indexed":false}]}]`))
	if err != nil {
		t.Fatal(err)
	}

	const wantShares = "50000000000000000000000" // 50000e18, larger than uint64.
	shares, ok := new(big.Int).SetString(wantShares, 10)
	if !ok {
		t.Fatal("invalid share amount")
	}
	controller := common.HexToAddress("0x1111111111111111111111111111111111111111")
	owner := common.HexToAddress("0x2222222222222222222222222222222222222222")
	sender := common.HexToAddress("0x3333333333333333333333333333333333333333")
	event := contractABI.Events["RedeemRequest"]
	data, err := event.Inputs.NonIndexed().Pack(sender, shares)
	if err != nil {
		t.Fatal(err)
	}
	contract := "0x4444444444444444444444444444444444444444"
	log := types.Log{
		Topics: []common.Hash{
			event.ID,
			common.BytesToHash(controller.Bytes()),
			common.BytesToHash(owner.Bytes()),
			common.BigToHash(big.NewInt(42)),
		},
		Data:        data,
		TxHash:      common.HexToHash("0x1234"),
		BlockNumber: 123,
		Index:       7,
	}

	request, err := NewEventHandler(&contractABI).ParseRedeemRequest(log, contract)
	if err != nil {
		t.Fatal(err)
	}
	if request.Shares == nil || *request.Shares != wantShares {
		t.Fatalf("Shares = %v, want %s", request.Shares, wantShares)
	}
	if request.AssetsExpected != nil {
		t.Fatalf("AssetsExpected = %s, want nil: RedeemRequest emits shares, not assets", *request.AssetsExpected)
	}
	if request.RequestID == nil || *request.RequestID != 42 {
		t.Fatalf("RequestID = %v, want 42", request.RequestID)
	}
	if request.Owner != owner.Hex() || request.Recipient != controller.Hex() {
		t.Fatalf("unexpected owner/recipient: %s/%s", request.Owner, request.Recipient)
	}
	if request.Contract != contract || request.TxHash != log.TxHash.Hex() || request.BlockNumber != 123 || request.LogIndex != 7 {
		t.Fatalf("unexpected event metadata: %+v", request)
	}
	if request.EventType != models.EventTypeRedeemRequest || request.Status != models.StatusPending {
		t.Fatalf("unexpected event type/status: %s/%s", request.EventType, request.Status)
	}
}
