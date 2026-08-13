// gemini.js

const axios = require('axios');

async function embedText(text) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      content: { parts: [{ text }] }
    }
  );

  return response.data.embedding.values;
}


async function generateReply(prompt) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );

  return response.data.candidates[0].content.parts[0].text;
}


async function extractMemory(userMessage) {
  const prompt = `Does this message contain a fact worth remembering about the user long-term (preferences, facts about their life, opinions)? 

Message: "${userMessage}"

If yes, respond with ONLY the fact as a clean, standalone sentence (e.g. "User is vegetarian.").
If no, respond with exactly: NONE`;

  const extracted = await generateReply(prompt);
  const trimmed = extracted.trim();

  return trimmed === 'NONE' ? null : trimmed;
}

module.exports = { embedText, generateReply, extractMemory };