// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { saveMemory, retrieveMemories } = require('./memoryService');
const { generateReply, extractMemory } = require('./gemini');
const Memory = require('./Memory'); // ADDED — needed for the new route below

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.json({ message: 'AI Memory Layer backend is alive 🧠' });
});


app.post('/api/memory', async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: 'userId and text are required' });
    }

    const memory = await saveMemory(userId, text);
    res.json({ success: true, memory });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Could not save memory' });
  }
});


app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const relevantMemories = await retrieveMemories(userId, message);

    const factsText = relevantMemories.map((m) => `- ${m.text}`).join('\n');
    const prompt = `You are a helpful assistant with memory of this user's preferences.

Known facts about this user:
${factsText || 'No known facts yet.'}

User's message: "${message}"

Reply naturally, using the known facts only if relevant to this message.`;

    const reply = await generateReply(prompt);

    res.json({ reply, usedMemories: relevantMemories });

    extractMemory(message)
      .then((fact) => {
        if (fact) {
          return saveMemory(userId, fact);
        }
      })
      .catch((err) => console.error('Background memory extraction failed:', err.message));

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Could not process chat message' });
  }
});


// ADDED — lets the frontend sidebar fetch everything stored about a user
app.get('/api/memories/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const memories = await Memory.find({ userId }).sort({ createdAt: -1 });
    res.json({ memories });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Could not fetch memories' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});