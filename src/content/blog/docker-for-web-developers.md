Docker for web developers comes down to one promise: your app runs the same way on your laptop, your teammate's laptop, and the server. In this guide I'll containerize a full-stack setup step by step, with a multi-stage Dockerfile for a Node.js API, a `.dockerignore`, and a `docker-compose.yml` that runs the API alongside PostgreSQL with a persistent volume and healthchecks.

## The Mental Model

Three terms are enough to get started:

- **Image:** a read-only template containing your app, its dependencies and a minimal OS. Built from a `Dockerfile`.
- **Container:** a running instance of an image. You can start many containers from one image.
- **Volume:** storage that lives outside the container, so data survives when containers are removed.

Docker Compose ties several containers together (API, database, cache) with one file and one command.

## The Example App

A Node.js API written in TypeScript, compiled to `dist/`, that talks to Postgres. The `package.json` has these scripts:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

The API needs a health endpoint, and it must listen on all interfaces, not just localhost:

```ts
// src/server.ts
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on port ${port}`);
});
```

## A Multi-Stage Dockerfile

Multi-stage builds let you compile with all your dev dependencies, then ship a final image with only what's needed at runtime. Smaller image, fewer packages, smaller attack surface.

```dockerfile
# Stage 1: install all dependencies (including dev)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: compile TypeScript
FROM deps AS build
COPY . .
RUN npm run build

# Stage 3: minimal runtime image
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Why it's written this way:

- **`COPY package*.json` before `COPY . .`**: Docker caches each layer. Dependencies only reinstall when the lockfile changes, not on every code edit.
- **`npm ci`** installs exactly what's in the lockfile, which is what you want for reproducible builds.
- **`--omit=dev`** keeps TypeScript, test runners and linters out of production.
- **`USER node`**: the official Node image ships a non-root user. Use it.
- **`CMD ["node", ...]`** instead of `npm start`: Node receives the `SIGTERM` signal directly when the container stops, so it can shut down cleanly.

## .dockerignore

Without this, `COPY . .` sends your local `node_modules`, `.git` folder and `.env` file into the build. That's slow at best, and a leaked secret at worst.

```bash
node_modules
dist
.git
.env
.env.*
npm-debug.log
Dockerfile
docker-compose*.yml
coverage
.vscode
```

## docker-compose.yml: API + Postgres

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://app:${POSTGRES_PASSWORD}@db:5432/app
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 10s
    restart: unless-stopped

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

Key points:

- **The hostname is `db`**, the service name. Inside the Compose network, containers reach each other by service name. `localhost` inside the API container means the API container itself.
- **`depends_on` with `condition: service_healthy`** waits until Postgres actually accepts connections, not just until its container has started.
- **The `pgdata` named volume** keeps your data when you run `docker compose down` and rebuild.
- **The database has no `ports` entry.** The API can reach it on the internal network, and it isn't exposed to the outside world. Add `"5432:5432"` only in development if you want to connect with a local GUI.
- **Pin image versions.** `postgres:17-alpine`, not `postgres:latest`. Major Postgres upgrades need a data migration. If you move to Postgres 18, check the image docs first, because the recommended volume mount path changed.

## Environment Variables

Compose automatically reads a `.env` file in the same folder and substitutes `${POSTGRES_PASSWORD}`:

```bash
# .env (never commit this)
POSTGRES_PASSWORD=change-me-to-something-long
```

Commit a `.env.example` with placeholder values so others know what's required. For production, inject secrets through your hosting platform or Docker secrets, not a file on the server that anyone with access can read.

Now run everything:

```bash
docker compose up -d --build
docker compose ps          # shows health status
docker compose logs -f api # follow API logs
```

## Development vs Production

The production setup above runs compiled code. For development, you want hot reload against your local files. I keep a small override file:

```yaml
# docker-compose.dev.yml
services:
  api:
    build:
      context: .
      target: deps
    command: npm run dev
    environment:
      NODE_ENV: development
    volumes:
      - .:/app
      - /app/node_modules
  db:
    ports:
      - "5432:5432"
```

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

`target: deps` stops the build at the first stage, which has dev dependencies installed. The bind mount `.:/app` maps your source code into the container, and the anonymous volume `/app/node_modules` stops your host folder from hiding the container's installed packages.

| | Development | Production |
|---|---|---|
| Build target | `deps` stage | `runtime` stage |
| Code | Bind-mounted, hot reload | Copied into the image |
| Dependencies | All, including dev | Production only |
| Database port | Exposed for local tools | Internal only |
| Secrets | Local `.env` | Platform secrets manager |

## Common Mistakes

1. **Using `localhost` in `DATABASE_URL`.** Use the service name (`db`).
2. **Binding the server to `127.0.0.1`.** The app is then unreachable from outside the container. Listen on `0.0.0.0`.
3. **No `.dockerignore`.** Slow builds, bloated images and possibly your `.env` baked into an image.
4. **Copying all source before installing dependencies.** Every code change triggers a full `npm ci`.
5. **Running as root.** Add `USER node`.
6. **No volume for the database.** Your data disappears with the container.
7. **Running `docker compose down -v` casually.** The `-v` flag deletes named volumes, including your database.
8. **Using `depends_on` without a healthcheck.** The API starts before Postgres is ready and crashes on its first query.

## FAQ

### Do I need Docker for web development?

Not strictly, but it removes "works on my machine" problems, makes onboarding a one-command setup, and gives you the same environment in development and production. For anything with a database, I consider it worth it.

### What is the difference between Docker and Docker Compose?

Docker builds and runs individual containers. Docker Compose defines and runs a multi-container application, such as an API, database and cache, from a single YAML file.

### Should I run my database in Docker in production?

It works fine for small projects on a single server, as long as you use volumes and back them up. For anything business-critical, I usually recommend a managed database so backups, failover and upgrades are handled for you, and keep Docker for the application containers.

### Why use multi-stage builds?

They let you compile with build tools, then copy only the output into a clean final image. The result is smaller, faster to deploy, and doesn't ship compilers or dev dependencies to production.

If you'd like help containerizing an existing app or setting up a clean deployment pipeline, [get in touch](/contact).
