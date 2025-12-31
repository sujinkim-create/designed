import { GeneratedArticles, StudyPack, UserPreferences, TopicRecommendation, ContentType } from "../types";

// Client-side service calling Vercel Serverless Functions in /api

// Client-side service calling Vercel Serverless Functions in /api

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const generateArticles = async (topic: string, contentType: ContentType = 'article', level?: string): Promise<GeneratedArticles> => {
  const res = await fetch(`${API_BASE_URL}/api/generate-articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, contentType, level }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to generate articles');
  }
  return res.json();
};

export const generateStudyPack = async (text: string, level: string, excludeWords: string[] = []): Promise<StudyPack> => {
  const res = await fetch(`${API_BASE_URL}/api/generate-study-pack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, level, excludeWords }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to generate study pack');
  }
  return res.json();
};

export const evaluateSentence = async (sentence: string, targetCollocation: string): Promise<{ isCorrect: boolean; feedback: string; suggestion?: string }> => {
  const res = await fetch(`${API_BASE_URL}/api/evaluate-sentence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sentence, targetCollocation }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to evaluate sentence');
  }
  return res.json();
};

export const evaluateDiscussionAnswer = async (question: string, answer: string): Promise<{ feedback: string; score: number; improvements: string }> => {
  const res = await fetch(`${API_BASE_URL}/api/evaluate-discussion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to evaluate discussion answer');
  }
  return res.json();
};

export const recommendTopics = async (prefs: UserPreferences): Promise<TopicRecommendation[]> => {
  const res = await fetch(`${API_BASE_URL}/api/recommend-topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefs }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to recommend topics');
  }
  return res.json();
};

export const lookupWord = async (word: string, context: string): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/api/lookup-word`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, context }),
  });

  if (!res.ok) {
    return "Definition not found.";
  }
  const data = await res.json();
  return data.result;
};

export const translateText = async (text: string): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/api/translate-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    return "Translation failed.";
  }
  const data = await res.json();
  return data.result;
};
