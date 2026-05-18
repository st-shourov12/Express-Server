# Express Server

A RESTful API server built with **Express.js** and **TypeScript**, backed by **PostgreSQL on NeonDB** (serverless), and deployed on **Vercel**.

🌐 **Live:** [express-server-eta-two.vercel.app](https://express-server-eta-two.vercel.app/)
📁 **GitHub:** [st-shourov12/Express-Server](https://github.com/st-shourov12/Express-Server)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (ESNext modules) |
| Framework | Express.js |
| Database | PostgreSQL — NeonDB (serverless) |
| Deployment | Vercel |
| Dev Runner | tsx (hot reload) |

---

## Project Structure

```
Express-Server/
├── src/
│   ├── server.ts       # Main entry point
│   └── config.ts       # DB config (reads from env)
├── .env                # Environment variables — never commit this
├── tsconfig.json       # TypeScript compiler config
├── package.json        # Dependencies and scripts
└── vercel.json         # Vercel deployment config
```

---

## Step-by-Step Setup

### Step 1 — Initialise the project

```bash
npm init --y
```

### Step 2 — Install TypeScript

```bash
npm i -D typescript
npx tsc --init
```

### Step 3 — Configure `tsconfig.json`

Open `tsconfig.json` and make these changes:

- Uncomment and set `"rootDir": "./src"` and `"outDir": "./dist"`
- Set `"module": "esnext"`
- Add `"node"` to the `types` array
- Comment out or remove the `jsx` option

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "types": ["node"],
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Step 4 — Add `"type": "module"` to `package.json`

```json
{
  "name": "express-server",
  "version": "1.0.0",
  "type": "module"
}
```

### Step 5 — Install Express and its types

```bash
npm install express --save
npm i --save-dev @types/express
```

### Step 6 — Install `tsx` for development

`tsx` runs TypeScript files directly without compiling first, enabling hot reload.

```bash
npm i -D tsx
```

Add scripts to `package.json`:

```json
"scripts": {
  "dev": "tsx watch ./src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

### Step 7 — Set up NeonDB

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Go to **Connection Details** → select **Pooled connection** → copy the URL
4. Optionally initialise via CLI:

```bash
npx neonctl@latest init
```

### Step 8 — Install `pg` and its types

```bash
npm i pg
npm i --save-dev @types/pg
```

### Step 9 — Configure environment variables

Create a `.env` file in the project root. **Never commit this file.**

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require&uselibpqcompat=true
```

Install dotenv:

```bash
npm i dotenv
```

> ⚠️ **Important:** Call `dotenv.config()` at the very top of `server.ts`, before any other imports that depend on `process.env`.

### Step 10 — Write the server

Create `src/server.ts`:

```typescript
import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express, { type Application, type Request, type Response } from "express";
import { Pool } from "pg";

const app: Application = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100),
        email      VARCHAR(100) NOT NULL,
        password   VARCHAR(100) NOT NULL,
        is_active  BOOLEAN DEFAULT true,
        age        INT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Database ready");
  } catch (error) {
    console.error(error);
  }
};

initDB();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Express server", author: "Shourov" });
});

app.post("/", async (req: Request, res: Response) => {
  const { name, email } = req.body;
  res.status(200).json({ message: "Data Created", data: { name, email } });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

## API Reference

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/` | Health check — returns server info | — |
| `POST` | `/` | Echo user data back | `{ name, email }` |

### Example responses

**GET /**
```json
{
  "message": "Express server",
  "author": "Shourov"
}
```

**POST /**
```json
{
  "message": "Data Created",
  "data": {
    "name": "Shourov",
    "email": "shourov@example.com"
  }
}
```

---

## Database Schema

The `users` table is created automatically on server start:

```sql
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100),
  email      VARCHAR(100) NOT NULL,
  password   VARCHAR(100) NOT NULL,
  is_active  BOOLEAN DEFAULT true,
  age        INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the repo in the [Vercel dashboard](https://vercel.com)
3. Add `DATABASE_URL` under **Project Settings → Environment Variables**
4. Vercel auto-deploys on every push to `main`

---

## Common Issues

### `ETIMEDOUT` connecting to NeonDB

Port `5432` may be blocked by your ISP (common in many regions).

**Solutions:**
- Use the NeonDB serverless HTTP driver — runs over HTTPS (port 443, never blocked):
  ```bash
  npm install @neondatabase/serverless
  ```
- Connect via a VPN to bypass ISP port blocking
- Make sure you are using the **pooler** connection URL from the Neon dashboard (ends in `-pooler.neon.tech`)

### `SyntaxError: Unexpected token` — invalid JSON

Happens when your API client sends a malformed body.

**Solutions:**
- In Postman / Thunder Client: set body to **raw → JSON**, not Text
- Make sure the `Content-Type: application/json` header is set
- Remove `app.use(express.text())` — it can intercept JSON bodies before `express.json()`
- Never call `JSON.stringify()` twice on the same object

### SSL warning from `pg`

The warning about `sslmode=require` vs `verify-full` can be silenced by appending `&uselibpqcompat=true` to your `DATABASE_URL`.

### `dotenv` not loading variables

Call `dotenv.config()` as the **very first line** of `server.ts`, before any other imports. ES module import hoisting means any config file imported above it will be evaluated before dotenv runs.

---

## Security Reminders

- Never commit `.env` or hardcode credentials in source files
- Add `.env` to `.gitignore` before the first commit
- Rotate your NeonDB password immediately if it is ever exposed publicly
- Use `ssl: { rejectUnauthorized: true }` in production with a valid CA certificate
- Use `VARCHAR(100)` or `TEXT` for email and password — `VARCHAR(20)` is too short

---

## Author

**Shourov** — [GitHub](https://github.com/st-shourov12)