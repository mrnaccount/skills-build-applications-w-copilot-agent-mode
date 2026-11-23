# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Each capability page will load its collection through the shared API client and provide accessible loading, empty, success, and error states.
- Logic tier decision: Keep input validation and business behavior in explicit service functions; route handlers will translate service results and errors into HTTP responses.
- Data tier decision: Enforce required contract fields in Mongoose schemas, default team members to an empty array, and keep demo seeding idempotent and non-destructive.
- Activity tracking approach: Validate the request fields and well-formed references to existing users and teams; compute points from submitted minutes and set the occurrence timestamp on creation.
- Team management approach: Require a non-empty name and mascot, default omitted members to an empty array, and return created/listed teams with their member IDs.
- Leaderboard approach: Sum activity points by team, order teams by descending total, and assign 1-based ranks.
- Workout suggestions approach: Find the requested user by email, prefer workouts matching their fitness goal or recent activity focus, include an explanatory reason, and return a deliberate 4xx for an unknown user.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`. Failures indicate incomplete model validation/defaults or seed behavior that is not representative, idempotent, or preserving unrelated data.
- API command: `npm run test:api --prefix octofit-tracker/backend`. Failures indicate incorrect request validation/status codes, persistence/list behavior, leaderboard aggregation/ranking, or user-specific workout recommendations.
- Frontend command: `npm test --prefix octofit-tracker/frontend`. Failures indicate incorrect API integration/content or missing accessible loading, empty, or error states.
- Backend build command: `npm run build --prefix octofit-tracker/backend`. Failures indicate backend TypeScript type-check errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`. Failures indicate frontend TypeScript or Vite production-build errors.

Current contract-test baseline: the data suite has 4 failures (required model fields), the API suite has 4 failures (activity/team creation, leaderboard, and workout suggestions), and the frontend suite has 15 failures (rendering/request behavior and loading, empty, and error states across the four pages). The backend and frontend build commands have not yet been run.
