# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git make

COPY go.mod go.sum ./
RUN go mod download

# Install tern migration tool
RUN go install github.com/jackc/tern/v2/cmd/tern@v2.2.5

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o bin/server ./cmd/main.go

# Runtime stage
FROM alpine:3.19

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/bin/server .
COPY --from=builder /go/bin/tern .
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/tern.conf .

EXPOSE 8080

CMD ["./server"]
