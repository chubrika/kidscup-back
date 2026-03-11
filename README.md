# Kidscup Backend API

REST API for the youth basketball tournament management system. Built for use with the Angular admin panel (kidscup-admin).

## Tech stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** authentication
- **dotenv**, **CORS**, **express-validator**
- **MVC** structure

## Setup

1. **Install dependencies**

   ```bash
   cd kidscup-back
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `MONGODB_URI` – MongoDB connection string (replace `<db_password>` with your password)
   - `JWT_SECRET` – Secret for signing JWTs (use a strong value in production)
   - `CORS_ORIGIN` – Allowed origins (e.g. `http://localhost:4200` for Angular dev server)

3. **Seed database** (optional)

   ```bash
   npm run seed
   ```

   Creates:

   - User: `admin@kidscup.com` / `admin123`
   - Categories: U12, U14
   - Sample teams, players, and matches

4. **Run**

   ```bash
   npm run dev   # development with watch
   npm start     # production
   ```

   API base URL: `http://localhost:3000/api`

## Angular integration

- **Base URL:** `http://localhost:3000/api`
- **Auth:** Send JWT in header: `Authorization: Bearer <token>`
- **Login:** `POST /api/auth/login` with `{ "email": "...", "password": "..." }`  
  Response: `{ "token": "...", "user": { "id", "email", "name" } }`
- Protect all other endpoints with the same `Authorization` header.

Set in Angular environment (e.g. `environment.ts`):

```ts
export const environment = {
  apiUrl: 'http://localhost:3000/api',
};
```

Use `apiUrl` for `HttpClient` base URL and include the token via an interceptor.

## API endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/api/auth/login` | No  | Login, returns JWT and user |
| GET    | `/api/teams`      | Yes | List teams (query: `ageCategory`) |
| POST   | `/api/teams`      | Yes | Create team |
| GET    | `/api/teams/:id`  | Yes | Get team |
| PUT    | `/api/teams/:id`  | Yes | Update team |
| DELETE | `/api/teams/:id`  | Yes | Delete team |
| GET    | `/api/players`    | Yes | List players (query: `teamId`) |
| POST   | `/api/players`    | Yes | Create player |
| GET    | `/api/players/:id`| Yes | Get player |
| PUT    | `/api/players/:id`| Yes | Update player |
| DELETE | `/api/players/:id`| Yes | Delete player |
| GET    | `/api/matches`    | Yes | List matches (query: `ageCategory`, `status`, `from`, `to`) |
| POST   | `/api/matches`    | Yes | Create match |
| GET    | `/api/matches/:id`| Yes | Get match |
| PUT    | `/api/matches/:id`| Yes | Update match |
| DELETE | `/api/matches/:id`| Yes | Delete match |
| GET    | `/api/standings`  | Yes | Standings (query: `ageCategory`) |
| GET    | `/api/categories` | Yes | List categories |
| POST   | `/api/categories` | Yes | Create category |

## Project structure

```
src/
  config/       # app config, DB connection
  controllers/  # request handlers
  middleware/   # auth, validation, error handler
  models/       # Mongoose models
  routes/       # route definitions
  services/     # business logic
  scripts/      # seed script
  utils/        # AppError, asyncHandler, validators
  app.js        # Express app
  index.js      # entry point
```

## Health check

- `GET /health` – returns `{ "status": "ok", "timestamp": "..." }` (no auth).
