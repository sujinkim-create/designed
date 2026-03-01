const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manual .env parsing
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) {
            console.warn("No .env file found at " + envPath);
            return {};
        }
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const env = {};

        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                let value = match[2] || '';
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                env[match[1]] = value.trim();
            }
        });
        return env;
    } catch (e) {
        console.error("Error reading .env file:", e);
        return {};
    }
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
    console.error("Loaded Env Keys:", Object.keys(env));
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function upload() {
    console.log("Reading grammar_db.json...");
    let data;
    try {
        const dbPath = path.resolve(process.cwd(), 'grammar_db.json');
        const fileContent = fs.readFileSync(dbPath, 'utf-8');
        data = JSON.parse(fileContent);
    } catch (e) {
        console.error("Failed to read grammar_db.json:", e.message);
        return;
    }

    console.log(`Found ${data.length} records. Starting upload (Upsert)...`);

    const BATCH_SIZE = 1000;

    // We assume the JSON has 'id', 'pattern', 'scenario'
    // Upsert will update if 'id' matches

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE).map(item => ({
            id: item.id, // Ensure ID is mapped if present to allow upsert
            pattern: item.pattern,
            scenario: item.scenario
        }));

        const { error } = await supabase
            .from('grammar_rules')
            .upsert(batch);

        if (error) {
            console.error(`Error uploading batch ${i / BATCH_SIZE + 1}:`, error);
        } else {
            console.log(`Uploaded items ${i} to ${Math.min(i + BATCH_SIZE, data.length)}`);
        }
    }

    console.log("Upload complete!");
}

upload();
