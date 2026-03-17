package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ollafinance/ui/services/backend/internal/database"
)

type DepositsHandler struct {
	store *database.Store
}

func NewDepositsHandler(store *database.Store) *DepositsHandler {
	return &DepositsHandler{store: store}
}

// GetDeposits godoc
// @Summary Get deposits by address
// @Description Returns all deposits for a given recipient address
// @Tags deposits
// @Accept json
// @Produce json
// @Param address path string true "Recipient address"
// @Param limit query int false "Limit" default(100)
// @Param offset query int false "Offset" default(0)
// @Success 200 {object} models.DepositList
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /deposits/{address} [get]
func (h *DepositsHandler) GetDeposits(c *gin.Context) {
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

	deposits, total, err := h.store.Deposits.GetByRecipient(c.Request.Context(), address, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"deposits": deposits,
		"total":    total,
	})
}

type ErrorResponse struct {
	Error string `json:"error"`
}
