package indexer

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/crypto"
)

type EventSignatures struct {
	Deposit           string
	WithdrawalClaimed string
	RedeemRequest     string
	AccountingUpdated string
}

func LoadABI(path string) (*abi.ABI, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read ABI file: %w", err)
	}

	var contractABI abi.ABI
	if err := json.Unmarshal(data, &contractABI); err != nil {
		return nil, fmt.Errorf("failed to unmarshal ABI: %w", err)
	}

	return &contractABI, nil
}

func LoadABIFromRelativePath() (*abi.ABI, string, error) {
	// From services/backend, ../../ goes to repo root
	paths := []string{
		filepath.Join("../../", "packages/types/src/generated/abis/OllaVault.json"),
	}

	if customPath := os.Getenv("ABI_PATH"); customPath != "" {
		paths = append([]string{customPath}, paths...)
	}

	var lastErr error
	for _, path := range paths {
		abi, err := LoadABI(path)
		if err != nil {
			lastErr = err
			continue
		}
		return abi, path, nil
	}

	return nil, "", fmt.Errorf("failed to load ABI: %w", lastErr)
}

// LoadOllaCoreABI loads the OllaCore ABI used to parse AccountingUpdated events.
func LoadOllaCoreABI() (*abi.ABI, error) {
	paths := []string{
		filepath.Join("../../", "packages/types/src/generated/abis/OllaCore.json"),
	}

	if customPath := os.Getenv("OLLACORE_ABI_PATH"); customPath != "" {
		paths = append([]string{customPath}, paths...)
	}

	var lastErr error
	for _, path := range paths {
		a, err := LoadABI(path)
		if err != nil {
			lastErr = err
			continue
		}
		return a, nil
	}

	return nil, fmt.Errorf("failed to load OllaCore ABI: %w", lastErr)
}

func GetEventSignatures() *EventSignatures {
	return &EventSignatures{
		Deposit:           crypto.Keccak256Hash([]byte("Deposit(address,address,uint256,uint256)")).Hex(),
		WithdrawalClaimed: crypto.Keccak256Hash([]byte("WithdrawalClaimed(uint256,address,uint256)")).Hex(),
		RedeemRequest:     crypto.Keccak256Hash([]byte("RedeemRequest(address,address,uint256,address,uint256)")).Hex(),
		// All 8 fields are non-indexed; canonical signature used for topic0 hash
		AccountingUpdated: crypto.Keccak256Hash([]byte("AccountingUpdated(uint256,uint256,uint256,int256,uint256,uint256,uint256,uint256)")).Hex(),
	}
}

func (s *EventSignatures) IsDeposit(topic string) bool {
	return strings.EqualFold(s.Deposit, topic)
}

func (s *EventSignatures) IsWithdrawalClaimed(topic string) bool {
	return strings.EqualFold(s.WithdrawalClaimed, topic)
}

func (s *EventSignatures) IsRedeemRequest(topic string) bool {
	return strings.EqualFold(s.RedeemRequest, topic)
}

func (s *EventSignatures) IsAccountingUpdated(topic string) bool {
	return strings.EqualFold(s.AccountingUpdated, topic)
}
