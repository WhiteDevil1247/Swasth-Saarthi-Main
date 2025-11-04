# SwasthSaathi — Empowering Smarter Healthcare

**SwasthSaathi** is a full-stack health management platform built to simplify patient–doctor interactions, enable secure teleconsultations, AI-powered insights, and digital health record management — all in one modern, cloud-ready app.

---

## 🚀 Overview

SwasthSaathi provides a connected ecosystem for patients, doctors, hospitals, and NGOs.  
It supports video consultations, appointment scheduling, AI assistance, and document uploads, powered by scalable backend microservices.

---

## 🧠 Key Features

### 🩹 Core Healthcare Platform
- Secure patient registration and login (OTP/JWT mock auth)
- Appointment scheduling and management
- Real-time teleconsultation using WebRTC signaling
- HealthVault: file uploads and document management
- AI insights mock endpoint (extendable to real ML models)

### ⚙️ Technical Highlights
- **Frontend:** Next.js 14 + Tailwind + shadcn/ui  
- **Backend:** Node.js (Express + TypeScript)  
- **Database:** PostgreSQL (main) + MongoDB + Redis  
- **Infra:** Docker Compose orchestration  
- **Auth:** Mock OTP & JWT flow  
- **Realtime:** WebSocket signaling server  
- **AI Mock:** Simulated ML responses (TF-Serving-ready)  
- **Testing:** Playwright smoke tests (4/4 passing)

### 📱 Mobile (Flutter)
- Minimal Flutter app scaffolded with environment wiring and health-check.
- Ready for expansion into patient dashboards or on-the-go doctor panels.

---

## 🧩 Project Structure

```
SwasthSaathi/
├── backend/                  # Node.js + TypeScript Express API
│   ├── src/                  # Core logic (auth, uploads, AI, signaling)
│   ├── Dockerfile
│   └── package.json
│
├── healthcare-main/          # Next.js frontend (web client)
│   ├── app/
│   ├── components/
│   ├── tests/                # Playwright smoke tests
│   └── Dockerfile
│
├── mobile/healthsaathi_flutter/ # Flutter client (scaffolded)
│
├── scripts/                  # migrate.sh, seed_dev.sh, start scripts
├── docker-compose.yml         # Full stack orchestration
├── .env.local.example         # Environment template
├── README.md                  # This file
└── REPORT.md                  # Root-cause and deployment summary
```

---

## 🧰 Local Development Setup

### Prerequisites
- Node.js ≥ 18  
- Docker Desktop (for Compose stack)  
- Git, npm, and optionally Flutter SDK  

### 1️⃣ Clone & Setup
```bash
git clone https://github.com/<your-username>/SwasthSaathi.git
cd SwasthSaathi
cp .env.local.example .env.local
```

### 2️⃣ Start with Docker (recommended)
```bash
docker compose up --build
```
Frontend → http://localhost:3000  
Backend → http://localhost:8000/api/health  

### 3️⃣ Run Locally (no Docker)
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd ../healthcare-main
npm install
npm run dev
```

### 4️⃣ Database Setup
```bash
./scripts/migrate.sh
./scripts/seed_dev.sh
```

### 5️⃣ Run Smoke Tests
```bash
cd healthcare-main
npx playwright install
npm run test:e2e
```
✅ 4/4 Tests Passed  
- Frontend loads  
- Backend health OK  
- Upload/list working  
- WebSocket signaling connects

---

## 🌍 Deployment (Recommended)

**Frontend:** [Vercel](https://vercel.com)  
**Backend:** [Render](https://render.com) or [Railway](https://railway.app)

Environment vars for frontend:
```
NEXT_PUBLIC_API_BASE_URL=https://<backend-domain>/api
NEXT_PUBLIC_WEBSOCKET_URL=wss://<backend-domain>/signalling
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your_key>
```

---

## 🔒 Optional Integrations
| Feature | Integration | Description |
|----------|--------------|-------------|
| ☁️ File Storage | AWS S3 | Replace local storage with S3 |
| 🤖 AI Models | TF-Serving | Plug real ML inference endpoint |
| 🔄 TURN Server | coturn / Twilio | Secure P2P video signaling |
| 💬 Notifications | Twilio / Firebase | SMS or push alerts |

---

## 🧪 Production Validation
- ✅ Backend health: `GET /api/health`
- ✅ Upload → list in `/healthvault`
- ✅ Signaling connected successfully
- ✅ AI mock endpoint returns JSON
- ✅ JWT + OTP mock flow working

---

## 🧑‍💻 Maintainer

**SwasthSaathi Project**  
Built with ❤️ by **Shubham Joshi & Team**

---

## 🧾 License
This project is licensed under the [MIT License](LICENSE).
