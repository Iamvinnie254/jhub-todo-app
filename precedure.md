# JHUB Todo App

A full-stack todo list application with JWT authentication, built with Next.js on the frontend and Express.js on the backend, connected to a PostgreSQL database via Drizzle ORM.

---

## Tech Stack

### Frontend (`todo-client`)

| Technology                   | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| Next.js 15 (App Router)      | React framework, routing, SSR                |
| TypeScript                   | Type safety                                  |
| Tailwind CSS                 | Utility-first styling                        |
| shadcn/ui                    | Pre-built accessible UI components           |
| TanStack Query (React Query) | Server state management, caching, refetching |
| Axios                        | HTTP client with interceptors for auth       |

### Backend (`todo-server`)

| Technology                       | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| Express.js                       | HTTP server and routing                           |
| Drizzle ORM                      | Type-safe database queries and schema management  |
| PostgreSQL                       | Relational database                               |
| `pg` (node-postgres)             | PostgreSQL driver                                 |
| JSON Web Tokens (`jsonwebtoken`) | Stateless authentication                          |
| bcryptjs                         | Password hashing                                  |
| Zod                              | Request body validation                           |
| `express-async-errors`           | Automatic async error forwarding to error handler |
| dotenv                           | Environment variable loading                      |
| morgan                           | HTTP request logging                              |
| cors                             | Cross-origin resource sharing                     |

---

## Project Structure

```
jhub-todo-app/
├── todo-client/                  # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout with Providers
│   │   │   ├── page.tsx          # Redirects to /login
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── TodoForm.tsx      # Create todo form
│   │   │   └── TodoItem.tsx      # Single todo card
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Auth state + login/register/logout
│   │   ├── hooks/
│   │   │   └── useTodos.ts       # TanStack Query hooks for CRUD
│   │   └── lib/
│   │       ├── axios.ts          # Axios instance + interceptors
│   │       └── Providers.tsx     # QueryClient + AuthProvider wrapper
│   └── .env.local
│
└── todo-server/                  # Express backend
    ├── src/
    │   ├── db/
    │   │   ├── index.js          # Drizzle client + pg Pool
    │   │   └── schema.js         # Table definitions
    │   ├── middleware/
    │   │   └── auth.js           # JWT verify middleware
    │   ├── routes/
    │   │   ├── auth.js           # /api/auth routes
    │   │   └── todos.js          # /api/todos routes
    │   └── validators/
    │       └── index.js          # Zod schemas
    ├── drizzle/                  # Auto-generated migration files
    ├── drizzle.config.js
    ├── app.js                    # Express app entry point
    └── .env
```

---

## Database Schema

### `users`

| Column          | Type      | Notes                       |
| --------------- | --------- | --------------------------- |
| `id`            | UUID      | Primary key, auto-generated |
| `email`         | TEXT      | Unique, not null            |
| `password_hash` | TEXT      | bcrypt hash, not null       |
| `created_at`    | TIMESTAMP | Defaults to now             |

### `todos`

| Column        | Type      | Notes                                          |
| ------------- | --------- | ---------------------------------------------- |
| `id`          | UUID      | Primary key, auto-generated                    |
| `user_id`     | UUID      | Foreign key → `users.id`, cascade delete       |
| `title`       | TEXT      | Not null                                       |
| `description` | TEXT      | Optional                                       |
| `due_date`    | TIMESTAMP | Optional                                       |
| `priority`    | ENUM      | `low`, `medium`, `high` — defaults to `medium` |
| `completed`   | BOOLEAN   | Defaults to `false`                            |
| `created_at`  | TIMESTAMP | Defaults to now                                |
| `updated_at`  | TIMESTAMP | Defaults to now, updated on every PATCH        |

---

## Environment Variables

### `todo-server/.env`

```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/jhub_todo_app_db
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
PORT=5000
```

### `todo-client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Setup & Commands

### Prerequisites

- Node.js v18+
- PostgreSQL running locally
- Bun (optional, used for package installation)

### 1. Create the database

```bash
psql -U postgres -h localhost -p 5432 -d postgres
```

```sql
CREATE DATABASE jhub_todo_app_db;
\q
```

### 2. Backend setup

```bash
cd todo-server

# Install dependencies
bun add express-async-errors cors dotenv bcryptjs jsonwebtoken zod
bun add drizzle-orm pg
bun add -d drizzle-kit @types/bcryptjs @types/jsonwebtoken @types/cors @types/pg

# Generate and run migrations
bunx drizzle-kit generate
bunx drizzle-kit migrate

# Start the server (runs on port 5000)
npm run dev
```

### 3. Frontend setup

