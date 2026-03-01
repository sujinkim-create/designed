import { supabase } from '../lib/supabase';

export interface LearningRecord {
    id: string;
    user_id: string;
    topic: string;
    level: string;
    date: string;
    words_learned: number;
    created_at?: string;
    article_data?: any; // JSONB
    study_data?: any;   // JSONB
}

// Fetch all learning history for a user
export const fetchLearningHistory = async (userId: string): Promise<LearningRecord[]> => {
    const { data, error } = await supabase
        .from('learning_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching learning history:', error);
        return [];
    }

    return data || [];
};

// Add a new learning record
export const addLearningRecord = async (
    userId: string,
    topic: string,
    level: string,
    articleData?: any,
    studyData?: any
): Promise<LearningRecord | null> => {
    // Try to insert with full data
    try {
        const { data, error } = await supabase
            .from('learning_history')
            .insert({
                user_id: userId,
                topic,
                level,
                date: new Date().toISOString().split('T')[0],
                words_learned: 0,
                article_data: articleData,
                study_data: studyData
            })
            .select()
            .single();

        if (!error && data) return data;

        console.warn('Failed to save with full data, trying fallback...', error);
    } catch (e) {
        console.warn('Exception saving full data', e);
    }

    // Fallback: Try inserting WITHOUT json columns (in case schema isn't updated)
    const { data: fallbackData, error: fallbackError } = await supabase
        .from('learning_history')
        .insert({
            user_id: userId,
            topic,
            level,
            date: new Date().toISOString().split('T')[0],
            words_learned: 0
        })
        .select()
        .single();

    if (fallbackError) {
        console.error('Error adding learning record (fallback):', fallbackError);
        return null;
    }

    return fallbackData;
};

// Delete a learning record
export const deleteLearningRecord = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('learning_history')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting learning record:', error);
        return false;
    }

    return true;
};

// Update words learned count
export const updateWordsLearned = async (id: string, wordsLearned: number): Promise<boolean> => {
    const { error } = await supabase
        .from('learning_history')
        .update({ words_learned: wordsLearned })
        .eq('id', id);

    if (error) {
        console.error('Error updating words learned:', error);
        return false;
    }

    return true;
};
