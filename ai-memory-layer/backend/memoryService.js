// memoryService.js

const Memory = require('./Memory');
const { embedText } = require('./gemini');
const { cosineSimilarity } = require('./similarity');

async function saveMemory(userId, text) {
  const embedding = await embedText(text);
  const existingMemories = await Memory.find({ userId });

  const isDuplicate = existingMemories.some((memory) => {
    const similarity = cosineSimilarity(embedding, memory.embedding);
    return similarity > 0.92;
  });

  if (isDuplicate) {
    return { skipped: true, reason: 'Similar memory already exists' };
  }

  const memory = await Memory.create({ userId, text, embedding });
  return memory;
}

async function retrieveMemories(userId, question, topK = 3) {
  const questionEmbedding = await embedText(question);
  const allMemories = await Memory.find({ userId });

  const scored = allMemories.map((memory) => ({
    text: memory.text,
    score: cosineSimilarity(questionEmbedding, memory.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.filter((m) => m.score > 0.4).slice(0, topK); // ADD the filter
}

module.exports = { saveMemory, retrieveMemories };