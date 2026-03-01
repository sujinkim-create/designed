import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { articleText } = req.body;

    if (!articleText) {
        return res.status(400).json({ error: 'Article text is required' });
    }

    try {
        // 1. Analyze article to find grammar topics
        const analysisPrompt = `
        Analyze the following English text and identify the 3 most prominent grammatical structures or patterns used.
        Return ONLY a JSON array of strings, e.g., ["Present Perfect", "Relative Clauses", "Conditionals"].
        
        Text:
        ${articleText.substring(0, 2000)} // Limit context to avoid token limits
        `;

        const analysisCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a linguistics expert. Output valid JSON array only." },
                { role: "user", content: analysisPrompt }
            ]
        });

        const features = JSON.parse(analysisCompletion.choices[0].message.content || "[]");
        console.log("Identified grammar features:", features);

        // 2. Query Supabase for examples
        const selectedExamples: any[] = [];

        // We will try to find examples for each feature
        for (const feature of features) {
            // Create a simple search query from the feature name 
            // e.g. "Present Perfect" -> pattern.ilike.%Perfect%
            // Taking the last word usually helps for broad matching, or just the whole string
            const searchTerm = feature.split(' ').pop() || feature;

            const { data, error } = await supabase
                .from('grammar_rules')
                .select('pattern, scenario')
                .ilike('pattern', `%${searchTerm}%`)
                .limit(5);

            if (data && data.length > 0) {
                // Pick random 2
                const chosen = data.sort(() => 0.5 - Math.random()).slice(0, 2);
                selectedExamples.push(...chosen);
            }
        }

        // Fallback if no specific matches found (fetch random ones)
        if (selectedExamples.length < 5) {
            const { data } = await supabase.from('grammar_rules').select('pattern, scenario').limit(5);
            if (data) selectedExamples.push(...data);
        }

        // 3. Generate Quiz (10 Questions)
        const quizPrompt = `
        Create a 10-question multiple-choice grammar quiz based on the following article and grammar points.
        
        Article Context:
        ${articleText.substring(0, 1000)}...

        Relevant Grammar Examples (Reference):
        ${JSON.stringify(selectedExamples)}

        Focus on: ${features.join(', ')}

        Output strictly valid JSON format:
        {
            "questions": [
                {
                    "question": "string",
                    "options": ["string", "string", "string", "string"],
                    "correctAnswer": 0, // index of option
                    "explanation": "string"
                }
            ]
        }
        `;

        const quizCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful teacher. Output valid JSON." },
                { role: "user", content: quizPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const quizContent = JSON.parse(quizCompletion.choices[0].message.content || "{}");

        return res.status(200).json(quizContent);

    } catch (error: any) {
        console.error("Error generating quiz:", error);
        return res.status(500).json({ error: error.message || 'Failed to generate quiz' });
    }
}
