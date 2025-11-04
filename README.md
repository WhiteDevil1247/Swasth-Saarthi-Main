SwasthSaathi — Smart Healthcare Platform

SwasthSaathi is a modern, full-stack healthcare platform designed to simplify patient management, teleconsultation, and AI-assisted diagnostics.
Built with Next.js, Node.js (TypeScript), and Flutter, it delivers an integrated web + mobile experience for healthcare providers and patients alike.

🚀 Features

HealthVault — Upload, store, and view medical files securely
Teleconsultation Signalling — Real-time communication via WebSocket
Secure Authentication — OTP + JWT-based mock auth flow
AI Inference Endpoint — Mock AI service (ready for TensorFlow Serving integration)
Infrastructure Ready — Dockerized setup for local & production environments
Automated Tests — Playwright smoke tests for health checks
Mobile Companion App — Flutter scaffold ready for Android/iOS
Docs Included — Setup, environment, and troubleshooting guides

🧱 Tech Stack
Layer	Technology
Frontend	Next.js 14 (App Router, TailwindCSS, TypeScript)
Backend	Node.js, Express, TypeScript
Database	PostgreSQL (with optional MongoDB + Redis)
Infra	Docker, Docker Compose
Testing	Playwright (E2E smoke tests)
Mobile	Flutter (Dart)
Deployment	Vercel (Frontend) + Render/Railway (Backend)
⚙️ Local Setup
1️⃣ Clone the repo
git clone https://github.com/<your-username>/swasthsaathi.git
cd swasthsaathi

2️⃣ Setup environment variables
cp .env.local.example .env.local


Fill in required keys (Postgres, JWT secret, etc.)

3️⃣ Run using Docker (recommended)
docker compose up --build


Frontend: http://localhost:3000

Backend: http://localhost:8000/api/health

HealthVault Demo: http://localhost:3000/healthvault

Signalling Demo: http://localhost:3000/signalling

4️⃣ Run locally (no Docker)
Backend
cd backend
npm install
npm run dev

Frontend
cd healthcare-main
npm install
npm run dev

🧪 Running Tests

After the stack is running:

cd healthcare-main
npm install
npx playwright install
npm run test:e2e


✅ All smoke tests should pass:

Frontend loads

Backend health check

File upload & list

WebSocket signalling

🌐 Deployment Guide
Frontend → Vercel

Project root: healthcare-main/

Env vars:

NEXT_PUBLIC_API_BASE_URL=https://<your-backend-domain>/api
NEXT_PUBLIC_WEBSOCKET_URL=wss://<your-backend-domain>/signalling
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your_key>

Backend → Render / Railway

Root: backend/

Port: 8000

Copy envs from .env.local.example (production values)

Add managed PostgreSQL + Redis

📱 Flutter Mobile App

The mobile app scaffold lives in /mobile/healthsaathi_flutter.

To run:

cd mobile/healthsaathi_flutter
flutter pub get
flutter run


.env.example included for API config

Uses same base URL as web frontend

📊 Smoke Test Summary
Test	Status
Frontend loads	✅
Backend health check	✅
Upload & list files	✅
WebSocket signalling	✅

All tests passed successfully on local validation.

🧠 Future Enhancements

🧬 AI-based diagnosis (TensorFlow Serving)

☁️ AWS S3 integration for cloud file storage

🎥 Full TURN server for real-time teleconsultation

📲 Expanded Flutter mobile client

📋 FHIR-compliant patient data model

🧾 License

This project is open-source under the MIT License.
Feel free to use, modify, and contribute.
