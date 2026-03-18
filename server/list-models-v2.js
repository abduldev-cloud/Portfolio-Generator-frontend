require('dotenv').config();

async function listAllModels() {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log("FULL_MODEL_LIST_START");
            data.models.forEach(m => {
                console.log(`NAME: ${m.name}`);
            });
            console.log("FULL_MODEL_LIST_END");
        } else {
            console.log(`ERROR: ${response.status}`);
            console.log(JSON.stringify(data));
        }
    } catch (error) {
        console.error("FETCH_ERROR:", error.message);
    }
}

listAllModels();
