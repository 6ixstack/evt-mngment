# ShaadiBasket Backend

Node.js/Express API server for the ShaadiBasket wedding planning platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure all variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
# Or for Azure OpenAI:
# AZURE_OPENAI_API_KEY=your_azure_openai_key
# AZURE_OPENAI_ENDPOINT=your_azure_endpoint

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── controllers/         # Request handlers
│   ├── authController.ts      # Authentication endpoints
│   ├── aiController.ts        # AI planning endpoints
│   ├── providersController.ts # Provider management
│   ├── leadsController.ts     # Lead management
│   └── stripeController.ts    # Payment processing
├── routes/             # API route definitions
│   ├── auth.ts         # Authentication routes
│   ├── ai.ts          # AI planning routes
│   ├── providers.ts   # Provider routes
│   ├── leads.ts       # Lead routes
│   └── stripe.ts      # Stripe webhooks
├── middleware/         # Custom middleware
│   └── auth.ts        # JWT authentication
├── services/          # Business logic services
├── types/            # TypeScript interfaces
│   └── index.ts      # Shared type definitions
├── utils/            # Utility functions
│   └── supabase.ts   # Supabase client
└── index.ts          # Express app setup
```

## 🔐 Authentication

The API uses Supabase authentication with JWT tokens:

```typescript
// Protected routes require Authorization header
Authorization: Bearer <supabase-jwt-token>
```

## 📊 Database Integration

### Supabase Setup
1. Create tables using `docs/database-schema.sql`
2. Configure Row Level Security (RLS) policies
3. Set up storage buckets for file uploads

### Key Models
- **Users**: User accounts (couples and providers)
- **Providers**: Business profiles with services
- **Events**: Wedding planning sessions
- **Tasks**: Individual steps in plans
- **Leads**: User-provider communications

## 🤖 AI Integration

### OpenAI Configuration
The API integrates with OpenAI GPT-4 for:
- Generating personalized wedding checklists
- Matching providers to user requirements
- Refining plans based on feedback

### Azure OpenAI Alternative
To use Azure OpenAI instead:
1. Set `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT`
2. Uncomment Azure configuration in `aiController.ts`

## 💳 Stripe Integration

### Webhook Setup
1. Register webhook endpoint: `https://your-api.com/api/stripe/webhook`
2. Select events: `customer.subscription.*`, `invoice.*`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Subscription Flow
1. Provider signs up → account created (inactive)
2. Redirect to Stripe Checkout → subscription created
3. Webhook confirms payment → account activated
4. Provider can manage subscription through Stripe Portal

## 🛡 Security Features

- **CORS** configured for frontend domain
- **Helmet** for security headers
- **Rate limiting** on sensitive endpoints
- **Input validation** and sanitization
- **Row Level Security** in database
- **JWT token verification**
- **Stripe webhook signature verification**

## 📍 API Endpoints

### Authentication (`/api/auth`)
```
POST /signup     - User/provider registration
POST /signin     - User login
POST /signout    - User logout
GET  /me         - Get user profile
```

### AI Planning (`/api/ai`)
```
POST /generate-plan  - Generate wedding checklist
POST /refine-step    - Refine specific step
```

### Providers (`/api/providers`)
```
GET    /              - Search providers
GET    /:id           - Get provider details
POST   /              - Create provider profile
PUT    /:id           - Update provider profile
DELETE /:id           - Delete provider profile
```

### Leads (`/api/leads`)
```
POST   /         - Create lead
GET    /         - Get leads (user/provider specific)
GET    /stats    - Get lead statistics
PUT    /:id      - Update lead status
DELETE /:id      - Delete lead
```

### Stripe (`/api/stripe`)
```
POST /webhook              - Handle Stripe webhooks
POST /create-subscription  - Create subscription
POST /cancel-subscription  - Cancel subscription
GET  /subscription-status  - Get subscription status
```

### Health Check
```
GET /health - Server health status
```

## 🔍 Request/Response Examples

### Generate Wedding Plan
```bash
POST /api/ai/generate-plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_type": "Wedding",
  "prompt": "A 3-day Pakistani wedding for 200 guests in Toronto with halal catering"
}
```

Response:
```json
{
  "event": { "id": "...", "user_id": "...", ... },
  "checklist": [
    {
      "step_title": "Book a Venue",
      "description": "Find and reserve a wedding venue...",
      "tags": ["venue"],
      "matching_providers": [...]
    }
  ]
}
```

### Search Providers
```bash
GET /api/providers?type=venue&city=Toronto&tags=halal&lat=43.6532&lng=-79.3832

{
  "providers": [
    {
      "id": "...",
      "business_name": "Elegant Venues Toronto",
      "provider_type": "venue",
      "location_city": "Toronto",
      "tags": ["luxury", "downtown"],
      "distance": 2.5
    }
  ],
  "total": 12,
  "page": 1
}
```

## 🚀 Deployment

### Render.com Deployment
1. Connect GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main

### Environment Variables for Production
Ensure all production keys are configured:
- Use production Supabase project
- Use live Stripe keys
- Set strong JWT secret
- Configure production CORS origins

## 📈 Monitoring

### Health Monitoring
- Health check endpoint: `GET /health`
- Application logs via Morgan middleware
- Error tracking with console.error

### Database Monitoring
- Supabase dashboard for performance metrics
- Query performance analysis
- Connection pool monitoring

### Payment Monitoring
- Stripe dashboard for payment analytics
- Webhook delivery monitoring
- Subscription status tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Test specific endpoint
curl -X GET http://localhost:3001/health
```

## 🔧 Development Tips

### Adding New Endpoints
1. Create controller method
2. Add route definition
3. Update middleware if needed
4. Test with sample requests

### Database Queries
- Use Supabase client with TypeScript
- Apply Row Level Security policies
- Use transactions for complex operations

### Error Handling
All controllers include comprehensive error handling:
```typescript
try {
  // Business logic
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

## 🐛 Troubleshooting

### Common Issues
- **CORS errors**: Check FRONTEND_URL configuration
- **Auth failures**: Verify Supabase keys and JWT secret
- **AI timeouts**: Check OpenAI API key and rate limits
- **Webhook failures**: Verify Stripe webhook secret

### Debugging
- Check logs: `npm run dev` shows detailed logs
- Test endpoints: Use curl or Postman
- Verify environment: Check all required variables are set

### Database Issues
- Check Supabase connection
- Verify RLS policies are correct
- Monitor query performance in dashboard