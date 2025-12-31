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

    const { question, answer } = req.body;

    try {
        const prompt = `
      Evaluate answer to discussion question.
      Question: "${question}"
      Answer: "${answer}"
      Provide feedback, score (1-10), and improvements.

      Output JSON format:
      {
        "feedback": "string",
        "score": number,
        "improvements": "string"
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
        return res.status(500).json({ error: error.message || 'Error evaluating answer' });
    }
}
