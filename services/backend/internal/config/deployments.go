package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Deployment struct {
	Network        string            `json:"network"`
	ChainID        int               `json:"chainId"`
	Deployer       string            `json:"deployer"`
	Addresses      map[string]string `json:"addresses"`
	StAztecName    string            `json:"stAztecName"`
	StAztecVersion string            `json:"stAztecVersion"`
	Status         DeploymentStatus  `json:"status"`
}

type DeploymentStatus struct {
	Phase          string          `json:"phase"`
	Completed      bool            `json:"completed"`
	UpdatedAtBlock int             `json:"updatedAtBlock"`
	Flags          map[string]bool `json:"flags"`
}

func LoadDeployment(env string) (*Deployment, error) {
	// Try relative path from backend directory or custom path from env
	// From services/backend, ../../ goes to repo root
	paths := []string{
		filepath.Join("../../", "packages/types/src/generated/deployments", env+".json"),
	}

	// Add custom path from env if set
	if customPath := os.Getenv("DEPLOYMENTS_PATH"); customPath != "" {
		paths = append([]string{filepath.Join(customPath, env+".json")}, paths...)
	}

	var lastErr error
	for _, path := range paths {
		if path == "" {
			continue
		}

		data, err := os.ReadFile(path)
		if err != nil {
			lastErr = err
			continue
		}

		var deployment Deployment
		if err := json.Unmarshal(data, &deployment); err != nil {
			lastErr = fmt.Errorf("failed to parse deployment file %s: %w", path, err)
			continue
		}

		return &deployment, nil
	}

	return nil, fmt.Errorf("failed to load deployment for env %s: %w", env, lastErr)
}

func (d *Deployment) OllaVaultAddress() (string, error) {
	addr, ok := d.Addresses["OllaVaultProxy"]
	if !ok {
		return "", fmt.Errorf("OllaVaultProxy address not found in deployment")
	}
	return addr, nil
}

func (d *Deployment) WithdrawalQueueAddress() (string, error) {
	addr, ok := d.Addresses["WithdrawalQueueProxy"]
	if !ok {
		return "", fmt.Errorf("WithdrawalQueueProxy address not found in deployment")
	}
	return addr, nil
}

func (d *Deployment) GetStartBlock(configuredBlock int64) (int64, error) {
	// If START_BLOCK is explicitly set to non--1 value, use it
	if configuredBlock > 0 {
		return configuredBlock, nil
	}

	// If START_BLOCK is 0, start from latest (returned as -1 to signal "latest")
	if configuredBlock == 0 {
		return 0, nil
	}

	// START_BLOCK is -1, use updatedAtBlock from deployment
	if d.Status.UpdatedAtBlock > 0 {
		return int64(d.Status.UpdatedAtBlock), nil
	}

	// No block in deployment, start from 0
	return 0, nil
}

func (d *Deployment) GetChainID() int {
	return d.ChainID
}
