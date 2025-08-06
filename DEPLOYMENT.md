# 🚀 EventCraft Deployment Guide

This guide ensures you can deploy EventCraft with a single command and avoid database sync issues.

## Quick Deployment (Recommended)

Run the automated deployment script:

```bash
./deploy.sh
```

This script will:
1. ✅ Check dependencies
2. ✅ Install all packages  
3. ✅ Build frontend and backend
4. ✅ Update database schema automatically
5. ✅ Commit and push changes
6. ✅ Trigger deployments

## Manual Database Migration

If you need to update the database separately:

```bash
cd backend
npm run migrate
```

Or manually run the SQL in your Supabase SQL Editor:
1. Copy contents of `backend/database/schema.sql`
2. Paste and execute in Supabase SQL Editor

## Environment Setup

Make sure you have these files:

### `backend/.env`
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
OPENAI_API_KEY=your_openai_key (fallback)
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### `frontend/.env`
```env
VITE_SUPABASE_URL=your_supabase_url  
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=your_backend_url
```

## Testing Provider Signup

After deployment, test that provider signups work correctly:

1. Go to your app
2. Sign up as a provider
3. Check your Supabase database
4. Verify the user has `type = 'provider'` (not 'user')

## Prerequisites
- GitHub repository with EventCraft code
- Supabase project set up (Phase 1-3 from main deployment guide)
- Environment variables ready

## Manual Deployment Steps (Alternative)

### 1. Update Frontend Environment
Edit `/frontend/.env.production` with your actual values:
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Setup automated deployment"
git push origin main
```

### 3. Configure GitHub Secrets
Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these repository secrets:
```
VITE_SUPABASE_URL = https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
VITE_API_BASE_URL = https://your-backend-name.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_your-publishable-key
```

### 4. Enable GitHub Pages
1. Go to Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: main / (root)
4. Save

### 5. Connect Render.com to GitHub
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. "Build and deploy from a Git repository"
4. Connect your GitHub account
5. Select your repository
6. Render will detect the `render.yaml` file automatically
7. Review settings and click "Create Web Service"

### 6. Add Environment Variables in Render
In your Render dashboard, go to Environment and add:

```bash
NODE_ENV=production
FRONTEND_URL=https://yourusername.github.io/evt-mngment
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AZURE_OPENAI_API_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-deployment
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=sk_live_your-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID=price_your-subscription-price-id
```

## Automated Deployment Flow

### Frontend (GitHub Pages)
- ✅ Triggers on push to `main` branch
- ✅ Builds React app with production environment
- ✅ Deploys to `https://yourusername.github.io/evt-mngment`
- ✅ Takes ~3-5 minutes

### Backend (Render.com)
- ✅ Auto-deploys when connected to GitHub
- ✅ Triggers on any push to `main` branch
- ✅ Uses `render.yaml` configuration
- ✅ Deploys to `https://your-service-name.onrender.com`
- ✅ Takes ~5-10 minutes

## Manual Trigger
You can manually trigger frontend deployment:
1. Go to Actions tab in GitHub
2. Select "Deploy EventCraft Platform"
3. Click "Run workflow"

## Environment Files

### Frontend (.env.production)
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=your-backend-api-url
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Backend (.env - already created)
```bash
NODE_ENV=production
FRONTEND_URL=your-frontend-url
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# ... other backend variables
```

## Monitoring Deployments

### GitHub Actions
- Monitor frontend deployment: Repository → Actions tab
- View build logs and deployment status
- Check deployment URL after successful build

### Render.com
- Monitor backend deployment: Render dashboard → your service
- View build and runtime logs
- Check health status at `/health` endpoint

## Troubleshooting

### Common Issues
1. **Build failures**: Check environment variables in GitHub secrets
2. **API errors**: Verify backend URL in frontend environment
3. **CORS issues**: Ensure FRONTEND_URL matches your GitHub Pages URL
4. **Webhook failures**: Update Stripe webhook URL to Render backend URL

### Quick Fixes
- Re-run failed GitHub Actions workflow
- Restart Render service if needed
- Check environment variable names (case-sensitive)
- Verify all secrets are added in GitHub

## Success Indicators
- ✅ GitHub Actions shows green checkmark
- ✅ Frontend loads at GitHub Pages URL
- ✅ Backend health check returns 200: `your-backend-url/health`
- ✅ API calls work between frontend and backend
- ✅ Database connections successful
- ✅ Stripe webhooks receiving events

## Next Steps After Deployment
1. Test complete user flow
2. Test provider registration and subscription
3. Verify AI plan generation works
4. Test image uploads
5. Check email notifications (if enabled)
6. Update Stripe webhook URL to production backend
7. Configure custom domain (optional)

Your EventCraft platform will be fully automated - any push to `main` branch will trigger deployments! 🚀