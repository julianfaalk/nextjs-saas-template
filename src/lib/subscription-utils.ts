import connectDB from '@/lib/db/mongodb'
import { User, UserDocument, Payment, Subscription } from '@/lib/db/schemas'
import { subscriptions } from '@/lib/db/database'

export interface UserPlan {
  name: 'payperuse' | 'starter' | 'professional' | 'free'
  isActive: boolean
  monthlyDocumentLimit?: number
  hasUnlimitedDocuments: boolean
  hasPrioritySupport: boolean
  hasTemplates: boolean
  hasAPI: boolean
  storageRetentionDays: number
}

/**
 * Get the current plan for a user
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  await connectDB()
  
  const subscription = await Subscription.findOne({
    user_id: userId,
    status: { $in: ['active', 'trialing'] }
  }).sort({ created_at: -1 }).lean()

  // Check for credits (from one-time payments)
  const userRecord = await User.findById(userId).lean()
  
  const hasCredits = userRecord?.credits && userRecord.credits > 0

  // Determine the active plan
  if (subscription) {
    const planName = subscription.plan_name || 'professional'
    
    if (planName === 'starter') {
      return {
        name: 'starter',
        isActive: true,
        monthlyDocumentLimit: 50,
        hasUnlimitedDocuments: false,
        hasPrioritySupport: false,
        hasTemplates: true,
        hasAPI: false,
        storageRetentionDays: 365
      }
    } else if (planName === 'professional') {
      return {
        name: 'professional',
        isActive: true,
        monthlyDocumentLimit: 500,
        hasUnlimitedDocuments: false,
        hasPrioritySupport: true,
        hasTemplates: true,
        hasAPI: true,
        storageRetentionDays: -1 // unlimited
      }
    }
  }

  // Check for credits (pay-per-use)
  if (hasCredits) {
    return {
      name: 'payperuse',
      isActive: true,
      monthlyDocumentLimit: userRecord.credits,
      hasUnlimitedDocuments: false,
      hasPrioritySupport: false,
      hasTemplates: false,
      hasAPI: false,
      storageRetentionDays: 30
    }
  }

  // Default to free plan
  return {
    name: 'free',
    isActive: false,
    monthlyDocumentLimit: 0,
    hasUnlimitedDocuments: false,
    hasPrioritySupport: false,
    hasTemplates: false,
    hasAPI: false,
    storageRetentionDays: 0
  }
}

/**
 * Check if user can create a new document
 */
export async function canCreateDocument(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  
  if (!plan.monthlyDocumentLimit || plan.monthlyDocumentLimit === 0) {
    return false
  }

  // For pay-per-use, check if they have credits
  if (plan.name === 'payperuse') {
    return plan.monthlyDocumentLimit > 0 // This is actually their credits count
  }

  // For subscription plans (starter, professional), count documents created this month
  await connectDB()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const documentsThisMonth = await UserDocument.countDocuments({
    user_id: userId,
    created_at: { $gte: startOfMonth }
  })

  return documentsThisMonth < plan.monthlyDocumentLimit
}

/**
 * Get remaining documents for the current month
 */
export async function getRemainingDocuments(userId: string): Promise<number | null> {
  const plan = await getUserPlan(userId)
  
  if (!plan.monthlyDocumentLimit) {
    return 0
  }

  // For pay-per-use, return the credits directly
  if (plan.name === 'payperuse') {
    return plan.monthlyDocumentLimit // This is actually their credits count
  }

  // For subscription plans, calculate remaining for the month
  await connectDB()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const documentsThisMonth = await UserDocument.countDocuments({
    user_id: userId,
    created_at: { $gte: startOfMonth }
  })

  return Math.max(0, plan.monthlyDocumentLimit - documentsThisMonth)
}

/**
 * Check if user has access to templates
 */
export async function hasTemplateAccess(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  return plan.hasTemplates
}

/**
 * Check if user has priority support
 */
export async function hasPrioritySupport(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  return plan.hasPrioritySupport
}

/**
 * Check if user has API access
 */
export async function hasAPIAccess(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  return plan.hasAPI
}

/**
 * Get document retention days for user
 */
export async function getDocumentRetentionDays(userId: string): Promise<number> {
  const plan = await getUserPlan(userId)
  return plan.storageRetentionDays
}

/**
 * Check if user needs to upgrade
 */
export async function needsUpgrade(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  
  // Free plan always needs upgrade
  if (plan.name === 'free') {
    return true
  }
  
  // Check if approaching document limit
  if (plan.monthlyDocumentLimit) {
    const remaining = await getRemainingDocuments(userId)
    if (remaining !== null && remaining <= 5) {
      return true
    }
  }
  
  return false
}

/**
 * Get upgrade recommendation based on usage
 */
export async function getUpgradeRecommendation(userId: string): Promise<string | null> {
  const plan = await getUserPlan(userId)
  
  if (plan.name === 'free') {
    return 'starter'
  }
  
  if (plan.name === 'payperuse') {
    // Check if user has made multiple payments
    await connectDB()
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    
    const paymentCount = await Payment.countDocuments({
      user_id: userId,
      status: 'succeeded',
      created_at: { $gte: sixtyDaysAgo }
    })
    
    if (paymentCount >= 2) {
      return 'starter' // If using pay-per-use frequently, starter is better value
    }
  }
  
  if (plan.name === 'starter') {
    const remaining = await getRemainingDocuments(userId)
    if (remaining !== null && remaining <= 5) {
      return 'professional'
    }
  }
  
  return null
}

/**
 * Check and deduct a credit when creating a document
 */
export async function checkAndDeductCredit(userId: string): Promise<boolean> {
  await connectDB()
  
  // First check if user has subscription
  const subscription = await Subscription.findOne({
    user_id: userId,
    status: { $in: ['active', 'trialing'] }
  }).lean()
  
  // If user has subscription, no need to deduct credits
  if (subscription) {
    return true
  }
  
  // Check if user has credits and deduct one atomically
  const result = await User.findOneAndUpdate(
    { _id: userId, credits: { $gt: 0 } },
    { 
      $inc: { credits: -1 },
      $set: { updated_at: new Date() }
    },
    { new: true }
  ).lean()
  
  return result !== null
}

/**
 * Get user's remaining credits
 */
export async function getUserCredits(userId: string): Promise<number> {
  await connectDB()
  const userRecord = await User.findById(userId).lean()
  return userRecord?.credits || 0
}

/**
 * Check if user has access to generate documents
 */
export async function hasAccessToGenerate(userId: string): Promise<boolean> {
  await connectDB()
  
  // Check if user has active subscription
  const subscription = await Subscription.findOne({
    user_id: userId,
    status: { $in: ['active', 'trialing'] },
    $or: [
      { cancel_at: null },
      { cancel_at: { $gt: new Date() } }
    ]
  }).lean()
  
  if (subscription) {
    return true
  }
  
  // Check if user has credits
  const credits = await getUserCredits(userId)
  return credits > 0
}