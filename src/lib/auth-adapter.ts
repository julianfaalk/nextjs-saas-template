import { Adapter } from 'next-auth/adapters'
import { randomUUID } from 'crypto'
import connectDB from '@/lib/db/mongodb'
import {
  User,
  Account,
  Session,
  VerificationToken
} from '@/lib/db/schemas'

export function MongoDBAdapter(): Adapter {
  return {
    async createUser(user) {
      await connectDB()
      const id = randomUUID()
      const newUser = await User.create({
        _id: id,
        email: user.email!.toLowerCase(),
        name: user.name || null,
        image: user.image || null,
        provider: 'email',
        subscription_status: 'free',
        credits: 0
      })
      
      return {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name || null,
        image: newUser.image || null,
        emailVerified: null,
      }
    },

    async getUser(id) {
      await connectDB()
      const user = await User.findById(id).lean()
      
      if (!user) return null
      
      return {
        id: user._id,
        email: user.email,
        name: user.name || null,
        image: user.image || null,
        emailVerified: null,
      }
    },

    async getUserByEmail(email) {
      await connectDB()
      const user = await User.findOne({ email: email.toLowerCase() }).lean()
      
      if (!user) return null
      
      return {
        id: user._id,
        email: user.email,
        name: user.name || null,
        image: user.image || null,
        emailVerified: null,
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      await connectDB()
      const account = await Account.findOne({
        provider_account_id: providerAccountId,
        provider
      }).lean()
      
      if (!account) return null
      
      const user = await User.findById(account.user_id).lean()
      
      if (!user) return null
      
      return {
        id: user._id,
        email: user.email,
        name: user.name || null,
        image: user.image || null,
        emailVerified: null,
      }
    },

    async updateUser(user) {
      await connectDB()
      const updateData: any = { updated_at: new Date() }
      
      if (user.name !== undefined) updateData.name = user.name
      if (user.email !== undefined) updateData.email = user.email!.toLowerCase()
      if (user.image !== undefined) updateData.image = user.image
      
      await User.findByIdAndUpdate(user.id, updateData)
      
      return this.getUser!(user.id!) as any
    },

    async linkAccount(account) {
      await connectDB()
      const id = randomUUID()
      await Account.create({
        _id: id,
        user_id: account.userId,
        type: account.type,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        refresh_token: account.refresh_token || null,
        access_token: account.access_token || null,
        expires_at: account.expires_at || null,
        token_type: account.token_type || null,
        scope: account.scope || null,
        id_token: account.id_token || null,
        session_state: account.session_state || null
      })
      
      return account
    },

    async createSession({ sessionToken, userId, expires }) {
      await connectDB()
      const id = randomUUID()
      await Session.create({
        _id: id,
        user_id: userId,
        expires,
        session_token: sessionToken
      })
      
      return {
        sessionToken,
        userId,
        expires,
      }
    },

    async getSessionAndUser(sessionToken) {
      await connectDB()
      const session = await Session.findOne({ session_token: sessionToken }).lean()
      
      if (!session) return null
      
      const user = await User.findById(session.user_id).lean()
      
      if (!user) return null
      
      return {
        session: {
          sessionToken: session.session_token,
          userId: session.user_id,
          expires: session.expires,
        },
        user: {
          id: user._id,
          email: user.email,
          name: user.name || null,
          image: user.image || null,
          emailVerified: null,
        },
      }
    },

    async updateSession({ sessionToken, expires }) {
      await connectDB()
      if (expires) {
        await Session.findOneAndUpdate(
          { session_token: sessionToken },
          { expires }
        )
      }
      
      const session = await Session.findOne({ session_token: sessionToken }).lean()
      
      return session ? {
        sessionToken: session.session_token,
        userId: session.user_id,
        expires: session.expires,
      } : null
    },

    async deleteSession(sessionToken) {
      await connectDB()
      await Session.deleteOne({ session_token: sessionToken })
    },

    async createVerificationToken({ identifier, expires, token }) {
      await connectDB()
      await VerificationToken.create({
        identifier,
        token,
        expires
      })
      
      return {
        identifier,
        token,
        expires,
      }
    },

    async useVerificationToken({ identifier, token }) {
      await connectDB()
      const verificationToken = await VerificationToken.findOne({
        identifier,
        token
      }).lean()
      
      if (!verificationToken) return null
      
      await VerificationToken.deleteOne({ identifier, token })
      
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      }
    },

    async deleteUser(userId) {
      await connectDB()
      await User.deleteOne({ _id: userId })
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await connectDB()
      await Account.deleteOne({
        provider_account_id: providerAccountId,
        provider
      })
    },
  }
}

// For backward compatibility during migration
export function SQLiteAdapter() {
  console.warn('SQLiteAdapter is deprecated, using MongoDBAdapter instead')
  return MongoDBAdapter()
}