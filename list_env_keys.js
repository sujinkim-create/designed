
const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env.local');

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length > 0) {
            const key = parts[0].trim();
            if (key && !key.startsWith('#')) {
                console.log("Key found:", key);
            }
        }
    });
} else {
    console.log(".env.local not found");
}
