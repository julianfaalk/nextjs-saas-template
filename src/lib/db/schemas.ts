import { Schema, model, models, Document, Model } from 'mongoose'

// User Schema
export interface IUser extends Document {
  _id: string
  email: string
  name?: string
  image?: string
  provider: string
  subscription_status: 'free' | 'credits' | 'starter' | 'professional' | 'trialing' | 'active'
  stripe_customer_id?: string
  credits: number
  trial_ends_at?: Date
  created_at: Date
  updated_at: Date
}

const userSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  name: String,
  image: String,
  provider: { type: String, default: 'google' },
  subscription_status: { type: String, default: 'free' },
  stripe_customer_id: String,
  credits: { type: Number, default: 0 },
  trial_ends_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

userSchema.index({ email: 1 })
userSchema.index({ stripe_customer_id: 1 })

// Document Schema - Generalized for any type of document processing
export interface IDocument extends Document {
  _id: string
  user_id: string
  title: string
  description?: string
  file_name?: string
  file_size?: number
  file_type?: string
  status: string
  data: any // Flexible data structure for any document type
  metadata?: any // Additional metadata for customization
  created_at: Date
  updated_at: Date
}

const documentSchema = new Schema<IDocument>({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  title: { type: String, required: true },
  description: String,
  file_name: String,
  file_size: Number,
  file_type: String,
  status: { type: String, default: 'draft' },
  data: { type: Schema.Types.Mixed },
  metadata: { type: Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

documentSchema.index({ user_id: 1, created_at: -1 })

// Document History Schema
export interface IDocumentHistory extends Document {
  _id: string
  document_id: string
  version: number
  data: any
  changed_by: string
  created_at: Date
}

const documentHistorySchema = new Schema<IDocumentHistory>({
  _id: { type: String, required: true },
  document_id: { type: String, required: true, ref: 'Document' },
  version: { type: Number, required: true },
  data: { type: Schema.Types.Mixed },
  changed_by: String,
  created_at: { type: Date, default: Date.now }
})

documentHistorySchema.index({ document_id: 1, version: -1 })

// Template Schema - For reusable templates
export interface ITemplate extends Document {
  _id: string
  user_id: string
  name: string
  description?: string
  category?: string
  data: any
  is_public?: boolean
  created_at: Date
  updated_at: Date
}

const templateSchema = new Schema<ITemplate>({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  name: { type: String, required: true },
  description: String,
  category: String,
  data: { type: Schema.Types.Mixed },
  is_public: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

templateSchema.index({ user_id: 1 })
templateSchema.index({ category: 1 })

// Activity Log Schema
export interface IActivityLog extends Document {
  _id: string
  user_id: string
  action: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at: Date
}

const activityLogSchema = new Schema<IActivityLog>({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  ip_address: String,
  user_agent: String,
  created_at: { type: Date, default: Date.now }
})

activityLogSchema.index({ user_id: 1, created_at: -1 })

// Session Schema (NextAuth)
export interface ISession extends Document {
  _id: string
  user_id: string
  expires: Date
  session_token: string
}

const sessionSchema = new Schema<ISession>({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  expires: { type: Date, required: true },
  session_token: { type: String, required: true, unique: true }
})

sessionSchema.index({ session_token: 1 })
sessionSchema.index({ expires: 1 })

// Verification Token Schema
export interface IVerificationToken extends Document {
  identifier: string
  token: string
  expires: Date
}

const verificationTokenSchema = new Schema<IVerificationToken>({
  identifier: { type: String, required: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true }
})

verificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true })
verificationTokenSchema.index({ expires: 1 })

// Account Schema (OAuth)
export interface IAccount extends Document {
  _id: string
  user_id: string
  type: string
  provider: string
  provider_account_id: string
  refresh_token?: string
  access_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
  id_token?: string
  session_state?: string
}

const accountSchema = new Schema<IAccount>({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  type: { type: String, required: true },
  provider: { type: String, required: true },
  provider_account_id: { type: String, required: true },
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String
})

accountSchema.index({ user_id: 1 })
accountSchema.index({ provider: 1, provider_account_id: 1 }, { unique: true })

// Subscription Schema
export interface ISubscription extends Document {
  _id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id?: string
  stripe_price_id?: string
  plan_name?: string
  billing_period: string
  status: string
  current_period_start?: Date
  current_period_end?: Date
  cancel_at?: Date
  canceled_at?: Date
  created_at: Date
  updated_at: Date
}

const subscriptionSchema = new Schema<ISubscription>({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, unique: true, ref: 'User' },
  stripe_customer_id: { type: String, required: true },
  stripe_subscription_id: { type: String, unique: true, sparse: true },
  stripe_price_id: String,
  plan_name: String,
  billing_period: { type: String, default: 'monthly' },
  status: { type: String, default: 'incomplete' },
  current_period_start: Date,
  current_period_end: Date,
  cancel_at: Date,
  canceled_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

subscriptionSchema.index({ user_id: 1 })
subscriptionSchema.index({ stripe_customer_id: 1 })
subscriptionSchema.index({ stripe_subscription_id: 1 })

// Payment Schema
export interface IPayment extends Document {
  _id: string
  user_id: string
  stripe_customer_id?: string
  stripe_payment_intent_id?: string
  amount: number
  currency: string
  status: string
  description?: string
  metadata?: any
  created_at: Date
}

const paymentSchema = new Schema<IPayment>({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  stripe_customer_id: String,
  stripe_payment_intent_id: { type: String, unique: true, sparse: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, required: true },
  description: String,
  metadata: { type: Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
})

paymentSchema.index({ user_id: 1 })
paymentSchema.index({ stripe_payment_intent_id: 1 })

// Export models (check if already exists in case of hot reload)
export const User: Model<IUser> = models.User || model<IUser>('User', userSchema)
export const UserDocument: Model<IDocument> = models.Document || model<IDocument>('Document', documentSchema)
export const DocumentHistory: Model<IDocumentHistory> = models.DocumentHistory || model<IDocumentHistory>('DocumentHistory', documentHistorySchema)
export const Template: Model<ITemplate> = models.Template || model<ITemplate>('Template', templateSchema)
export const ActivityLog: Model<IActivityLog> = models.ActivityLog || model<IActivityLog>('ActivityLog', activityLogSchema)
export const Session: Model<ISession> = models.Session || model<ISession>('Session', sessionSchema)
export const VerificationToken: Model<IVerificationToken> = models.VerificationToken || model<IVerificationToken>('VerificationToken', verificationTokenSchema)
export const Account: Model<IAccount> = models.Account || model<IAccount>('Account', accountSchema)
export const Subscription: Model<ISubscription> = models.Subscription || model<ISubscription>('Subscription', subscriptionSchema)
export const Payment: Model<IPayment> = models.Payment || model<IPayment>('Payment', paymentSchema)