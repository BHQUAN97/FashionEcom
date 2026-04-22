# ADR-0008: Docker isolated port (FE 5300 host → 3300 container)

- **Status**: accepted
- **Date**: 2026-04-12
- **Tags**: infra, ports

## Context

Per-project port range 5300-5399 (CROSS-0002). Nhung trong container Next.js default port 3000. Neu **map** 5300:3000 thi internal env `PORT=3000`, ngoai dev local goi 5300.

Nhung dev local chay `npm run dev` Next.js mac dinh 3000 → conflict voi ai-orchestrator (port 3000 = Hermes).

## Decision

Dung 2 port rieng:
- **Dev local**: `npm run dev -p 5300` → Next.js serve tai 5300 truc tiep (khong docker)
- **Production container**: `docker-compose.prod.yml` map `5300:3300` → container INTERNAL listen 3300, host expose 5300

### Backend
- Container INTERNAL: 5301 (Nest default configurable)
- Host: 5301 (dev + prod dong nhat)

### .env
```
PORT=5300          # FE dev
NEXT_PUBLIC_PORT=5300
INTERNAL_FE_PORT=3300  # prod container listen
BE_PORT=5301
```

### docker-compose.prod.yml
```yaml
services:
  frontend:
    ports:
      - "5300:3300"
    environment:
      - PORT=3300
```

## Rationale

- Dev local khong conflict Hermes (3000)
- Prod expose 5300 consistent voi CROSS-0002
- Container isolation: internal port khong affect host

## Consequences

### Tich cuc
- 0 conflict voi project khac
- Dev va prod cung expose 5300 → URL khong doi

### Tieu cuc
- Them 1 env var (INTERNAL_FE_PORT)
- Can giao tiep giua FE-BE qua INTERNAL_API_URL

## References

- Related: CROSS-0002 (port allocation)
- `docker-compose.yml`, `docker-compose.prod.yml`
