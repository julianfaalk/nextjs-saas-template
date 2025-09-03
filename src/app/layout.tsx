import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthSessionProvider from '@/components/providers/SessionProvider'
import { Toaster } from '@/components/ui/toaster'
import packageJson from '../../package.json'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Your SaaS App - AI-Powered Solutions',
    template: '%s | Your SaaS App'
  },
  description: 'Transform your workflow with our AI-powered SaaS platform. Built with Next.js, featuring authentication, payments, and modern UI components.',
  keywords: [
    'SaaS',
    'AI',
    'automation',
    'productivity',
    'Next.js',
    'React',
    'TypeScript',
    'Stripe',
    'authentication'
  ],
  authors: [{ name: 'Your SaaS App' }],
  creator: 'Your SaaS App',
  publisher: 'Your SaaS App',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Your SaaS App - AI-Powered Solutions',
    description: 'Transform your workflow with our AI-powered SaaS platform. Start free, scale as you grow.',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: 'Your SaaS App',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        secureUrl: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Your SaaS App - AI-Powered Solutions',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yoursaasapp',
    creator: '@yoursaasapp',
    title: 'Your SaaS App - AI-Powered Solutions',
    description: 'Transform your workflow with our AI-powered SaaS platform.',
    images: {
      url: '/og-image.png',
      alt: 'Your SaaS App - AI-Powered Solutions',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Your SaaS App',
    description: 'AI-powered SaaS platform for modern businesses. Transform your workflow with intelligent automation.',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '250',
      bestRating: '5',
      worstRating: '1'
    },
    provider: {
      '@type': 'Organization',
      name: 'Your SaaS App',
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      logo: '/logo.svg',
      sameAs: []
    }
  }

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        {/* Apple-specific tags for mobile */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthSessionProvider>
          {children}
          <Toaster />
          <div className="fixed bottom-2 right-2 text-xs text-gray-400 z-10">
            v{packageJson.version}
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  )
}