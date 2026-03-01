import { GrammarFocusRule } from '@/types';

const LT_API_URL = process.env.NEXT_PUBLIC_LANGUAGETOOL_URL || 'http://localhost:8010/v2/check';

export interface LTMatch {
    message: string;
    shortMessage: string;
    offset: number;
    length: number;
    replacements: { value: string }[];
    rule: {
        id: string;
        description: string;
        issueType: string;
        category: {
            id: string;
            name: string;
        }
    };
    context: {
        text: string;
        offset: number;
        length: number;
    };
}

export interface LTResponse {
    software: {
        name: string;
        version: string;
        buildDate: string;
        apiVersion: number;
        premium: boolean;
        premiumHint: string;
        status: string;
    };
    warnings: {
        incompleteResults: boolean;
    };
    language: {
        name: string;
        code: string;
        detectedLanguage: {
            name: string;
            code: string;
            confidence: number;
        };
    };
    matches: LTMatch[];
}

/**
 * Check text using LanguageTool API
 * specifically enabling rules that might reveal interesting grammar points
 * (even if they are style checks like Passive Voice)
 */
export const checkTextWithLanguageTool = async (text: string): Promise<string[]> => {
    try {
        const params = new URLSearchParams();
        params.append('text', text);
        params.append('language', 'en-US');
        // Enable 'picky' style checks to find Passive Voice and other stylistic structures
        params.append('level', 'picky');
        // Explicitly enable Passive Voice if not covered by 'picky'
        params.append('enabledRules', 'PASSIVE_VOICE');

        const response = await fetch(LT_API_URL, {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('LanguageTool API failed', await response.text());
            return [];
        }

        const data: LTResponse = await response.json();

        // Map matches to Grammar Keywords
        const keywords = new Set<string>();

        data.matches.forEach(match => {
            const ruleId = match.rule.id;

            // Map LanguageTool Rule IDs to Grammar Topics
            if (ruleId === 'PASSIVE_VOICE') {
                keywords.add("Passive Voice");
            } else if (ruleId.includes('WILL') || ruleId.includes('FUTURE')) {
                keywords.add("Future Tense");
            }
            // Add other mappings as discovered/needed
        });

        return Array.from(keywords);
    } catch (error) {
        console.error("Error calling LanguageTool:", error);
        return [];
    }
};

/**
 * Check text using LanguageTool API and return full matches
 */
export const checkGrammar = async (text: string): Promise<LTResponse | null> => {
    try {
        const params = new URLSearchParams();
        params.append('text', text);
        params.append('language', 'en-US');

        const response = await fetch(LT_API_URL, {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`LanguageTool API failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error checking grammar:", error);
        return null; // Or throw error depending on how we want to handle it
    }
};
