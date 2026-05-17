import { NextResponse } from 'next/server'

export async function GET() {
  const messages = [
    'Hello from the backend!',
    'Welcome to Next.js API routes!',
    'Backend is working perfectly!',
    'Full-stack development made easy!',
    'Next.js is amazing!'
  ]
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)]
  
  return NextResponse.json({ 
    message: randomMessage,
    timestamp: new Date().toISOString(),
    status: 'success'
  })
}
