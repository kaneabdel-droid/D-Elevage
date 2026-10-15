import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { NextRequest, NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

// Client Supabase dédié à l'identité admin partagée entre produits DembaSolution
// (SIGGIE, D-QUINCA, D-PHARMA, D-ELEVAGE...) — projet Supabase commun SSO,
// cookie à domaine .dembasolution.com pour qu'il soit lisible par tous
// les produits hébergés sous ce domaine.
const ADMIN_COOKIE_OPTIONS = {
  name: 'sb-demba-admin',
  domain: '.dembasolution.com',
  sameSite: 'lax' as const,
  secure: true,
}

// Pour Server Components / Server Actions.
export async function createAdminIdentityClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.ADMIN_IDENTITY_SUPABASE_URL || 'https://mvvjkkohzopxtpkrnmqs.supabase.co',
    process.env.ADMIN_IDENTITY_SUPABASE_ANON_KEY || 'sb_publishable_n0Fy0jIC_BqbzNh9oMrUYw_2TA6UW10',
    {
      cookieOptions: ADMIN_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Appelé depuis un Server Component : sans effet si le middleware
            // rafraîchit déjà la session
          }
        },
      },
    }
  )
}

export const getSharedAdminUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createAdminIdentityClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
})

// Pour le middleware / proxy — mêmes options de cookie, branchées sur request/response.
export function createAdminIdentityMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  const url = process.env.ADMIN_IDENTITY_SUPABASE_URL || 'https://mvvjkkohzopxtpkrnmqs.supabase.co'
  const key = process.env.ADMIN_IDENTITY_SUPABASE_ANON_KEY || 'sb_publishable_n0Fy0jIC_BqbzNh9oMrUYw_2TA6UW10'
  
  if (!url || !key) {
    return { auth: { getUser: async () => ({ data: { user: null }, error: null }) } } as any
  }
  return createServerClient(
    url,
    key,
    {
      cookieOptions: ADMIN_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
}
