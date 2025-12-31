import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { word, context } = req.body;

    try {
        const prompt = `
      Define the word "${word}" in Korean, based on usage in: "${context}".
      Provide ONLY the Korean definition (and part of speech). Max 10 words.
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        const result = completion.choices[0].message.content || "Definition not found.";
        return res.status(200).json({ result });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || 'Error looking up word' });
    }
}
