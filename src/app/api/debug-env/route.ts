
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hasNextPublicApiKey: !!process.env.NEXT_PUBLIC_API_KEY,
        hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        allKeys: Object.keys(process.env).filter(k => k.startsWith('NEXT_') || k.includes('KEY'))
    });
}
