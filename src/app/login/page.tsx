'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ChevronRight, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="h-screen grid lg:grid-cols-2 relative overflow-hidden bg-background">
      {/* Back button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-burgundy-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l'accueil
      </Link>

      {/* Left Side - Form */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 bg-white z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-navy-700">Bon retour !</h1>
            <p className="text-muted-foreground text-lg">
              Connectez-vous pour gérer vos documents en toute sécurité.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <label htmlFor="email" className="text-sm font-semibold text-navy-900 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-burgundy-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 pl-12 rounded-2xl border-border bg-slate-50 transition-all focus:bg-white focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-sm font-semibold text-navy-900">
                    Mot de passe
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium text-burgundy-600 hover:text-burgundy-700">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-burgundy-600" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 pl-12 rounded-2xl border-border bg-slate-50 transition-all focus:bg-white focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-burgundy-600 to-indigo-600 hover:opacity-90 text-white text-lg rounded-2xl font-bold shadow-xl shadow-burgundy-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
              {!loading && <ChevronRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link href="/signup" className="text-burgundy-600 hover:text-burgundy-700 font-bold decoration-2 transition-all">
                Inscrivez-vous gratuitement
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-navy-700 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-burgundy-600/20 via-transparent to-indigo-600/20" />
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-burgundy-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/10 blur-[150px] rounded-full" />
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-12 inline-flex items-center gap-3">
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <svg className="w-8 h-8 text-burgundy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
             </div>
             <span className="text-3xl font-black text-white tracking-tighter">SignOfika</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-8 leading-tight">
            La signature électronique qui fait gagner du temps.
          </h2>

          <div className="space-y-6 text-left">
            <FeatureBox title="Légal et Sécurisé" text="Conforme eIDAS et chiffré de bout en bout." />
            <FeatureBox title="Workflow Intelligent" text="Gérez les signataires dans l'ordre de votre choix." />
            <FeatureBox title="Marque Blanche" text="Personnalisez vos documents à vos couleurs." />
          </div>
        </div>

        {/* Dashboard Preview Overlay */}
        <div className="mt-16 relative w-[120%] h-64 bg-white/5 border border-white/10 rounded-t-[3rem] backdrop-blur-3xl p-8 translate-y-12 animate-in slide-in-from-bottom-24 duration-1500">
           <div className="flex gap-4">
              <div className="w-1/3 h-4 bg-white/10 rounded-full" />
              <div className="flex-1 h-4 bg-white/5 rounded-full" />
           </div>
           <div className="grid grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-3xl bg-white/5 border border-white/5" />
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}

function FeatureBox({ title, text }: { title: string, text: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
      </div>
      <div>
        <p className="font-bold text-white">{title}</p>
        <p className="text-white/60 text-sm">{text}</p>
      </div>
    </div>
  )
}
