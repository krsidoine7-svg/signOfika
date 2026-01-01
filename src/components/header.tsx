'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FilePlus, LogIn, LogOut, User, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
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
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-navy-700 dark:text-white">SignOfika</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                <Link href="/templates">
                  Templates
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                <Link href="/submissions">
                  Soumissions
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/templates/new">
                  <FilePlus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Nouveau</span>
                </Link>
              </Button>
              
              <div className="flex items-center gap-2 ml-2 pl-2 border-l dark:border-gray-700">
                <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Link>
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden lg:inline max-w-[150px] truncate">
                  {user.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Déconnexion</span>
                </Button>
              </div>
            </>
          ) : (
            <Button asChild size="sm" className="bg-burgundy-600 hover:bg-burgundy-700 text-white">
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Se connecter
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
