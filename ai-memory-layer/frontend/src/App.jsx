import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState([]);

  const userId = 'test-user-1';

  const loadMemories = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/memories/${userId}`);
      const data = await response.json();
      setMemories(data.memories || []);
    } catch (err) {
      console.error('Could not load memories');
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: userMessage.text }),
      });
      const data = await response.json();

      const aiMessage = { id: Date.now() + 1, role: 'assistant', text: data.reply };
      setMessages((prev) => [...prev, aiMessage]);

      setTimeout(loadMemories, 2000);

    } catch (err) {
      console.error('Chat request failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Interesting facts </h2>
        {memories.length === 0 && <p className="empty">Nothing learned yet</p>}
        {memories.map((m) => (
          <div key={m._id} className="memory-item">{m.text}</div>
        ))}
      </aside>

      <main className="app">
        <h1>Bloom</h1>
        <div className="chat-window">
          {messages.map((msg) => (
            <div key={msg.id} className={`bubble ${msg.role}`}>{msg.text}</div>
          ))}
          {loading && <div className="bubble assistant">Thinking...</div>}
        </div>
        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Let's Bloom together...."
          />
          <button onClick={handleSend} disabled={loading}>Send</button>
        </div>
      </main>
    </div>
  );
}

export default App;