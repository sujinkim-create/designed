import { GeneratedArticles, StudyPack } from '../types';

const CACHE_KEY = 'lingoleap_article_cache';
const MAX_CACHED_ARTICLES = 10;

export interface CachedArticle {
    id: string;
    articleData: GeneratedArticles;
    studyData: StudyPack | null;
    contentType: string;
    targetLevel: string;
    createdAt: string;
}

interface ArticleCache {
    articles: CachedArticle[];
}

// Get the cache from localStorage
const getCache = (): ArticleCache => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.error('Error reading article cache:', e);
    }
    return { articles: [] };
};

// Save the cache to localStorage
const saveCache = (cache: ArticleCache): void => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.error('Error saving article cache:', e);
    }
};

// Save an article to cache
export const saveArticleToCache = (
    id: string,
    articleData: GeneratedArticles,
    studyData: StudyPack | null,
    contentType: string,
    targetLevel: string
): void => {
    const cache = getCache();

    // Remove existing article with same id if exists
    cache.articles = cache.articles.filter(a => a.id !== id);

    // Add new article at the beginning
    cache.articles.unshift({
        id,
        articleData,
        studyData,
        contentType,
        targetLevel,
        createdAt: new Date().toISOString()
    });

    // Keep only MAX_CACHED_ARTICLES
    if (cache.articles.length > MAX_CACHED_ARTICLES) {
        cache.articles = cache.articles.slice(0, MAX_CACHED_ARTICLES);
    }

    saveCache(cache);
};

// Get an article from cache by id
export const getArticleFromCache = (id: string): CachedArticle | null => {
    const cache = getCache();
    return cache.articles.find(a => a.id === id) || null;
};

// Update study data for a cached article
export const updateCachedStudyData = (id: string, studyData: StudyPack): void => {
    const cache = getCache();
    const article = cache.articles.find(a => a.id === id);
    if (article) {
        article.studyData = studyData;
        saveCache(cache);
    }
};

// Remove an article from cache
export const removeArticleFromCache = (id: string): void => {
    const cache = getCache();
    cache.articles = cache.articles.filter(a => a.id !== id);
    saveCache(cache);
};

// Clear all cached articles
export const clearArticleCache = (): void => {
    localStorage.removeItem(CACHE_KEY);
};

// Get learning history records from cached articles (for non-logged users)
export const getLocalLearningHistory = (): Array<{
    id: string;
    topic: string;
    level: string;
    date: string;
    wordsLearned: number;
}> => {
    const cache = getCache();
    return cache.articles.map(article => ({
        id: article.id,
        topic: article.articleData.topic,
        level: article.targetLevel,
        date: article.createdAt.split('T')[0],
        wordsLearned: 0
    }));
};