```bash
cd todo-client

# Install dependencies
bun add axios @tanstack/react-query
bun add -d @tanstack/react-query-devtools

# Initialise shadcn
bunx shadcn@latest init

# Add UI components
bunx shadcn@latest add button input label card badge dialog select checkbox

# Start the dev server (runs on port 3000)
bun run dev
```

### 4. Run both servers simultaneously

Open two terminals:

```bash
# Terminal 1 — backend
cd todo-server && npm run dev

# Terminal 2 — frontend
cd todo-client && bun run dev
```

Then open `http://localhost:3000`.

---

## API Endpoints

Base URL: `http://localhost:5000/api`

All `/todos` endpoints require an `Authorization: Bearer <token>` header.

---

### Auth

#### `POST /api/auth/register`

Registers a new user and returns a JWT.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `201`:**

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "3732cb8c-5b13-4b10-8d06-5bbf3a44e1c6",
    "email": "user@example.com"
  }
}
```

**Errors:**

- `400` — validation failed (invalid email, password too short)
- `409` — email already in use

---

#### `POST /api/auth/login`

Authenticates an existing user and returns a JWT.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `200`:**

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "3732cb8c-5b13-4b10-8d06-5bbf3a44e1c6",
    "email": "user@example.com"
  }
}
```

**Errors:**

- `400` — validation failed
- `401` — invalid credentials

---

### Todos

All todo endpoints verify the JWT and scope results to the authenticated user — users can only see and modify their own todos.

#### `GET /api/todos`

Returns all todos for the authenticated user, ordered by most recently created.

**Response `200`:**

```json
[
  {
    "id": "a1b2c3d4-...",
    "userId": "3732cb8c-...",
    "title": "Buy groceries",
    "description": "Milk and eggs",
    "dueDate": "2026-07-10T10:00:00.000Z",
    "priority": "high",
    "completed": false,
    "createdAt": "2026-06-30T10:00:00.000Z",
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
]
```

---

#### `POST /api/todos`

Creates a new todo for the authenticated user.

**Request body:**

```json
{
  "title": "Buy groceries",
  "description": "Milk and eggs",
  "dueDate": "2026-07-10T10:00:00.000Z",
  "priority": "high"
}
```

Only `title` is required. `priority` defaults to `"medium"` if omitted.

**Response `201`:**

```json
{
  "id": "a1b2c3d4-...",
  "userId": "3732cb8c-...",
  "title": "Buy groceries",
  "description": "Milk and eggs",
  "dueDate": "2026-07-10T10:00:00.000Z",
  "priority": "high",
  "completed": false,
  "createdAt": "2026-06-30T10:00:00.000Z",
  "updatedAt": "2026-06-30T10:00:00.000Z"
}
```

**Errors:**

- `400` — validation failed (missing title, invalid priority)
- `401` — missing or invalid token

---

#### `PATCH /api/todos/:id`

Partially updates a todo. All fields are optional — send only what you want to change.

**Request body (any combination):**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2026-08-01T10:00:00.000Z",
  "priority": "low",
  "completed": true
}
```

**Response `200`:** Returns the updated todo object.

**Errors:**

- `400` — validation failed
- `401` — missing or invalid token
- `404` — todo not found or belongs to a different user

---

#### `DELETE /api/todos/:id`

Deletes a todo. Only succeeds if the todo belongs to the authenticated user.

**Response `204`:** No content.

**Errors:**

- `401` — missing or invalid token
- `404` — todo not found or belongs to a different user

---

## How Auth Works End to End

1. User registers or logs in → server hashes password with bcrypt, signs a JWT with `jsonwebtoken`, returns token.
2. Frontend stores token in `localStorage`.
3. Axios request interceptor reads the token from `localStorage` and attaches it as `Authorization: Bearer <token>` on every outgoing request.
4. Express `authenticate` middleware on all `/api/todos` routes calls `jwt.verify()` — if valid, attaches `req.user` (contains `sub` = user ID) and calls `next()`.
5. If the token is missing, expired, or tampered with, the middleware returns `401` immediately.
6. Axios response interceptor catches any `401` response, clears the token from `localStorage`, and redirects to `/login`.
7. On logout, the frontend clears `localStorage` and redirects — no server call needed since JWTs are stateless.

---

## How TanStack Query Works in the App

| Hook              | Query key   | What it does                                       |
| ----------------- | ----------- | -------------------------------------------------- |
| `useTodos()`      | `['todos']` | Fetches all todos on mount, caches for 30s         |
| `useCreateTodo()` | —           | POSTs new todo, invalidates `['todos']` on success |
| `useUpdateTodo()` | —           | PATCHes a todo, invalidates `['todos']` on success |
| `useDeleteTodo()` | —           | DELETEs a todo, invalidates `['todos']` on success |

Invalidating the `['todos']` query key after every mutation triggers an automatic refetch, keeping the UI in sync with the server without manual state management.
