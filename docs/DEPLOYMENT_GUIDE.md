# 🚀 WBIZZ Deployment Guide

Congratulations! Your project is complete and production-ready. Since we've already built a robust **Docker infrastructure**, you have several professional paths for deployment.

---

## 🏗️ Recommended: VPS Deployment (Docker Compose)
This is the most cost-effective and professional method for a full-stack app with a backend and real-time WebSockets.

**Platforms:** DigitalOcean (Droplet), AWS (EC2), Hetzner, or Vultr (approx. $5-10/month).

### Step 1: Prepare your Code
Ensure all changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Final production build with Docker & WebSocket"
git push origin main
```

### Step 2: Setup your VPS
1. Create a Linux VPS (Ubuntu 22.04 recommended).
2. SSH into your server: `ssh root@your_server_ip`.
3. Install Docker and Docker Compose:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   ```

### Step 3: Deployment
1. Clone your repo: `git clone https://github.com/harsh5d5/intership_nextjs_-WhatsApp-Business`
2. Enter the directory: `cd intership_nextjs_-WhatsApp-Business`
3. Create your production environment file from the template we made:
   ```bash
   cp .env.production.example .env.production
   nano .env.production # Fill in your actual MongoDB URI and API Keys
   ```
4. Start the entire stack:
   ```bash
   docker-compse up -d --build
   ```

### Step 4: SSL (HTTPS)
Use **Certbot** with Nginx to get free SSL certificates from Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## ☁️ Option B: Managed PaaS (Easiest)
If you don't want to manage a server, use these specialized platforms:

1. **Frontend (Next.js):** Deploy to **Vercel**.
   - Connect your GitHub repo.
   - It will automatically detect Next.js and build it.
   - Set Environment Variables (API URL) in the project settings.

2. **Backend (FastAPI):** Deploy to **Railway.app** or **Render.com**.
   - These platforms support `Dockerfiles` natively.
   - Point them to your `/backhand` directory.
   - Add your MongoDB URI to their "Variables" tab.

3. **Database:** Keep using **MongoDB Atlas**.
   - Ensure you whitelist the IP addresses of your Vercel/Railway instances in the Network Access tab of Atlas.

---

## 🔑 Critical Production Checklist
Before you go live, ensure these are handled:

- [ ] **MongoDB Whitelist**: Ensure your production server IP is whitelisted in MongoDB Atlas.
- [ ] **JWT Secret**: Change `SECRET_KEY` in `.env.production` to a long, random string.
- [ ] **Cors Policy**: Update `allow_origins` in `backhand/main.py` to your actual domain.
- [ ] **API URLs**: Ensure the Frontend `NEXT_PUBLIC_API_URL` points to your production backend domain.
- [ ] **Storage**: If using local uploads, ensure the `uploads/` volume in `docker-compose.yml` is correctly mapped for persistence.

---

## 💡 Summary Suggestion
For this competition/internship, I recommend **Option A (DigitalOcean + Docker Compose)**. It shows that you understand **DevOps, Reverse Proxies (Nginx), and Containerization**, which are high-value skills for a senior developer.

**Good luck with your submission! Your architecture is solid.**
