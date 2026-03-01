export type ContentType = 'article' | 'speech' | 'conversation' | 'fairytale';
export type AppView = 'home' | 'dashboard' | 'learner';
export type TabView = 'read' | 'vocab' | 'collocation' | 'grammar' | 'quiz' | 'discuss';

export type VocabItem = VocabularyItem;
export type QuestionMCQ = MCQItem;
export type QuestionCloze = ClozeItem;

export interface ArticleVariation {
    level: string;
    title: string;
    content: string;
    summary: string;
}

export interface ArticleSource {
    title: string;
    link: string;
    snippet: string;
}

export interface GeneratedArticles {
    topic: string;
    variations: ArticleVariation[];
    sources?: ArticleSource[];
}

export interface VocabularyItem {
    word: string;
    definition: string;
    koreanDefinition: string;
    example: string;
}

export interface MCQItem {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    correctAnswer?: string; // For grammar
    explanation?: string; // For grammar
}

export interface ClozeItem {
    id: number;
    sentencePart1: string;
    sentencePart2: string;
    answer: string;
    options: string[];
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

export interface GrammarItem {
    rule: string;
    explanation: string;
    example: string;
    practice: MCQItem[];
}

export interface GrammarDBRule {
    id: number;
    pattern: string;
    scenario: string;
}

export interface StudyPack {
    vocabulary: VocabularyItem[];
    mcq: MCQItem[];
    cloze: ClozeItem[];
    discussion: DiscussionItem[];
    collocations: CollocationItem[];
    grammar: GrammarItem[];
}

export interface UserPreferences {
    interests: string[];
    goals: string[];
}

export interface TopicRecommendation {
    topic: string;
    reason: string;
}

// Grammar Focus types - DB-based
export interface GrammarFocusQuiz {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface GrammarFocusRule {
    dbRule: GrammarDBRule;  // pattern (공식), scenario (설명) from DB
    matchedSentence: string;  // 아티클에서 매칭된 문장
    quiz: GrammarFocusQuiz;
}

export interface GrammarFocusData {
    matchedRules: GrammarFocusRule[];
    message?: string;  // For "no matches" scenario
}

// Alias for backward compatibility
export type GrammarPoint = GrammarItem;
