# 🏗️ Deployment Architecture

## 🎯 Recommended Setup (Production Ready)

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                   │
│              (Web Browsers, Mobile Devices)                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    CLOUDFLARE CDN                                │
│                   (Optional - Free)                              │
│            • DDoS Protection                                     │
│            • SSL/TLS                                             │
│            • Caching                                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│    VERCEL (Frontend)      │  │   RENDER (Backend)        │
│  Port: 443 (HTTPS)        │  │   Port: 443 (HTTPS)       │
├───────────────────────────┤  ├───────────────────────────┤
│  • React Application      │  │  • Node.js/Express        │
│  • Static Files           │  │  • REST APIs              │
│  • Client-Side Routing    │◄─┤  • WebSocket              │
│  • Vite Build             │  │  • Authentication         │
│                           │  │  • File Processing        │
│  swasth-saarthi.vercel.app│  │  swasth-backend.onrender  │
└───────────────────────────┘  └───────────┬───────────────┘
                                           │
                                           │
                    ┌──────────────────────┴──────────────────┐
                    │                                          │
                    ▼                                          ▼
        ┌───────────────────────┐              ┌─────────────────────────┐
        │  NEON.TECH            │              │  MONGODB ATLAS          │
        │  (PostgreSQL)         │              │  (MongoDB)              │
        ├───────────────────────┤              ├─────────────────────────┤
        │  • Users              │              │  • Health Records       │
        │  • Profiles           │              │  • Chat Logs            │
        │  • Hospitals          │              │  • AI Conversations     │
        │  • Appointments       │              │  • Session Data         │
        │  • Metrics            │              │                         │
        │  • NGOs               │              │  Free Tier: 512MB       │
        │                       │              │                         │
        │  Free Tier: 3GB       │              │                         │
        └───────────────────────┘              └─────────────────────────┘
```

---

## 🔄 Data Flow

```
User Request Flow:
─────────────────

1. User opens: https://swasth-saarthi.vercel.app
                    │
                    ▼
2. Vercel serves React app (HTML/CSS/JS)
                    │
                    ▼
3. Browser loads application
                    │
                    ▼
4. User clicks "Hospital Navigator"
                    │
                    ▼
5. React Query fetches: /api/hospitals
                    │
                    ▼
6. Request proxied to: https://swasth-backend.onrender.com/api/hospitals
                    │
                    ▼
7. Backend queries PostgreSQL (Neon)
                    │
                    ▼
8. Returns 12 hospitals with coordinates
                    │
                    ▼
9. Frontend renders map with markers
                    │
                    ▼
