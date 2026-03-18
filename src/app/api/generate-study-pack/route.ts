import { NextResponse } from 'next/server';
import { generateStudyPack } from '@/services/geminiService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { text, level, excludeWords = [] } = await req.json();
        if (!text || !level) {
            return NextResponse.json({ error: 'text and level are required' }, { status: 400 });
        }
        const studyPack = await generateStudyPack(text, level, excludeWords);
        return NextResponse.json(studyPack);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
