FROM golang:1.25-alpine AS builder

WORKDIR /var/tribetracker

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server/ ./

RUN go build -o /bin/tribetracker cmd/main.go

FROM alpine:latest AS runner

COPY --from=builder /bin/tribetracker /bin/tribetracker

RUN mkdir -p /var/tribetracker/data
VOLUME /var/tribetracker/data

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -q --spider http://localhost:80/api/health || exit 1

RUN adduser -D ttuser
RUN chown -R ttuser /bin/tribetracker /var/tribetracker/data
USER ttuser

EXPOSE 80

CMD ["tribetracker", "serve", "--http=0.0.0.0:80", "--dir=/var/tribetracker/data"]
