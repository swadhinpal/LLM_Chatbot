import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ModelSelector from './ModelSelector.jsx';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        messages: [...messages, userMessage],
        model: selectedModel
      });

      setMessages(prev => [...prev, { 
        text: response.data.text, 
        sender: 'bot',
        model: selectedModel
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        text: "Backend error: cannot respond.", 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Multi-Model Chatbot</h1>
          <p className="text-gray-600">Powered by Ollama & Google AI</p>
        </div>
        <div className="mt-2 md:mt-0">
          <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 border border-gray-300 bg-white rounded-lg mb-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-10">Start a conversation!</p>
        )}
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-xs md:max-w-md ${
                msg.sender === 'user'
                  ? 'bg-blue-100 text-black rounded-br-none'
                  : 'bg-gray-100 text-black rounded-bl-none'
              }`}
            >
              {msg.text}
              {msg.sender === 'bot' && (
                <div className="text-xs text-gray-500 mt-1">
                  {msg.model === 'llama3.2' ? 'Llama 3.2' : 'Gemini'}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="px-4 py-2 rounded-xl bg-gray-100 rounded-bl-none flex space-x-1">
              <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
