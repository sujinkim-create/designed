import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedArticles, StudyPack, UserPreferences, TopicRecommendation, ArticleSource } from "../types";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// Schema for Articles
const articleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    variations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.STRING, description: "The CEFR level (A1, A2, B1, B2, C1)" },
          title: { type: Type.STRING },
          content: { type: Type.STRING, description: "Full article text appropriate for the level" },
          summary: { type: Type.STRING, description: "A 2-sentence summary" },
        },
        required: ["level", "title", "content", "summary"],
      },
    },
  },
  required: ["topic", "variations"],
};

// Schema for Study Pack (Vocab, Quiz, Discussion)
const studyPackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    vocabulary: {
      type: Type.ARRAY,
      description: "10 important words from the text",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          definition: { type: Type.STRING, description: "Simple English definition" },
          koreanDefinition: { type: Type.STRING, description: "Korean translation of the definition (사전 뜻)" },
          example: { type: Type.STRING, description: "Example sentence using the word" },
        },
        required: ["word", "definition", "koreanDefinition", "example"],
      },
    },
    mcq: {
      type: Type.ARRAY,
      description: "5 Multiple choice reading comprehension questions",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options" },
          correctIndex: { type: Type.INTEGER, description: "0-based index of correct option" },
        },
        required: ["id", "question", "options", "correctIndex"],
      },
    },
    cloze: {
      type: Type.ARRAY,
      description: "4 Fill-in-the-blank questions based on vocabulary",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          sentencePart1: { type: Type.STRING, description: "Text before the blank" },
          sentencePart2: { type: Type.STRING, description: "Text after the blank" },
          answer: { type: Type.STRING, description: "The missing word" },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 word choices including the answer" },
        },
        required: ["id", "sentencePart1", "sentencePart2", "answer", "options"],
      },
    },
    discussion: {
      type: Type.ARRAY,
      description: "3 Discussion topics with model answers",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          modelAnswer: { type: Type.STRING, description: "A sophisticated model answer" },
        },
        required: ["question", "modelAnswer"],
      },
    },
    collocations: {
      type: Type.ARRAY,
      description: "5 useful collocations that are commonly found in dictionaries (e.g., Oxford Collocations Dictionary)",
      items: {
        type: Type.OBJECT,
        properties: {
          phrase: { type: Type.STRING, description: "The collocation phrase (e.g., 'make a decision', 'heavy rain')" },
          definition: { type: Type.STRING, description: "English definition of the collocation" },
          koreanDefinition: { type: Type.STRING, description: "Korean translation of the collocation meaning" },
          example: { type: Type.STRING, description: "Example sentence using the collocation" },
        },
        required: ["phrase", "definition", "koreanDefinition", "example"],
      },
    },
    grammar: {
      type: Type.ARRAY,
      description: "3 key grammar points used in the text",
      items: {
        type: Type.OBJECT,
        properties: {
          rule: { type: Type.STRING, description: "Name/Title of the grammar rule" },
          explanation: { type: Type.STRING, description: "Clear explanation for the learner" },
          example: { type: Type.STRING, description: "Example sentence from the text or relevant to it" },
          practice: {
            type: Type.ARRAY,
            description: "3 Multiple choice questions to practice this grammar point",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options" },
                correctAnswer: { type: Type.STRING, description: "The correct option text" },
                explanation: { type: Type.STRING, description: "Why this is the correct answer" },
              },
              required: ["id", "question", "options", "correctAnswer", "explanation"],
            },
          },
        },
        required: ["rule", "explanation", "example", "practice"],
      },
    },
  },
  required: ["vocabulary", "mcq", "cloze", "discussion", "collocations", "grammar"],
};

import { ContentType } from "../types";
import { searchArticles, buildSearchContext } from "./serperService";

