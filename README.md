# EventCraft - AI-Powered Event Planning Platform

**Dream. Plan. Celebrate.**

EventCraft is a comprehensive SaaS platform that uses AI to help people plan their perfect events by generating personalized checklists and connecting them with trusted local vendors. While weddings are our primary focus, the platform supports all types of celebrations.

## 🚀 Features

### For Event Planners
- **AI-Powered Planning**: Describe your dream event and get a personalized step-by-step checklist
- **Multi-Event Support**: Plan weddings, birthdays, corporate events, graduations, and more
- **Vendor Discovery**: Browse and filter local vendors that match your specific requirements
- **Intelligent Matching**: AI matches vendors based on your preferences, location, and special needs
- **Event Management**: Save and share your event plans
- **Direct Communication**: Contact vendors directly through the platform

### For Vendors/Providers
- **Business Profiles**: Create comprehensive profiles with images, services, and pricing
- **Lead Management**: Receive and manage leads from potential clients
- **Subscription Management**: Simple monthly subscription model
- **Analytics Dashboard**: Track profile views, leads, and business performance
- **Secure Payments**: Integrated Stripe payment processing

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Framer Motion** for animations
- **React Hook Form** for form management
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **OpenAI/Azure OpenAI** for AI-powered planning
- **Stripe** for subscription payments
- **JWT** for authentication

### Infrastructure
- **Supabase** for database, auth, and storage
- **Render.com** for backend hosting
- **GitHub Pages** for frontend deployment
- **Stripe** for payment processing

## 📁 Project Structure

```
evt-mngment/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React context providers
│   │   ├── lib/           # Utility functions and configs
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── dist/             # Build output
├── backend/                # Node.js/Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API route definitions
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Utility functions
│   └── dist/             # Compiled JavaScript
├── docs/                 # Documentation and database schemas
│   ├── database-schema.sql
│   ├── seed-data.sql
│   └── api-docs.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Stripe account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd evt-mngment
```

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema:
   ```sql
   -- Copy and paste contents of docs/database-schema.sql
   -- into the Supabase SQL editor and execute
   ```
3. (Optional) Add seed data:
   ```sql
   -- Copy and paste contents of docs/seed-data.sql
   -- to populate with sample data
   ```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure your `.env` file:
```env
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
# Or for Azure OpenAI:
# AZURE_OPENAI_API_KEY=your_azure_openai_key
# AZURE_OPENAI_ENDPOINT=your_azure_endpoint

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Configure your `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001/api
```

Start the frontend:
```bash
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts (couples and providers)
- **providers** - Provider/vendor business profiles
- **events** - Wedding/event planning sessions
- **tasks** - Individual steps in wedding plans
- **leads** - Communication between couples and providers

See `docs/database-schema.sql` for the complete schema with indexes and RLS policies.

## 🔐 Authentication & Security

- **Supabase Auth** for user authentication
- **Row Level Security (RLS)** for data access control
- **JWT tokens** for API authentication
- **HTTPS** enforced in production
- **CORS** configured for secure cross-origin requests
- **Input validation** and sanitization
- **Rate limiting** on API endpoints

## 💳 Payment Integration

- **Stripe Checkout** for provider subscriptions
- **Webhook handling** for payment events
- **Subscription management** through Stripe Customer Portal
- **Automatic provider activation/deactivation** based on payment status

## 🤖 AI Integration

The platform uses OpenAI's GPT-4 to:
- Generate personalized wedding checklists
- Match vendors based on requirements
- Refine plans based on user feedback
- Provide intelligent recommendations

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get user profile

### AI Planning
- `POST /api/ai/generate-plan` - Generate wedding plan
- `POST /api/ai/refine-step` - Refine specific plan step

### Providers
- `GET /api/providers` - Search providers
- `GET /api/providers/:id` - Get provider details
- `PUT /api/providers/:id` - Update provider profile

### Leads
- `POST /api/leads` - Create lead
- `GET /api/leads` - Get user/provider leads
- `PUT /api/leads/:id` - Update lead status

### Stripe
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `POST /api/stripe/create-subscription` - Create subscription
- `POST /api/stripe/cancel-subscription` - Cancel subscription

## 🚀 Deployment

### Backend (Render.com)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables
4. Deploy automatically on push to main branch

### Frontend (GitHub Pages)
1. Build the application: `npm run build`
2. Configure GitHub Pages to serve from `dist/` directory
3. Set up GitHub Actions for automatic deployment

### Environment Variables for Production
Ensure all environment variables are properly configured in your hosting platforms with production values.

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

## 📈 Monitoring & Analytics

- **Application metrics** through hosting platform dashboards
- **Database performance** via Supabase analytics
- **Payment monitoring** through Stripe dashboard
- **Error tracking** with built-in logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact [support@shaadibasket.com](mailto:support@shaadibasket.com) or create an issue in the GitHub repository.

## 🗺 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI recommendations
- [ ] Multi-language support
- [ ] Vendor reviews and ratings
- [ ] Budget tracking tools
- [ ] Guest management features
- [ ] Calendar integration
- [ ] SMS notifications

---

**Built with ❤️ for couples planning their perfect celebration**