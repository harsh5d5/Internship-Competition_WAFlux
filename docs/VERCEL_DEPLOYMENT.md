# ☁️ Vercel Deployment Guide (Frontend Focused)

To deploy WBIZZ, we will use a **Split-Deployment Architecture**. This is because Vercel is the best platform for Next.js (Frontend), but it **does not support WebSockets** (which we just implemented for the Backend).

---

## 🏗️ The Architecture
- **Frontend (Next.js):** [Vercel](https://vercel.com) (Global CDN, fast, free)
- **Backend (FastAPI):** [Railway](https://railway.app) or [Render](https://render.com) (Supports permanent servers and WebSockets)

---

## 1️⃣ Deploying the Backend (Railway/Render)

Since we have a `Dockerfile` in `/backhand`, these platforms will automatically detect it.

1.  **Sign up** for [Railway.app](https://railway.app).
2.  Click **New Project** → **Deploy from GitHub repo**.
3.  Select your WBIZZ repo.
4.  **Crucial Settings:**
    *   **Root Directory:** Set to `backhand`.
    *   **Variables:** Add all variables from `.env.production.example` (MongoDB URI, SECRET_KEY, etc.).
5.  Railway will build the Docker container and give you a URL (e.g., `wbizz-backend.up.railway.app`).

---

## 2️⃣ Deploying the Frontend (Vercel)

Now that your backend is live, we can deploy the frontend.

1.  **Sign up** for [Vercel](https://vercel.com).
2.  Click **Add New** → **Project**.
3.  Connect your GitHub and import the WBIZZ repo.
4.  **Configure Project Settings:**
    *   **Project Name:** `wbizz-frontend`
    *   **Framework Preset:** Next.js
    *   **Root Directory:** Click "Edit" and select the **`client`** folder.
5.  **Environment Variables:**
    *   Add `NEXT_PUBLIC_API_URL`
    *   **Value:** `https://wbizz-backend.up.railway.app` (Your Railway URL)
    *   Add `NEXT_PUBLIC_WS_URL`
    *   **Value:** `wss://wbizz-backend.up.railway.app` (Notice the **wss** for WebSockets)
6.  Click **Deploy**.

---

## 3️⃣ Final Configuration (CORS)

For the frontend to talk to the backend, you must allow your Vercel URL in the Backend's CORS settings.

1.  Copy your new Vercel URL (e.g., `wbizz-frontend.vercel.app`).
2.  In the Backend (Railway), update your Environment Variables:
    *   **FRONTEND_URL:** `https://wbizz-frontend.vercel.app`
3.  The backend will automatically restart and allow traffic from your Vercel frontend.

---

## ⚠️ Why not Backend on Vercel?
Vercel's backend functions are "Serverless" (Lambda). They turn off when not in use. This causes two problems for high-quality apps like WBIZZ:
1.  **No WebSockets:** Serverless functions cannot maintain a permanent connection for real-time chat.
2.  **Cold Starts:** Your first API request after a while might take 5-10 seconds to respond.

**By using Vercel for Frontend and Railway/Render for Backend, you get the best of both worlds: Instant loading and real-time messaging.**

---

## 🚀 Pro Tip: Custom Domain
Once deployed, you can add your custom domain to both Vercel and Railway under their "Settings" tabs. Vercel will even handle the SSL certificate for you automatically!
