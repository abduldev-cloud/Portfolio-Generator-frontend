const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // Note: listModels is not directly on genAI in some versions, 
        // but we can try to find the available models.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Attempting to generate tiny content...");
        const result = await model.generateContent("hi");
        console.log("Success with gemini-1.5-flash");
    } catch (e) {
        console.error("Error with gemini-1.5-flash:", e.message);

        try {
            const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            await modelPro.generateContent("hi");
            console.log("Success with gemini-1.5-pro");
        } catch (e2) {
            console.error("Error with gemini-1.5-pro:", e2.message);
        }
    }
}

listModels();
