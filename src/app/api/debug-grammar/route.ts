import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Fetch up to 50 rows to pick random ones from
        const { data, error } = await supabase
            .from('grammar_rules')
            .select('*')
            .limit(50);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ data: [] });
        }

        // Pick 5 random items
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);

        return NextResponse.json({ data: selected });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
