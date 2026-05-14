# TaskFlow Pro - Professional Team Task Management

TaskFlow Pro is a production-level Team Task Management Web Application built with the MERN stack. It features a modern UI, secure backend, real-time updates, and AI-driven insights to help teams manage projects efficiently.

## 🚀 Key Features

- **Project Management**: Create, edit, and archive projects.
- **Kanban Board**: Drag-and-drop task management with real-time updates.
- **Role-Based Access Control (RBAC)**: Admin and Member roles with specific permissions.
- **AI Smart Features**: Automatic priority suggestions and workload balancing.
- **Analytics Dashboard**: Visual insights using Recharts (productivity, status, priority).
- **Calendar View**: Track deadlines on a team-wide calendar.
- **Real-time Notifications**: Instant updates on task assignments and completions.
- **Dark Mode**: Persistent dark/light mode toggle.
- **Responsive Design**: Works perfectly on Mobile, Tablet, and Desktop.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts, React Beautiful DnD, Zustand.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), Socket.io.
- **Auth**: JWT, Bcrypt.
- **AI Logic**: Heuristic-based smart suggestions.

## 📦 Installation

### Prerequisites
- Node.js installed
- MongoDB Atlas account (for `MONGO_URI`)

### 1. Clone & Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

## 🏃 Running the App

### Start Backend
```bash
cd backend
npm run start
```

### Start Frontend
```bash
cd frontend
npm run dev
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password |
| Member | member@demo.com | password |

## 📐 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Projects
- `GET /api/projects`
- `POST /api/projects` (Admin)
- `GET /api/projects/:id`

### Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/ai-suggest`

---
