# Dance Academy — Backend

Node.js + Express + MongoDB REST API.

## Local Development

```bash
npm install
# create .env (see Environment Variables below)
npm run dev
```

Server runs on `http://localhost:5000`.

## Environment Variables

Create a `.env` file in this directory:

```
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/DanceAcademy?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=<min-32-char-random-string>
JWT_EXPIRES_IN=7d
CSRF_SECRET=<min-32-char-random-string>
COOKIE_SECRET=<min-32-char-random-string>
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=Admin@123
```

## Deploy on Render

1. Push backend to a GitHub repo.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all environment variables from the list above in Render's dashboard.
   - Set `NODE_ENV=production`
   - Set `CLIENT_URL` to your Netlify frontend URL (e.g. `https://your-app.netlify.app`)
   - Render sets `PORT` automatically — you can omit it or leave it as `5000`.
6. Deploy. Note your service URL (e.g. `https://dance-academy-backend.onrender.com`).

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | Public | Health check |
| GET | /api/csrf-token | Public | Get CSRF token |
| POST | /api/user/signup | Public | Register |
| POST | /api/user/login | Public | Login |
| POST | /api/user/reset-password | Public | Reset password |
| GET | /api/user/profile | User | Get profile |
| PUT | /api/user/profile | User | Update profile |
| GET | /api/user/all | Admin | List users |
| DELETE | /api/user/:id | Admin | Delete user |
| GET | /api/courses | Public | List courses |
| POST | /api/courses | Admin | Add course |
| PUT | /api/courses/:id | Admin | Update course |
| DELETE | /api/courses/:id | Admin | Delete course |
| GET | /api/students/count | Public | Student count |
| GET | /api/students | Admin | List students |
| POST | /api/students | Admin | Enroll student |
| PUT | /api/students/:id | Admin | Update student |
| DELETE | /api/students/:id | Admin | Delete student |
| GET | /api/attendance | Admin | List attendance |
| POST | /api/attendance | Admin | Mark attendance |
| PUT | /api/attendance/:id | Admin | Update record |
| DELETE | /api/attendance/:id | Admin | Delete record |
| GET | /api/fees | Admin | List fees |
| POST | /api/fees | Admin | Record fee |
| PUT | /api/fees/:id | Admin | Update fee |
| DELETE | /api/fees/:id | Admin | Delete fee |
| GET | /api/events | Public | List events |
| POST | /api/events | Admin | Add event |
| PUT | /api/events/:id | Admin | Update event |
| DELETE | /api/events/:id | Admin | Delete event |
| GET | /api/contact | Admin | List messages |
| POST | /api/contact | Public | Send message |
| DELETE | /api/contact/:id | Admin | Delete message |
| GET | /api/threads | User | List threads |
| POST | /api/threads | User | Create thread |
| GET | /api/threads/:id | User | Get thread |
| PUT | /api/threads/:id | User | Update thread |
| DELETE | /api/threads/:id | User | Delete thread |
| GET | /api/threads/:id/messages | User | Get messages |
| POST | /api/threads/:id/messages | User | Send message |
