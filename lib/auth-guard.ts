import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')
  const role = (session.user as any).role
  if (allowedRoles && !allowedRoles.includes(role)) redirect('/auth/login')
  return session
}
