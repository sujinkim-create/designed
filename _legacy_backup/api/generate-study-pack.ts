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

  const { text, level, excludeWords = [] } = req.body;

  if (!text || !level) {
    return res.status(400).json({ error: 'Text and level are required' });
  }

  try {
    const prompt = `
      Analyze the following English text (Level ${level}):
      "${text.substring(0, 5000)}"

      Create a study guide for an English learner.
      Create a study guide for an English learner.
      1. Extract 8 challenging vocabulary words appropriate for Level ${level}.
         ${excludeWords.length > 0 ? `Do NOT include: ${excludeWords.join(", ")}` : ""}
      2. Create 3 Multiple Choice Questions (Reading Comprehension). Paraphrased questions.
      3. Create 4 Fill-in-the-blank (Cloze) questions testing vocabulary. Sentences DIRECTLY from text.
      4. Create 2 Discussion questions with model answers.
      5. Extract 4 useful collocations (Verb+Noun, Adj+Noun etc).
      6. Explain 2-3 key grammar points used in text.
         - **CRITICAL**: You MUST select grammar points ONLY from the "TARGET GRAMMAR RULES" list below.
         - Choose rules that are actually valid and relevant to the provided text.
         - Explanation must be DETAILED and EASY TO UNDERSTAND.
         - FOR EACH Grammar Point, create EXACTLY 3 Practice Multiple Choice Questions testing that specific rule.
         - Questions must be **TOEIC/TOEFL style** (Formal, challenging, checking precise usage).
         - Options must count **EXACTLY 4** (A, B, C, D).
         - Options must include **high-quality distractors** (plausible mistakes).
         - **CRITICAL**: Options must be MUTUALLY EXCLUSIVE. Do NOT provide two options that could both be grammatically correct (e.g., do NOT list 'made' and 'had' as options for a causative structure if both fit). There must be ONLY ONE correct answer.

      TARGET GRAMMAR RULES:
      1. Advanced Verb Nuances:
         - Causative verbs (make, have, let + bare infinitive) vs (get/help + to-infinitive/p.p.)
         - Modals + Perfect (should/must/cannot have p.p. - regrets, deductions)
         - Future Perfect (will have p.p.) & Perfect Continuous (have been V-ing)
      2. Syntactic Complexity:
         - Noun Clauses (whether/if, whoever/whatever)
         - Participle Clauses (Reduction of adverbial clauses, "While V-ing", "Although...")
         - "With" absolute phrases (with + obj + v-ing/p.p./adj/prep)
      3. Formal & Special Structures:
         - Omission of "should" in subjunctive clauses (insist, suggest, demand that...)
         - Inversion (Negative adverbs, Place adverbs, "Only" phrases)
         - Inversion in concession clauses (Young as he is...)
         - Cleft Sentences (It is... that, What-clefts)
      4. Modification & Comparison:
         - "as... as" comparisons & Multipliers (twice, three times)
         - Emphasizing comparatives (much, still, even, far, a lot vs very)
         - "The + Adjective" (Collective/Abstract nouns)
      5. Cohesion & Agreement:
         - Subject-Verb Agreement with Inversion (There is/are...)
         - Agreement with portions (most, half, the rest of + Noun)
         - Quasi-relative pronouns (than, as, but)

      Output JSON format:
      {
        "vocabulary": [
          { "word": "string", "definition": "string", "koreanDefinition": "string", "example": "string" }
        ],
        "mcq": [
          { "id": number, "question": "string", "options": ["string"], "correctIndex": number }
        ],
        "cloze": [
          { "id": number, "sentencePart1": "string", "sentencePart2": "string", "answer": "string", "options": ["string"] }
        ],
        "discussion": [
          { "question": "string", "modelAnswer": "string" }
        ],
        "collocations": [
          { "phrase": "string", "definition": "string", "koreanDefinition": "string", "example": "string" }
        ],
        "grammar": [
          {
            "rule": "string", "explanation": "string", "example": "string",
            "practice": [
              { "id": number, "question": "string", "options": ["string"], "correctAnswer": "string", "explanation": "string" }
            ]
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful English learning expert. You MUST respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Empty response from OpenAI");

    return res.status(200).json(JSON.parse(content));
  } catch (error: any) {
    console.error("Error generating study pack:", error);
    return res.status(500).json({ error: error.message || 'Failed to generate study pack' });
  }
}
