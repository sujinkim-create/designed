const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local because dotenv might be flaky with nextjs conventions sometimes
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

console.log("URL:", supabaseUrl ? "Found" : "Missing");
console.log("Key:", supabaseKey ? "Found" : "Missing");

if (!supabaseUrl || !supabaseKey) {
    console.error("Credentials missing from .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    // There isn't a direct "list tables" method in js client easily without admin access usually,
    // but we can try to query the information_schema if enabled, or just try querying the table and inspecting the exact error.

    // 1. Try querying grammar_table
    console.log("Attempting to select from 'grammar_table'...");
    const { data, error } = await supabase.from('grammar_table').select('*').limit(1);
    if (error) {
        console.error("Error querying grammar_table:", error.message);
        console.error("Details:", error.details);
        console.error("Hint:", error.hint);
        console.error("Code:", error.code);
    } else {
        console.log("Success! grammar_table exists.");
    }
}

listTables();
