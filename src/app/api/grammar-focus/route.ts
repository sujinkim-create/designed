import { NextResponse } from 'next/server';
import { extractKeySentences, generateDBBasedQuiz } from '@/services/geminiService';
import { checkTextWithLanguageTool, checkGrammar } from '@/services/languageToolService';
import { GrammarFocusData, GrammarFocusRule } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { articleText } = await req.json();

        if (!articleText) {
            return NextResponse.json({ error: 'Article text is required' }, { status: 400 });
        }

        console.log("Step 1: Analyzing text with LanguageTool API...");
        // 1. Get Grammar Keywords from LanguageTool (e.g. "Passive Voice")
        const ltKeywords = await checkTextWithLanguageTool(articleText.substring(0, 1500)); // Limit length for API
        console.log("LanguageTool found keywords:", ltKeywords);

        // 2. Extract Key Sentences & Grammar Patterns using OpenAI
        // Use the LT keywords as hints if available, otherwise OpenAI finds its own
        console.log("Step 2: Extracting grammar patterns with OpenAI...");
        const extractedPoints = await extractKeySentences(articleText); // detailed analysis

        // Merge keywords: prioritize LT findings if they exist in the text analysis
        // Actually, we need to generate quizzes. The `extractKeySentences` returns { sentence, grammarPattern }.

        const matchedRules: GrammarFocusRule[] = [];
        const seenPatterns = new Set<string>();

        // 3. Generate Quizzes for extracted points
        for (const point of extractedPoints) {
            if (seenPatterns.has(point.grammarPattern)) continue;
            seenPatterns.add(point.grammarPattern);

            // [VALIDATION STEP]
            // Verify the sentence is actually correct according to LanguageTool
            // If LT finds errors in the source sentence, it might be a bad candidate for teaching.
            const ltCheck = await checkGrammar(point.sentence);
            const hasErrors = ltCheck && ltCheck.matches && ltCheck.matches.length > 0;

            if (hasErrors) {
                console.log(`[Validation Failed] Discarding sentence for pattern '${point.grammarPattern}': "${point.sentence}"`);
                console.log(`-- Reason: Found ${ltCheck.matches.length} potential issues (e.g., ${ltCheck.matches[0].message})`);
                continue; // Skip this sentence
            } else {
                console.log(`[Validation Passed] Sentence is clean: "${point.sentence}"`);
            }

            // Construct a "Virtual DB Rule"
            const virtualRule = {
                id: Math.floor(Math.random() * 10000), // Ensure integer ID
                pattern: point.grammarPattern,
                scenario: `Grammar point found in text: ${point.grammarPattern}`,
            };

            console.log(`Generating quiz for pattern: ${point.grammarPattern}`);
            const quiz = await generateDBBasedQuiz(point.sentence, virtualRule);

            matchedRules.push({
                dbRule: virtualRule,
                matchedSentence: point.sentence,
                quiz
            });

            if (matchedRules.length >= 5) break;
        }

        return NextResponse.json({
            matchedRules,
            message: matchedRules.length === 0 ? "No valid grammar points found (all filtered by verification)." : undefined,
            source: "AI + LanguageTool Verified"
        } as GrammarFocusData);

    } catch (error: any) {
        console.error('Error in grammar-focus:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate grammar focus' },
            { status: 500 }
        );
    }
}
