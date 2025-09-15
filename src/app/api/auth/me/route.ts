import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async (req) => {
  return NextResponse.json({
    user: req.user,
  })
})