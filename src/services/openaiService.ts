import OpenAI from 'openai';
import { GeneratedArticles, StudyPack, UserPreferences, TopicRecommendation, ContentType, GrammarDBRule, GrammarFocusQuiz } from "../types";

// Configure OpenAI Client to use the local proxy
// The proxy in vite.config.ts handles the API Key injection and forwarding to https://api.openai.com/v1
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'dummy',
  dangerouslyAllowBrowser: true // We are running in browser
});

export const generateArticles = async (topic: string, contentType: ContentType = 'article', level?: string): Promise<GeneratedArticles> => {
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
  return JSON.parse(content);
};

export const generateStudyPack = async (text: string, level: string, excludeWords: string[] = []): Promise<StudyPack> => {
  const prompt = `
      Analyze the following English text (Level ${level}):
      "${text.substring(0, 5000)}"

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
         - **CRITICAL**: Options must be MUTUALLY EXCLUSIVE. Do NOT provide two options that could both be grammatically correct. There must be ONLY ONE correct answer.

      TARGET GRAMMAR RULES:
       1. Advanced Verb Nuances: Causative verbs, Modals + Perfect, Future Perfect & Perfect Continuous
       2. Syntactic Complexity: Noun Clauses, Participle Clauses, "With" absolute phrases
       3. Formal & Special Structures: Omission of "should", Inversion, Cleft Sentences
       4. Modification & Comparison: "as... as" comparisons, Emphasizing comparatives, "The + Adjective"
       5. Cohesion & Agreement: Subject-Verb Agreement with Inversion, Agreement with portions, Quasi-relative pronouns

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
  return JSON.parse(content);
};

export const evaluateSentence = async (sentence: string, targetCollocation: string): Promise<{ isCorrect: boolean; feedback: string; suggestion?: string }> => {
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
  return parsed.recommendations || parsed;
};

export const lookupWord = async (word: string, context: string): Promise<string> => {
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
  const prompt = `Translate to natural Korean:\n\n"${text}"`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content || "Translation failed.";
};

/**
 * Extract key sentences from article text that demonstrate grammatical structures
 * Returns sentences that can be matched against DB grammar rules
 */
export const extractKeySentences = async (text: string): Promise<{ sentence: string; grammarPattern: string }[]> => {
  const prompt = `
    Analyze the following text and extract 5-8 key sentences that demonstrate clear grammatical structures.
    For each sentence, identify the main grammar KEYWORD (e.g., "Present Perfect", "Passive Voice", "Relative Clause", "To Infinitive").
    
    Text: "${text.substring(0, 3000)}"
    
    Return ONLY standard grammar terms that would be found in a grammar textbook.
    
    Output JSON format:
    {
      "sentences": [
        {
          "sentence": "string",
          "grammarPattern": "string"
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
    if (!content) return [];

    const data = JSON.parse(content);
    return data.sentences || [];
  } catch (e) {
    console.error("Error extracting key sentences:", e);
    return [];
  }
};

/**
 * Generate a quiz question based on a DB grammar rule and article sentence
 * Uses the DB rule's pattern structure to transform the article sentence
 */
export const generateDBBasedQuiz = async (
  articleSentence: string,
  dbRule: GrammarDBRule
): Promise<GrammarFocusQuiz> => {
  const prompt = `
    Create a grammar quiz question based on the following:
    
    Grammar Rule from Database:
    - Pattern (공식): "${dbRule.pattern}"
    - Description (설명): "${dbRule.scenario}"
    
    Article Sentence to Transform:
    "${articleSentence}"
    
    Task:
    1. Create a multiple-choice question that tests understanding of this grammar pattern.
    2. The question should be based on transforming or completing the article sentence using the grammar pattern.
    3. Provide 4 options (1 correct, 3 distractors).
    4. The explanation should mention both the grammar rule name and why the correct answer follows that pattern.
    
    Example question types:
    - Fill in the blank with the correct form
    - Choose the correct sentence structure
    - Identify the error in the sentence
    - Select the correct transformation

    Output JSON format:
    {
      "question": "string",
      "options": ["string"],
      "correctAnswer": 0, // Index 0-3
      "explanation": "string"
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
    if (!content) throw new Error("No response");

    return JSON.parse(content);
  } catch (e: any) {
    console.error("Error generating DB-based quiz:", e);
    // Return a fallback quiz if generation fails
    return {
      question: `What grammar pattern does this sentence demonstrate: "${articleSentence}"?`,
      options: [dbRule.pattern, "Simple Past", "Future Tense", "Present Continuous"],
      correctAnswer: 0,
      explanation: `This sentence follows the "${dbRule.pattern}" pattern. ${dbRule.scenario}`
    };
  }
};

export const normalizeGrammarPattern = (pattern: string): string[] => {
  // Common variations and synonyms for grammar patterns
  const normalizations: Record<string, string[]> = {
    "present perfect": ["present perfect", "have/has + past participle", "has been", "have been"],
    "past perfect": ["past perfect", "had + past participle", "had been"],
    "passive voice": ["passive voice", "be + past participle", "is/are/was/were + pp"],
    "conditional": ["conditional", "if clause", "if sentences", "first conditional", "second conditional", "third conditional"],
    "relative clause": ["relative clause", "who/which/that clause", "defining clause", "non-defining clause"],
    "reported speech": ["reported speech", "indirect speech", "say/tell + that"],
    "modal verb": ["modal verb", "can/could/will/would/should/must", "modals"],
    "gerund": ["gerund", "verb + ing", "-ing form as noun"],
    "infinitive": ["infinitive", "to + verb", "to-infinitive"],
    "comparative": ["comparative", "more + adj", "adj + er", "comparison"],
    "superlative": ["superlative", "most + adj", "adj + est"],
  };

  const lowerPattern = pattern.toLowerCase();
  const results: string[] = [lowerPattern];

  // Add all possible variations
  for (const [key, variations] of Object.entries(normalizations)) {
    if (lowerPattern.includes(key) || variations.some(v => lowerPattern.includes(v))) {
      results.push(...variations);
    }
  }

  return [...new Set(results)]; // Remove duplicates
};
