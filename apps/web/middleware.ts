import { updateSession } from '@/lib/supabase/middleware'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json$|offline\\.html$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default updateSession
