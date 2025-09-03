import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check database connection
    const dbConnection = await connectDB()
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbConnection ? 'connected' : 'disconnected',
      version: process.env.npm_package_version || '1.0.0',
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}