import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

    const { sentence, targetCollocation } = req.body;

    try {
        const prompt = `
      Evaluate the following sentence written by an English learner.
      Target Collocation: "${targetCollocation}"
      Learner's Sentence: "${sentence}"
      Determine correctness, provide feedback, and suggestion if wrong.

      Output JSON format:
      {
        "isCorrect": boolean,
        "feedback": "string",
        "suggestion": "string (optional)"
      }
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful English learning assistant. You MUST respond with valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("Failed to parse response");

        return res.status(200).json(JSON.parse(content));
    } catch (error: any) {
        return res.status(500).json({ error: error.message || 'Error evaluating sentence' });
    }
}