export const generateArticles = async (topic: string, contentType: ContentType = 'article', level?: string): Promise<GeneratedArticles> => {
  if (!apiKey) {
    console.error("NEXT_PUBLIC_API_KEY is not set in environment variables");
    throw new Error("API Key is missing. Please check your .env file.");
  }

  console.log("API Key loaded:", apiKey.substring(0, 10) + "...");
  const ai = new GoogleGenAI({ apiKey });

  let typeInstruction = "";
  let formatInstruction = "";

  switch (contentType) {
    case 'speech':
      typeInstruction = "Write a 3-minute speech script";
      formatInstruction = `
    FORMATTING REQUIREMENTS:
    1. Divide the content into 4-5 paragraphs.
    2. Use [PARAGRAPH] as a separator between each paragraph.
    3. NO Markdown formatting (no **, *, #, bullets).
    4. Example: "First paragraph text here.[PARAGRAPH]Second paragraph starts here."`;
      break;
    case 'conversation':
      typeInstruction = "Write a natural conversation script between two people";
      formatInstruction = `
    FORMATTING REQUIREMENTS FOR CONVERSATION:
    1. Format: "Name: dialogue" for each line.
    2. Use exactly two speakers (Sarah and Tom).
    3. Use [PARAGRAPH] to separate each dialogue line.
    4. NO Markdown formatting.
    5. Example: "Sarah: Hello![PARAGRAPH]Tom: Hi there![PARAGRAPH]Sarah: How are you?"`;
      break;
    case 'fairytale':
      typeInstruction = "Write a creative fairy tale";
      formatInstruction = `
    FORMATTING REQUIREMENTS:
    1. Divide the content into 4-5 paragraphs.
    2. Use [PARAGRAPH] as a separator between each paragraph.
    3. NO Markdown formatting (no **, *, #, bullets).`;
      break;
    case 'article':
    default:
      typeInstruction = "Write a news-style or educational article";
      formatInstruction = `
    FORMATTING REQUIREMENTS:
    1. Divide the content into 4-5 paragraphs.
    2. Use [PARAGRAPH] as a separator between each paragraph.
    3. NO Markdown formatting (no **, *, #, bullets).`;
      break;
  }

  let levelInstruction = "";
  if (level && level !== 'All') {
    levelInstruction = `
      Create 1 version adapted for English proficiency level ${level}.
      Target Length: ${level === 'A1' ? '400' : level === 'A2' ? '600' : level === 'B1' ? '800' : level === 'B2' ? '1000' : '1300'} words.
      Vocabulary and sentence structure should be appropriate for ${level} level.
      Write at least 6 full paragraphs with rich detail and context.
      `;
  } else {
    // Fallback or explicit 'All' (though UI doesn't support it anymore, good for robustness)
    levelInstruction = `
    Create 5 versions adapted for different English proficiency levels with DIFFERENT LENGTHS:
    1. A1 (Beginner) - approximately 400 words, very simple vocabulary, short sentences, 5-6 paragraphs
    2. A2 (Elementary) - approximately 600 words, simple vocabulary, 6-7 paragraphs
    3. B1 (Intermediate) - approximately 800 words, moderate vocabulary, 7-8 paragraphs
    4. B2 (Upper Intermediate) - approximately 1000 words, advanced vocabulary, 8-9 paragraphs
    5. C1 (Advanced) - approximately 1300 words, sophisticated vocabulary and complex sentences, 10-12 paragraphs

    IMPORTANT: Each higher level should be LONGER and more detailed than the previous level.
    Write thorough, informative content with specific examples, data, and analysis appropriate to each level.
    `;
  }

  // Serper로 실제 웹 검색 결과 가져오기 (article 타입일 때만)
  let searchContext = "";
  let sources: ArticleSource[] = [];
  if (contentType === "article") {
    try {
      const searchResults = await searchArticles(topic);
      sources = searchResults.map((r) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
      }));
      searchContext = buildSearchContext(searchResults);
    } catch (e) {
      console.warn("Serper search failed, continuing without context:", e);
    }
  }

  const prompt = `
    ${typeInstruction} about the topic: "${topic}".

    ${searchContext}

    ${levelInstruction}

    ${formatInstruction}

    SAFETY GUIDELINES:
    - No profanity, slang, or offensive language.
    - Content must be suitable for all ages.
    ${searchContext ? "- Use the search results above as factual reference to make the article accurate and up-to-date." : ""}
  `;

  try {
    // Google Search Grounding - 잠시 비활성화 (할당량 이슈 해결을 위한 테스트용)
    // const groundingTool = { googleSearch: {} };

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        // tools: [groundingTool], // 할당량 이슈로 잠시 주석 처리
      },
    });

    if (!response.text) {
      console.error("Empty response from AI");
      throw new Error("No response from AI");
    }

    console.log("Article generated successfully");
    const result = JSON.parse(response.text) as GeneratedArticles;
    result.sources = sources;
    return result;
  } catch (error: any) {
    console.error("Error generating article:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Invalid API Key. Please check your Google AI API key.");
    }
    throw new Error(`Failed to generate article: ${error.message || "Unknown error"}`);
  }
};

