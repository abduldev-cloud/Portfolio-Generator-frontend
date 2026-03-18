require('dotenv').config();

async function listAllModels() {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`;

    try {
        console.log("Listing available models for this key...");
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log("Allowed Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log(`Failed to list models: ${response.status} ${response.statusText}`);
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listAllModels();
