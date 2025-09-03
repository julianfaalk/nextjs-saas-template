import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { users, subscriptions } from '@/lib/db/database'
import { MongoDBAdapter } from './auth-adapter'
import { sendVerificationRequest } from './email'
import connectDB from './db/mongodb'
import { User as UserModel } from './db/schemas'

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
      sendVerificationRequest,
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB()
          // Check if user exists
          let dbUser = await users.findByEmail(user.email!)
          
          if (!dbUser) {
            // Create new user
            dbUser = await users.create(
              user.email!,
              user.name || '',
              user.image || undefined,
              'google'
            )
          }
          
          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }
      // Email provider is handled by the adapter
      return true
    },
    
    async session({ session, token }) {
      // Transfer id from token to session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      
      // Check subscription status and credits if we have a user id
      if (session?.user?.id) {
        await connectDB()
        
        const subscription = await subscriptions.findActiveByUserId(session.user.id)
        
        // Also check if user has credits
        const userRecord = await UserModel.findById(session.user.id).lean()
        
        const hasCredits = userRecord?.credits && userRecord.credits > 0
        
        session.user.hasActiveSubscription = !!subscription || hasCredits
        session.user.subscriptionStatus = subscription?.status || (hasCredits ? 'credits' : 'none')
        session.user.credits = userRecord?.credits || 0
      }
      
      return session
    },
    
    async jwt({ token, user, account }) {
      // When user signs in
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      
      // For subsequent requests, if we don't have an id but have email
      // (happens with email provider), fetch it from database
      if (!token.id && token.email) {
        await connectDB()
        const dbUser = await users.findByEmail(token.email as string)
        if (dbUser) {
          token.id = dbUser._id || dbUser.id
        }
      }
      
      return token
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}