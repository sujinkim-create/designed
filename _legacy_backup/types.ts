export enum CEFRLevel {
  A1 = "A1 (Beginner)",
  A2 = "A2 (Elementary)",
  B1 = "B1 (Intermediate)",
  B2 = "B2 (Upper Intermediate)",
  C1 = "C1 (Advanced)"
}

export interface ArticleVariation {
  level: string; // "A1", "A2", etc.
  title: string;
  content: string;
  summary: string;
}

export interface GeneratedArticles {
  topic: string;
  variations: ArticleVariation[];
}

export interface VocabItem {
  word: string;
  definition: string;
  koreanDefinition: string;
  example: string;
}

export interface QuestionMCQ {
  id: number;
  question: string;
  options: string[];
  correctIndex: number; // 0-3
}

export interface QuestionCloze {
  id: number;
  sentencePart1: string;
  sentencePart2: string;
  answer: string;
  options: string[]; // Distractors + Answer
}

export interface DiscussionItem {
  question: string;
  modelAnswer: string;
}

export interface CollocationItem {
  phrase: string;
  definition: string;
  koreanDefinition: string;
  example: string;
}

export interface GrammarQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GrammarPoint {
  rule: string;
  explanation: string;
  example: string;
  practice: GrammarQuestion[];
}

export interface StudyPack {
  vocabulary: VocabItem[];
  mcq: QuestionMCQ[];
  cloze: QuestionCloze[];
  discussion: DiscussionItem[];
  collocations: CollocationItem[];
  grammar: GrammarPoint[];
}

export type AppView = 'home' | 'dashboard' | 'learner';
export type TabView = 'read' | 'vocab' | 'quiz' | 'discuss' | 'collocation' | 'grammar';

export interface UserPreferences {
  interests: string[];
  goals: string[];
}

export interface TopicRecommendation {
  topic: string;
  reason: string;
}

export type ContentType = 'article' | 'speech' | 'conversation' | 'fairytale';
