<p align="center">
  <img src="Client/public/favicon.svg" width="80" alt="Why Connect Logo" />
</p>

<h1 align="center">Why Connect</h1>

<p align="center">
  A feature-rich, real-time messenger application with video/voice calls and AI-powered chat.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
</p>

---

## ✨ Features

- **Real-Time Messaging** — Instant message delivery powered by Socket.IO
- **Video & Voice Calls** — Peer-to-peer calls using PeerJS (WebRTC)
- **AI Chat Assistant** — Chat with an AI bot powered by Google Gemini AI
- **Authentication** — Secure JWT-based auth with Passport.js
- **Group & Direct Chats** — Create group conversations or chat one-on-one
- **Reply to Messages** — Reply to specific messages in a conversation
- **Dark / Light Mode** — Theme toggle with next-themes
- **Responsive Design** — Fully responsive UI built with Tailwind CSS & Shadcn UI
- **Form Validation** — Client & server-side validation with Zod

---

## 🛠️ Tech Stack

### Frontend

| Technology               | Purpose                    |
| ------------------------ | -------------------------- |
| React 19                 | UI Library                 |
| TypeScript               | Type Safety                |
| Tailwind CSS + Shadcn UI | Styling & Components       |
| Zustand                  | State Management           |
| React Hook Form + Zod    | Forms & Validation         |
| Socket.IO Client         | Real-Time Communication    |
| PeerJS                   | Video/Voice Calls (WebRTC) |
| Axios                    | HTTP Requests              |
| React Router DOM         | Routing                    |

### Backend

| Technology           | Purpose            |
| -------------------- | ------------------ |
| Node.js + Express 5  | Server Framework   |
| TypeScript           | Type Safety        |
| MongoDB + Mongoose   | Database & ODM     |
| Socket.IO            | Real-Time Events   |
| Passport.js + JWT    | Authentication     |
| Google Gemini AI SDK | AI Chat Assistant  |
| Zod                  | Request Validation |
| Helmet               | Security Headers   |

---

## 📁 Project Structure

```
Why-Connect/
├── Client/                  # Frontend (React + Vite)
│   ├── public/              # Static assets & favicon
│   └── src/
│       ├── components/      # Reusable UI components
│       │   ├── call/        # Video/voice call overlay
│       │   ├── chat/        # Chat UI components
│       │   ├── logo/        # App logo
│       │   └── ui/          # Shadcn UI primitives
│       ├── hooks/           # Custom React hooks
│       │   ├── use-auth.ts
│       │   ├── use-call.ts
│       │   ├── use-chat.ts
│       │   ├── use-peer.ts
│       │   └── use-socket.ts
│       ├── layouts/         # Layout wrappers
│       ├── lib/             # Utility functions
│       ├── pages/           # Route pages
│       │   ├── auth/        # Sign In / Sign Up
│       │   └── chat/        # Main chat page
│       ├── routes/          # Route definitions
│       └── types/           # TypeScript types
│
├── Server/                  # Backend (Node.js + Express)
│   └── src/
│       ├── config/          # DB, env, passport, HTTP config
│       ├── controllers/     # Route handlers
│       ├── lib/             # Socket.IO setup
│       ├── middlewares/     # Error handling, async handler
│       ├── models/          # Mongoose models (User, Chat, Message)
│       ├── routes/          # API route definitions
│       ├── scripts/         # Seed scripts (AI user)
│       ├── services/        # Business logic
│       ├── utils/           # Helpers (JWT, cookies)
│       └── validators/      # Zod validation schemas
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** (local or Atlas)
- **Cloudinary** account
- **Google AI API Key** (for Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/Shubham7015/Why-Connect.git
cd Why-Connect
```

### 2. Setup the Server

```bash
cd Server
npm install
```

Create a `.env` file in the `Server/` directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

Start the dev server:

```bash
npm run dev
```

### 3. Setup the Client

```bash
cd Client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🌐 Deployment

The app is deployed on **Render** as a single web service.

**Build Command:**

```bash
npm install --production=false --prefix Client && npm run build --prefix Client && npm install --production=false --prefix Server && npm run build --prefix Server
```

**Start Command:**

```bash
npm start --prefix Server
```

The server serves the built Client files in production mode.

---

## 📡 API Routes

| Method | Endpoint                     | Description                     |
| ------ | ---------------------------- | ------------------------------- |
| `POST` | `/api/auth/sign-up`          | Register a new user             |
| `POST` | `/api/auth/sign-in`          | Login user                      |
| `GET`  | `/api/user/`                 | Get user profile & search users |
| `GET`  | `/api/chat/`                 | Get user's chats                |
| `POST` | `/api/chat/`                 | Create a new chat               |
| `GET`  | `/api/chat/:chatId/messages` | Get messages for a chat         |
| `GET`  | `/health`                    | Server health check             |

---

## 🔌 Real-Time Events (Socket.IO)

| Event           | Direction       | Description                |
| --------------- | --------------- | -------------------------- |
| `message:new`   | Server → Client | New message received       |
| `message:send`  | Client → Server | Send a message             |
| `user:online`   | Server → Client | User comes online          |
| `user:offline`  | Server → Client | User goes offline          |
| `call:incoming` | Server → Client | Incoming call notification |

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Shubham7015">Shubham</a>
</p>
