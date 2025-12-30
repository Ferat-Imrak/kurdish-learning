import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({ 
    message: 'Please clear cookies manually from browser DevTools',
    instructions: 'Open DevTools > Application > Cookies > localhost:3000 > Delete all next-auth.session-token cookies'
  })
  
  // Try to clear cookies by setting them to expire
  const cookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.session-token.0',
    'next-auth.session-token.1',
    'next-auth.session-token.2',
    'next-auth.session-token.3',
    'next-auth.session-token.4',
    'next-auth.session-token.5',
    'next-auth.session-token.6',
  ]
  
  cookieNames.forEach(name => {
    response.cookies.set(name, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  })
  
  return response
}
