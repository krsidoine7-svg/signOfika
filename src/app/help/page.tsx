'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Shield, 
  Zap, 
  ArrowRight,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { icon: <Zap className="h-6 w-6" />, title: 'Débuter', count: 12, description: 'Tout ce dont vous avez besoin pour envoyer votre premier document.' },
    { icon: <FileText className="h-6 w-6" />, title: 'Modèles', count: 8, description: 'Comment créer et gérer vos modèles de documents réutilisables.' },
    { icon: <Shield className="h-6 w-6" />, title: 'Sécurité', count: 5, description: 'Détails sur la valeur juridique et le chiffrement de vos données.' },
    { icon: <MessageSquare className="h-6 w-6" />, title: 'Signataires', count: 10, description: 'Gérez vos contacts et les workflows de signature.' },
  ]

  const faqs = [
    { q: "Comment fonctionne la signature électronique ?", a: "La signature électronique utilise un certificat numérique pour authentifier le signataire et garantir que le document n'a pas été modifié. C'est rapide, sûr et légal." },
    { q: "Puis-je annuler un document envoyé ?", a: "Oui, tant que tous les signataires n'ont pas encore signé, vous pouvez révoquer l'accès au document depuis votre tableau de bord." },
    { q: "Est-ce gratuit pour les signataires ?", a: "Absolument. Vos signataires n'ont pas besoin de compte ou de payer quoi que ce soit pour signer vos documents." },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-navy-700 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy-600/20 via-transparent to-indigo-600/20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Comment pouvons-nous vous aider ?</h1>
          <p className="text-xl text-navy-100 mb-10 max-w-2xl mx-auto">
            Recherchez dans notre documentation ou parcourez les catégories ci-dessous.
          </p>
          
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-burgundy-400 transition-colors" />
            <Input 
              placeholder="Rechercher un guide, un article..." 
              className="h-16 pl-16 pr-6 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 backdrop-blur-md focus:bg-white focus:text-navy-900 transition-all text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <div key={cat.title} className="group bg-card border border-border/50 p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-burgundy-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-burgundy-50 group-hover:text-burgundy-600 transition-colors">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{cat.count} articles</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-burgundy-600 group-hover:text-white transition-colors">
                     <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="w-full md:w-1/3">
              <h2 className="text-3xl font-bold mb-6">Articles populaires</h2>
              <p className="text-muted-foreground mb-8">
                Les questions les plus fréquentes posées par nos utilisateurs.
              </p>
              <Button asChild variant="outline" className="rounded-xl h-12">
                 <Link href="/docs">Accéder à la doc complète</Link>
              </Button>
            </div>
            <div className="flex-1 space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 rounded-[1.5rem] border border-border/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                     <h4 className="font-bold text-lg group-hover:text-burgundy-600 transition-colors">{faq.q}</h4>
                     <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-navy-700 text-white">
         <div className="container mx-auto px-4 text-center">
            <div className="inline-flex p-4 rounded-3xl bg-white/10 mb-8">
               <HelpCircle className="h-10 w-10 text-burgundy-400" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Vous ne trouvez pas votre réponse ?</h2>
            <p className="text-navy-100 text-lg mb-10 max-w-xl mx-auto">
               Notre équipe de support est disponible 24/7 pour vous aider à résoudre vos problèmes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button size="lg" className="rounded-2xl h-14 px-10 bg-burgundy-600 hover:bg-burgundy-700 font-bold">
                  Envoyer un message
               </Button>
               <Button size="lg" variant="outline" className="rounded-2xl h-14 px-10 border-white/20 hover:bg-white/10 font-bold">
                  Parler à un expert
               </Button>
            </div>
         </div>
      </section>
    </div>
  )
}
