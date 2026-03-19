package models

import "fmt"

type NotFoundError struct {
	Resource string
	ID       string
}

func (e *NotFoundError) Error() string {
	return fmt.Sprintf("%s not found: %s", e.Resource, e.ID)
}

func NewNotFoundError(resource, id string) *NotFoundError {
	return &NotFoundError{Resource: resource, ID: id}
}

type DatabaseError struct {
	Operation string
	Table     string
	Err       error
}

func (e *DatabaseError) Error() string {
	return fmt.Errorf("database error during %s on %s: %w", e.Operation, e.Table, e.Err).Error()
}

func NewDatabaseError(operation, table string, err error) *DatabaseError {
	return &DatabaseError{Operation: operation, Table: table, Err: err}
}
