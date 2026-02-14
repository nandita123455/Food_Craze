import { useState, useRef, useEffect } from 'react';
import './AIChat.css';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm your shopping assistant. Ask me about products, recommendations, or help with your order! 🛒" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGrokAPI = async (message) => {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY || process.env.REACT_APP_XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are Food Craze shopping assistant. 

E-commerce focused features:
- Recommend products by category/price
- Check product stock (assume most items in stock unless told otherwise)  
- Help with cart/order questions
- Answer product questions
- Be friendly and conversational
- Keep answers short (under 100 words)

Current products include: Electronics, Clothing, Groceries, Home & Garden`
          },
          ...messages,
          { role: 'user', content: message }
        ],
        model: 'grok-beta',
        stream: false,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const aiResponse = await callGrokAPI(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <div className="ai-avatar">🤖</div>
        <div>
          <h3>Shopping Assistant</h3>
          <span className="status">Online</span>
        </div>
        <button className="close-chat">×</button>
      </div>

      <div className="ai-chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-bubble">
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message ai">
            <div className="message-bubble typing">
              <div className="typing-indicator"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="ai-chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products, orders, or recommendations..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? '⏳' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AIChat;
