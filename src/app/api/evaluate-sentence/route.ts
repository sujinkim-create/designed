import { NextResponse } from 'next/server';
import { evaluateSentence } from '@/services/geminiService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { sentence, targetCollocation } = await req.json();
        if (!sentence || !targetCollocation) {
            return NextResponse.json({ error: 'sentence and targetCollocation are required' }, { status: 400 });
        }
        const result = await evaluateSentence(sentence, targetCollocation);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
