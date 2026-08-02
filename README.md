# 🚀 WBIZZ - WAFlux

<p align="center">
  <img src="https://img.sanishtech.com/u/865f8227c53cbdc5e5ac02e60efe712d.png" alt="WBIZZ Dashboard" width="850"/>
</p>

<p align="center">
  <strong>Master Your Business, One Message at a Time.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

---

## 📌 Overview

**WBIZZ (WAFlux)** is a high-performance, full-stack WhatsApp Business & CRM Management platform designed to unify customer communications, automate multi-step conversational flows, manage sales pipelines, and send targeted broadcasting campaigns. 

Built with **Next.js 14**, **FastAPI**, **MongoDB Atlas**, and **WebSockets**, WBIZZ provides real-time messaging, visual lead management, and an error-free automation simulator.

---

## ✨ Key Features

### 📊 Intelligent Analytics Dashboard
- **Live Metrics**: Track total contacts, active chats, active campaigns, and message throughput in real-time.
- **Interactive Charts**: Responsive analytics powered by Recharts for message history, engagement trends, and delivery rates.
- **Real-Time Activity Feed**: Live notifications on customer responses and automation triggers.

### 🎯 Kanban CRM Lead Pipeline
- **Visual Sales Funnel**: Manage leads across customizable stages (*New Leads*, *Interested*, *Negotiating*, *Closed*).
- **Drag-and-Drop Workflow**: Drag lead cards across columns to update pipeline status instantly.
- **One-Click Conversion**: Turn active WhatsApp chats into structured CRM leads directly from the interface.
- **Lead Contact Details**: Add rich notes, update contact info, and manage lead priority.

<p align="center">
  <img src="https://img.sanishtech.com/u/6dd73517c997f89b94d137714bcd8621.png" alt="WBIZZ CRM Board" width="850"/>
</p>

### 💬 Real-Time Chat & Messaging
- **WebSocket Gateway**: Ultra low-latency bidirectional messaging for live conversations.
- **Approved Templates**: Select and send official WhatsApp message templates with dynamic variable insertion.
- **Media Sharing**: Support for uploading and sharing documents, images, and attachments directly in chat.
- **Message Status Indicators**: Real-time Sent, Delivered, and Read status updates.

### 📢 Broadcasting & Campaign Manager
- **Targeted Broadcasts**: Create, schedule, and execute broadcast campaigns for custom contact segments.
- **Live Delivery Tracking**: Monitor real-time status (Pending, Processing, Sent, Failed) per contact.
- **Audience Filtering**: Filter contacts by labels, lead stage, or custom attributes before dispatching.

### 🤖 Visual Automation Builder (WAFlux Engine)
- **No-Code Flow Builder**: Define multi-step bot rules with visual triggers, conditional nodes, and response cards.
- **Interactive Simulator**: Test conversation flows in a built-in sandbox simulator before deploying live.
- **24/7 Auto-Responder**: Automatic lead qualification and data collection without manual intervention.

### 📝 Approved Template & Media Library
- **Template Management**: Catalog for WhatsApp utility, marketing, and authentication message templates.
- **Category Search & Filter**: Instant filtering by template category and status.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14** (App Router) | Server-side rendering, layout routes, and optimized client components |
| **Language** | **TypeScript** & **Python 3.12** | End-to-end type safety and Python backend logic |
| **Styling & UI** | **Tailwind CSS**, **Shadcn UI**, **Framer Motion** | Glassmorphism aesthetics, fluid micro-animations, responsive layout |
| **Backend API** | **FastAPI**, **Uvicorn** | High-concurrency async Python framework with automatic Swagger docs |
| **Database** | **MongoDB Atlas** (PyMongo / Motor) | NoSQL document storage for users, chats, contacts, and automation flows |
| **Real-time Gateway** | **WebSockets** | Low-latency socket connections for instant chat delivery |
| **Proxy / Server** | **Nginx** | Reverse proxy, SSL termination, and rate-limiting |
| **Containerization** | **Docker & Docker Compose** | Multi-container environment orchestration |

---

## 📂 Project Structure

