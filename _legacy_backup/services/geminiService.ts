import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedArticles, StudyPack, UserPreferences, TopicRecommendation } from "../types";

const apiKey = import.meta.env.VITE_API_KEY;

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

export const generateArticles = async (topic: string, contentType: ContentType = 'article', level?: string): Promise<GeneratedArticles> => {
  if (!apiKey) {
    console.error("VITE_API_KEY is not set in environment variables");
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
      Target Length: ${level === 'A1' ? '150' : level === 'A2' ? '200' : level === 'B1' ? '300' : level === 'B2' ? '400' : '500'} words.
      Vocabulary and sentence structure should be appropriate for ${level} level.
      `;
  } else {
    // Fallback or explicit 'All' (though UI doesn't support it anymore, good for robustness)
    levelInstruction = `
    Create 5 versions adapted for different English proficiency levels with DIFFERENT LENGTHS:
    1. A1 (Beginner) - approximately 150 words, very simple vocabulary
    2. A2 (Elementary) - approximately 200 words, simple vocabulary
    3. B1 (Intermediate) - approximately 300 words, moderate vocabulary
    4. B2 (Upper Intermediate) - approximately 400 words, advanced vocabulary
    5. C1 (Advanced) - approximately 500 words, sophisticated vocabulary and complex sentences

    IMPORTANT: Each higher level should be LONGER and more detailed than the previous level.
    `;
  }

  const prompt = `
    ${typeInstruction} about the topic: "${topic}".
    
    ${levelInstruction}

    ${formatInstruction}

    SAFETY GUIDELINES:
    - No profanity, slang, or offensive language.
    - Content must be suitable for all ages.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
      },
    });

    if (!response.text) {
      console.error("Empty response from AI");
      throw new Error("No response from AI");
    }

    console.log("Article generated successfully");
    return JSON.parse(response.text) as GeneratedArticles;
  } catch (error: any) {
    console.error("Error generating article:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Invalid API Key. Please check your Google AI API key.");
    }
    throw new Error(`Failed to generate article: ${error.message || "Unknown error"}`);
  }
};

export const generateStudyPack = async (text: string, level: string, excludeWords: string[] = []): Promise<StudyPack> => {
  if (!apiKey) {
    console.error("VITE_API_KEY is not set in environment variables");
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
       - The questions and options must be appropriate for a Level ${level} learner.
       - The questions should be paraphrased and not copy sentences directly from the text.
    3. Create 4 Fill-in-the-blank (Cloze) questions testing vocabulary.
       - Select sentences DIRECTLY from the provided text.
       - Remove a key vocabulary word to create the blank.
       - The missing word must be appropriate for a Level ${level} learner.
       - Ensure the sentence is a complete grammatical structure.
       - After the blank, the sentence must continue naturally.
       - The answer and distractors must match the required grammar form.
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
    throw new Error(`Failed to generate study pack: ${error.message || "Unknown error"}`);
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
    1. Determine if the learner used the target collocation correctly (grammar, context, naturalness).
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
    2. Give a score from 1-10 based on relevance and clarity.
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

  const prompt = `
    Define the word "${word}" in Korean, based on its usage in this context:
    "${context}"

    Provide ONLY the Korean definition (and part of speech if helpful). Keep it concise (max 10 words).
    Example Output: 명사: 사과 (과일)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return response.text || "Definition not found.";
};

export const translateText = async (text: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Translate the following English text into natural, fluent Korean.
    Maintain the tone and nuance of the original text.

    Text:
    "${text}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return response.text || "Translation failed.";
};
