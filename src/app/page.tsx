"use client"

import React from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Check, Zap, Shield, Sparkles, Users, BarChart3, Rocket } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HomePage() {
  const { data: session, status } = useSession()

  // If user is authenticated, show dashboard or redirect
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Header />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">
              Welcome back, {session.user?.name}!
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Ready to continue where you left off?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/documents">View Documents</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      
      {/* Hero Section */}
      <main className="pt-16">
        <section className="px-4 py-20 sm:py-32">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 text-sm font-medium px-3 py-1">
                ✨ AI-Powered • Built with Next.js
              </Badge>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
              Transform Your Workflow with{' '}
              <span className="gradient-text">AI-Powered</span> Solutions
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Streamline your business processes, automate repetitive tasks, and unlock new possibilities 
              with our intelligent SaaS platform. Start free, scale as you grow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="text-base px-8 py-6" asChild>
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 py-6" asChild>
                <Link href="/demo">
                  View Demo
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-4">Trusted by teams at</p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="text-2xl font-bold text-slate-400">Acme Corp</div>
                <div className="text-2xl font-bold text-slate-400">TechFlow</div>
                <div className="text-2xl font-bold text-slate-400">InnovateX</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Powerful features designed to streamline your workflow and boost productivity
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Lightning Fast</CardTitle>
                  <CardDescription>
                    Built for speed with Next.js 14 and modern web technologies
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-green-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Secure by Default</CardTitle>
                  <CardDescription>
                    Enterprise-grade security with authentication and data protection
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-purple-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>AI Integration</CardTitle>
                  <CardDescription>
                    Powered by OpenAI for intelligent automation and insights
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-orange-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle>Team Collaboration</CardTitle>
                  <CardDescription>
                    Work together seamlessly with real-time collaboration features
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-indigo-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle>Analytics & Insights</CardTitle>
                  <CardDescription>
                    Make data-driven decisions with comprehensive analytics
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-pink-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <Rocket className="w-6 h-6 text-pink-600" />
                  </div>
                  <CardTitle>Scale Effortlessly</CardTitle>
                  <CardDescription>
                    Grow from startup to enterprise with flexible pricing plans
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-slate-600">
                Start free and scale with your business
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="relative">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl">Starter</CardTitle>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-slate-600 ml-2">/month</span>
                  </div>
                  <CardDescription>Perfect for trying out our platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">5 documents per month</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">Basic AI features</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">Email support</span>
                  </div>
                  <Button className="w-full mt-6" variant="outline" asChild>
                    <Link href="/auth/signup">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="relative border-2 border-blue-500">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl">Professional</CardTitle>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$19</span>
                    <span className="text-slate-600 ml-2">/month</span>
                  </div>
                  <CardDescription>For growing businesses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">100 documents per month</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">Advanced AI features</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">API access</span>
                  </div>
                  <Button className="w-full mt-6" asChild>
                    <Link href="/auth/signup">Start 14-day trial</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="relative">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$49</span>
                    <span className="text-slate-600 ml-2">/month</span>
                  </div>
                  <CardDescription>For large organizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">Unlimited documents</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">Custom AI models</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">24/7 phone support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm">SSO integration</span>
                  </div>
                  <Button className="w-full mt-6" variant="outline" asChild>
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-slate-900">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to transform your workflow?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using our platform to streamline their operations
              and boost productivity with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8 py-6" asChild>
                <Link href="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-slate-900" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}