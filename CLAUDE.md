# arac-takip

Fleet management app for waste collection companies.
Monorepo: frontend/ (React 19+Vite+Tailwind) + backend/ (Spring Boot 3.4+JWT) + PostgreSQL 16.

## EVERY SESSION — DO THIS FIRST
1. Read `docs/MODULES.md` — find current module, check status
2. If module has plan → read `plans/module{N}_plan.md`
3. Work only on the active module
4. Update status in MODULES.md when done

## READ RULE
Read only the section relevant to your task. Skip the rest.

## ROLES
- `saha`: create trips + manage definitions
- `yonetici`: saha + dashboard + user management

## PROJECT LAYOUT
```
arac-takip/
├── frontend/src/
│   ├── contexts/AuthContext.jsx
│   ├── lib/apiClient.js           # ALL api calls go here
│   ├── services/                  # one file per domain
│   ├── components/
│   └── pages/
├── backend/src/main/java/com/aractakip/
│   ├── config/
│   ├── common/
│   └── {domain}/
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── nginx/nginx.conf
├── plans/                         # module implementation plans
├── docs/
│   ├── SCHEMA.md
│   ├── API.md
│   ├── RULES.md
│   ├── STANDARDS.md
│   └── MODULES.md
└── CLAUDE.md
```

## DOCS
- Schema:    `docs/SCHEMA.md`
- API:       `docs/API.md`
- Rules:     `docs/RULES.md`
- Standards: `docs/STANDARDS.md`
- Modules:   `docs/MODULES.md`
- Plans:     `plans/module{N}_plan.md`

## CURRENT: Module 5 — Document Tracking
Plan: `plans/module5_plan.md`
