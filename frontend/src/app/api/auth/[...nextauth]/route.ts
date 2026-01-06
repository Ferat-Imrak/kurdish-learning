import NextAuth from 'next-auth'
import { authOptions } from '../../../../lib/auth'

// Force dynamic rendering - API routes should never be statically generated
export const dynamic = 'force-dynamic'

// NextAuth handler for App Router
// Standard pattern: export handler as GET and POST
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }


