import { prisma } from './prisma'

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    maxNotes: 3,
  },
  PRO: {
    name: 'Pro',
    maxNotes: Infinity,
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

export async function checkNoteLimit(tenantId: string): Promise<{
  canCreateNote: boolean
  currentCount: number
  maxNotes: number
  subscription: SubscriptionPlan
}> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      _count: {
        select: { notes: true }
      }
    }
  })

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const subscription = tenant.subscription as SubscriptionPlan
  const plan = SUBSCRIPTION_PLANS[subscription]
  const currentCount = tenant._count.notes
  const canCreateNote = currentCount < plan.maxNotes

  return {
    canCreateNote,
    currentCount,
    maxNotes: plan.maxNotes,
    subscription,
  }
}

export async function upgradeTenant(tenantId: string): Promise<void> {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { subscription: 'PRO' },
  })
}