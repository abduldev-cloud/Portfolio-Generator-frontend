require('dotenv').config();

async function testFetch() {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
        contents: [{ parts: [{ text: "Hello" }] }]
    };

    try {
        console.log("Testing v1 endpoint via fetch...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (response.ok) {
            console.log("v1 Endpoint SUCCESS!");
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(`v1 Endpoint FAILED: ${response.status} ${response.statusText}`);
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

testFetch();
