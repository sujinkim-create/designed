const fs = require('fs');
const path = require('path');

const legacyPath = path.join('_legacy_backup', '.env');
const localPath = path.join('.env.local');

try {
    if (fs.existsSync(legacyPath)) {
        let content = fs.readFileSync(legacyPath, 'utf-8');
        content = content.replace(/VITE_/g, 'NEXT_PUBLIC_');
        fs.writeFileSync(localPath, content);
        console.log("Migrated .env to .env.local with NEXT_PUBLIC_ prefix.");
    } else {
        console.log("No legacy .env found.");
    }
} catch (e) {
    console.error("Error migrating env:", e);
}
