
async function testEnv() {
    try {
        const response = await fetch('http://localhost:3000/api/debug-env');
        const data = await response.json();
        console.log("Env Debug:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Request failed:", e);
    }
}
testEnv();
