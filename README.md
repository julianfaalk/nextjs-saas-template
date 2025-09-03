# Next.js SaaS Template

A complete, production-ready SaaS template built with Next.js 14, featuring authentication, payments, AI integration, and modern UI components.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47a248?logo=mongodb)](https://mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-635bff?logo=stripe)](https://stripe.com/)

## ✨ Features

### 🔐 Authentication & User Management
- **NextAuth.js** with Google OAuth and Magic Link email authentication
- User profiles, sessions, and account management
- Secure session handling with JWT tokens
- Email verification and magic link authentication

### 💳 Payment & Subscription Management
- **Stripe** integration with webhook handling
- Multiple pricing tiers (Free, Starter, Professional)
- One-time payments and recurring subscriptions
- Credit system for pay-per-use billing
- Automatic subscription status updates

### 🤖 AI Integration
- **OpenAI API** integration ready
- Configurable AI models and parameters
- Generic document processing pipeline
- Streaming responses for real-time feedback

### 🎨 Modern UI/UX
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- Fully responsive design
- Dark mode support (ready to implement)
- Professional landing page and dashboard

### 🏗️ Developer Experience
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **Docker** support for containerization
- Hot reloading in development
- Production-optimized builds

### 📊 Database & Storage
- **MongoDB** with Mongoose ODM
- Optimized schemas with proper indexing
- Activity logging and audit trails
- Document versioning and history

### 🚀 Production Ready
- Docker containerization
- Nginx reverse proxy configuration
- Health checks and monitoring
- Security headers and CORS configuration
- Rate limiting and DDoS protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/nextjs-saas-template.git
cd nextjs-saas-template

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
```

**Required Environment Variables:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/yourapp

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# OAuth (optional but recommended)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (required for magic links)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM="Your App <noreply@yourapp.com>"

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Database Setup

Start MongoDB locally or use MongoDB Atlas:

```bash
# Using Docker (recommended)
docker run -d --name mongodb -p 27017:27017 mongo:7.0

# Or use the full docker-compose setup
docker-compose up -d
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

### Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── icons/            # Icon components
├── lib/                  # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── db/               # Database schemas and utilities
│   └── utils.ts          # Helper utilities
└── types/                # TypeScript type definitions
```

### Key Components

#### Authentication Flow
1. Users can sign in with Google OAuth or Magic Link email
2. Sessions are managed with NextAuth.js and JWT tokens
3. User data is stored in MongoDB with proper indexing

#### Payment Flow
1. Stripe checkout sessions for subscriptions and one-time payments
2. Webhook handling for automatic status updates
3. Credit system for flexible billing models

#### AI Integration
The template includes a flexible AI processing pipeline:

```typescript
// Example: Processing documents with AI
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function processDocument(content: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content }],
    temperature: 0.2,
  })
  
  return response.choices[0].message.content
}
```

### Configuration

#### Stripe Setup
1. Create a Stripe account and get your API keys
2. Set up products and pricing in the Stripe Dashboard
3. Configure webhook endpoints for subscription management
4. Update the price IDs in your environment variables

#### Email Setup (Resend)
1. Sign up for Resend and get your API key
2. Verify your sending domain
3. Configure the email templates in `src/lib/email.ts`

#### Database Schema
The template includes pre-configured schemas for:
- Users with subscription status
- Documents with versioning
- Payments and subscription tracking
- Activity logs and audit trails

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services including MongoDB and Redis
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build and deploy with production profile
docker-compose --profile production up -d

# This includes Nginx reverse proxy with SSL
```

### Environment Variables for Docker

Create a `.env` file for Docker Compose:

```env
# Database passwords
MONGO_ROOT_PASSWORD=your_secure_mongo_password
REDIS_PASSWORD=your_secure_redis_password

# Application secrets
NEXTAUTH_SECRET=your_nextauth_secret

# API keys
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
OPENAI_API_KEY=your_openai_api_key

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🔧 Customization

### Branding
1. Update the logo and branding in `src/components/Header.tsx`
2. Modify the color scheme in `tailwind.config.ts`
3. Update metadata in `src/app/layout.tsx`

### Adding New Features
1. Create new API routes in `src/app/api/`
2. Add database schemas in `src/lib/db/schemas.ts`
3. Build UI components using the shadcn/ui library

### Payment Plans
Modify the subscription logic in `src/lib/subscription-utils.ts`:

```typescript
export interface UserPlan {
  name: 'free' | 'starter' | 'professional' | 'enterprise'
  // Add your plan features here
}
```

## 📊 Monitoring & Analytics

### Health Checks
The template includes a health check endpoint at `/api/health`:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "uptime": 123.45
}
```

### Logging
All user activities are logged for audit purposes:

```typescript
import { activity } from '@/lib/db/database'

await activity.log(userId, 'document_created', { 
  documentId,
  fileName 
})
```

## 🚀 Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

### Self-Hosted with Docker
1. Use the provided Docker configuration
2. Set up your domain and SSL certificates
3. Configure the Nginx reverse proxy

### Other Platforms
- **Netlify**: Requires serverless functions setup
- **Railway**: Direct Docker deployment
- **DigitalOcean App Platform**: Container-based deployment

## 🔒 Security

The template includes several security measures:

- **Environment variable validation**
- **CORS configuration**
- **Rate limiting on API routes**
- **Security headers (CSP, HSTS, etc.)**
- **Input sanitization**
- **SQL injection prevention**
- **XSS protection**

### Additional Security Recommendations

1. **Enable HTTPS** in production
2. **Use strong secrets** for all environment variables
3. **Regularly update dependencies**
4. **Monitor for vulnerabilities** with `npm audit`
5. **Implement proper logging** and monitoring

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build check
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **shadcn** for the beautiful UI components
- **Vercel** for hosting and deployment platform
- **Stripe** for payment processing
- **MongoDB** for the database
- **OpenAI** for AI capabilities

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs and feature requests
- **Community**: Join our Discord server for discussions

---

**Happy coding!** 🚀

If you find this template useful, please consider giving it a ⭐ on GitHub!