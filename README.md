# 🌸 Bloom — a social media app (MERN)

A full-stack social media platform: sign up, post text/photos, like, comment,
follow people, get real-time notifications, and search for users. Built with
MongoDB, Express, React, and Node — styled in a soft **pink / green / purple**
theme.

```
bloom/
├── server/   → Express + MongoDB API (deploy to Render)
├── client/   → React + Vite frontend (deploy to Vercel)
└── render.yaml
```

## Features

- Email/username + password auth with httpOnly JWT cookies
- Create posts with text and/or an image (Cloudinary storage)
- Like, comment, save/bookmark, delete your own posts & comments
- Follow / unfollow, profile pages with cover photo, bio, stats
- Search for people, "who to follow" suggestions
- Real-time notifications via Socket.IO (likes, comments, follows)
- Infinite-scroll feed and explore page
- Responsive layout: sidebar nav on desktop, bottom tab bar on mobile
- Rate limiting, input validation, sanitization, and centralized error handling

## Tech stack

**Backend:** Node, Express, MongoDB/Mongoose, JWT, bcrypt, Cloudinary, Multer,
Socket.IO, Helmet, express-validator, express-rate-limit

**Frontend:** React 19, Vite, React Router, Tailwind CSS v4, Axios,
Socket.IO client, react-hot-toast, lucide-react icons

---

## 1. Prerequisites

- Node.js 18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB)
- A free [Cloudinary](https://cloudinary.com) account (for image uploads)
- Accounts on [Render](https://render.com) and [Vercel](https://vercel.com) for deployment

## 2. Local development

### Backend

```bash
cd server
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm install
npm run dev               # starts on http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev               # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so you don't
need a `.env` file for local frontend development. Open
`http://localhost:5173` and create an account.

---

## 3. Deploying the backend to Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, point it at your repo. Render will read
   `render.yaml` at the project root and create a web service rooted at `server/`.
   (Alternatively: **New → Web Service**, set **Root Directory** to `server`,
   **Build Command** to `npm install`, **Start Command** to `npm start`.)
3. Add the environment variables (Render will prompt for the ones marked
   `sync: false` in `render.yaml`):
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — any long random string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLIENT_URL` — your Vercel URL once you have it (e.g. `https://bloom.vercel.app`);
     you can update this after step 4 and redeploy
4. Deploy. Your API will be live at `https://<your-service>.onrender.com`.
   Confirm it's up by visiting `/api/health`.

> Render's free tier spins the service down after periods of inactivity — the
> first request after idling will be slow (cold start) while it wakes up.

## 4. Deploying the frontend to Vercel

1. In Vercel: **Add New → Project**, import the same repo, set **Root
   Directory** to `client`.
2. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (Vercel detects this automatically).
3. Add environment variables:
   - `VITE_API_URL` = `https://<your-render-service>.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://<your-render-service>.onrender.com`
4. Deploy. Then go back to Render and set `CLIENT_URL` to your new
   `https://<your-project>.vercel.app` URL so CORS and cookies work, and
   redeploy the backend.

Once both `CLIENT_URL` (Render) and `VITE_API_URL`/`VITE_SOCKET_URL` (Vercel)
point at each other, login, image uploads, and real-time notifications will
all work end-to-end in production.

---

## 5. Theme

Colors live as CSS variables in `client/src/index.css` (`@theme` block):
pastel pink, green, and purple bases, each with a deeper accent shade for
buttons/links, plus a recurring **"Bloom ring"** gradient (pink → purple →
green) used around every avatar as the app's visual signature. Edit the
values there to retheme the whole app from one place.

## 6. API overview

| Method | Route                          | Description                  |
|--------|--------------------------------|-------------------------------|
| POST   | `/api/auth/register`           | Create account                |
| POST   | `/api/auth/login`               | Log in                        |
| POST   | `/api/auth/logout`              | Log out                       |
| GET    | `/api/auth/me`                  | Current user                  |
| GET    | `/api/users/:username`          | Public profile                |
| PUT    | `/api/users/profile`            | Update own profile             |
| PUT    | `/api/users/avatar` / `/cover`  | Upload avatar/cover image      |
| PUT    | `/api/users/:id/follow`         | Follow/unfollow                |
| GET    | `/api/users/search?q=`          | Search users                  |
| GET    | `/api/users/suggestions`        | Who-to-follow suggestions      |
| POST   | `/api/posts`                    | Create a post                  |
| GET    | `/api/posts/feed`               | Feed (people you follow)       |
| GET    | `/api/posts/explore`            | All posts                      |
| GET    | `/api/posts/user/:username`     | A user's posts                 |
| PUT    | `/api/posts/:id/like`           | Like/unlike                    |
| PUT    | `/api/posts/:id/save`           | Save/unsave                    |
| DELETE | `/api/posts/:id`                | Delete own post                |
| GET    | `/api/comments/:postId`         | List comments                  |
| POST   | `/api/comments/:postId`         | Add a comment                  |
| GET    | `/api/notifications`            | List notifications             |
| PUT    | `/api/notifications/read-all`   | Mark all read                  |

## 7. Notes & next steps

- For production, consider adding email verification and password reset flows.
- The free tiers of Render/Atlas/Cloudinary are enough for a demo/portfolio —
  upgrade as real traffic grows.
- `server/server.js` already wires Socket.IO; the frontend's `SocketContext`
  consumes it for live notification badges.
