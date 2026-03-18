import { NextResponse } from 'next/server';
import { lookupWord } from '@/services/geminiService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { word, context } = await req.json();
        if (!word || !context) {
            return NextResponse.json({ error: 'word and context are required' }, { status: 400 });
        }
        const result = await lookupWord(word, context);
        return NextResponse.json({ result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
