import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Toaster } from 'sonner'
import { MainWrapper } from '@/components/main-wrapper'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SignOfika - Signature électronique sécurisée',
  description: 'Signez et faites signer vos documents en ligne de manière sécurisée et légale',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <MainWrapper>
          <Header />
          {children}
        </MainWrapper>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
