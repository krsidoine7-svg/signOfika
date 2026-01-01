import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
        supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10),
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
        nodeEnv: process.env.NODE_ENV,
    })
}