10. User sees interactive map! 🎉
```

---

## 📊 Service Responsibilities

### Frontend (Vercel):
```
┌─────────────────────────┐
│   React Application     │
├─────────────────────────┤
│  ✓ UI Rendering         │
│  ✓ State Management     │
│  ✓ Client Routing       │
│  ✓ API Calls            │
│  ✓ Map Display          │
│  ✓ User Interactions    │
└─────────────────────────┘
```

### Backend (Render):
```
┌─────────────────────────┐
│   Express API Server    │
├─────────────────────────┤
│  ✓ Authentication       │
│  ✓ Database Queries     │
│  ✓ Business Logic       │
│  ✓ File Upload          │
│  ✓ SMS/Email            │
│  ✓ WebSocket            │
│  ✓ API Endpoints        │
└─────────────────────────┘
```

### Database (Neon/Atlas):
```
┌─────────────────────────┐
│   Data Persistence      │
├─────────────────────────┤
│  ✓ User Data            │
│  ✓ Health Records       │
│  ✓ Appointments         │
│  ✓ Hospital Info        │
│  ✓ Chat History         │
└─────────────────────────┘
```

---

## 🌐 Network Architecture

```
Internet
   │
   ├──► DNS Lookup (your-domain.com)
   │         │
   │         └──► Vercel Edge Network (Global CDN)
   │                   │
   │                   └──► Nearest Server (Singapore/US/EU)
   │
   └──► API Requests (/api/*)
            │
            └──► Render.com (Backend)
                      │
                      ├──► Neon PostgreSQL
                      └──► MongoDB Atlas
```

---

## 🔒 Security Layers

```
┌─────────────────────────────────────┐
│  1. HTTPS/TLS (SSL Certificate)    │  ← All traffic encrypted
├─────────────────────────────────────┤
│  2. CORS (Cross-Origin)             │  ← Only allowed origins
├─────────────────────────────────────┤
│  3. JWT Authentication              │  ← Token-based auth
├─────────────────────────────────────┤
│  4. Rate Limiting                   │  ← Prevent abuse
├─────────────────────────────────────┤
│  5. Input Validation (Zod)          │  ← Clean data
├─────────────────────────────────────┤
│  6. Database Encryption             │  ← Encrypted at rest
└─────────────────────────────────────┘
```

---

## 📈 Scaling Strategy

### Current (Free Tier):
```
Vercel:   100GB bandwidth/month
Render:   750 hours/month
Neon:     3GB storage
MongoDB:  512MB storage
```

### When to Upgrade:
```
> 10,000 users/month    → Vercel Pro ($20/mo)
> 5,000 API calls/day   → Render Standard ($7/mo)
> 1GB database          → Neon Pro ($19/mo)
```

### High Traffic Setup:
```
┌────────────────────────┐
│   Load Balancer        │  ← Distribute traffic
├────────────────────────┤
│   Multiple Backend     │  ← Horizontal scaling
│   Instances            │
├────────────────────────┤
│   Redis Cache          │  ← Speed up queries
├────────────────────────┤
│   Database Replicas    │  ← Read replicas
└────────────────────────┘
```

---

## 🔄 Deployment Pipeline

```
Local Development
      │
      │ git push
      ▼
GitHub Repository
      │
      ├──────────────┬──────────────┐
      │              │              │
      ▼              ▼              ▼
Vercel Build    Render Build   Database
(Frontend)      (Backend)      (Migrations)
      │              │              │
      │ (2-3 min)    │ (5-8 min)   │ (instant)
      │              │              │
      ▼              ▼              ▼
Production     Production      Updated
Frontend       Backend         Schema
      │              │              │
      └──────────────┴──────────────┘
              │
              ▼
         🎉 LIVE!
```

---

## 💾 Backup Strategy

```
┌─────────────────────────────────────┐
│  Automated Backups                  │
├─────────────────────────────────────┤
│  • Neon: Daily snapshots (7 days)   │
│  • MongoDB: Point-in-time recovery  │
│  • Git: Version control (forever)   │
│  • Vercel: Deployment history       │
└─────────────────────────────────────┘
```

---

## 📊 Monitoring Setup

```
┌──────────────────────────────────────────────┐
│           Monitoring Stack                    │
├──────────────────────────────────────────────┤
│  Vercel Analytics    → Frontend performance  │
│  Render Metrics      → Backend health        │
│  UptimeRobot         → Uptime monitoring     │
│  Sentry (optional)   → Error tracking        │
│  Google Analytics    → User analytics        │
└──────────────────────────────────────────────┘
```

---

## 🌍 Global Distribution

```
User Location     →  Served From
────────────────────────────────
🇮🇳 India         →  Singapore Edge
🇺🇸 USA           →  US East Coast
🇪🇺 Europe        →  Frankfurt
🇦🇺 Australia     →  Sydney

Average Latency: < 100ms
Global CDN: 100+ locations
```

---

## 💰 Cost Breakdown

### Free Tier (Sufficient for 1000+ users):
```
Vercel:     $0/month
Render:     $0/month
Neon:       $0/month
MongoDB:    $0/month
Domain:     $10/year
SSL:        $0 (included)
───────────────────────
Total:      ~$1/month
```

### Production Scale (10,000+ users):
```
Vercel Pro:     $20/month
Render:         $7/month
Neon Pro:       $19/month
MongoDB:        $9/month
Monitoring:     Free
───────────────────────
Total:          $55/month
```

---

## ✅ Advantages of This Setup

### ✓ Zero DevOps:
- No server management
- Auto-scaling
- Auto-SSL
- Auto-backups

### ✓ Developer Friendly:
- Git-based deployment
- Preview deployments
- Easy rollbacks
- Fast builds

### ✓ Performance:
- Global CDN
- Edge caching
- Optimized builds
- Fast database

### ✓ Cost Effective:
- Free tier generous
- Pay as you grow
- No upfront costs
- Predictable pricing

---

## 🎯 Alternative Architectures

### Budget Option ($0/month):
```
Vercel (Frontend) + Railway (Backend) + Supabase (DB)
```

### Enterprise Option:
```
AWS CloudFront + AWS ECS + AWS RDS + AWS DocumentDB
```

### Simple Option:
```
DigitalOcean Droplet ($6/month) - Everything on one server
```

---

**Recommended**: Vercel + Render + Neon/Atlas (Free tier)
**Reason**: Best balance of cost, performance, and ease of use
**Suitable for**: MVPs, demos, small-to-medium apps
