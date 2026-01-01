'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, Shield, Zap, PenTool, Users } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/documents')
    }
  }, [router, supabase.auth])

  useEffect(() => {
    checkUser()
  }, [checkUser])
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-lg flex items-center justify-center">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-navy-700">SignOfika</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-navy-700 hover:bg-gray-100">Connexion</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-burgundy-600 hover:bg-burgundy-700 text-white">Commencer</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-24 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-burgundy-50 border border-burgundy-200 rounded-full">
            <span className="text-burgundy-700 font-semibold text-sm">✨ Plateforme open-source de signature électronique</span>
          </div>
          <h2 className="text-6xl font-extrabold text-navy-900 mb-8 leading-tight">
            Signez vos documents<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-burgundy-600 to-burgundy-700">en toute simplicité</span>
          </h2>
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            SignOfika est une plateforme moderne qui vous permet de créer, envoyer et signer des documents électroniques de manière sécurisée et professionnelle.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-10 py-6 bg-burgundy-600 hover:bg-burgundy-700 text-white shadow-xl shadow-burgundy-900/50">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-navy-700 text-navy-700 hover:bg-navy-50">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="py-20">
          <h3 className="text-4xl font-bold text-center mb-16 text-navy-900">
            Fonctionnalités principales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-burgundy-500 transition-all duration-300 hover:shadow-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-xl mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-3 text-navy-900">Créer des templates</h4>
              <p className="text-gray-600 leading-relaxed">
                Créez des modèles de documents réutilisables avec un éditeur intuitif et professionnel
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-burgundy-500 transition-all duration-300 hover:shadow-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-xl mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-3 text-navy-900">Signature électronique</h4>
              <p className="text-gray-600 leading-relaxed">
                Signez vos documents en ligne de manière sécurisée, légale et traçable
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-burgundy-500 transition-all duration-300 hover:shadow-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-xl mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-3 text-navy-900">Multi-signataires</h4>
              <p className="text-gray-600 leading-relaxed">
                Gérez plusieurs signataires par document avec un suivi en temps réel
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-burgundy-500 transition-all duration-300 hover:shadow-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-xl mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-3 text-navy-900">Sécurité maximale</h4>
              <p className="text-gray-600 leading-relaxed">
                Vos documents sont cryptés et stockés en toute sécurité avec RLS
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-burgundy-500 transition-all duration-300 hover:shadow-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-xl mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-3 text-navy-900">Rapide et simple</h4>
              <p className="text-gray-600 leading-relaxed">
                Envoyez et signez des documents en quelques minutes seulement
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-burgundy-500 transition-all duration-300 hover:shadow-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-xl mb-6">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-3 text-navy-900">Éditeur PDF</h4>
              <p className="text-gray-600 leading-relaxed">
                Éditeur visuel pour placer vos champs de signature sur vos PDFs
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 text-center">
          <div className="relative overflow-hidden bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-3xl p-16 shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-5xl font-bold mb-6 text-white">
                Prêt à commencer ?
              </h3>
              <p className="text-xl mb-10 text-burgundy-50 max-w-2xl mx-auto">
                Créez votre compte gratuit et commencez à signer vos documents dès maintenant. Aucune carte bancaire requise.
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-lg px-12 py-6 bg-white text-burgundy-700 hover:bg-gray-100 shadow-xl font-bold">
                  Créer un compte gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-burgundy-600 to-burgundy-700 rounded-lg flex items-center justify-center">
                  <PenTool className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-navy-900">SignOfika</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Plateforme open-source de signature électronique moderne et sécurisée.
              </p>
            </div>
            <div>
              <h4 className="text-navy-900 font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-burgundy-600 transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-burgundy-600 transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-burgundy-600 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-navy-900 font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-burgundy-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-burgundy-600 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-burgundy-600 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-600 text-sm">© 2025 SignOfika. Tous droits réservés.</p>
            <p className="mt-2 text-gray-500 text-xs">
              Propulsé par Next.js 15, Supabase et TailwindCSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
