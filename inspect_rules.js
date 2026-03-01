const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim();
        }
    });
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    console.log("Inspecting 'grammar_rules'...");
    const { data, error } = await supabase.from('grammar_rules').select('*').limit(1);

    if (error) {
        console.error("Error:", error.message);
    } else {
        if (data.length > 0) {
            console.log("Columns found:", Object.keys(data[0]));
        } else {
            console.log("Table 'grammar_rules' exists but is empty.");
        }
    }
}

inspectTable();
