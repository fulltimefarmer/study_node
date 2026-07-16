# study_node

A Node.js REST API learning project built with Express, TypeScript, and Zod. It provides a simple user management API backed by an in-memory data store.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **Validation:** Zod
- **Dev tooling:** tsx (hot reload), tsc (build)

## Project Structure

```
src/
├── index.ts                    # App entry point
├── controllers/
│   └── user.controller.ts      # User CRUD handlers
├── routes/
│   └── user.routes.ts          # /api/users routes
├── middleware/
│   ├── validate.middleware.ts  # Zod request validation
│   └── error.middleware.ts     # 404 and global error handling
└── types/
    └── user.ts                 # User types and Zod schemas
```

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
npm install
```

### Development

Start the dev server with hot reload:

```bash
npm run dev
```

The server runs at `http://localhost:3000`.

### Build & Production

```bash
npm run build
npm start
```

## API Reference

Base path: `/api/users`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get a user by ID |
| `POST` | `/api/users` | Create a user |
| `PUT` | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

### Create User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "age": 22
  }'
```

**Validation rules:**

- `username` — string, 2–20 characters
- `email` — valid email address
- `age` — optional integer, 1–120

### Update User

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_updated"
  }'
```

All fields are optional on update.

### Validation Error Response

```json
{
  "code": 400,
  "message": "参数校验失败",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}
```

## Notes

- Data is stored in memory and resets when the server restarts.
- A default user (`admin`) is seeded on startup.
