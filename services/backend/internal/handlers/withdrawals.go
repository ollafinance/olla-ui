package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ollafinance/ui/services/backend/internal/database"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

type WithdrawalsHandler struct {
	store *database.Store
}

func NewWithdrawalsHandler(store *database.Store) *WithdrawalsHandler {
	return &WithdrawalsHandler{store: store}
}

// GetWithdrawals godoc
// @Summary Get withdrawals by address
// @Description Returns all withdrawal requests for a given owner address
// @Tags withdrawals
// @Accept json
// @Produce json
// @Param address path string true "Owner address"
// @Param status query string false "Filter by status (pending/completed)"
// @Param limit query int false "Limit" default(100)
// @Param offset query int false "Offset" default(0)
// @Success 200 {object} models.WithdrawalList
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /withdrawals/{address} [get]
func (h *WithdrawalsHandler) GetWithdrawals(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "address parameter is required"})
		return
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "100"))
	if err != nil || limit < 1 {
		limit = 100
	}
	if limit > 1000 {
		limit = 1000
	}

	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil || offset < 0 {
		offset = 0
	}

	var status *models.WithdrawalStatus
	statusStr := c.Query("status")
	if statusStr != "" {
		s := models.WithdrawalStatus(statusStr)
		status = &s
	}

	withdrawals, total, err := h.store.Withdrawals.GetByOwner(c.Request.Context(), address, status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"withdrawals": withdrawals,
		"total":       total,
	})
}

// GetPendingWithdrawals godoc
// @Summary Get pending withdrawals by address
// @Description Returns all pending withdrawal requests for a given owner address
// @Tags withdrawals
// @Accept json
// @Produce json
// @Param address path string true "Owner address"
// @Param limit query int false "Limit" default(100)
// @Param offset query int false "Offset" default(0)
// @Success 200 {object} models.WithdrawalList
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /withdrawals/{address}/pending [get]
func (h *WithdrawalsHandler) GetPendingWithdrawals(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "address parameter is required"})
		return
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "100"))
	if err != nil || limit < 1 {
		limit = 100
	}

	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil || offset < 0 {
		offset = 0
	}

	status := models.StatusPending
	withdrawals, total, err := h.store.Withdrawals.GetByOwner(c.Request.Context(), address, &status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"withdrawals": withdrawals,
		"total":       total,
	})
}
