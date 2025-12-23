import OpenAI from 'openai';
import { GeneratedArticles, StudyPack, UserPreferences, TopicRecommendation, ContentType } from "../types";
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openai: OpenAI | null = null;
if (apiKey) {
  openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
}

export const generateArticles = async (topic: string, contentType: ContentType = 'article', level?: string): Promise<GeneratedArticles> => {
  if (!openai) throw new Error("OpenAI API Key is missing. Please check your .env file.");

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

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model
      messages: [
        { role: "system", content: "You are a helpful English learning assistant. You MUST respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Empty response from OpenAI");

    return JSON.parse(content) as GeneratedArticles;
  } catch (error: any) {
    console.error("Error generating articles:", error);
    throw new Error(`Failed to generate articles: ${error.message}`);
  }
};

export const generateStudyPack = async (text: string, level: string, excludeWords: string[] = []): Promise<StudyPack> => {
  if (!openai) throw new Error("OpenAI API Key is missing");

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

  try {
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

    return JSON.parse(content) as StudyPack;
  } catch (error: any) {
    console.error("Error generating study pack:", error);
    throw new Error(`Failed to generate study pack: ${error.message}`);
  }
};

export const evaluateSentence = async (sentence: string, targetCollocation: string): Promise<{ isCorrect: boolean; feedback: string; suggestion?: string }> => {
  if (!openai) throw new Error("OpenAI API Key is missing");

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
  return JSON.parse(content);
};

export const evaluateDiscussionAnswer = async (question: string, answer: string): Promise<{ feedback: string; score: number; improvements: string }> => {
  if (!openai) throw new Error("OpenAI API Key is missing");

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
  return JSON.parse(content);
};

export const recommendTopics = async (prefs: UserPreferences): Promise<TopicRecommendation[]> => {
  if (!openai) throw new Error("OpenAI API Key is missing");

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
  return parsed.recommendations || parsed; // Handle potentially unwrapped array if model behaves oddly, though schema usually prevents it.
};

export const lookupWord = async (word: string, context: string): Promise<string> => {
  if (!openai) throw new Error("OpenAI API Key is missing");

  const prompt = `
    Define the word "${word}" in Korean, based on usage in: "${context}".
    Provide ONLY the Korean definition (and part of speech). Max 10 words.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content || "Definition not found.";
};

export const translateText = async (text: string): Promise<string> => {
  if (!openai) throw new Error("OpenAI API Key is missing");

  const prompt = `Translate to natural Korean:\n\n"${text}"`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content || "Translation failed.";
};
