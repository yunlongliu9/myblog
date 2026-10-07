version 1.1

# Deployment
Internet
   ↓
Nginx
   ├── /      → Next.js

   └── /api   → NestJS
                    ↓
                PostgreSQL


# frontend - next.js
Next.js
   ↕ REST
NestJS
   ↓
Drizzle
   ↓
PostgreSQL
Docker Compose

# backend - NestJS
Controller
    ↓
Service
    ↓
Repository
    ↓
Drizzle
    ↓
PostgreSQL

### later:
Auth
Rate Limiting
Redis
Queues
Observability
AI Service

# docs and data storage
PostgreSQL
    → users
    → subscription
    → comments
    → likes
    → post metadata

MDX
    → technical notes
    → FAU course notes
    → learning routes
    → my own articles about life and work


# technical stacks

Frontend       Next.js + React + TypeScript
UI             Tailwind CSS + shadcn/ui

Backend        NestJS + TypeScript
API            REST + OpenAPI
Validation     Zod

ORM            Drizzle ORM
Database       PostgreSQL

Content        MDX + PostgreSQL mixed

Repository     Monorepo
Workspace      pnpm Workspaces
Build          Turborepo

Infrastructure Docker + Docker Compose
Reverse Proxy  Nginx
CI/CD          GitHub Actions
Hosting        Hetzner VPS

Later:
Auth / User / Subscription / Redis / AI / pgvector

# modules later
+ User
+ Subscription
+ Comment
+ Like
+ Admin
+ Redis
+ AI
+ pgvector