'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Routes where the sidebar should be visible
  const isDashboardRoute = 
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/submissions') || 
    pathname?.startsWith('/templates') || 
    pathname?.startsWith('/settings')

  return (
    <div className={cn("min-h-screen flex flex-col", isDashboardRoute && "flex-row")}>
      {isDashboardRoute && <Sidebar />}
      <main className={cn("flex-1", isDashboardRoute && "pl-72")}>
        {children}
      </main>
    </div>
  )
}
