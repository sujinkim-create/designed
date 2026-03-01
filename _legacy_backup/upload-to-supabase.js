import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const env: Record<string, string> = {};

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
// Note: Ideally use SERVICE_ROLE_KEY for bulk writes if RLS blocks, 
// but for now we try with Anon Key (make sure RLS allows insert or is off).
// If RLS blocks, user might need to disable RLS temporarily or add policy.

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function upload() {
    console.log("Reading grammar_db.json...");
    let data;
    try {
        const fileContent = fs.readFileSync('grammar_db.json', 'utf-8');
        data = JSON.parse(fileContent);
    } catch (e) {
        console.error("Failed to read grammar_db.json (make sure it exists in root):", e);
        return;
    }

    console.log(`Found ${data.length} records. Starting upload...`);

    const BATCH_SIZE = 1000;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE).map(item => ({
            pattern: item.pattern,
            scenario: item.scenario
        }));

        const { error } = await supabase
            .from('grammar_rules')
            .insert(batch);

        if (error) {
            console.error(`Error uploading batch ${i / BATCH_SIZE + 1}:`, error);
        } else {
            console.log(`Uploaded items ${i} to ${Math.min(i + BATCH_SIZE, data.length)}`);
        }
    }

    console.log("Upload complete!");
}

upload();
