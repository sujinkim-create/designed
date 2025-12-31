import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prefs } = req.body;

    try {
        const prompt = `
      Suggest 3 engaging topics based on:
      Interests: ${prefs.interests.join(", ")}
      Goals: ${prefs.goals.join(", ")}

      Output JSON format:
      {
        "recommendations": [
          {
            "topic": "string",
            "reason": "string"
          }
        ]
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
        const parsed = JSON.parse(content);
        return res.status(200).json(parsed.recommendations || parsed);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || 'Error recommending topics' });
    }
}
