# Project flowcharts

Visual reference for the main API, Docker, and CI/CD flows.

## 1. HTTP request flow (API)

```mermaid
flowchart TD
    A[HTTP client<br/>Postman / Swagger / App] --> B{Route}
    B -->|GET /status| C[Health check]
    B -->|/api/docs| D[Swagger UI]
    B -->|/api/auth| E[Auth routes]
    B -->|/api/user or /api/post| F[Auth middleware]

    E --> G[Controller]
    F -->|Missing or invalid Bearer| H[401 Unauthorized]
    F -->|Valid Bearer| I{Role middleware?}
    I -->|Forbidden| J[403 Forbidden]
    I -->|Allowed or not required| G

    G --> K[Service]
    K --> L[Repository]
    L --> M[(MySQL via Prisma)]
    M --> L --> K --> G --> N[JSON response]

    G -->|Domain error| O[CodedApiError]
    O --> P[errorHandler]
    P --> Q[Standard error JSON]

    B -->|Unknown route| R[404 NOT_FOUND]
    R --> P
```

## 2. Authentication flow (login → API usage)

```mermaid
flowchart LR
    A[POST /api/auth/login] --> B[Validate email and password]
    B -->|Invalid| C[401]
    B -->|OK| D[Generate JWT]
    D --> E[Persist AuthToken]
    E --> F[Return token to client]
    F --> G[Later requests<br/>Authorization: Bearer ...]
    G --> H[Middleware validates JWT and DB token]
    H -->|Expired or missing token| I[401]
    H -->|OK| J[Continue to controller]
```

## 3. Multi-stage Dockerfile build

```mermaid
flowchart TD
    subgraph builder["Stage 1 — builder (node:22-alpine)"]
        B1[COPY package*.json + prisma + prisma.config.ts]
        B2[npm ci]
        B3[npx prisma generate]
        B1 --> B2 --> B3
    end

    subgraph runner["Stage 2 — runner (node:22-alpine)"]
        R1[Create non-root nodejs user]
        R2[COPY node_modules and prisma from builder]
        R3[COPY src]
        R4[USER nodejs]
        R5[CMD node src/server.js]
        R1 --> R2 --> R3 --> R4 --> R5
    end

    builder --> runner
    runner --> IMG[Production image]
    IMG --> RUN[Runtime: inject JWT_SECRET and MYSQL_*]
    RUN --> APP[API listening on :3000]
```

The `builder` stage installs dependencies and generates the Prisma Client.  
The `runner` stage keeps only runtime artifacts, runs as a non-root user, and does not embed secrets in the image.

## 4. GitHub Actions pipelines

```mermaid
flowchart TD
    P[Push or Pull Request to main] --> CI
    P --> DK

    subgraph CI["CI workflow — ci.yml"]
        C1[checkout]
        C2[setup-node 22]
        C3[npm ci]
        C4[prisma generate]
        C5[validate OpenAPI]
        C6[npm test]
        C7[coverage + upload-artifact]
        C1 --> C2 --> C3 --> C4 --> C5 --> C6 --> C7
    end

    subgraph DK["Docker workflow — docker.yml"]
        D1[checkout]
        D2[setup-buildx]
        D3["docker build (push: false)"]
        D1 --> D2 --> D3
    end

    CI -->|failure| F1[CI failed]
    CI -->|success| OK1[Code validated]
    DK -->|failure| F2[Docker build failed]
    DK -->|success| OK2[Image builds successfully]
```

## 5. Docker Compose (local)

```mermaid
flowchart LR
    DEV[Developer] --> COMPOSE[docker compose up]
    COMPOSE --> DB[(MySQL 8<br/>db service)]
    COMPOSE --> APP[API<br/>app service]
    APP -->|MYSQL_HOST=db| DB
    APP -->|env_file .env| SECRETS[JWT and DB credentials]
    DEV -->|localhost:3000| APP
```
