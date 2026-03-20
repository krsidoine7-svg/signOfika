'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Send, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ShieldCheck,
  Plus,
  ChevronRight,
  Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Documents', icon: FileText, href: '/submissions' },
  { name: 'Journal d\'Audit', icon: ShieldCheck, href: '/audit' },
  { name: 'Templates', icon: Monitor, href: '/templates' },
  { name: 'Paramètres', icon: Settings, href: '/settings' },
]


export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-navy-900 text-white z-50 flex flex-col border-r border-white/5 shadow-2xl">
      {/* Brand Logo */}
      <div className="p-8 pb-10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
             <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">SignOfika</span>
        </Link>
      </div>

      {/* Action Button */}
      <div className="px-6 mb-10">
         <Button asChild className="w-full bg-gradient-to-r from-burgundy-600 to-indigo-600 hover:opacity-90 text-white rounded-2xl h-14 font-bold shadow-xl shadow-burgundy-500/20 group">
            <Link href="/templates/new">
               <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
               Nouveau
            </Link>
         </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-4 rounded-2xl transition-all group relative overflow-hidden",
                isActive 
                  ? "bg-white/10 text-white font-bold" 
                  : "text-navy-100/60 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-burgundy-400" : "group-hover:text-white"
                )} />
                <span className="text-sm">{item.name}</span>
              </div>
              {isActive && (
                 <div className="absolute left-0 top-0 w-1 h-full bg-burgundy-400 z-20" />
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-burgundy-400 relative z-10" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 mt-auto border-t border-white/5">
        <Link 
          href="/help" 
          className="flex items-center gap-4 px-4 py-3 rounded-2xl text-navy-100/50 hover:text-white hover:bg-white/5 transition-all mb-2"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Aide & Support</span>
        </Link>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
