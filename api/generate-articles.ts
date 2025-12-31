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

    const { topic, contentType = 'article', level } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        let typeInstruction = "";
        let formatInstruction = "";

        switch (contentType) {
            case 'speech':
                typeInstruction = "Write a 3-minute speech script";
                formatInstruction = `Divide content into 4-5 paragraphs. Use [PARAGRAPH] separator.`;
                break;
            case 'conversation':
                typeInstruction = "Write a natural conversation script between two people (Sarah and Tom)";
                formatInstruction = `Format: "Name: dialogue". Use [PARAGRAPH] separator between lines.`;
                break;
            case 'fairytale':
                typeInstruction = "Write a creative fairy tale";
                formatInstruction = `Divide content into 4-5 paragraphs. Use [PARAGRAPH] separator.`;
                break;
            case 'article':
            default:
                typeInstruction = "Write a news-style or educational article";
                formatInstruction = `Divide content into 4-5 paragraphs. Use [PARAGRAPH] separator.`;
                break;
        }

        let levelInstruction = "";
        if (level && level !== 'All') {
            levelInstruction = `Create 1 version adapted for English level ${level}. Target Length: ${level === 'A1' ? '150' : '400'} words.`;
        } else {
            levelInstruction = `
      Create 5 versions adapted for different English proficiency levels (A1, A2, B1, B2, C1) with DIFFERENT LENGTHS.
      A1 (150 words) to C1 (500 words).
      `;
        }

        const prompt = `
      ${typeInstruction} about the topic: "${topic}".
      ${levelInstruction}
      ${formatInstruction}

      Output JSON format:
      {
        "topic": "string",
        "variations": [
          {
            "level": "string (A1, A2, etc)",
            "title": "string",
            "content": "string",
            "summary": "string"
          }
        ]
      }
      SAFETY GUIDELINES: No profanity, slang, or offensive language. Suitable for all ages.
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
        if (!content) throw new Error("Empty response from OpenAI");

        return res.status(200).json(JSON.parse(content));
    } catch (error: any) {
        console.error("Error generating articles:", error);
        return res.status(500).json({ error: error.message || 'Failed to generate articles' });
    }
}
