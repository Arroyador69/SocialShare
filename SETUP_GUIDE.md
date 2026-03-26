# 🚀 SocialShare Setup Guide

## Backend Setup (Railway)

### 1. Initialize Database

```bash
cd backend
npm install

# Create .env file from .env.example
cp .env.example .env

# Configure your DATABASE_URL (Railway PostgreSQL)
```

### 2. Run Migrations

```bash
npm run migrate
```

This will create all necessary tables using `src/db/schema.sql`.

### 3. Deploy to Railway

```bash
npm install -g railway
railway login
railway init
npm run build
```

Configure Railway environment variables in dashboard:
- DATABASE_URL
- JWT_SECRET
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NODE_ENV=production
- FRONTEND_URL=your-vercel-domain

### 4. Test API

```bash
curl http://localhost:5000/health
```

---

## Frontend Setup (Vercel)

### 1. Install & Configure

```bash
cd frontend
npm install

# Create .env.local
cp .env.example .env.local

# Update with your values:
NEXT_PUBLIC_API_URL=your-railway-api-url
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### 3. Configure Environment Variables in Vercel Dashboard

- NEXT_PUBLIC_API_URL (Railway API URL)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

---

## Stripe Setup

### 1. Create Products

In Stripe Dashboard → Products:

**Product 1: Pro Plan**
- Name: SocialShare Pro
- Description: All features, up to 10 accounts
- Pricing: €6.99/month (recurring)
- Copy Price ID: `price_pro_monthly`

**Product 2: Enterprise Plan**
- Name: SocialShare Enterprise  
- Description: Unlimited accounts + priority support
- Pricing: €29.99/month (recurring)
- Copy Price ID: `price_enterprise_monthly`

### 2. Update Backend

Replace in `backend/src/routes/stripe.js`:
```javascript
const priceIds = {
  pro: 'price_1234567890abcdef', // Your actual Stripe price ID
  enterprise: 'price_0987654321fedcba' // Your actual Stripe price ID
};
```

### 3. Configure Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add Endpoint: `https://your-railway-api/api/stripe/webhook`
3. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
4. Copy Webhook Signing Secret to `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Database Schema Overview

### Users Table
- id, email, password (hashed), full_name
- For authentication & profile management

### Subscriptions Table
- Tracks user's Stripe subscription
- Links to Stripe Customer ID & Subscription ID
- Stores plan type (free/pro/enterprise) & status

### Social Accounts Table
- User's connected social media accounts
- Stores access tokens (encrypted recommended)
- Tracks which platforms are enabled

### Posts Table
- Content to be published
- Status: draft, scheduled, published, failed
- Contains media URLs & scheduled timestamps

### Post Platforms Table
- Maps each post to multiple social accounts
- Tracks per-platform status & post IDs

### Consent Logs Table
- GDPR compliance tracking
- Records when users agree to terms/privacy

---

## OAuth Integration (Next Steps)

When you're ready to connect social platforms, you'll need:

### Instagram Graph API
- Create app on Meta Developers
- Get access token from user
- POST to `/api/social-accounts/connect` with platform='instagram'

### TikTok API
- Register app on TikTok Developer
- Implement OAuth flow
- Post access token

### LinkedIn
- Create LinkedIn App
- OAuth2 flow through LinkedIn
- Post access token

### YouTube
- Create Google OAuth credentials
- Implement consent screen
- Post access token

### Facebook
- Similar to Instagram (Meta Developers)
- Create Facebook App
- Post access token

### Twitter
- Create Twitter Developer Account
- Implement OAuth 2.0 with PKCE
- Post bearer token

---

## Testing Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit: http://localhost:3000

### Test Account
- Email: test@example.com
- Password: Test123!

---

## Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] Stripe products created & price IDs added
- [ ] Stripe webhook configured
- [ ] Environment variables set in Railway & Vercel
- [ ] Test registration flow
- [ ] Test subscription purchase
- [ ] Test social account connection (mock)
- [ ] Test post creation

---

## Next Steps for You (via Cursor)

1. **OAuth Handlers** - Create endpoints for each social platform
2. **Post Publishing** - Implement actual API calls to publish posts
3. **Analytics** - Add analytics collection & display
4. **Email Notifications** - Set up SendGrid for confirmations
5. **Advanced Features** - AI content generation, auto-scheduling, etc.

---

## Troubleshooting

**"Connection refused" on localhost:5000**
- Ensure backend is running: `npm run dev` in backend folder

**Stripe webhook not working**
- Check webhook signing secret in `.env`
- Test webhook through Stripe dashboard

**Vercel deployment fails**
- Check environment variables are set
- Ensure frontend can reach backend API URL

**Database connection errors**
- Verify DATABASE_URL format (PostgreSQL)
- Check Railway database is running
- Ensure credentials are correct

---

**Need help? Check the docs/ folder for platform-specific guides.**
