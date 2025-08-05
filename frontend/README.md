# ShaadiBasket Frontend

React-based frontend application for the ShaadiBasket wedding planning platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001/api
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── Navbar.tsx      # Navigation component
│   ├── Hero.tsx        # Landing page hero section
│   ├── HowItWorks.tsx  # How it works section
│   └── AuthModal.tsx   # Authentication modal
├── pages/              # Page components
│   ├── Landing.tsx     # Landing page
│   ├── Dashboard.tsx   # User dashboard
│   └── Provider.tsx    # Provider dashboard
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/               # Utilities and configurations
│   ├── utils.ts       # Utility functions
│   └── supabase.ts    # Supabase client
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🎨 Styling

The application uses Tailwind CSS with custom components from shadcn/ui.

### Key Classes
- `btn-primary` - Primary button styling
- `btn-secondary` - Secondary button styling
- `card` - Card container styling
- `input` - Input field styling

## 🔐 Authentication

Authentication is handled through Supabase Auth with React Context:

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { user, signIn, signUp, signOut } = useAuth();
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎭 Animations

Framer Motion is used for smooth animations and transitions throughout the application.

## 🧪 Development Tips

### Using shadcn/ui Components
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation if needed

### State Management
- Global state: React Context
- Form state: React Hook Form
- Server state: React Query (if added)

## 🚀 Deployment

### GitHub Pages
The app is configured for deployment to GitHub Pages:

1. Build: `npm run build`
2. The `dist/` folder contains the production build
3. Configure GitHub Pages to serve from this directory

### Other Platforms
The build output in `dist/` can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps

## 🔧 Configuration

### Vite Configuration
See `vite.config.ts` for build configuration including:
- Path aliases (`@/` maps to `src/`)
- Base URL for GitHub Pages deployment
- Build optimizations

### TypeScript Configuration
- Strict mode enabled
- Path mapping configured
- Modern ES2022 target

## 📦 Dependencies

### Core
- React 18 + TypeScript
- Vite for build tooling
- React Router for navigation

### UI & Styling
- Tailwind CSS
- shadcn/ui components
- Framer Motion for animations
- Heroicons for icons

### State & Forms
- React Hook Form
- React Hot Toast for notifications

### Backend Integration
- Supabase client
- Stripe.js for payments

## 🐛 Troubleshooting

### Build Issues
- Ensure all environment variables are set
- Check TypeScript errors: `npm run type-check`
- Clear node_modules and reinstall if needed

### Styling Issues
- Tailwind classes not working: Check PostCSS configuration
- Custom styles not applying: Verify CSS import order

### Authentication Issues
- Check Supabase configuration
- Verify environment variables
- Check browser network tab for API errors