# 📁 Swasth Saarthi - Folder Structure

```
Swasth-Saarthi-Main/
│
├── 📄 Configuration Files (Root)
│   ├── package.json                    # Root package manager
│   ├── package-lock.json               # Dependency lock
│   ├── .gitignore                      # Git ignore rules
│   ├── docker-compose.yml              # Docker setup
│   ├── nginx.conf                      # Nginx configuration
│   ├── index.html                      # Root HTML
│   ├── vite.config.ts                  # Vite config (root)
│   ├── tailwind.config.js/cjs          # Tailwind CSS
│   └── postcss.config.js               # PostCSS config
│
├── 📂 swasthsaathi-backend/            # Backend Server
│   ├── 📄 Configuration
│   │   ├── package.json                # Backend dependencies
│   │   ├── tsconfig.json               # TypeScript config
│   │   ├── .env                        # Environment variables (LOCAL ONLY)
│   │   └── .env.example                # Environment template
│   │
│   ├── 📂 src/                         # Source code
│   │   ├── index.ts                    # Main server file
│   │   │
│   │   ├── 📂 middleware/
│   │   │   └── auth.ts                 # JWT authentication
│   │   │
│   │   ├── 📂 models/
│   │   │   ├── HealthRecord.ts         # MongoDB models
│   │   │   └── ChatLog.ts
│   │   │
│   │   ├── 📂 db/
│   │   │   ├── mongo.ts                # MongoDB connection
│   │   │   ├── pg.ts                   # PostgreSQL connection
│   │   │   └── prisma.ts               # Prisma ORM
│   │   │
│   │   ├── 📂 lib/
│   │   │   └── crypto.ts               # Encryption utilities
│   │   │
│   │   └── 📂 data/
│   │       └── mock-hospitals.ts       # Mock hospital data
│   │
│   ├── 📂 prisma/
│   │   └── schema.prisma               # Database schema
│   │
│   ├── 📂 scripts/
│   │   ├── seed-hospitals-with-coords.js  # Seed hospitals
│   │   └── import_hospitals.ts         # CSV import
│   │
│   ├── 📂 dist/                        # Compiled JavaScript (generated)
│   │   └── index.js
│   │
│   └── 📂 storage/                     # File uploads
│       └── (user uploaded files)
│
├── 📂 swasthsaathi-frontend/           # Frontend React App
│   ├── 📄 Configuration
│   │   ├── package.json                # Frontend dependencies
│   │   ├── tsconfig.json               # TypeScript config
│   │   ├── vite.config.ts              # Vite dev server
│   │   ├── tailwind.config.js          # Tailwind CSS
│   │   └── index.html                  # Entry HTML
│   │
│   ├── 📂 public/                      # Static assets
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── placeholder.svg
│   │
│   └── 📂 src/                         # Source code
│       ├── main.tsx                    # React entry point
│       ├── App.tsx                     # Main app component
│       ├── index.css                   # Global styles
│       │
│       ├── 📂 components/              # React components
│       │   ├── Auth.tsx                # Login/Signup
│       │   ├── Layout.tsx              # App layout
│       │   ├── ProtectedRoute.tsx      # Auth guard
│       │   ├── HospitalNavigator.tsx   # Hospital component
│       │   ├── HealthTimeline.tsx
│       │   ├── VideoConsultation.tsx
│       │   ├── FloatingChatButton.tsx
│       │   └── 📂 ui/                  # UI components (shadcn)
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── input.tsx
│       │       └── ... (40+ components)
│       │
│       ├── 📂 pages/                   # Page components
│       │   ├── Home.tsx
│       │   ├── HospitalNavigator.tsx   # Hospital page
│       │   ├── HealthVault.tsx
│       │   ├── AICompanion.tsx
│       │   ├── Teleconsultation.tsx
│       │   ├── NGOHub.tsx
│       │   ├── Emergency.tsx
│       │   ├── Settings.tsx
│       │   └── Profile.tsx
│       │
│       ├── 📂 hooks/                   # Custom React hooks
│       │   ├── use-toast.ts
│       │   ├── useHospitals.ts
│       │   ├── useHealthData.ts
│       │   ├── useAppointments.ts
│       │   └── useAITimeline.ts
│       │
│       └── 📂 lib/                     # Utilities
│           ├── api.ts                  # API client
│           └── utils.ts                # Helper functions
│
├── 📂 scripts/                         # Utility scripts
│   └── (build/deployment scripts)
│
├── 📂 .git/                            # Git repository
│   └── (git files)
│
└── 📄 Documentation
    ├── README.md                       # Project readme
    ├── IMPLEMENTATION_SUMMARY.md       # Feature summary
    ├── DEBUGGING_FIXES.md              # Bug fixes
    ├── QUICK_TEST_GUIDE.md             # Testing guide
    ├── GITHUB_PUSH_FIX_COMPLETE.md     # Security fixes
    ├── SECURITY_FIX_APPLIED.md         # Security details
    ├── DEPLOYMENT_GUIDE.md             # Deployment instructions
    └── ... (other documentation)
```

---

## 📊 Key Components:

### Backend (Port 8083):
- **Language**: TypeScript/Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma) + MongoDB
- **Authentication**: JWT
- **APIs**: REST endpoints for all features

### Frontend (Port 5173):
- **Language**: TypeScript/React
- **Framework**: Vite + React Router
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React Query (TanStack Query)
- **Maps**: Leaflet + React-Leaflet

---

## 🔗 Dependencies:

### Backend Main Dependencies:
- express - Web server
- prisma - Database ORM
- mongoose - MongoDB ORM
- jsonwebtoken - JWT auth
- zod - Validation
- twilio - SMS/OTP
- socket.io - WebSocket
- multer - File uploads

### Frontend Main Dependencies:
- react - UI framework
- react-router-dom - Routing
- @tanstack/react-query - Data fetching
- leaflet - Maps
- react-leaflet - React map bindings
- lucide-react - Icons
- tailwindcss - Styling
- shadcn/ui - UI components

---

## 📏 Size Breakdown:

```
Total Project Size: ~500MB (with node_modules)

├── node_modules/ (~300MB)
├── swasthsaathi-backend/ (~100MB)
│   └── node_modules/ (~80MB)
├── swasthsaathi-frontend/ (~100MB)
│   └── node_modules/ (~90MB)
├── src/ (~2MB)
└── documentation/ (~1MB)
```

**Without node_modules**: ~10-15MB

---

## 🎯 Important Files:

### Configuration:
- `swasthsaathi-backend/.env` - Backend environment variables
- `swasthsaathi-backend/prisma/schema.prisma` - Database schema
- `vite.config.ts` - Frontend dev server config

### Entry Points:
- `swasthsaathi-backend/src/index.ts` - Backend server
- `swasthsaathi-frontend/src/main.tsx` - Frontend app

### Build Output:
- `swasthsaathi-backend/dist/` - Compiled backend
- `swasthsaathi-frontend/dist/` - Built frontend
