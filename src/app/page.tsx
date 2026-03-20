'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  FileText, 
  CheckCircle, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  ArrowRight,
  MousePointer2,
  Clock,
  Briefcase,
  FilePlus
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate an upload process before redirecting
      setIsUploading(true)
      setTimeout(() => {
        router.push('/signup')
      }, 1500)
    }
  }

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/dashboard')
    }
  }, [router, supabase.auth])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background Mesh Gradient */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-burgundy-600 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-navy-600 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Signature de documents<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-burgundy-600 to-indigo-500">pour tous</span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-navy-800/80 mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 font-medium">
              Gratuit pour toujours pour les particuliers, extensible pour les entreprises et les développeurs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
              <Button size="lg" className="h-14 px-10 text-lg rounded-2xl group shadow-2xl shadow-navy-900/20 transition-all hover:scale-105 active:scale-95 bg-navy-900 text-white hover:bg-navy-800" asChild>
                <Link href="/signup">
                  Commencer l'essai
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-2xl transition-all hover:bg-slate-100 text-navy-700 font-bold" asChild>
                <Link href="/self-hosting">
                  Ou organisez-le vous-même
                </Link>
              </Button>
            </div>

            {/* Upload Mockup Shadow */}
            <div className="mt-20 relative max-w-4xl mx-auto p-4 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent border border-white/20 shadow-2xl animate-in zoom-in-95 duration-1000 delay-500">
              <input 
                 type="file" 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={handleFileSelect} 
                 accept=".pdf,.docx,.xlsx,.jpeg,.jpg,.png,.zip" 
              />
              <div 
                 onClick={() => !isUploading && fileInputRef.current?.click()}
                 className={cn(
                   "relative rounded-[2rem] overflow-hidden border-2 border-dashed bg-white/50 backdrop-blur-xl shadow-inner transition-all duration-300 p-12 md:p-20 flex flex-col items-center justify-center",
                   isUploading ? "border-indigo-400 bg-indigo-50/50 cursor-wait" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 cursor-pointer group"
                 )}
              >
                  {isUploading ? (
                    <>
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-indigo-100 relative">
                         <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                         <FilePlus className="h-10 w-10 text-indigo-500 animate-pulse" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-navy-900 mb-2 tracking-tight">Téléchargement en cours...</h3>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Préparation de votre document</p>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-burgundy-50 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 shadow-sm border border-white">
                         <FilePlus className="h-10 w-10 text-indigo-600" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-navy-900 mb-4 tracking-tight">Téléchargez un document à signer</h3>
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Formats pris en charge : PDF, DOCX, XLSX, JPEG, PNG, ZIP</p>
                      <p className="text-[11px] font-black text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200/50">Taille maximale du fichier : 100 Mo</p>
                    </>
                  )}
              </div>
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-24 relative overflow-hidden">
          {/* Decorative background element for features */}
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-burgundy-100/30 blur-3xl rounded-full -translate-x-1/2 -z-10" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Tout ce dont vous avez besoin</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                Concentrez-vous sur votre cœur de métier, nous nous occupons de la logistique documentaire.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Zap className="h-8 w-8 text-amber-500" />}
                title="Installation en 2 minutes"
                description="Créez votre compte, téléchargez votre document et envoyez-le. C'est aussi simple que cela."
              />
              <FeatureCard 
                icon={<Shield className="h-8 w-8 text-blue-500" />}
                title="Conformité Totale"
                description="Signature électronique conforme eIDAS. Vos documents ont une valeur juridique incontestable."
              />
              <FeatureCard 
                icon={<Users className="h-8 w-8 text-emerald-500" />}
                title="Travail collaboratif"
                description="Gérez des workflows complexes avec plusieurs signataires dans un ordre précis."
              />
              <FeatureCard 
                icon={<TrendingUp className="h-8 w-8 text-indigo-500" />}
                title="Analytique avancée"
                description="Suivez l'avancement de vos documents en temps réel et recevez des notifications à chaque étape."
              />
              <FeatureCard 
                icon={<Clock className="h-8 w-8 text-rose-500" />}
                title="Rappels automatiques"
                description="Notre système relance automatiquement les signataires en retard pour vous."
              />
              <FeatureCard 
                icon={<Briefcase className="h-8 w-8 text-orange-500" />}
                title="API Développeur"
                description="Intégrez SignOfika directement dans vos applications existantes via notre API REST."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Des tarifs simples et transparents</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                Choisissez le plan qui correspond à la taille de votre entreprise. No hidden fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Basic Plan */}
              <div className="bg-card border border-border/50 rounded-[2.5rem] p-10 flex flex-col hover:shadow-xl transition-all duration-300">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">Gratuit</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">0€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 italic">Pour les besoins ponctuels.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <PriceItem text="3 documents / mois" />
                  <PriceItem text="1 signataire par document" />
                  <PriceItem text="Signature électronique standard" />
                  <PriceItem text="Suivi en temps réel" disabled />
                </ul>
                <Button variant="outline" className="w-full h-12 rounded-xl" asChild>
                  <Link href="/signup">Commencer gratuitement</Link>
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="bg-card border-2 border-burgundy-600 rounded-[2.5rem] p-10 flex flex-col shadow-2xl shadow-burgundy-600/10 scale-105 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-burgundy-600 text-white px-4 py-1 text-xs font-bold rounded-bl-xl">POPULAIRE</div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2 text-burgundy-700">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">29€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 italic">Pour les professionnels dynamiques.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <PriceItem text="Documents illimités" />
                  <PriceItem text="Signataires illimités" />
                  <PriceItem text="Workflow de signature" />
                  <PriceItem text="API Access" />
                  <PriceItem text="Rappels automatiques" />
                  <PriceItem text="Support prioritaire" />
                </ul>
                <Button className="w-full h-12 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 shadow-lg shadow-burgundy-500/20" asChild>
                  <Link href="/signup">Essayer Pro</Link>
                </Button>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-card border border-border/50 rounded-[2.5rem] p-10 flex flex-col hover:shadow-xl transition-all duration-300">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">Entreprise</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold italic">Sur devis</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 italic">Pour les grandes organisations.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <PriceItem text="Infrastructures dédiées" />
                  <PriceItem text="SLA 99.9%" />
                  <PriceItem text="Onboarding personnalisé" />
                  <PriceItem text="SSO & Sécurité avancée" />
                  <PriceItem text="Gérant de compte dédié" />
                </ul>
                <Button variant="outline" className="w-full h-12 rounded-xl" asChild>
                  <Link href="/contact">Contacter l'équipe</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Questions Fréquentes</h2>
              <p className="text-muted-foreground text-lg">
                Tout ce que vous devez savoir sur SignOfika.
              </p>
            </div>
            
            <div className="space-y-4">
              <FaqItem 
                question="La signature est-elle légalement reconnue ?" 
                answer="Oui, absolument. SignOfika est conforme au règlement européen eIDAS. Toutes nos signatures ont la même valeur juridique qu'une signature manuscrite." 
              />
              <FaqItem 
                question="Mes documents sont-ils en sécurité ?" 
                answer="Vos documents sont chiffrés avec des standards militaires (AES-256) et stockés sur des serveurs sécurisés en Europe. Seuls vous et les signataires autorisés peuvent y accéder." 
              />
              <FaqItem 
                question="Puis-je utiliser mon propre logo sur les emails ?" 
                answer="Oui, à partir du plan Pro, vous pouvez personnaliser l'interface et les emails avec votre propre charte graphique (Whitelabel)." 
              />
              <FaqItem 
                question="Comment fonctionne l'essai gratuit ?" 
                answer="Vous pouvez tester toutes les fonctionnalités du plan Pro pendant 14 jours sans carte bancaire. Après cette période, vous basculerez automatiquement sur le plan gratuit sauf si vous choisissez de vous abonner." 
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-burgundy-600 via-burgundy-700 to-indigo-800 py-16 md:py-24 px-8 md:px-16 text-center text-white shadow-2xl shadow-burgundy-900/20">
               {/* Pattern */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
               
               <div className="relative z-10 max-w-3xl mx-auto">
                 <h2 className="text-3xl md:text-6xl font-bold mb-8 tracking-tight">Prêt à transformer votre gestion documentaire ?</h2>
                 <p className="text-lg md:text-xl mb-12 opacity-90 leading-relaxed max-w-2xl mx-auto">
                   Rejoignez les milliers d'utilisateurs qui gagnent du temps chaque jour avec SignOfika. Pas d'engagement, annulez quand vous voulez.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="h-16 px-12 text-lg rounded-2xl bg-white text-burgundy-700 hover:bg-white/90 shadow-xl font-heavy transition-all hover:scale-105 active:scale-95" asChild>
                       <Link href="/signup">Commencer gratuitement</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-16 px-12 text-lg rounded-2xl border-white/30 backdrop-blur-md hover:bg-white/10 font-bold transition-all" asChild>
                       <Link href="/contact">Parler à un expert</Link>
                    </Button>
                 </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
            <div className="col-span-2 lg:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">SignOfika</span>
               </div>
               <p className="text-muted-foreground leading-relaxed max-w-xs mb-8">
                 La plateforme de signature électronique la plus intuitive du marché. 
                 Construite pour les entreprises qui vont vite.
               </p>
               <div className="flex gap-4">
                  {/* Social icons placeholders */}
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
                  </div>
               </div>
            </div>
            <div>
               <h4 className="font-bold mb-6">Produit</h4>
               <ul className="space-y-4 text-muted-foreground">
                  <li><Link href="/features" className="hover:text-primary transition-colors">Fonctionnalités</Link></li>
                  <li><Link href="/pricing" className="hover:text-primary transition-colors">Tarifs</Link></li>
                  <li><Link href="/templates" className="hover:text-primary transition-colors">Templates</Link></li>
                  <li><Link href="/roadmap" className="hover:text-primary transition-colors">Roadmap</Link></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold mb-6">Compagnie</h4>
               <ul className="space-y-4 text-muted-foreground">
                  <li><Link href="/about" className="hover:text-primary transition-colors">À propos</Link></li>
                  <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link href="/careers" className="hover:text-primary transition-colors">Carrières</Link></li>
                  <li><Link href="/legal" className="hover:text-primary transition-colors">Légal</Link></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold mb-6">Support</h4>
               <ul className="space-y-4 text-muted-foreground">
                  <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                  <li><Link href="/help" className="hover:text-primary transition-colors">Aide</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                  <li><Link href="/status" className="hover:text-primary transition-colors">Statut</Link></li>
               </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
             <p>© 2025 SignOfika. Tous droits réservés.</p>
             <div className="flex gap-8">
                <Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">Conditions</Link>
                <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group bg-card border border-border/50 rounded-3xl p-8 hover:border-burgundy-500/50 hover:shadow-2xl hover:shadow-burgundy-500/10 transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-burgundy-50 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function PriceItem({ text, disabled = false }: { text: string; disabled?: boolean }) {
  return (
    <li className={cn("flex items-center gap-3", disabled && "opacity-40")}>
      <CheckCircle className={cn("h-5 w-5", disabled ? "text-muted-foreground" : "text-emerald-500")} />
      <span className="text-sm">{text}</span>
    </li>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border border-border/50 rounded-2xl overflow-hidden bg-card transition-all duration-300">
      <button 
        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold text-lg">{question}</span>
        <div className={cn("transition-transform duration-300", isOpen ? "rotate-45" : "rotate-0")}>
          <FilePlus className="h-5 w-5" />
        </div>
      </button>
      <div className={cn(
        "px-6 transition-all duration-300 ease-in-out",
        isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
      )}>
        <p className="text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  )
}
