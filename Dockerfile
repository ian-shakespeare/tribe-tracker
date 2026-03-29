FROM golang:1.25-alpine AS builder

WORKDIR /var/lib/tribetracker

RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server/ ./

RUN ./scripts/generate.sh

RUN go build -o /bin/tribetracker cmd/main.go

FROM alpine:latest AS runner

ENV PORT 80

COPY --from=builder /bin/tribetracker /bin/tribetracker

RUN adduser -D ttuser

RUN mkdir -p /var/lib/tribetracker/data \
  && mkdir -p /var/lib/tribetracker/storage \
  && chown -R ttuser /bin/tribetracker \
    /var/lib/tribetracker \
    /var/lib/tribetracker/data \
    /var/lib/tribetracker/storage

VOLUME /var/lib/tribetracker

USER ttuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -q --spider http://localhost:80/api/health || exit 1

EXPOSE 80

CMD ["tribetracker"]