/**
 * Generate a Google search query with credible source site operators
 * Translates Korean topics to English if needed
 */
export const generateSearchQuery = async (topic: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  // Site operators for credible sources
  const siteOperators = "(site:.edu OR site:.gov OR site:.org OR site:bbc.com OR site:reuters.com OR site:theguardian.com OR site:npr.org OR site:nationalgeographic.com OR site:nature.com OR site:sciencedaily.com OR site:economist.com)";

  // Check if topic contains Korean characters
  const hasKorean = /[가-힣]/.test(topic);

  let englishTopic = topic;

  if (hasKorean) {
    // Translate Korean topic to English
    const translatePrompt = `Translate the following Korean topic to English. Return ONLY the English translation, nothing else:
"${topic}"`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: translatePrompt,
      });
      englishTopic = response.text?.trim() || topic;
    } catch (e) {
      console.error("Error translating topic:", e);
      // Use original topic if translation fails
    }
  }

  return `${englishTopic} ${siteOperators}`;
};

export const generateStudyPack = async (text: string, level: string, excludeWords: string[] = []): Promise<StudyPack> => {
  if (!apiKey) {
    console.error("NEXT_PUBLIC_API_KEY is not set in environment variables");
    throw new Error("API Key is missing. Please check your .env file.");
  }
  const ai = new GoogleGenAI({ apiKey });

  let exclusionPrompt = "";
  if (excludeWords.length > 0) {
    exclusionPrompt = `IMPORTANT: Do NOT include any of the following words in the vocabulary list: ${excludeWords.join(", ")}.`;
  }

  const prompt = `
    Analyze the following English text (Level ${level}):
    "${text.substring(0, 5000)}"

    Create a study guide for an English learner.
    1. Extract 10 challenging vocabulary words that are appropriate for a Level ${level} learner. The words should be challenging but reachable for this level. ${exclusionPrompt} For each word, provide:
       - A simple English definition.
       - A Korean translation/definition (한국어 사전 뜻) - provide the meaning as it would appear in a Korean-English dictionary.
       - A NEW example sentence using the word (MUST NOT be from the text).
    2. Create 5 Multiple Choice Questions (Reading Comprehension) to test understanding of the article.
       - Ensure questions test HIGH-ORDER THINKING: Include main idea, inference, tone/author's purpose, or true/false logic, not just simple factual recall matching words exactly from the text.
       - The options MUST include highly plausible distractors (오답) that sound reasonable but are incorrect based on the text.
       - The questions and options must be appropriate for a Level ${level} learner.
    3. Create 4 Fill-in-the-blank (Cloze) questions testing vocabulary.
       - Select sentences DIRECTLY from the provided text.
       - Remove a key vocabulary word to create the blank.
       - The missing word must be appropriate for a Level ${level} learner.
       - Ensure the sentence is a complete grammatical structure.
       - After the blank, the sentence must continue naturally.
       - Language distractor choices should be the same part of speech and logically sound if context is ignored.
       - Do NOT end the question with ellipses (...) or an unfinished clause.
    4. Create 3 Thought-provoking discussion questions related to the article's theme, and provide a model answer for each.
       - The complexity of the topic and the model answer must match Level ${level}.
    5. Extract 5 useful collocations (word partnerships) that would appear in a collocation dictionary (like Oxford Collocations Dictionary).
       - Use one of the 10 vocabulary words from step 1 in each collocation.
       - ONLY use authentic, dictionary-attested collocations. Examples of good collocations:
         * Verb + Noun: make a decision, take responsibility, gain experience, pose a threat
         * Adjective + Noun: heavy rain, strong coffee, bitter disappointment, golden opportunity
         * Noun + Noun: solar system, climate change, peace treaty, birth rate
         * Verb + Adverb: breathe deeply, speak fluently, think carefully
         * Adverb + Adjective: highly successful, deeply concerned, fully aware
       - AVOID creating your own combinations. Only use collocations that native speakers commonly use.
       - Provide:
         * An English definition of how the collocation is used.
         * A Korean translation/explanation of the collocation (한국어 뜻).
         * An example sentence.
    6. Identify and explain 5 key grammar points used in the text.
       - Provide the rule name, a clear explanation suitable for Level ${level}, and an example sentence DIRECTLY FROM THE TEXT.
       - For EACH grammar point, create 3 multiple-choice practice questions to test the user's understanding of that specific rule.
       - Make the grammar options test common ELL (English Language Learner) mistakes. Distractors should look very similar but contain a specific grammatical error (e.g. subject verb agreement, wrong preposition, wrong tense).
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyPackSchema,
      },
    });

    if (!response.text) {
      console.error("Empty response from AI");
      throw new Error("No response from AI");
    }

    console.log("Study pack generated successfully");
    return JSON.parse(response.text) as StudyPack;
  } catch (error: any) {
    console.error("Error generating study pack:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Invalid API Key. Please check your Google AI API key.");
    }
    throw new Error(`Failed to generate study pack: ${error.message || "Unknown error"
      }`);
  }
};

export const evaluateSentence = async (sentence: string, targetCollocation: string): Promise<{ isCorrect: boolean; feedback: string; suggestion?: string }> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Evaluate the following sentence written by an English learner.
    Target Collocation: "${targetCollocation}"
    Learner's Sentence: "${sentence}"

Task:
1. Determine if the learner used the target collocation correctly(grammar, context, naturalness).
    2. Provide brief, encouraging feedback.
    3. If incorrect or unnatural, provide a corrected version or suggestion.

    Output JSON format:
{
  "isCorrect": boolean,
    "feedback": "string",
      "suggestion": "string (optional)"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text);
};

export const evaluateDiscussionAnswer = async (question: string, answer: string): Promise<{ feedback: string; score: number; improvements: string }> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Evaluate the following answer to a discussion question.
  Question: "${question}"
    User's Answer: "${answer}"

Task:
1. Provide constructive feedback on the content and grammar.
    2. Give a score from 1 - 10 based on relevance and clarity.
    3. Suggest specific improvements or a better way to phrase the answer.

    Output JSON format:
{
  "feedback": "string",
    "score": number,
      "improvements": "string"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text);
};

export const recommendTopics = async (prefs: UserPreferences): Promise<TopicRecommendation[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Based on the user's interests and learning goals, suggest 3 engaging topics for English learning articles.
    
    User Interests: ${prefs.interests.join(", ")}
    Learning Goals: ${prefs.goals.join(", ")}

Task:
1. Generate 3 distinct, specific, and interesting topics.
    2. For each topic, provide a brief reason why it matches their profile.

    Output JSON format:
[
  {
    "topic": "string",
    "reason": "string"
  }
]
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text);
};

export const lookupWord = async (word: string, context: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a Korean-English dictionary.
Return ONLY the Korean meaning of the word "${word}" as used in this sentence: "${context}"
Format: [품사] [뜻] (예: 동사: 달리다 / 명사: 환경)
No explanation. No extra text. Just the Korean meaning in one short line.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return (response.text || "").trim();
};

export const translateText = async (text: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Translate the following English text to Korean.
Return ONLY the Korean translation. No explanations, no original text, no extra comments.

"${text}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return (response.text || "").trim();
};

export const extractGrammarTopics = async (text: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      topics: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["topics"]
  };

  const prompt = `
    Analyze the text and identify the top 3 grammatical structures or patterns used(e.g., "Present Perfect", "Relative Clauses", "Passive Voice").
    Return ONLY the names of the grammar points.
  Text: "${text.substring(0, 1000)}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    const data = JSON.parse(response.text || '{"topics": []}');
    return data.topics;
  } catch (e) {
    console.error("Error extracting grammar topics:", e);
    return [];
  }
};

