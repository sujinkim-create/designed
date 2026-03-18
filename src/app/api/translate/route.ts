import { NextResponse } from 'next/server';
import { translateText } from '@/services/geminiService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: 'text is required' }, { status: 400 });
        }
        const translated = await translateText(text);
        return NextResponse.json({ translated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
