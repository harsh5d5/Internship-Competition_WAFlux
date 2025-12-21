# Challenge Description

## 🚀 Overview
We're looking for a talented frontend developer to join our team! This competition tests your skills in modern web development with Next.js and React.

**Prize:** Internship position + Competitive stipend

## 🎯 Challenge: WhatsApp Business Dashboard Migration

### Current Tech Stack
- **Frontend:** Vanilla JavaScript + HTML + CSS
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **APIs:** WhatsApp Business API Integration

### Your Task
Migrate and improve our WhatsApp Business Dashboard from vanilla JavaScript to Next.js 14+ with modern best practices.

## 📐 Project Scope

### Core Features to Implement

#### 1. Dashboard Page 📊
- Real-time statistics cards (Total Contacts, Active Chats, Campaigns, Messages)
- Interactive charts for message analytics
- Recent activity feed
- Quick action buttons

#### 2. Contacts Management 👥
- Contact list with search, filter, and sorting
- Individual contact profile view
- Contact tags and custom fields
- Import/Export contacts functionality
- Bulk operations (tag, delete, export)

#### 3. Chat Interface 💬
- WhatsApp-style chat UI
- Message list with user selection
- Send text messages
- Send WhatsApp templates with parameters
- Media support (images, documents)
- Message status indicators (sent, delivered, read)
- Real-time message updates

#### 4. Campaign Management 📢
- Create bulk messaging campaigns
- Select contact sheets (Google Sheets integration)
- Choose WhatsApp templates
- Campaign status tracking
- View campaign analytics
- Contact list for each campaign
- Delivery status per contact

#### 5. Templates Management 📝
- List all approved WhatsApp templates
- Template preview
- Template parameter filling
- Template categories
- Search and filter templates

#### 6. User Management (Optional - Bonus Points) 👤
- User profile
- Settings and preferences
- Multi-user support with roles

## 🛠️ Technical Requirements

### Must Have
1. **Next.js 14+** with App Router
2. **TypeScript** (strongly recommended)
3. **Tailwind CSS** or **Shadcn UI** for styling
4. **Responsive Design** (Mobile + Desktop)
5. **State Management** (Zustand / Redux / Context API)
6. **API Integration** with FastAPI backend
7. **Authentication** (JWT token handling)
8. **Error Handling** and Loading States
9. **Form Validation** (Zod / React Hook Form)
10. **Toast Notifications** for user feedback

### Good to Have (Bonus Points)
- React Query / SWR for data fetching
- Framer Motion for animations
- Chart.js / Recharts for analytics
- WebSocket for real-time updates
- PWA capabilities
- Dark Mode toggle
- Accessibility (a11y) best practices
- Testing (Jest, React Testing Library)
- Docker configuration for deployment

## 📊 API Integration Details

### Backend API Structure
`Backend API: https://your-backend-url.com/whatsapp` (Local: `http://localhost:8000`)

### Key Endpoints

#### Authentication
- `GET /` - Health check
- Authentication via JWT tokens (Bearer token in headers)

#### Contacts
- `GET /users?login_user={user_id}` - Get all contacts
- `GET /tags` - Get all contact tags

#### Chats
- `GET /chats/{phone_number}` - Get chat history
- `POST /send` - Send message

#### Campaigns
- `GET /campaigns` - Get all campaigns
- `GET /campaign_contacts?campaign={name}` - Get campaign contacts
- `GET /imported_numbers?sheet_name={name}` - Get contacts from sheet
- `GET /{campaign_name}` - Get campaign status

#### Templates
- `GET /templates` - Get all WhatsApp templates

#### Sheets
- `GET /sheets` - Get all Google Sheets

## 🎨 Design Requirements

### UI/UX Guidelines
1. **Modern & Clean:** Follow 2024-2025 design trends
2. **WhatsApp Theme:** Use WhatsApp's color palette (#128C7E, #25D366)
3. **Responsive:** Mobile-first approach
4. **Fast:** Optimize for performance (Core Web Vitals)
5. **Intuitive:** Self-explanatory UI with minimal learning curve
6. **Consistent:** Reusable component library

### Reference Inspiration
- WhatsApp Web Interface
- Modern SaaS dashboards (Linear, Notion, Vercel)
- Shadcn UI component examples

## 📦 Deliverables

### What to Submit
1. **GitHub Repository (Public/Private)**
   - Well-structured Next.js project
   - Clean, commented code
   - Proper Git history (meaningful commits)
2. **README.md with:**
   - Setup instructions
   - Environment variables needed
   - Tech stack used
   - Project structure explanation
   - Screenshots/Demo video
3. **Live Demo (Deployed)**
   - Vercel / Netlify / Any hosting platform
   - Working demo with mock data if backend not connected
4. **Documentation (Optional - Bonus)**
   - Component documentation
   - API integration guide
   - Design decisions explanation

## 🏆 Evaluation Criteria

### Scoring Breakdown (100 Points)
- **Functionality (30 points):** All core features working correctly
- **Code Quality (20 points):** Clean, maintainable, well-structured code
- **UI/UX Design (20 points):** Beautiful, intuitive, responsive design
- **Performance (10 points):** Fast loading, optimized assets
- **Best Practices (10 points):** TypeScript, ESLint, proper folder structure
- **Innovation (10 points):** Creative solutions, bonus features

### Bonus Points (Up to +20)
- ✅ Dark mode implementation (+5)
- ✅ Real-time updates with WebSocket (+5)
- ✅ Comprehensive testing (+5)
- ✅ Excellent documentation (+3)
- ✅ PWA features (+2)

## 💡 Tips for Success
1. **Start Small:** Implement core features first, then add enhancements
2. **Reusable Components:** Build a solid component library
3. **State Management:** Plan your state structure early
4. **Error Handling:** Handle loading, error, and empty states gracefully
5. **Mobile First:** Design for mobile, then scale up
6. **Git Commits:** Make frequent, meaningful commits
7. **Ask Questions:** If APIs are unclear, make reasonable assumptions
8. **Time Management:** Don't over-engineer, focus on working features

## Technologies
- Next.js 14+
- TypeScript
- React
- Tailwind CSS
- Shadcn UI
- FastAPI
- MongoDB
- JWT
- WebSocket
