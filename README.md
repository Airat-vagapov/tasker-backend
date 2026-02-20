# Tasker Backend

## Environment switch (Local <-> Supabase)

Default `.env` is now local PostgreSQL.

Switch to local:

```bash
npm run env:use-local
```

Switch to Supabase:

```bash
npm run env:use-supabase
```

Then restart backend (`npm run dev` or `npm start`).

## Docker (backend + local Postgres)

### 1) Start services

```bash
npm run docker:up
```

This command builds and starts:
- `backend` on `http://localhost:8080`
- `postgres` on `localhost:5432`

### 2) Check API

- Tasks: `http://localhost:8080/tasks?page=1&limit=20`
- Swagger: `http://localhost:8080/api-docs`
- Auth register: `POST http://localhost:8080/auth/register`
- Auth login: `POST http://localhost:8080/auth/login`

### 3) View backend logs

```bash
npm run docker:logs
```

### 4) Stop services

```bash
npm run docker:down
```

### 5) Remove services and database volume

```bash
docker compose --env-file .env.docker down -v
```

## Docker environment file

Docker Compose uses `/Users/airatvagapov/Development/My_projects/tasker-backend/.env.docker`:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

`DB_URL`, `PORT`, `DB_BOOTSTRAP=true`, and `DB_SSL=false` are defined directly in `docker-compose.yml` for the backend service.

## Auth flow (JWT + Refresh Cookie)

1. Register user:

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin12345","role":"admin"}'
```

2. Login and store cookie:

```bash
curl -i -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin12345"}' \
  -c cookies.txt
```

3. Refresh access token using cookie:

```bash
curl -X POST http://localhost:8080/auth/refresh -b cookies.txt -c cookies.txt
```

4. Logout (invalidates refresh session):

```bash
curl -X POST http://localhost:8080/auth/logout -b cookies.txt
```

## Role policy for tasks

- `GET /tasks`, `GET /task/:id`, `GET /tasks/status`, `GET /tasks/stats`: `user` or `admin`
- `POST /task`, `POST /task/:id`, `DELETE /task/:id`: `admin`
