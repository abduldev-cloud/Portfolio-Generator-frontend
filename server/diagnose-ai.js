const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
    try {
        console.log("Using API Key:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");

        // We can't easily list models with the standard GenAI object in some SDK versions 
        // without using the admin/management API, but we can try a few more specific ones
        // or try to catch more detailed error info.

        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

        for (const m of models) {
            try {
                console.log(`Checking ${m}...`);
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Say hello");
                console.log(`- ${m}: SUCCESS`);
                console.log("Response:", result.response.text());
                return; // Exit if one works
            } catch (e) {
                console.log(`- ${m}: FAILED - ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Critical Error:", error);
    }
}

checkModels();