export const generateGrammarQuiz = async (text: string, dbMatches: any[] = []): Promise<{ questions: any[] }> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const quizSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
            explanation: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer", "explanation"],
        },
      },
    },
    required: ["questions"],
  };

  let prompt = "";

  if (dbMatches && dbMatches.length > 0) {
    // STRICT DB MODE
    const rules = dbMatches.map((m, i) => `${i + 1}.Rule: ${m.pattern} (Description: ${m.scenario})`).join("\n");
    prompt = `
        Analyze the following text and create a GRAMMAR QUIZ strictly based on the provided rules.
  Text: "${text.substring(0, 3000)}"

        You MUST generate multiple - choice questions ONLY for the following grammar rules found in our database:
        ${rules}

Task:
1. Create at least one question for EACH of the rules above.
        2. IF a rule is not applicable to the text, try to create a relevant example question that fits the context of the article anyway.
        3. Provide 4 options for each question.
        4. Provide a clear explanation for the correct answer, mentioning the rule name.

        Output JSON format as specified in the schema.
      `;
  } else {
    // FALLBACK MODE (or error if strictly enforced, but let's keep fallback for robustness if DB fails silently, though user wanted strict check)
    // Actually, user said: "If no matches are found, inform the user."
    // The API route handles the "no matches" error 404 BEFORE calling this. 
    // So if we are here with empty dbMatches, it might be a weird edge case or the API logic changed.
    // But let's assume if this is called, we have matches or we want generic. 
    // However, to be safe and strictly follow "check valid", let's keep generic as a backup ONLY if called without matches, 
    // but the API ensures we have matches.

    prompt = `
        Analyze the following text and create a PERSONALIZED grammar quiz.
  Text: "${text.substring(0, 3000)}"

Task:
1. Identify 5 specific grammar points or structures used in the text.
        2. Create a multiple - choice question for each grammar point.
        3. Provide 4 options for each question.
        4. Provide a clear explanation for the correct answer.

        Output JSON format as specified in the schema.
      `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Error generating grammar quiz:", error);
    throw new Error(`Failed to generate quiz: ${error.message} `);
  }
};


