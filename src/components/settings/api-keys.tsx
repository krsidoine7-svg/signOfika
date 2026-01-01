'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Copy, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKey {
  id: string
  name: string
  prefix: string
  created_at: string
  last_used_at: string | null
  expires_at: string
}

export default function ApiKeysSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApiKeys(data || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
      toast.error('Erreur lors du chargement des clés API')
    }
  }

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) {
      toast.error('Veuillez entrer un nom pour la clé')
      return
    }

    setIsCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création de la clé')
      }

      const { key, keyData } = await response.json()
      setNewKey(key)
      setApiKeys(prev => [keyData, ...prev])
      setNewKeyName('')
      toast.success('Clé API générée avec succès')
    } catch (error: any) {
      console.error('Error creating API key:', error)
      toast.error(error.message || 'Erreur lors de la création de la clé')
    } finally {
      setIsCreating(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette clé ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`/api/keys?id=${keyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la suppression de la clé')
      }

      setApiKeys(prev => prev.filter(k => k.id !== keyId))
      toast.success('Clé API supprimée avec succès')
    } catch (error: any) {
      console.error('Error deleting API key:', error)
      toast.error(error.message || 'Erreur lors de la suppression de la clé')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Clé copiée dans le presse-papier')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {newKey && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>Nouvelle clé API créée</CardTitle>
            <CardDescription>
              Copiez cette clé maintenant. Vous ne pourrez plus la voir plus tard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded-md overflow-x-auto">
                {newKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(newKey)}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Important :</span> Conservez cette clé dans un endroit sûr. 
              Elle ne sera plus affichée après avoir quitté cette page.
            </p>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Créer une nouvelle clé API</CardTitle>
          <CardDescription>
            Donnez un nom à votre clé pour l'identifier facilement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createApiKey} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Ex. Mon application de test"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <Button
              type="submit"
              disabled={isCreating || !newKeyName.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? 'Création...' : 'Créer une clé'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes clés API</CardTitle>
          <CardDescription>
            Liste de toutes vos clés API actives et révoquées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune clé API trouvée
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{key.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Créée le {new Date(key.created_at).toLocaleDateString()}
                      {key.last_used_at && (
                        <span className="ml-2">
                          • Dernière utilisation : {new Date(key.last_used_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {key.prefix}••••••••••••••••
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {new Date(key.expires_at) > new Date() ? 'Active' : 'Expirée'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revokeApiKey(key.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    title="Supprimer la clé"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
