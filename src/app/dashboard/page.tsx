"use client"

import React from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, BarChart3, Zap, Plus, ArrowRight, Sparkles } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  const stats = [
    {
      title: 'Documents',
      value: '12',
      change: '+3 this week',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'AI Processes',
      value: '45',
      change: '+12 this month',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Team Members',
      value: '8',
      change: '+2 this month',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Usage',
      value: '78%',
      change: 'of monthly limit',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const recentActivity = [
    { action: 'Document processed', time: '2 minutes ago', status: 'completed' },
    { action: 'New team member added', time: '1 hour ago', status: 'info' },
    { action: 'AI analysis completed', time: '3 hours ago', status: 'completed' },
    { action: 'Monthly report generated', time: '1 day ago', status: 'completed' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your account today.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button className="h-20 text-left justify-start p-6" asChild>
              <Link href="/upload">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Upload Document</div>
                    <div className="text-sm opacity-80">Process new files</div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-20 text-left justify-start p-6" asChild>
              <Link href="/documents">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">View Documents</div>
                    <div className="text-sm text-gray-600">Manage your files</div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-20 text-left justify-start p-6" asChild>
              <Link href="/analytics">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">View Analytics</div>
                    <div className="text-sm text-gray-600">Check insights</div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/activity">
                    View All Activity
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Usage & Upgrade */}
            <div className="space-y-6">
              {/* Usage Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage This Month</CardTitle>
                  <CardDescription>
                    78 of 100 documents processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={78} className="mb-4" />
                  <div className="text-sm text-gray-600 mb-4">
                    22 documents remaining this month
                  </div>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href="/usage">View Details</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Upgrade Card */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">Upgrade Your Plan</CardTitle>
                  <CardDescription className="text-blue-700">
                    Get unlimited documents and priority support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-blue-800">
                      <Zap className="w-4 h-4 mr-2" />
                      Unlimited processing
                    </div>
                    <div className="flex items-center text-sm text-blue-800">
                      <Users className="w-4 h-4 mr-2" />
                      Priority support
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/pricing">
                      Upgrade Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    Get support or browse our documentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/help">Help Center</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/docs">Documentation</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}