// ==========================================
// Grammar Focus - DB-Based Functions
// ==========================================

import { GrammarDBRule, GrammarFocusQuiz } from "../types";

/**
 * Extract key sentences from article text that demonstrate grammatical structures
 * Returns sentences that can be matched against DB grammar rules
 */
export const extractKeySentences = async (text: string): Promise<{ sentence: string; grammarPattern: string }[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      sentences: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sentence: { type: Type.STRING, description: "The exact sentence from the text" },
            grammarPattern: { type: Type.STRING, description: "The grammar pattern name (e.g., Present Perfect, Passive Voice, Conditional)" }
          },
          required: ["sentence", "grammarPattern"]
        }
      }
    },
    required: ["sentences"]
  };

  const prompt = `
    Analyze the following text and extract 5 - 8 key sentences that demonstrate clear grammatical structures.
    For each sentence, identify the main grammar pattern used.

  Text: "${text.substring(0, 3000)}"
    
    Focus on common grammar patterns like:
- Tenses(Present Perfect, Past Perfect, Future, etc.)
  - Passive Voice
    - Conditional sentences(If clauses)
      - Relative Clauses
        - Reported Speech
          - Modal Verbs
            - Comparatives / Superlatives
            - Gerunds and Infinitives
    
    Extract the EXACT sentences from the text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    const data = JSON.parse(response.text || '{"sentences": []}');
    return data.sentences;
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
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "The quiz question" },
      options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 answer options" },
      correctAnswer: { type: Type.INTEGER, description: "Index of correct answer (0-3)" },
      explanation: { type: Type.STRING, description: "Explanation of why the answer is correct, referencing the grammar rule" }
    },
    required: ["question", "options", "correctAnswer", "explanation"]
  };

  const prompt = `
    Create a grammar quiz question based on the following:
    
    Grammar Rule from Database:
- Pattern(공식): "${dbRule.pattern}"
  - Description(설명): "${dbRule.scenario}"
    
    Article Sentence to Transform:
"${articleSentence}"

Task:
1. Create a multiple - choice question that tests understanding of this grammar pattern.
    2. The question should be based on transforming or completing the article sentence using the grammar pattern.
3. Provide 4 options(1 correct, 3 distractors).
    4. The explanation should mention both the grammar rule name and why the correct answer follows that pattern.
    
    Example question types:
- Fill in the blank with the correct form
  - Choose the correct sentence structure
    - Identify the error in the sentence
      - Select the correct transformation
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text);
  } catch (e: any) {
    console.error("Error generating DB-based quiz:", e);
    // Return a fallback quiz if generation fails
    return {
      question: `What grammar pattern does this sentence demonstrate: "${articleSentence}" ? `,
      options: [dbRule.pattern, "Simple Past", "Future Tense", "Present Continuous"],
      correctAnswer: 0,
      explanation: `This sentence follows the "${dbRule.pattern}" pattern.${dbRule.scenario} `
    };
  }
};

/**
 * Match extracted grammar patterns with database rules
 * Returns normalized pattern names for DB lookup
 */
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
