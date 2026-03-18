
export async function POST(req: Request) {
    try {
        const { articleText } = await req.json();

        if (!articleText) {
            return NextResponse.json({ error: 'Article text is required' }, { status: 400 });
        }

        // 1. Identify potential grammar topics from text
        const topics = await extractGrammarTopics(articleText);
        console.log("Extracted Topics:", topics);

        if (!topics || topics.length === 0) {
            return NextResponse.json({ error: "Could not identify grammar topics in text." }, { status: 404 });
        }

        // 2. Search DB for these topics
        // We'll search for any rule that matches any of the topics (OR query)
        // Since Supabase 'in' expects exact matches, we might need 'ilike' for partial.
        // But for simplicity/performance in this strict mode, let's try strict matching or simple 'or' filtering in code if dataset is small, 
        // OR better: use textual search or multiple ilike. 
        // Let's assume 'pattern' column stores the rule name.

        // Construct filter: pattern.ilike.%Topic1%, pattern.ilike.%Topic2%...
        // Construct filter: pattern.ilike.%Topic%, scenario.ilike.%Topic%
        // We search in both pattern and scenario because pattern might be generic (e.g. "General Grammar")
        const filter = topics.map(t => {
            // Escape special characters in t if necessary, but for now assume simple text
            return `pattern.ilike.%${t}%,scenario.ilike.%${t}%`;
        }).join(',');

        const { data: dbMatches, error: dbError } = await supabase
            .from('grammar_table')
            .select('*')
            .or(filter);

        if (dbError) {
            console.error("DB Error:", dbError);
            // If table doesn't exist, this is where we catch it.
            // User wants: "If not found, tell me."
            return NextResponse.json({
                error: "Failed to access grammar database. Please ensure 'grammar_table' exists.",
                details: dbError.message
            }, { status: 500 });
        }

        if (!dbMatches || dbMatches.length === 0) {
            return NextResponse.json({
                error: "No matching grammar points found in your database for this text.",
                code: "NO_DB_MATCH",
                topicsFound: topics
            }, { status: 404 });
        }

        console.log("DB Matches found:", dbMatches.length);

        // 3. Generate Quiz using DB data
        const quizData = await generateGrammarQuiz(articleText, dbMatches);
        return NextResponse.json(quizData);

    } catch (error: any) {
        console.error('Error in generate-grammar-quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate quiz' },
            { status: 500 }
        );
    }
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
