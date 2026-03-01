// Node 18+ has native fetch


async function testLanguageTool() {
    const url = 'http://localhost:8010/v2/check';
    const text = 'This is a test sentence with a error.';
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', 'en-US');

    try {
        console.log(`Checking text: "${text}" against ${url}...`);
        const response = await fetch(url, {
            method: 'POST',
            body: params,
        });

        if (!response.ok) {
            console.error('Error:', response.status, response.statusText);
            const body = await response.text();
            console.error('Body:', body);
            return;
        }

        const data = await response.json();
        console.log('Success! Found matches:', data.matches.length);
        data.matches.forEach(match => {
            console.log(`- [${match.rule.issueType}] ${match.message} (Offset: ${match.offset}, Length: ${match.length})`);
        });
    } catch (error) {
        console.error('Failed to connect to LanguageTool:', error.message);
        console.log('Make sure Docker container is running: docker-compose up -d');
    }
}

testLanguageTool();
