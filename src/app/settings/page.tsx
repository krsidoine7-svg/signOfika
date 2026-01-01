'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Bell, 
  Download, 
  Image as ImageIcon,
  SunMedium,
  Moon,
  Palette,
  Key
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ApiKeysSettings from '@/components/settings/api-keys'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notifications, setNotifications] = useState({
    email: true,
    documentSigned: true,
    documentReceived: true,
    weeklyDigest: false
  })
  
  type NotificationKey = keyof typeof notifications
  
  const handleNotificationChange = (key: NotificationKey, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Récupérer les données du profil
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfile(prev => ({
          ...prev,
          full_name: profileData?.full_name || user.user_metadata?.full_name || '',
          email: user.email || ''
        }))
      } catch (error) {
        console.error('Error fetching profile:', error)
        setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      // Mise à jour du mot de passe si fourni
      if (profile.newPassword) {
        if (profile.newPassword !== profile.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas')
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: profile.newPassword
        })

        if (passwordError) throw passwordError
      }

      // Mise à jour du profil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Mise à jour des métadonnées utilisateur
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name }
      })

      if (userError) throw userError

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
      
      // Réinitialiser les champs de mot de passe
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erreur lors de la mise à jour du profil' 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-600"></div>
      </div>
    )
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Mettre à jour l'avatar dans la table profiles
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(URL.createObjectURL(file))
      setMessage({ type: 'success', text: 'Photo de profil mise à jour avec succès' })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement de la photo' })
    }
  }

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      // Récupérer les données de l'utilisateur
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Créer un objet avec toutes les données
      const userData = {
        profile: profileData,
        metadata: user.user_metadata,
        exportDate: new Date().toISOString()
      }

      // Créer et télécharger le fichier JSON
      const dataStr = JSON.stringify(userData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      
      const exportFileName = `signofika-export-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileName)
      linkElement.click()
      
      setMessage({ type: 'success', text: 'Données exportées avec succès' })
    } catch (error) {
      console.error('Error exporting data:', error)
      setMessage({ type: 'error', text: 'Erreur lors de l\'exportation des données' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Paramètres du compte</h1>
        </div>
        
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <Tabs 
          defaultValue="profile" 
          className="w-full"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Apparence</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl">Profil</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles et votre photo de profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 bg-burgundy-100 dark:bg-burgundy-900/30 text-burgundy-700 dark:text-burgundy-300 text-2xl font-medium">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>
                        {profile.full_name 
                          ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload"
                      className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Changer la photo"
                    >
                      <ImageIcon className="h-6 w-6 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Cliquez sur la photo pour la modifier</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom complet
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={profile.full_name}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Votre nom complet"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="pl-10 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    L'adresse email ne peut pas être modifiée
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Changer le mot de passe
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={profile.currentPassword}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Votre mot de passe actuel"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={profile.newPassword}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Nouveau mot de passe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={profile.confirmPassword}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Confirmer le nouveau mot de passe"
                      />
                    </div>
                  </div>
                </div>
              </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
                      disabled={saving}
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl">Sécurité</CardTitle>
                <CardDescription>
                  Gérez votre mot de passe et la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={profile.currentPassword}
                          onChange={handleChange}
                          className="pl-10"
                          placeholder="Votre mot de passe actuel"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={profile.newPassword}
                          onChange={handleChange}
                          className="pl-10"
                          placeholder="Nouveau mot de passe"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={profile.confirmPassword}
                          onChange={handleChange}
                          className="pl-10"
                          placeholder="Confirmer le nouveau mot de passe"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-sm text-gray-500">
                      Utilisez au moins 8 caractères avec des chiffres et des symboles
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
                      disabled={saving || (!profile.currentPassword && !profile.newPassword && !profile.confirmPassword)}
                    >
                      {saving ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
                    </Button>
                  </div>
                </form>

                <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Exportation des données
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Téléchargez une copie de vos données personnelles au format JSON.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter mes données
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl">Préférences de notification</CardTitle>
                <CardDescription>
                  Gérez comment vous recevez les notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="email-notifications">Notifications par email</Label>
                      <p className="text-sm text-gray-500">Recevoir des notifications importantes par email</p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="document-signed">Document signé</Label>
                      <p className="text-sm text-gray-500">Recevoir une notification quand un document est signé</p>
                    </div>
                    <Switch 
                      id="document-signed" 
                      checked={notifications.documentSigned}
                      onCheckedChange={(checked) => handleNotificationChange('documentSigned', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="document-received">Nouveau document</Label>
                      <p className="text-sm text-gray-500">Recevoir une notification pour les nouveaux documents</p>
                    </div>
                    <Switch 
                      id="document-received" 
                      checked={notifications.documentReceived}
                      onCheckedChange={(checked) => handleNotificationChange('documentReceived', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="weekly-digest">Résumé hebdomadaire</Label>
                      <p className="text-sm text-gray-500">Recevoir un résumé hebdomadaire de l'activité</p>
                    </div>
                    <Switch 
                      id="weekly-digest" 
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
                      onClick={() => setMessage({ type: 'success', text: 'Préférences de notification mises à jour' })}
                    >
                      Enregistrer les préférences
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl">Apparence</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Thème</h3>
                    <div className="grid gap-4 grid-cols-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                          theme === 'light' 
                            ? 'border-burgundy-500 bg-burgundy-50 dark:bg-burgundy-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="w-full h-20 bg-white rounded border border-gray-200 dark:border-gray-700 mb-2 overflow-hidden">
                          <div className="h-3 bg-gray-100 border-b border-gray-200 dark:border-gray-700" />
                          <div className="p-2">
                            <div className="h-2 bg-gray-200 rounded w-3/4 mb-1" />
                            <div className="h-2 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">Clair</span>
                      </button>

                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                          theme === 'dark' 
                            ? 'border-burgundy-500 bg-burgundy-50 dark:bg-burgundy-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="w-full h-20 bg-gray-900 rounded border border-gray-700 mb-2 overflow-hidden">
                          <div className="h-3 bg-gray-800 border-b border-gray-700" />
                          <div className="p-2">
                            <div className="h-2 bg-gray-700 rounded w-3/4 mb-1" />
                            <div className="h-2 bg-gray-800 rounded w-1/2" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">Sombre</span>
                      </button>

                      <button
                        onClick={() => setTheme('system')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                          theme === 'system' 
                            ? 'border-burgundy-500 bg-burgundy-50 dark:bg-burgundy-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="w-full h-20 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 mb-2 overflow-hidden">
                          <div className="h-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" />
                          <div className="p-2">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">Système</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Densité de l'interface</h3>
                    <div className="flex gap-4">
                      <button className="px-4 py-2 text-sm font-medium rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        Confortable
                      </button>
                      <button className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                        Compact
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-0">
            <ApiKeysSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
