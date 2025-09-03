import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import connectDB from '@/lib/db/mongodb'
import { users, payments, activity, subscriptions } from '@/lib/db/database'
import { User } from '@/lib/db/schemas'

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }
    
    let event: Stripe.Event
    
    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Handle one-time payment
        if (session.mode === 'payment') {
          // Find user by customer ID or email
          let user = null
          if (session.customer) {
            user = await User.findOne({ stripe_customer_id: session.customer }).lean()
          }
          if (!user && session.customer_email) {
            user = await users.findByEmail(session.customer_email)
          }
          
          if (user) {
            // Add credits for one-time payment (e.g., 5 credits for $10)
            const creditsToAdd = Math.floor((session.amount_total || 0) / 200) // $2 per credit
            await User.findByIdAndUpdate(user._id || user.id, {
              $inc: { credits: creditsToAdd },
              $set: { updated_at: new Date() }
            })
            
            // Record the payment
            await payments.create({
              user_id: user._id || user.id,
              stripe_payment_intent_id: session.payment_intent as string,
              amount: session.amount_total || 0,
              currency: session.currency || 'usd',
              status: 'succeeded',
              description: `One-time payment - ${creditsToAdd} credits`,
              metadata: { credits: creditsToAdd }
            })
            
            // Log activity
            await activity.log(
              user._id || user.id,
              'payment_completed',
              { amount: session.amount_total, currency: session.currency, credits: creditsToAdd }
            )
          }
        }
        break
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by Stripe customer ID
        const user = await User.findOne({ 
          stripe_customer_id: subscription.customer 
        }).lean()
        
        if (user) {
          // Determine plan name based on price ID
          const priceId = subscription.items.data[0].price.id
          let planName = 'professional' // default
          if (priceId === process.env.STRIPE_PRICE_ID_STARTER) {
            planName = 'starter'
          } else if (priceId === process.env.STRIPE_PRICE_ID_PAY_PER_USE) {
            planName = 'payperuse'
          }
          
          // Update or create subscription
          await subscriptions.update(user._id, {
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            plan_name: planName,
            status: subscription.status,
            current_period_start: new Date((subscription as any).current_period_start * 1000),
            current_period_end: new Date((subscription as any).current_period_end * 1000),
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : undefined,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined
          })
          
          // Update user subscription status
          await users.updateSubscriptionStatus(user._id, subscription.status)
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find and update subscription
        const existingSubscription = await subscriptions.findByStripeSubscriptionId(subscription.id)
        if (existingSubscription) {
          await subscriptions.update(existingSubscription.user_id, {
            status: 'canceled',
            canceled_at: new Date()
          })
          
          // Update user subscription status
          await users.updateSubscriptionStatus(existingSubscription.user_id, 'free')
        }
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Find user by customer ID
        const user = await User.findOne({ 
          stripe_customer_id: invoice.customer 
        }).lean()
        
        if (user) {
          // Record the payment
          await payments.create({
            user_id: user._id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'succeeded',
            description: `Subscription payment - Invoice ${invoice.number || invoice.id}`
          })
          
          // Log activity
          await activity.log(
            user._id,
            'invoice_paid',
            { amount: invoice.amount_paid, currency: invoice.currency, invoice_id: invoice.id }
          )
        }
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Find user and update subscription status
        const user = await User.findOne({ 
          stripe_customer_id: invoice.customer 
        }).lean()
        
        if (user) {
          await subscriptions.update(user._id, {
            status: 'past_due'
          })
          
          // Log activity
          await activity.log(
            user._id,
            'payment_failed',
            { invoice_id: invoice.id }
          )
        }
        break
      }
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}