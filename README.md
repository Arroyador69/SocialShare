# 🌐 SocialShare - Multi-Platform Social Media SaaS

**Professional SaaS platform for publishing to multiple social networks simultaneously.**

- Instagram, TikTok, LinkedIn, YouTube, Facebook, Twitter
- Stripe monetization
- Full authentication & GDPR compliance
- Production-ready, documented for Cursor/developer handoff

## 🚀 Quick Start

### Backend (Railway)
```bash
cd backend
npm install
# Configure .env (see .env.example)
npm run dev
```

### Frontend (Vercel)
```bash
cd frontend
npm install
# Configure .env.local (see .env.example)
npm run dev
```

## 📁 Structure

```
SocialShare/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── models/   # Database schemas
│   │   ├── middleware/
│   │   └── services/ # Business logic
│   └── .env.example
├── frontend/         # React dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   └── .env.example
└── docs/            # Documentation
```

## 🔑 Key Features

✅ User authentication (JWT)
✅ Stripe subscription management
✅ Multi-social API integration
✅ Scheduled posting
✅ Dashboard & analytics
✅ GDPR compliance
✅ Scalable architecture

## 📖 See docs/ for detailed setup instructions
