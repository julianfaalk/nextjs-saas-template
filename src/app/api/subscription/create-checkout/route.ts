import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import connectDB from '@/lib/db/mongodb'
import { users } from '@/lib/db/database'
import { User } from '@/lib/db/schemas'

export const dynamic = 'force-dynamic'

// Lazy initialization of Stripe to avoid build-time errors
let stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  }
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  return stripe
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Get price ID and mode from request body
    const body = await request.json()
    const { priceId, mode = 'subscription' } = body
    
    // Check if user already has a Stripe customer ID
    const user = await users.findById(session.user.id)
    
    let customerId = user?.stripe_customer_id
    
    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
        },
      })
      customerId = customer.id
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(session.user.id, {
        stripe_customer_id: customerId,
        updated_at: new Date()
      })
    }
    
    // Use provided price ID or fall back to default
    const stripePriceId = priceId || process.env.STRIPE_PRICE_ID || process.env.STRIPE_PRICE_ID_PROFESSIONAL
    
    // Create checkout session
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: mode as 'payment' | 'subscription',
      success_url: mode === 'payment' 
        ? `${process.env.NEXTAUTH_URL}/dashboard?payment=success`
        : `${process.env.NEXTAUTH_URL}/api/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      metadata: {
        userId: session.user.id,
        mode: mode,
      },
    })
    
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
}