import { NextRequest, NextResponse } from 'next/server'
import { withAuth, requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { upgradeTenant } from '@/lib/subscription'
import { prisma } from '@/lib/prisma'

// POST /api/tenants/:slug/upgrade - Upgrade tenant subscription (Admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return withAuth(requireRole(['ADMIN'])(async (req: AuthenticatedRequest) => {
    try {
      const { slug } = await params
      
      // Verify that the slug matches the user's tenant
      if (req.user!.tenantSlug !== slug) {
        return NextResponse.json(
          { error: 'Unauthorized: Cannot upgrade other tenants' },
          { status: 403 }
        )
      }

      // Get current tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug },
      })

      if (!tenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        )
      }

      if (tenant.subscription === 'PRO') {
        return NextResponse.json(
          { error: 'Tenant is already on Pro plan' },
          { status: 400 }
        )
      }

      // Upgrade tenant
      await upgradeTenant(tenant.id)

      // Return updated tenant
      const updatedTenant = await prisma.tenant.findUnique({
        where: { slug },
      })

      return NextResponse.json({
        message: 'Tenant successfully upgraded to Pro',
        tenant: updatedTenant,
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    } catch (error) {
      console.error('Error upgrading tenant:', error)
      return NextResponse.json(
        { error: 'Failed to upgrade tenant' },
        { status: 500 }
      )
    }
  }))(request)
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