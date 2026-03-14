---
name: deployment-plan
description: Docker deployment plan — frontend Nginx + backend JRE + PostgreSQL on single VPS
type: project
---

Docker deployment planı kurgulandı ve infra dosyaları oluşturuldu.

**Why:** Uygulamayı temel bir VPS'e taşımak için Docker Compose altyapısı hazırlandı.

**How to apply:** Yeni deploy/infra değişikliklerinde docs/deploy-plan.md'yi referans al.

Oluşturulan dosyalar:
- `frontend/Dockerfile` — multi-stage Node 22 → Nginx 1.27
- `frontend/nginx.conf` — SPA + /api/* proxy → backend:8080
- `frontend/.dockerignore`
- `backend/Dockerfile` — multi-stage Maven 3.9+JDK21 → JRE 21 Alpine
- `backend/.dockerignore`
- `infra/docker-compose.prod.yml` — 3 servis: db (PG17), backend, frontend
- `.env.example` — DB_USER/PASSWORD/NAME, JWT_SECRET, CORS_ALLOWED_ORIGINS
- `docs/deploy-plan.md` — tam deployment kılavuzu

Kritik kararlar:
- VITE_API_URL="" → Nginx proxy → CORS yok
- DB ve backend portu dışarıya kapalı — yalnızca Docker iç ağ
- `infra/init-full.sql` pg_dump'tan üretilmeli (otomatik değil)
- Hibernate validate — migrasyonlar manuel: `docker exec db psql < sql/VXX.sql`
- application.yml: `cors.allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173}`