```text
Internship-Competition_WAFlux/
├── backhand/                      # 🐍 FastAPI Backend Application
│   ├── main.py                   # Main FastAPI endpoints, auth & app initialization
│   ├── database.py               # MongoDB connection and database client setup
│   ├── models.py                 # Pydantic schemas for data validation
│   ├── auth.py                   # JWT token generation, password hashing & auth guards
│   ├── websocket_manager.py       # Socket connection manager & broad-casting logic
│   ├── websocket_routes.py        # WebSocket connection endpoint routes
│   ├── wbizz_brain.json           # Knowledge base data for AI assistant integration
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Backend Docker configuration
├── client/                        # ⚛️ Next.js Frontend Application
│   ├── app/                      # Next.js App Router (Pages, Layouts & API Routes)
│   │   ├── dashboard/            # Dashboard pages (Chats, Contacts, Kanban, Settings)
│   │   ├── automation/           # Visual Automation Engine builder page
│   │   ├── campaigns/            # Campaign broadcast management page
│   │   ├── templates/            # Template gallery page
│   │   └── login/                # Authentication page
│   ├── components/               # UI & Feature Components
│   │   ├── dashboard/            # Sidebar, Header, Kanban Board components
│   │   ├── ui/                   # Reusable Shadcn UI & Framer Motion elements
│   │   └── AutomationWorkflow.tsx# Visual Flow builder component
│   ├── hooks/                    # Custom React hooks (useWebSocket, useAuth)
│   ├── lib/                      # Utilities, API client configuration & helpers
│   ├── public/                   # Static public assets (avatars, icons)
│   ├── next.config.js            # Next.js build configuration
│   └── Dockerfile                # Frontend Docker configuration
├── docs/                          # 📖 Detailed Documentation
│   ├── AUTOMATION.md             # Automation Flow documentation
│   ├── CAMPAIGNS.md              # Campaign system setup & guide
│   ├── DATA_PERSISTENCE.md       # MongoDB data structure documentation
│   ├── DEPLOYMENT_GUIDE.md       # Production deployment instructions
│   └── WEBSOCKET_INTEGRATION.md  # Real-time WebSocket architecture
├── nginx/                         # 🌐 Nginx Reverse Proxy
│   └── nginx.conf                # Route routing, WebSocket upgrading & proxy rules
├── docker-compose.yml             # 📦 Docker Compose Service Definition
├── README.md                      # 📄 Project Master Documentation
└── .env.production.example        # ⚙️ Production environment variables template
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) **OR**
- [Node.js 18+](https://nodejs.org/) & [Python 3.10+](https://www.python.org/)

---

### Option A: Run with Docker Compose (Recommended)

Run the full stack (Frontend, Backend, and Nginx proxy) in isolated containers with a single command:

```bash
docker-compose up --build
```

Access the services at:
- 🌐 **Frontend Application**: `http://localhost:3000` (or `http://localhost`)
- ⚙️ **Backend API Docs**: `http://localhost:8000/docs`

---

### Option B: Local Development Setup (Manual)

#### 1. Backend Setup (`FastAPI`)

Open a terminal and navigate to the backend folder:

```bash
cd backhand

# Create and activate a Python virtual environment
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\activate

# On macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server with auto-reload
uvicorn main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

---

#### 2. Frontend Setup (`Next.js`)

Open a second terminal and navigate to the client folder:

```bash
cd client

# Install packages
npm install

# Start Next.js development server
npm run dev
```

The web application will open at `http://localhost:3000`.

---

## ⚙️ Environment Variables

Create a `.env` file in the root or respective subdirectories based on `.env.production.example`:

```env
# Backend Environment
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/whatsapp_dashboard_db
JWT_SECRET=your_jwt_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend Environment
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## 📖 API Documentation & Swagger

When the backend server is running, explore and test the REST & WebSocket API endpoints interactively:

- 📑 **OpenAPI / Swagger UI**: `http://localhost:8000/docs`
- 📄 **ReDoc**: `http://localhost:8000/redoc`

---

## 🛡️ License & Acknowledgments

This project was built for the Internship Competition. All rights reserved.

<p align="center">
  Made with ❤️ for high-performance business communication.
</p>
