'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FilePlus, LogIn, LogOut, Settings, Menu, X, HelpCircle, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase.auth])

  // Do not show header on auth pages and dashboard sub-routes
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isDashboardPage = pathname?.startsWith('/dashboard') || 
                          pathname?.startsWith('/submissions') || 
                          pathname?.startsWith('/templates') || 
                          pathname?.startsWith('/settings')

  if (isAuthPage || isDashboardPage) {
    return null
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLinks = [
    { name: 'Fonctionnalités', href: '#features' },
    { name: 'Tarifs', href: '#pricing' },
    { name: 'Aide', href: '/help' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-burgundy-600 to-indigo-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg shadow-burgundy-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-navy-700">SignOfika</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {!user && (
            <>
              <div className="relative group">
                <Button variant="ghost" className="text-sm font-medium hover:bg-burgundy-50 hover:text-burgundy-700 px-4 gap-1">
                  Solutions
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" />
                </Button>
                <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 w-72 z-50">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl py-2 px-2 flex flex-col gap-1 border border-white">
                    <Link href="/features" className="px-4 py-3 hover:bg-white rounded-xl text-sm text-navy-900 font-bold transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50">
                      Pour les Entreprises
                      <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-snug">Workflows de signature et équipes multiples.</p>
                    </Link>
                    <Link href="/features" className="px-4 py-3 hover:bg-white rounded-xl text-sm text-navy-900 font-bold transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50">
                      Pour les Indépendants
                      <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-snug">Simple et rapide pour vos devis et contrats.</p>
                    </Link>
                    <Link href="/self-hosting" className="px-4 py-3 hover:bg-white rounded-xl text-sm text-navy-900 font-bold transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50">
                      Pour les Développeurs
                      <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-snug">API sécurisée ou déploiement Self-hosted.</p>
                    </Link>
                  </div>
                </div>
              </div>

              {navLinks.map((link) => (
                <Button key={link.name} asChild variant="ghost" className="text-sm font-medium hover:bg-burgundy-50 hover:text-burgundy-700 px-4">
                  <Link href={link.href}>{link.name}</Link>
                </Button>
              ))}
            </>
          )}
          
          {user && (
            <>
              <Button asChild variant="ghost" size="sm" className="px-4">
                <Link href="/templates">Templates</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="px-4">
                <Link href="/submissions">Soumissions</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l">
              <Button asChild variant="default" size="sm" className="bg-gradient-to-r from-burgundy-600 to-indigo-600 hover:opacity-90 rounded-xl">
                <Link href="/templates/new">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Nouveau
                </Link>
              </Button>
              
              <Link href="/settings" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Settings className="h-5 w-5 text-gray-500" />
              </Link>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-xl">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild size="sm" className="bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-xl shadow-md shadow-burgundy-200">
                <Link href="/signup">Essayer gratuitement</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-2xl border-b transition-all duration-300 overflow-hidden",
        isMenuOpen ? "max-h-[80vh] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
      )}>
        <div className="container mx-auto px-4 flex flex-col gap-4">
          {!user && navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-lg font-semibold py-2 px-4 rounded-xl hover:bg-burgundy-50 hover:text-burgundy-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {user && (
            <>
              <Link href="/templates" className="text-lg font-semibold py-2 px-4 rounded-xl hover:bg-burgundy-50" onClick={() => setIsMenuOpen(false)}>Templates</Link>
              <Link href="/submissions" className="text-lg font-semibold py-2 px-4 rounded-xl hover:bg-burgundy-50" onClick={() => setIsMenuOpen(false)}>Soumissions</Link>
              <Link href="/templates/new" className="text-lg font-semibold py-2 px-4 rounded-xl bg-burgundy-50 text-burgundy-700" onClick={() => setIsMenuOpen(false)}>Créer un document</Link>
              <Link href="/settings" className="text-lg font-semibold py-2 px-4 rounded-xl hover:bg-burgundy-50" onClick={() => setIsMenuOpen(false)}>Paramètres</Link>
              <button 
                onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                className="text-lg font-semibold py-2 px-4 rounded-xl hover:bg-red-50 text-red-600 text-left"
              >
                Déconnexion
              </button>
            </>
          )}

          {!user && (
            <div className="flex flex-col gap-3 pt-4 border-t">
              <Button asChild variant="outline" size="lg" className="rounded-2xl h-14" onClick={() => setIsMenuOpen(false)}>
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild size="lg" className="rounded-2xl h-14 bg-burgundy-600" onClick={() => setIsMenuOpen(false)}>
                <Link href="/signup">Essayer gratuitement</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
