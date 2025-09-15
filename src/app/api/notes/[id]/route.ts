import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { updateNoteSchema } from '@/lib/validations'

// GET /api/notes/:id - Get a specific note
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params
      
      const note = await prisma.note.findFirst({
        where: {
          id,
          tenantId: req.user!.tenantId, // Ensure tenant isolation
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

      if (!note) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ note }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    } catch (error) {
      console.error('Error fetching note:', error)
      return NextResponse.json(
        { error: 'Failed to fetch note' },
        { status: 500 }
      )
    }
  })(request)
}

// PUT /api/notes/:id - Update a note
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params
      const body = await req.json()
      const validatedData = updateNoteSchema.parse(body)

      // Check if note exists and belongs to the user's tenant
      const existingNote = await prisma.note.findFirst({
        where: {
          id,
          tenantId: req.user!.tenantId,
        },
      })

      if (!existingNote) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        )
      }

      const note = await prisma.note.update({
        where: { id },
        data: validatedData,
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
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    } catch (error) {
      console.error('Error updating note:', error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid input data' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }
  })(request)
}

// DELETE /api/notes/:id - Delete a note
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params

      // Check if note exists and belongs to the user's tenant
      const existingNote = await prisma.note.findFirst({
        where: {
          id,
          tenantId: req.user!.tenantId,
        },
      })

      if (!existingNote) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        )
      }

      await prisma.note.delete({
        where: { id },
      })

      return NextResponse.json({ success: true }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      )
    }
  })(request)
}

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