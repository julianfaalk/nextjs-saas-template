import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      hasActiveSubscription?: boolean
      subscriptionStatus?: string
      credits?: number
    } & DefaultSession['user']
  }
}