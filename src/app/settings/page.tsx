'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { 
  User, 
  Key, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Loader2,
  ShieldCheck,
  Building2,
  Phone,
  Mail
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, cn } from '@/lib/utils'


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Profile state
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    company_name: '',
    phone: '',
    brand_color: '#800020',
    brand_logo_url: '',
    webhook_url: '',
    company_url: ''
  })



  // API Keys state
  const [keys, setKeys] = useState<any[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyEnvironment, setNewKeyEnvironment] = useState('production')

  const [generatedKey, setGeneratedKey] = useState(null)

  const [showKeyDialog, setShowKeyDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const fileExt = file.name.split('.').pop()
      const fileName = `branding/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      setProfile({ ...profile, brand_logo_url: publicUrl })
      toast.success('Logo mis en ligne ! N\'oubliez pas d\'enregistrer le profil.')
    } catch (error: any) {
      toast.error('Erreur lors de l\'upload : ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const loadData = async () => {

    try {
      setLoading(true)
      const [profileRes, keysRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/keys')
      ])

      if (profileRes.ok) {
        const { profile } = await profileRes.json()
        setProfile(profile)
      }

      if (keysRes.ok) {
        const { keys } = await keysRes.json()
        setKeys(keys)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        toast.success('Profil mis à jour avec succès')
      } else {
        throw new Error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Impossible de mettre à jour le profil')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName) return

    setSaving(true)
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newKeyName,
          environment: newKeyEnvironment 
        })

      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedKey(data.key)
        setKeys([data.keyData, ...keys])
        setNewKeyName('')
        toast.success('Clé API créée !')
      } else {
        throw new Error('Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Impossible de créer la clé API')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    try {
      const response = await fetch(`/api/keys?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setKeys(keys.filter((k: any) => k.id !== id))
        toast.success('Clé API révoquée')
      }
    } catch (error) {
      toast.error('Impossible de révoquer la clé')
    }
  }

  const handleToggleKey = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus })
      })

      if (response.ok) {
        setKeys(keys.map((k: any) => k.id === id ? { ...k, is_active: !currentStatus } : k))
        toast.info(currentStatus ? 'Clé désactivée' : 'Clé activée')
      }
    } catch (error) {
      toast.error('Impossible de modifier le statut')
    }
  }

  const copyToClipboard = (text: string) => {

    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papier')
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-burgundy-600" />
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-10 px-4">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-bold text-navy-900 tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-10 w-10 text-burgundy-600" />
          Paramètres
        </h1>
        <p className="text-gray-600 text-lg">Gérez vos informations personnelles et votre accès API</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white/50 backdrop-blur-md border border-gray-200 p-1 h-14 rounded-2xl shadow-sm">
          <TabsTrigger value="profile" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-burgundy-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
            <User className="h-4 w-4 mr-2" />
            Profil public
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-burgundy-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
            <Key className="h-4 w-4 mr-2" />
            Clés API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white border-gray-200 shadow-xl rounded-3xl overflow-hidden border-t-4 border-t-burgundy-600">
            <form onSubmit={handleUpdateProfile}>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-navy-900 font-bold">Informations personnelles</CardTitle>
                <CardDescription className="text-gray-500">Mettez à jour vos informations de contact et d'entreprise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-navy-800 font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-burgundy-600" /> Nom complet
                    </Label>
                    <Input 
                      value={profile.full_name || ''} 
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      placeholder="Jean Dupont"
                      className="rounded-xl border-gray-200 focus:border-burgundy-500 transition-all text-navy-900 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy-800 font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-burgundy-600" /> Email
                    </Label>
                    <Input 
                      value={profile.email || ''} 
                      disabled
                      className="rounded-xl bg-gray-50 border-gray-200 text-gray-500 h-11"
                    />
                    <p className="text-[10px] text-gray-400 pl-1">Contactez le support pour modifier votre email</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy-800 font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-burgundy-600" /> Société (Optionnel)
                    </Label>
                    <Input 
                      value={profile.company_name || ''} 
                      onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                      placeholder="SignOfika Inc."
                      className="rounded-xl border-gray-200 focus:border-burgundy-500 transition-all text-navy-900 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy-800 font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-burgundy-600" /> Téléphone (Optionnel)
                    </Label>
                    <Input 
                      value={profile.phone || ''} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+33 6 00 00 00 00"
                      className="rounded-xl border-gray-200 focus:border-burgundy-500 transition-all text-navy-900 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy-800 font-semibold flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: profile.brand_color }} />
                      Couleur de marque
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={profile.brand_color || '#800020'} 
                        onChange={(e) => setProfile({...profile, brand_color: e.target.value})}
                        className="w-12 p-1 rounded-lg border-gray-200 h-11"
                      />
                      <Input 
                        value={profile.brand_color || '#800020'} 
                        onChange={(e) => setProfile({...profile, brand_color: e.target.value})}
                        placeholder="#800020"
                        className="flex-1 rounded-xl border-gray-200 h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-navy-800 font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-burgundy-600" /> Logo de l'entreprise
                    </Label>
                    <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                      {profile.brand_logo_url ? (
                        <div className="relative group">
                          <img 
                            src={profile.brand_logo_url} 
                            alt="Logo" 
                            className="h-16 w-16 object-contain rounded-lg bg-white p-1 border border-gray-100" 
                          />
                          <button 
                            type="button"
                            onClick={() => setProfile({...profile, brand_logo_url: ''})}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <Building2 className="h-8 w-8" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-navy-900 mb-1">Téléverser un nouveau logo</p>
                        <p className="text-xs text-gray-500 mb-3">PNG, JPG ou SVG (Max. 2 Mo)</p>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload}
                          className="text-xs h-8 py-1 px-2 cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-navy-800 font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-burgundy-600" /> Lien du site de l'entreprise
                    </Label>
                    <Input 
                      value={profile.company_url || ''} 
                      onChange={(e) => setProfile({...profile, company_url: e.target.value})}
                      placeholder="https://votre-entreprise.com"
                      className="rounded-xl border-gray-200 focus:border-burgundy-500 transition-all text-navy-900 h-11"
                    />
                    <p className="text-[10px] text-gray-400 pl-1">Ce lien sera inclus dans les emails envoyés à vos signataires.</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-navy-800 font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-burgundy-600" /> Webhook URL (Notifications API)
                    </Label>
                    <Input 
                      value={profile.webhook_url || ''} 
                      onChange={(e) => setProfile({...profile, webhook_url: e.target.value})}
                      placeholder="https://votre-serveur.com/webhooks/signofika"
                      className="rounded-xl border-gray-200 focus:border-burgundy-500 transition-all text-navy-900 h-11"
                    />
                    <p className="text-[10px] text-gray-400 pl-1">SignOfika enverra un POST JSON à cette adresse dès qu'un document sera signé.</p>
                  </div>


                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 p-6 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-burgundy-200 transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="apikeys">
          <div className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-xl rounded-3xl overflow-hidden border-t-4 border-t-burgundy-600">
              <CardHeader>
                <CardTitle className="text-2xl text-navy-900 font-bold">Nouvelle Clé API</CardTitle>
                <CardDescription className="text-gray-500 text-base">Générez une clé pour automatiser vos signatures via notre API</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateKey} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-[2]">
                      <Input 
                        placeholder="Nom de la clé (ex: Production Website)" 
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="rounded-xl border-gray-200 focus:border-burgundy-500 transition-all h-11 text-navy-900"
                      />
                    </div>
                    <div className="flex-1">
                      <select 
                        value={newKeyEnvironment}
                        onChange={(e) => setNewKeyEnvironment(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 h-11 text-sm text-navy-900 focus:border-burgundy-500 outline-none transition-all"
                      >
                        <option value="production">Production (Réel)</option>
                        <option value="sandbox">Bac à sable (Sandbox)</option>
                      </select>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={saving || !newKeyName}
                    className="w-full bg-navy-700 hover:bg-navy-800 text-white rounded-xl h-11 font-bold transition-all shadow-md mt-2"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Générer la clé {newKeyEnvironment === 'production' ? 'Production' : 'Sandbox'}
                  </Button>
                </form>


                {generatedKey && (
                  <div className="mt-6 p-6 bg-burgundy-50 border border-burgundy-200 rounded-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 text-burgundy-800 font-bold mb-3">
                      <ShieldCheck className="h-5 w-5" /> Attention : Copiez votre clé maintenant
                    </div>
                    <p className="text-sm text-burgundy-700 mb-4 font-medium">Pour votre sécurité, cette clé ne sera plus jamais affichée.</p>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-white p-3 rounded-xl border border-burgundy-200 font-mono text-sm break-all font-bold text-navy-900 shadow-inner">
                        {generatedKey}
                      </code>
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedKey)} className="rounded-xl h-11 w-11 hover:bg-burgundy-100 border-burgundy-200">
                        <Copy className="h-4 w-4 text-burgundy-700" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setGeneratedKey(null)} 
                      className="mt-4 text-burgundy-600 hover:text-burgundy-800 underline p-0 h-auto font-bold"
                    >
                      J'ai fini de copier la clé
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2 pl-4">
                <Key className="h-5 w-5 text-burgundy-600" /> Vos clés actives
              </h3>
              
              {keys.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-500">
                  <p className="font-medium text-lg mb-2">Aucune clé active</p>
                  <p className="text-sm">Générez votre première clé ci-dessus pour commencer.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {keys.map((key: any) => (
                    <Card key={key.id} className={cn(
                      "bg-white border-gray-100 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group",
                      !key.is_active && "opacity-60 bg-gray-50/50"
                    )}>
                      <div className="flex items-center justify-between p-5 md:p-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                            key.is_active 
                              ? "bg-gray-50 text-gray-400 group-hover:bg-burgundy-50 group-hover:text-burgundy-500" 
                              : "bg-gray-200 text-gray-400"
                          )}>
                            <Key className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn("font-bold text-lg", key.is_active ? "text-navy-900" : "text-gray-500")}>
                                {key.name}
                              </h4>
                              <span className={cn(
                                "text-[10px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider border",
                                key.environment === 'sandbox' 
                                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              )}>
                                {key.environment === 'sandbox' ? 'Sandbox' : 'Production'}
                              </span>
                              {!key.is_active && (
                                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider border bg-gray-100 text-gray-500 border-gray-200">
                                  Désactivée
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-mono">
                                {key.prefix}••••••••
                              </span>
                              <span className="flex items-center gap-1.5">
                                Créée le {formatDate(key.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 mr-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                              {key.is_active ? 'Active' : 'Désactivée'}
                            </span>
                            <Switch 
                              checked={key.is_active} 
                              onCheckedChange={() => handleToggleKey(key.id, key.is_active)}
                              className="data-[state=checked]:bg-burgundy-600"
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteKey(key.id)}
                            className="h-11 w-11 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
