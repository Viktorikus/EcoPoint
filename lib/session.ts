import { getServerSession, Session } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export type SessionResult = {
  error: NextResponse | null;
  session: Session | null;
}

export async function requireSession(allowedRoles?: string[]): Promise<SessionResult> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  }
  const role = (session.user as any).role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), session: null }
  }
  return { error: null, session }
}
