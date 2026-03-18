import { NextResponse } from 'next/server';
import { recommendTopics } from '@/services/geminiService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const prefs = await req.json();
        const topics = await recommendTopics(prefs);
        return NextResponse.json(topics);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
