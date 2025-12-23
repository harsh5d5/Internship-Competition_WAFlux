# 🚀 WBIZZ 
<p align="center">
  <img src="https://img.sanishtech.com/u/865f8227c53cbdc5e5ac02e60efe712d.png" alt="WBIZZ Dashboard" width="800"/>
</p>

**Master Your Business, One Message at a Time.**

WBIZZ is a high-performance, full-stack WhatsApp Business Management platform designed to streamline communication, automate engagement, and provide deep insights into your business interactions. Built with modern technologies, it offers a seamless experience for managing contacts, running campaigns, and building complex automation flows.

---

## ✨ Key Features

### 📊 Intelligent Dashboard
- **Real-time Analytics**: Monitor Total Contacts, Active Chats, Campaigns, and Message Volume at a glance.
- **Interactive Data Visualization**: Beautifully rendered charts for message history, audience engagement, and campaign performance.
- **Activity Feed**: Stay updated with the latest interactions across your business.

### 🎯 CRM Board (Customer Relationship Management)
**Organize and track leads clearly, instead of relying only on WhatsApp chat messages.**
<p align="center">
  <img src="https://img.sanishtech.com/u/6dd73517c997f89b94d137714bcd8621.png"
       alt="WBIZZ - Advanced WhatsApp Business Dashboard"
       width="800"/>
</p>


*   **Visual Sales Pipeline**: Think of this as a visual board where you can track the journey of every customer.
*   **Real-World Example (Real Estate)**:
    *   **Add Lead**: When a new customer messages, manually add them as a card in the **"New Leads"** column.
    *   **Interested**: If they show interest, simply drag their card to **"Interested"**.
    *   **Negotiating**: Move them to **"Negotiating"** when discussing price.
    *   **Closed**: Drag them to **"Closed"** when the deal is done.
*   **Full Accuracy & Flexibility**: Manual control ensures your business data is exactly how you want it.
*   **User Efficiency**: Without this board, you would have to read hundreds of chats to remember who is buying. With the CRM board, everything is visible in **one screen and one second**.
*   **All-in-One Management**: Edit leads, add notes, or remove junk contacts directly from the board without navigating away.
*   **Real-Time Integration**: As soon as a message arrives, you can instantly turn that chat into a lead, ensuring no opportunity is ever missed.

### 💬 Professional Chat Interface
- **Real-time Messaging**: Low-latency chat experience powered by WebSockets.
- **Template Integration**: Send approved WhatsApp templates with dynamic parameters.
- **Media Support**: Send and receive images and documents directly within the chat.
- **Rich Status Indicators**: Track if messages are Sent, Delivered, or Read.

### 📢 Campaign Management
- **Bulk Broadcasts**: Create and schedule messaging campaigns for large audiences.
- **Deep Analytics**: Track delivery status per contact and overall campaign success rates.
- **Template Integration**: Use pre-defined templates for professional outreach.

### 🤖 Automation (Digital Assistant)
**Automation works like a digital assistant that follows a fixed conversation flow.**

*   **Visual Flow Builder (No Coding)**: Everything is controlled using a visual flow builder. Any business owner can change the bot in **2 minutes** simply by editing the flow.
*   **Real-World Example (Insurance Company)**:
    *   **Trigger**: When a customer sends **“START”**, the automation begins.
    *   **Welcome**: The system sends a welcome message.
    *   **Inquiry**: It asks for the **policy number**.
    *   **Logic**: Based on the reply, it sends the next message.
*   **24/7 Operations**: Even when the business is closed, the bot continues answering questions and collecting details.
*   **Test Simulator**: WBIZZ provides a **Test Simulator** so you can ensure the automation works perfectly before going live.
*   **Error-Free**: Because the bot follows a fixed flow, it is error-free. It **never forgets** to ask important questions — whereas humans sometimes do.

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

### 🔧 Local Development Guide

Follow these steps to run the application locally without Docker.

#### 1. Backend Setup (Terminal 1)
The backend handles the API, database connections, and business logic.

```bash
# Navigate to the backend directory
cd backhand

# Create and activate a virtual environment (Recommended)
# Windows:
python -m venv venv
.\venv\Scripts\activate
# Mac/Linux:
# python3 -m venv venv
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```
*The backend will start at `http://127.0.0.1:8000`*

#### 2. Frontend Setup (Terminal 2)
The frontend is the user interface built with Next.js.

```bash
# Open a new terminal and navigate to the client directory
cd client

# Install dependencies
npm install  --force

# Start the development server
npm run dev
```
*The frontend will start at `http://localhost:3000`*

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
