import { randomUUID } from 'crypto'
import connectDB from './mongodb'
import {
  User,
  UserDocument,
  DocumentHistory,
  Template,
  ActivityLog,
  Session,
  VerificationToken,
  Account,
  Subscription,
  Payment,
  IUser,
  IDocument,
  IDocumentHistory,
  IActivityLog,
  ISubscription,
  IPayment
} from './schemas'

// Ensure database connection on module load
connectDB().catch(console.error)

// User operations
export const users = {
  async create(email: string, name: string, image?: string, provider: string = 'google') {
    await connectDB()
    const id = randomUUID()
    const user = await User.create({
      _id: id,
      email,
      name,
      image,
      provider,
      subscription_status: 'free',
      credits: 0
    })
    return user.toObject()
  },

  async findByEmail(email: string) {
    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase() }).lean()
    return user
  },

  async findById(id: string) {
    await connectDB()
    const user = await User.findById(id).lean()
    return user
  },

  async updateCredits(id: string, credits: number) {
    await connectDB()
    const user = await User.findByIdAndUpdate(
      id,
      { credits, updated_at: new Date() },
      { new: true }
    ).lean()
    return user
  },

  async updateSubscriptionStatus(id: string, status: string, stripeCustomerId?: string) {
    await connectDB()
    const updateData: any = {
      subscription_status: status,
      updated_at: new Date()
    }
    if (stripeCustomerId) {
      updateData.stripe_customer_id = stripeCustomerId
    }
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).lean()
    return user
  }
}

// Generic document operations - flexible for any document type
export const documents = {
  async create(userId: string, data: any) {
    await connectDB()
    const id = randomUUID()
    
    const doc = await UserDocument.create({
      _id: id,
      user_id: userId,
      title: data.title || 'New Document',
      description: data.description,
      file_name: data.file_name,
      file_size: data.file_size,
      file_type: data.file_type,
      status: data.status || 'draft',
      data: data,
      metadata: data.metadata
    })
    
    return doc.toObject()
  },

  async findByUser(userId: string) {
    await connectDB()
    const docs = await UserDocument.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean()
    return docs
  },

  async findById(id: string, userId: string) {
    await connectDB()
    const doc = await UserDocument.findOne({ _id: id, user_id: userId }).lean()
    return doc
  },

  async update(id: string, userId: string, data: any) {
    await connectDB()
    
    // Save current version to history
    const current = await UserDocument.findOne({ _id: id, user_id: userId }).lean()
    if (current) {
      // Get next version number
      const lastHistory = await DocumentHistory.findOne({ document_id: id })
        .sort({ version: -1 })
        .lean()
      const nextVersion = (lastHistory?.version || 0) + 1
      
      // Save to history
      await DocumentHistory.create({
        _id: randomUUID(),
        document_id: id,
        version: nextVersion,
        data: current.data,
        changed_by: userId
      })
    }
    
    // Update document
    const updated = await UserDocument.findOneAndUpdate(
      { _id: id, user_id: userId },
      {
        title: data.title || current?.title || 'Document',
        description: data.description,
        status: data.status || 'draft',
        data: data,
        metadata: data.metadata,
        updated_at: new Date()
      },
      { new: true }
    ).lean()
    
    return !!updated
  },

  async delete(id: string, userId: string) {
    await connectDB()
    const result = await UserDocument.deleteOne({ _id: id, user_id: userId })
    // Also delete history
    await DocumentHistory.deleteMany({ document_id: id })
    return result.deletedCount > 0
  }
}

// Template operations
export const templates = {
  async create(userId: string, name: string, data: any, category?: string, isPublic: boolean = false) {
    await connectDB()
    const id = randomUUID()
    
    const template = await Template.create({
      _id: id,
      user_id: userId,
      name,
      description: data.description,
      category,
      data,
      is_public: isPublic
    })
    
    return template.toObject()
  },

  async findByUser(userId: string) {
    await connectDB()
    const templates = await Template.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean()
    return templates
  },

  async findPublic(category?: string) {
    await connectDB()
    const query: any = { is_public: true }
    if (category) query.category = category
    
    const templates = await Template.find(query)
      .sort({ created_at: -1 })
      .lean()
    return templates
  }
}

// Activity logging
export const activity = {
  async log(userId: string, action: string, details?: any, ipAddress?: string, userAgent?: string) {
    await connectDB()
    const id = randomUUID()
    await ActivityLog.create({
      _id: id,
      user_id: userId,
      action,
      details,
      ip_address: ipAddress,
      user_agent: userAgent
    })
  },

  async getByUser(userId: string, limit: number = 50) {
    await connectDB()
    const logs = await ActivityLog.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean()
    return logs
  }
}

// Subscription operations
export const subscriptions = {
  async create(data: {
    user_id: string
    stripe_customer_id: string
    stripe_subscription_id?: string
    stripe_price_id?: string
    plan_name?: string
    status?: string
    current_period_start?: Date
    current_period_end?: Date
  }) {
    await connectDB()
    const id = randomUUID()
    const subscription = await Subscription.create({
      _id: id,
      ...data
    })
    return subscription.toObject()
  },

  async findByUserId(userId: string) {
    await connectDB()
    const subscription = await Subscription.findOne({ user_id: userId }).lean()
    return subscription
  },

  async findByStripeSubscriptionId(stripeSubscriptionId: string) {
    await connectDB()
    const subscription = await Subscription.findOne({ 
      stripe_subscription_id: stripeSubscriptionId 
    }).lean()
    return subscription
  },

  async update(userId: string, data: Partial<ISubscription>) {
    await connectDB()
    const updated = await Subscription.findOneAndUpdate(
      { user_id: userId },
      { ...data, updated_at: new Date() },
      { new: true, upsert: true }
    ).lean()
    return updated
  },

  async findActiveByUserId(userId: string) {
    await connectDB()
    const subscription = await Subscription.findOne({
      user_id: userId,
      status: { $in: ['active', 'trialing'] },
      $or: [
        { cancel_at: null },
        { cancel_at: { $gt: new Date() } }
      ]
    }).lean()
    return subscription
  }
}

// Payment operations
export const payments = {
  async create(data: {
    user_id: string
    stripe_customer_id?: string
    stripe_payment_intent_id?: string
    amount: number
    currency?: string
    status: string
    description?: string
    metadata?: any
  }) {
    await connectDB()
    const id = randomUUID()
    const payment = await Payment.create({
      _id: id,
      currency: 'usd',
      ...data
    })
    return payment.toObject()
  },

  async findByUserId(userId: string) {
    await connectDB()
    const payments = await Payment.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean()
    return payments
  },

  async findByStripePaymentIntentId(stripePaymentIntentId: string) {
    await connectDB()
    const payment = await Payment.findOne({ 
      stripe_payment_intent_id: stripePaymentIntentId 
    }).lean()
    return payment
  }
}