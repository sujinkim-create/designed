
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing keys. URL:", supabaseUrl ? "Found" : "Missing", "Key:", supabaseAnonKey ? "Found" : "Missing");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
    console.log('Checking grammar_table...');
    const { data: data1, error: error1 } = await supabase
        .from('grammar_table')
        .select('*')
        .limit(3);

    if (error1) {
        console.error('Error querying grammar_table:', error1.message);

        // Try grammar_rules
        console.log('Checking grammar_rules...');
        const { data: data2, error: error2 } = await supabase
            .from('grammar_rules')
            .select('*')
            .limit(3);

        if (error2) {
            console.error('Error querying grammar_rules:', error2.message);
        } else {
            console.log('Found grammar_rules! Sample:', JSON.stringify(data2, null, 2));
        }

    } else {
        console.log('Found grammar_table! Sample:', JSON.stringify(data1, null, 2));
    }
}

checkTable();
