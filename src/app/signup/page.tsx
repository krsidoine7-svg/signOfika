'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ChevronRight, Lock, Mail, User, ShieldCheck } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
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

      {/* Left Side - Visuals */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-navy-700 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 via-transparent to-burgundy-600/20" />
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/10 blur-[150px] rounded-full" />
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-12 inline-flex items-center gap-3">
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
             </div>
             <span className="text-3xl font-black text-white tracking-tighter">SignOfika</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-8 leading-tight">
            Commencez à signer en quelques secondes.
          </h2>

          <div className="space-y-6 text-left">
            <div className="flex items-center gap-4 text-white/80">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">1</div>
               <p className="font-medium">Créez votre compte gratuitement.</p>
            </div>
            <div className="flex items-center gap-4 text-white/80">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">2</div>
               <p className="font-medium">Téléchargez votre premier document.</p>
            </div>
            <div className="flex items-center gap-4 text-white/80">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">3</div>
               <p className="font-medium">Envoyez et suivez les signatures.</p>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Overlay */}
        <div className="mt-16 relative w-[120%] h-64 bg-white/5 border border-white/10 rounded-t-[3rem] backdrop-blur-3xl p-8 translate-y-12 animate-in slide-in-from-bottom-24 duration-1500">
           <div className="grid grid-cols-4 gap-4">
              {[1, 2, 4].map((i) => (
                <div key={i} className="h-8 bg-white/10 rounded-full" />
              ))}
           </div>
           <div className="mt-8 space-y-4">
              <div className="h-12 w-full bg-emerald-500/20 rounded-2xl border border-emerald-500/20" />
              <div className="h-12 w-full bg-white/5 rounded-2xl" />
           </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 bg-white z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-navy-700">Créer un compte</h1>
            <p className="text-muted-foreground text-lg">
              Rejoignez des milliers de professionnels sur SignOfika.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <label htmlFor="fullName" className="text-sm font-semibold text-navy-900 ml-1">
                  Nom complet
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-indigo-600" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-14 pl-12 rounded-2xl border-border bg-slate-50 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label htmlFor="email" className="text-sm font-semibold text-navy-900 ml-1">
                  Email professionnel
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-indigo-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 pl-12 rounded-2xl border-border bg-slate-50 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label htmlFor="password" className="text-sm font-semibold text-navy-900 ml-1">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-indigo-600" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-14 pl-12 rounded-2xl border-border bg-slate-50 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-indigo-600 to-burgundy-600 hover:opacity-90 text-white text-lg rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? 'Création du compte...' : 'S\'inscrire gratuitement'}
              {!loading && <ChevronRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-muted-foreground">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold decoration-2 transition-all">
                Connectez-vous
              </Link>
            </p>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            En vous inscrivant, vous acceptez nos{' '}
            <Link href="/terms" className="underline">Conditions d'utilisation</Link> et notre{' '}
            <Link href="/privacy" className="underline">Politique de confidentialité</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
