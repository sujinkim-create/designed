import fs from 'fs';
import path from 'path';

function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            result[match[1]] = value.trim();
        }
    });
    return result;
}

const envConfig = parseEnv(path.resolve(process.cwd(), '.env'));
const localConfig = parseEnv(path.resolve(process.cwd(), '.env.local'));

console.log('--- .env content (partial) ---');
console.log('VITE_OPENAI_API_KEY:', envConfig.VITE_OPENAI_API_KEY ? envConfig.VITE_OPENAI_API_KEY.substring(0, 10) + '...' : 'UNDEFINED');
console.log('OPENAI_API_KEY:', envConfig.OPENAI_API_KEY ? envConfig.OPENAI_API_KEY.substring(0, 10) + '...' : 'UNDEFINED');

console.log('\n--- .env.local content (partial) ---');
console.log('VITE_OPENAI_API_KEY:', localConfig.VITE_OPENAI_API_KEY ? localConfig.VITE_OPENAI_API_KEY.substring(0, 10) + '...' : 'UNDEFINED');
console.log('OPENAI_API_KEY:', localConfig.OPENAI_API_KEY ? localConfig.OPENAI_API_KEY.substring(0, 10) + '...' : 'UNDEFINED');
