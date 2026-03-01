
async function testQuiz() {
    console.log("Testing quiz generation...");
    const articleText = "Yesterday, I went to the market. I have been living here for 5 years. I must finish my homework.";

    try {
        const response = await fetch('http://localhost:3000/api/generate-grammar-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleText })
        });

        console.log("Status:", response.status);
        if (!response.ok) {
            const err = await response.text();
            console.error("Error:", err);
        } else {
            const data = await response.json();
            console.log("Quiz Data:", JSON.stringify(data, null, 2).substring(0, 500) + "...");
        }
    } catch (e) {
        console.error("Request failed:", e);
    }
}

testQuiz();
