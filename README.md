# WBIZZ - WAFlux

Master Your Business, One Message at a Time.

## Overview

WBIZZ (WAFlux) is a full-stack WhatsApp Business and CRM management platform designed to unify customer communications, automate multi-step conversational flows, manage sales pipelines, and send targeted broadcasting campaigns.

Built with Next.js 14, FastAPI, MongoDB Atlas, and WebSockets, WBIZZ provides real-time messaging, visual lead management, and an automation simulator.

---

## Key Features

### Analytics Dashboard
- Live Metrics: Track total contacts, active chats, active campaigns, and message throughput in real time.
- Interactive Charts: Analytics for message history, engagement trends, and delivery rates.
- Activity Feed: Real-time notifications on customer responses and automation triggers.

### Kanban CRM Lead Pipeline
- Visual Sales Funnel: Manage leads across customizable stages (New Leads, Interested, Negotiating, Closed).
- Drag-and-Drop Workflow: Drag lead cards across columns to update pipeline status instantly.
- One-Click Conversion: Turn active WhatsApp chats into structured CRM leads directly from the interface.
- Lead Details: Add notes, update contact info, and manage lead priority.

### Real-Time Chat & Messaging
- WebSocket Gateway: Low-latency bidirectional messaging for live conversations.
- Approved Templates: Select and send official WhatsApp message templates with dynamic variable insertion.
- Media Sharing: Upload and share documents, images, and attachments directly in chat.
- Message Status Indicators: Real-time Sent, Delivered, and Read status updates.

### Broadcasting & Campaign Manager
- Targeted Broadcasts: Create, schedule, and execute broadcast campaigns for custom contact segments.
- Live Delivery Tracking: Monitor status (Pending, Processing, Sent, Failed) per contact.
- Audience Filtering: Filter contacts by labels, lead stage, or custom attributes before dispatching.

### Visual Automation Builder (WAFlux Engine)
- Visual Flow Builder: Define multi-step bot rules with visual triggers, conditional nodes, and response cards.
- Interactive Simulator: Test conversation flows in a built-in sandbox simulator before deploying live.
- 24/7 Auto-Responder: Automatic lead qualification and data collection without manual intervention.

### Approved Template Library
- Template Management: Catalog for WhatsApp utility, marketing, and authentication message templates.
- Filtering: Filter by template category and status.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| Frontend Framework | Next.js 14 (App Router) | Server-side rendering, layout routes, and client components |
| Language | TypeScript & Python 3.12 | End-to-end type safety and Python backend logic |
| Styling & UI | Tailwind CSS, Shadcn UI, Framer Motion | Modern UI styling, components, and animations |
| Backend API | FastAPI, Uvicorn | Async Python web framework with OpenAPI documentation |
| Database | MongoDB Atlas | NoSQL database for storing users, chats, contacts, and automation flows |
| Real-time Gateway | WebSockets | Low-latency socket connections for instant chat delivery |
| Proxy / Server | Nginx | Reverse proxy and routing rules |
| Containerization | Docker & Docker Compose | Multi-container environment orchestration |

---

## Project Structure

```text
Internship-Competition_WAFlux/
├── backend/                       # FastAPI Backend Application
│   ├── main.py                   # FastAPI endpoints, auth & app initialization
│   ├── database.py               # MongoDB connection setup
│   ├── models.py                 # Pydantic schemas for data validation
│   ├── auth.py                   # JWT token generation, password hashing & auth guards
│   ├── websocket_manager.py       # Socket connection manager & broadcasting logic
│   ├── websocket_routes.py        # WebSocket connection endpoint routes
│   ├── wbizz_brain.json           # Knowledge base data for AI assistant integration
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Backend Docker configuration
├── client/                        # Next.js Frontend Application
│   ├── app/                      # Next.js App Router pages and layouts
│   ├── components/               # UI & feature components
│   ├── hooks/                    # Custom React hooks (useWebSocket, useAuth)
│   ├── lib/                      # Utilities and configuration helpers
│   ├── public/                   # Static public assets
│   ├── next.config.js            # Next.js build configuration
│   └── Dockerfile                # Frontend Docker configuration
├── docs/                          # Project documentation files
├── nginx/                         # Nginx reverse proxy configuration
├── docker-compose.yml             # Docker Compose service configuration
├── README.md                      # Project master documentation
└── .env.production.example        # Production environment variables template
```

---

## Quick Start Guide

### Prerequisites
- Docker and Docker Compose OR
- Node.js 18+ and Python 3.10+

### Option A: Run with Docker Compose

Run the full stack with Docker Compose:

```bash
docker-compose up --build
```

Access the services:
- Frontend Application: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs

---

### Option B: Local Development Setup

#### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\activate

# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --port 8000
```

Backend API: http://127.0.0.1:8000  
API Documentation: http://127.0.0.1:8000/docs

#### 2. Frontend Setup (Next.js)

```bash
cd client

# Install dependencies
npm install

# Start frontend server
npm run dev
```

Frontend Application: http://localhost:3000

---

## Environment Variables

Configure `.env` based on `.env.production.example`:

```env
# Backend
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/whatsapp_dashboard_db
JWT_SECRET=your_jwt_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## API Documentation

When the backend server is running, access the interactive API documentation:

- OpenAPI / Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## License

This project was built for the Internship Competition. All rights reserved.
