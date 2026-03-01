// Remove require, use native fetch
async function testGrammarAPI() {
    const text = `
    Yesterday I have went to the store. 
    She is writing a book now.
    He goes to school every day.
    `;

    console.log("Testing API with text containing errors...");
    console.log("1. 'Yesterday I have went...' (Should be filtered out)");
    console.log("2. 'She is writing...' (Should be kept)");

    try {
        const response = await fetch('http://localhost:3000/api/grammar-focus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleText: text })
        });

        if (!response.ok) {
            console.error("Server Error:", await response.text());
            return;
        }

        const data = await response.json();
        console.log("--- Result ---");
        console.log("Matched Rules Count:", data.matchedRules.length);
        data.matchedRules.forEach((r, i) => {
            console.log(`[${i + 1}] Pattern: ${r.dbRule.pattern}`);
            console.log(`    Sentence: "${r.matchedSentence}"`);
        });

        if (data.matchedRules.some(r => r.matchedSentence.includes("have went"))) {
            console.error("FAIL: The incorrect sentence was NOT filtered out!");
        } else {
            console.log("SUCCESS: The incorrect sentence was filtered out.");
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

testGrammarAPI();
