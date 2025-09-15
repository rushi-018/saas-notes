import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { createNoteSchema } from '@/lib/validations'
import { checkNoteLimit } from '@/lib/subscription'

// GET /api/notes - List all notes for the current tenant
export const GET = withAuth(async (req) => {
  try {
    const notes = await prisma.note.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ notes }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
})

// POST /api/notes - Create a new note
export const POST = withAuth(async (req) => {
  try {
    const body = await req.json()
    const validatedData = createNoteSchema.parse(body)

    // Check note limit for current tenant
    const limitCheck = await checkNoteLimit(req.user!.tenantId)
    
    if (!limitCheck.canCreateNote) {
      return NextResponse.json(
        { 
          error: 'Note limit reached',
          limit: limitCheck.maxNotes,
          current: limitCheck.currentCount,
          subscription: limitCheck.subscription,
        },
        { status: 403 }
      )
    }

    const note = await prisma.note.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ note }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error creating note:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
})

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}