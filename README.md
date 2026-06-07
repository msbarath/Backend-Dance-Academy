# Dance Academy — Backend API

Node.js + Express 5 REST API for the Dance Academy Management System.

## Tech Stack

- **Runtime:** Node.js ≥ 18
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** JWT Bearer tokens
- **Security:** Helmet, CORS, bcryptjs, express-rate-limit, csrf-csrf, express-mongo-sanitize

## Project Structure

```
Backend [Dance Academy]/
├── Controllers/          # Route handler logic
│   ├── AttendanceController.js
│   ├── ContactController.js
│   ├── CourseController.js
│   ├── EventController.js
│   ├── FeeController.js
│   ├── StudentController.js
│   ├── ThreadController.js
│   └── UserController.js
├── Models/               # Mongoose schemas
│   ├── AttendanceModel.js
│   ├── ContactModel.js
│   ├── CourseModel.js
│   ├── EventModel.js
│   ├── FeeModel.js
│   ├── MessageModel.js
│   ├── StudentModel.js
│   ├── ThreadModel.js
│   └── UserModel.js
├── Routes/               # Express routers
│   ├── AttendanceRoutes.js
│   ├── ContactRoutes.js
│   ├── CourseRoutes.js
│   ├── EventRoutes.js
│   ├── FeeRoutes.js
│   ├── StudentRoutes.js
│   ├── ThreadRoutes.js
│   └── UserRoutes.js
├── Utils/
│   ├── authMiddleware.js      # JWT protect + adminOnly
│   └── resetTokenStore.js     # In-memory password reset tokens
├── server.js
├── package.json
└── render.yaml
```

## Environment Variables

Create a `.env` file in this directory with the following keys:

```env
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/DanceAcademy
CLIENT_URL=http://localhost:3000
JWT_SECRET=<random 64-char hex>
JWT_EXPIRES_IN=7d
CSRF_SECRET=<random 64-char hex>
COOKIE_SECRET=<random 64-char hex>
NODE_ENV=development
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong password>
```

> **Never commit `.env` to source control.** It is in `.gitignore`.

## Local Development

```bash
npm install
npm run dev      # nodemon hot-reload
```

Server starts at `http://localhost:5000`.

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/csrf-token` | Fetch CSRF token |
| GET | `/api/courses` | List all courses |
| GET | `/api/students/count` | Student count |
| GET | `/api/events` | List all events |
| POST | `/api/contact` | Submit contact message |
| POST | `/api/user/signup` | Register |
| POST | `/api/user/login` | Login |
| POST | `/api/user/request-reset` | Request password reset token |
| POST | `/api/user/reset-password` | Reset password with token |

### Protected (Bearer JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/profile` | Get own profile |
| PUT | `/api/user/profile` | Update own profile |
| GET/POST/PUT/DELETE | `/api/threads/*` | Thread and message CRUD |

### Admin Only

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/all` | List all users |
| DELETE | `/api/user/:id` | Delete user |
| POST/PUT/DELETE | `/api/courses/*` | Course CRUD |
| GET/POST/PUT/DELETE | `/api/students/*` | Student CRUD |
| GET/POST/PUT/DELETE | `/api/attendance/*` | Attendance CRUD |
| GET/POST/PUT/DELETE | `/api/fees/*` | Fee CRUD |
| POST/PUT/DELETE | `/api/events/*` | Event CRUD |
| GET/DELETE | `/api/contact/*` | Contact message management |

## Password Reset Flow

1. `POST /api/user/request-reset` with `{ email }` — returns `{ resetToken }` if email exists
2. `POST /api/user/reset-password` with `{ resetToken, newPassword }` — resets password
3. Tokens expire after **15 minutes** and are single-use

## Security Features

- CSRF double-submit cookie pattern on all mutating endpoints
- Rate limiting: 200 req/15min global, 20 req/15min on auth endpoints
- Helmet with explicit Content-Security-Policy
- MongoDB query sanitization via express-mongo-sanitize
- Passwords hashed with bcrypt (cost factor 12)
- JWT payload validated on every protected request
- Cascade delete: removing a student removes all their attendance and fee records

## Deployment (Render)

All environment variables are configured in Render dashboard. The `render.yaml` defines the service configuration.

Build command: `npm install`
Start command: `npm start`
Health check: `/api/health`
