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

## Docker: apply backend/db changes

If you changed backend code (including DB bootstrap in `src/config/db.js`), rebuild backend container:

```bash
docker compose --env-file .env.docker up -d --build backend
```

Check backend logs (bootstrap should run without errors):

```bash
docker compose --env-file .env.docker logs -f backend
```

If you need a clean database from scratch:

```bash
docker compose --env-file .env.docker down -v
docker compose --env-file .env.docker up -d --build
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
  -d '{"username":"admin","password":"admin12345","firstName":"Admin","lastName":"User","role":"admin"}'
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

## Frontend integration guide

Base URL:

- `http://localhost:8080`

Auth endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Register request body:

```json
{
  "username": "admin",
  "password": "admin12345",
  "firstName": "Admin",
  "lastName": "User",
  "role": "user"
}
```

Login request body:

```json
{
  "username": "admin",
  "password": "admin12345"
}
```

Login success response:

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "user",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

Important for frontend:

- Send login/refresh/logout requests with credentials (`withCredentials: true` in Axios or `credentials: "include"` in fetch).
- `refreshToken` is stored in `HttpOnly` cookie (frontend cannot read it directly).
- Store only `accessToken` client-side (memory or secure storage strategy used in your app).
- Send API requests with header: `Authorization: Bearer <accessToken>`.

## Recommended frontend auth flow

1. Registration:
   Send `POST /auth/register` with `username`, `password`, `firstName`, `lastName`, optional `role`.
2. Login:
   Send `POST /auth/login` with credentials and `credentials: "include"`.
   Save `accessToken` from response and user profile in app state.
3. Authorized API calls:
   Add `Authorization: Bearer <accessToken>` to protected requests.
4. Auto refresh:
   If protected request returns `401`, call `POST /auth/refresh` with credentials included.
   If refresh is successful, update `accessToken` and retry original request once.
5. Session bootstrap on page reload:
   If no `accessToken` in memory, call `POST /auth/refresh` once on app startup.
   If success, continue as authenticated user; if fail, route to login.
6. Logout:
   Call `POST /auth/logout` with credentials included, clear local auth state, redirect to login.

## Role policy for tasks

- `GET /tasks`, `GET /task/:id`, `GET /tasks/status`, `GET /tasks/stats`: `user` or `admin`
- `POST /task`, `POST /task/:id`, `DELETE /task/:id`: `admin`
