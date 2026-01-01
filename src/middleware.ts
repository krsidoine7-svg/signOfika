import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const url = new URL(request.url)

  // Ignorer les routes publiques
  const publicRoutes = ['/login', '/signup', '/api/auth']
  if (publicRoutes.some(route => url.pathname.startsWith(route))) {
    return await updateSession(request)
  }

  // Gestion de l'authentification par clé API
  if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth')) {
    const authHeader = requestHeaders.get('authorization')
    const apiKey = authHeader?.split(' ')[1]

    if (apiKey) {
      try {
        // Créer un client Supabase pour le middleware sans gestion de cookies
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              // Désactiver la gestion des cookies pour cette requête
              get: () => '',
              set: () => { },
              remove: () => { },
            },
          }
        )

        // Vérifier la clé API
        const encoder = new TextEncoder()
        const data = encoder.encode(apiKey)
        const hashBuffer = await Buffer.from(await crypto.subtle.digest('SHA-256', data))
        const keyHash = hashBuffer.toString('hex')

        // Utiliser la méthode from directement sur l'objet supabase
        const { data: apiKeyData, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('key_hash', keyHash)
          .eq('is_active', true)
          .single()

        if (error || !apiKeyData) {
          return new NextResponse(
            JSON.stringify({ error: 'Clé API invalide ou expirée' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        // Mettre à jour la date de dernière utilisation
        await supabase
          .from('api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', apiKeyData.id)

        // Ajouter l'ID utilisateur aux en-têtes
        requestHeaders.set('x-user-id', apiKeyData.user_id)
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })

        return response
      } catch (error) {
        console.error('Erreur lors de la vérification de la clé API:', error)
        return new NextResponse(
          JSON.stringify({ error: 'Erreur lors de la vérification de la clé API' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  }

  // Gestion de l'authentification normale
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/public (public API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
