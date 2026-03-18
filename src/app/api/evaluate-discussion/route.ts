import { NextResponse } from 'next/server';
import { evaluateDiscussionAnswer } from '@/services/geminiService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { question, answer } = await req.json();
        if (!question || !answer) {
            return NextResponse.json({ error: 'question and answer are required' }, { status: 400 });
        }
        const result = await evaluateDiscussionAnswer(question, answer);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
