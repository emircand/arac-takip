# arac-takip

Atık toplama şirketi için araç filo yönetim sistemi. Sefer, yakıt, arıza, belge ve stok takibi.

## Stack

- **Frontend:** React 19 + Vite 7 + Tailwind 4 + MUI 7 → `frontend/` (port 5173)
- **Backend:** Spring Boot 3.4.3 + Java 21 + Spring Security/JWT → `backend/` (port 8080)
- **DB:** PostgreSQL 17 (port 5432), Hibernate `validate` mode — tüm şema SQL ile yönetilir

## Project Structure

```
frontend/src/
├── pages/          # Route-level components
├── components/     # Reusable UI
├── services/       # API call functions → apiClient.js
└── context/        # Auth context

backend/src/main/java/com/aractakip/
├── {domain}/
│   ├── {Entity}.java
│   ├── {Entity}Repository.java
│   ├── {Entity}Service.java
│   ├── {Entity}Controller.java
│   └── dto/
├── config/         # Security, CORS, Jackson
└── common/         # ApiResponse<T>, exceptions
```

## Key Commands

```bash
# Backend
cd backend && ./mvnw spring-boot:run
./mvnw test

# Frontend
cd frontend && npm run dev
npm run build

# Database
psql -U aractakip -d aractakip -f sql/migration.sql
```

## Critical Conventions

- DB schema changes: **always SQL** — never Hibernate auto-DDL
- All API responses wrapped in `ApiResponse<T>` (`success`, `data`/`message`)
- Jackson SNAKE_CASE: Java camelCase → JSON snake_case automatic
- JWT token stored in `localStorage` as `filo_token`
- Frontend services use `apiClient.js` — single fetch entry point
- GENERATED columns (`km`, `sfr_suresi`) — never set from app code
- Views depend on `tonaj` column — drop/recreate on schema changes

## Context Docs (read when relevant)

- `@docs/summary.md` — Full system overview, DB model, business rules
- `@docs/faz0-plan.md` — FAZ 0 implementation plan (Phase 1–4)
- `@docs/mvp-plan.md` — Full MVP roadmap (6 phases)
- `@docs/db-schema.md` — Table definitions and relationships
- `@docs/api-reference.md` — Endpoint inventory
- `@docs/is-kurallari.md` — Business rules (KM chain, belge durum, yakıt anomali)

## Verification

After any backend change: `./mvnw test`
After any frontend change: `npm run build`
After any SQL change: restart backend — Hibernate validate will catch mismatches
