import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Créer un client Supabase
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      )
    }

    // Générer une clé API sécurisée
    const prefix = 'sfk_'
    const key = prefix + randomBytes(32).toString('hex')
    const keyHash = require('crypto').createHash('sha256').update(key).digest('hex')

    // Enregistrer la clé dans la base de données
    const { data: keyData, error: dbError } = await (supabase as any)
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: keyHash,
        prefix,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // Expire dans 1 an
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Renvoyer la clé (à afficher une seule fois) et les métadonnées
    return NextResponse.json({
      key,
      keyData: {
        ...keyData,
        key_hash: undefined // Ne pas renvoyer le hash
      }
    })

  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la clé API' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'ID de clé manquant' },
        { status: 400 }
      )
    }

    // Créer un client Supabase
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est bien le propriétaire de la clé
    const { data: key, error: keyError } = await (supabase as any)
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .eq('user_id', user.id)
      .single()

    if (keyError || !key) {
      return NextResponse.json(
        { error: 'Clé non trouvée ou accès non autorisé' },
        { status: 404 }
      )
    }

    // Supprimer la clé de la base de données
    const { error: deleteError } = await (supabase as any)
      .from('api_keys')
      .delete()
      .eq('id', keyId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error revoking API key:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la révocation de la clé API' },
      { status: 500 }
    )
  }
}
