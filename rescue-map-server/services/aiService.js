const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Analyzes a distress description to categorize severity and provide a priority score.
 * @param {string} description - The user's input description of the emergency.
 * @returns {Promise<{priorityScore: number, verifiedSeverity: string, reasoning: string}>}
 */
const analyzeDistress = async (description) => {
  if (!process.env.GOOGLE_AI_KEY) {
    console.warn("GOOGLE_AI_KEY is missing. AI Triage skipped.");
    return null;
  }

  const prompt = `
    You are an emergency response AI dispatcher for "RescueMap".
    Analyze the following distress message and determine:
    1. A Priority Score (1-100), where 100 is absolute critical danger.
    2. A Severity Category: "Critical", "Trapped", "Injured", or "Safe".
    3. A short 1-sentence reasoning.

    Distress Message: "${description}"

    Response format (JSON only):
    {
      "priorityScore": number,
      "verifiedSeverity": "string",
      "reasoning": "string"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Simple JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (err) {
    console.error("Gemini AI Triage Error:", err);
    return null;
  }
};

module.exports = { analyzeDistress };
