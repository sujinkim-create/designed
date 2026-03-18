import { GeneratedArticles, StudyPack, UserPreferences, TopicRecommendation } from "../types";
import { ContentType } from "../types";

export const generateArticles = async (topic: string, contentType: ContentType = 'article', level?: string): Promise<GeneratedArticles> => {
    const res = await fetch('/api/generate-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, contentType, level }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate articles');
    }
    return res.json();
};

export const generateStudyPack = async (text: string, level: string, excludeWords: string[] = []): Promise<StudyPack> => {
    const res = await fetch('/api/generate-study-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level, excludeWords }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate study pack');
    }
    return res.json();
};

export const recommendTopics = async (prefs: UserPreferences): Promise<TopicRecommendation[]> => {
    const res = await fetch('/api/recommend-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to recommend topics');
    }
    return res.json();
};

export const translateText = async (text: string): Promise<string> => {
    const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to translate');
    }
    const data = await res.json();
    return data.translated;
};

export const evaluateSentence = async (sentence: string, targetCollocation: string): Promise<{ isCorrect: boolean; feedback: string; suggestion?: string }> => {
    const res = await fetch('/api/evaluate-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence, targetCollocation }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to evaluate sentence');
    }
    return res.json();
};

export const evaluateDiscussionAnswer = async (question: string, answer: string): Promise<{ feedback: string; score: number; improvements: string }> => {
    const res = await fetch('/api/evaluate-discussion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to evaluate answer');
    }
    return res.json();
};

export const lookupWord = async (word: string, context: string): Promise<string> => {
    const res = await fetch('/api/lookup-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, context }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to lookup word');
    }
    const data = await res.json();
    return data.result;
};
