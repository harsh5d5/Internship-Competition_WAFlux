# 🚀 WBIZZ - Advanced WhatsApp Business Dashboard

**Master Your Business, One Message at a Time.**

WBIZZ is a high-performance, full-stack WhatsApp Business Management platform designed to streamline communication, automate engagement, and provide deep insights into your business interactions. Built with modern technologies, it offers a seamless experience for managing contacts, running campaigns, and building complex automation flows.

---

## ✨ Key Features

### 📊 Intelligent Dashboard
- **Real-time Analytics**: Monitor Total Contacts, Active Chats, Campaigns, and Message Volume at a glance.
- **Interactive Data Visualization**: Beautifully rendered charts for message history, audience engagement, and campaign performance.
- **Activity Feed**: Stay updated with the latest interactions across your business.

### 👥 CRM & Contact Management
- **Centralized Database**: Manage your business contacts with search, filter, and sorting capabilities.
- **Segmentation**: Organize contacts with tags and custom fields for targeted messaging.
- **Bulk Operations**: Seamlessly import/export contacts and perform batch actions.

### 💬 Professional Chat Interface
- **Real-time Messaging**: Low-latency chat experience powered by WebSockets.
- **Template Integration**: Send approved WhatsApp templates with dynamic parameters.
- **Media Support**: Send and receive images and documents directly within the chat.
- **Rich Status Indicators**: Track if messages are Sent, Delivered, or Read.

### 📢 Campaign Management
- **Bulk Broadcasts**: Create and schedule messaging campaigns for large audiences.
- **Deep Analytics**: Track delivery status per contact and overall campaign success rates.
- **Template Integration**: Use pre-defined templates for professional outreach.

### 🤖 Automation & AI
- **Automation Flow Builder**: Design complex logical branches for automated responses.
- **AI Integration**: Enhance customer interactions with AI-powered assistants (Gemini/OpenAI).
- **Global AI Persona**: Define your agent's personality and behavior.

### 📝 Template & Asset Management
- **Template Gallery**: Browse, preview, and manage your WhatsApp message templates.
- **Category Filtering**: Quickly find templates for Marketing, Utility, or Authentication.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Recharts, Lucide Icons |
| **Backend** | FastAPI (Python), Motor (Async MongoDB), Pydantic, JWT Auth |
| **Database** | MongoDB |
| **Real-time** | WebSockets |
| **Deployment** | Docker, Nginx, Docker Compose |

---

## 📂 Project Structure

```text
WBIZZ/
├── backhand/               # 🐍 FastAPI Backend
│   ├── main.py            # Primary API routes and logic
│   ├── models.py          # Data validation schemas (Pydantic)
│   ├── database.py        # MongoDB connection management
│   ├── auth.py            # Security and JWT handling
│   ├── websocket_manager.py# Real-time communication logic
│   └── requirements.txt   # Python dependencies
├── client/                 # ⚛️ Next.js Frontend
│   ├── app/               # Next.js App Router (Pages & Layouts)
│   ├── components/        # Specialized & Atomic UI Components
│   │   ├── dashboard/    # Dashboard-specific widgets
│   │   ├── chat/         # Chat interface components
│   │   └── ui/           # Radix-based base UI elements
│   ├── lib/               # Shared hooks, utils, and global state
│   └── public/            # Static assets (images, icons)
├── nginx/                  # 🌐 Proxy Configuration
│   └── nginx.conf         # Rate limiting and routing rules
├── docs/                   # 📖 Documentation & Guides
└── docker-compose.yml      # 📦 Container Orchestration
```

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local development)

### One-Command Setup (Docker)
```bash
docker-compose up --build
```
The application will be available at `http://localhost:3000`.

### Local Development

1. **Backend Setup**:
   ```bash
   cd backhand
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend Setup**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 🔒 Environment Variables

Ensure you have a `.env` file in the root directory (or respective folders) with:

```env
# Backend
MONGODB_URL=your_mongodb_url
JWT_SECRET=your_secret_key
WHATSAPP_API_TOKEN=your_token

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📄 License

This project is part of an internship competition. All rights reserved.

---

<p align="center">
  Built with ❤️ for High-Performance Business Communication
</p>
