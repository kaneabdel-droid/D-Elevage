import { NextResponse } from 'next/server'
import { createAdminIdentityClient } from '@/utils/supabase/admin-identity'

export async function GET(request: Request) {
  const supabase = await createAdminIdentityClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/admin/login', request.url))
}
