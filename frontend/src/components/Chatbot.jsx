// import { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import ModelSelector from './ModelSelector.jsx';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// const Chatbot = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedModel, setSelectedModel] = useState('llama3.2');
//   const messagesEndRef = useRef(null);

//   // Scroll to bottom when messages update
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Handle sending message
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userMessage = { text: input, sender: 'user' };
//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const response = await axios.post('http://localhost:8000/chat', {
//         messages: [...messages, userMessage],
//         model: selectedModel
//       });

//       // Add bot message and include BLEU score
//       setMessages(prev => [...prev, { 
//         text: response.data.text, 
//         sender: 'bot',
//         model: selectedModel,
//         bleuScore: response.data.codebleu_score,
//         showBleu: false, // initial hidden
//       }]);
//     } catch (error) {
//       console.error(error);
//       setMessages(prev => [...prev, { 
//         text: "Backend error: cannot respond.", 
//         sender: 'bot',
//         bleuScore: null,
//         showBleu: false
//       }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render message content with optional syntax highlighting
//   const renderMessageContent = (msg) => {
//     if (msg.sender === 'bot') {
//       const codeBlockMatch = msg.text.match(/```(.*?)\n([\s\S]*?)```/);
//       if (codeBlockMatch) {
//         const lang = codeBlockMatch[1] || 'python';
//         const code = codeBlockMatch[2];
//         return (
//           <SyntaxHighlighter
//             language={lang}
//             style={oneDark}
//             showLineNumbers
//             wrapLongLines
//             customStyle={{ maxHeight: '300px', overflow: 'auto' }}
//           >
//             {code}
//           </SyntaxHighlighter>
//         );
//       }

//       // Simple code heuristic
//       const lines = msg.text.split('\n');
//       const codeLike = lines.some(line =>
//         line.trim().startsWith('def ') ||
//         line.trim().startsWith('class ') ||
//         line.includes('import ') ||
//         line.includes(':')
//       );

//       if (codeLike) {
//         return (
//           <SyntaxHighlighter
//             language="python"
//             style={oneDark}
//             showLineNumbers
//             wrapLongLines
//             customStyle={{ maxHeight: '300px', overflow: 'auto' }}
//           >
//             {msg.text}
//           </SyntaxHighlighter>
//         );
//       }
//     }

//     // Plain text fallback
//     return <span>{msg.text}</span>;
//   };

//   // Toggle BLEU score visibility
//   const toggleBleu = (index) => {
//     setMessages(prev => prev.map((msg, i) => 
//       i === index ? { ...msg, showBleu: !msg.showBleu } : msg
//     ));
//   };

//   return (
//     <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
//         <div>
//           <h1 className="text-2xl font-bold text-black">Multi-Model Chatbot</h1>
//           <p className="text-gray-600">Powered by Ollama & Google AI</p>
//         </div>
//         <div className="mt-2 md:mt-0">
//           <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div className="flex-1 overflow-y-auto p-4 border border-gray-300 bg-white rounded-lg mb-4">
//         {messages.length === 0 && (
//           <p className="text-gray-500 text-center mt-10">Start a conversation!</p>
//         )}
//         {messages.map((msg, i) => (
//           <div 
//             key={i} 
//             className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div
//               className={`px-4 py-2 rounded-xl max-w-xs md:max-w-md ${
//                 msg.sender === 'user'
//                   ? 'bg-blue-100 text-black rounded-br-none'
//                   : 'bg-gray-100 text-black rounded-bl-none'
//               }`}
//             >
//               {renderMessageContent(msg)}

//               {/* BLEU button and score */}
//               {msg.sender === 'bot' && msg.bleuScore !== null && (
//                 <div className="mt-2">
//                   <button
//                     onClick={() => toggleBleu(i)}
//                     className="text-xs text-blue-600 hover:underline"
//                   >
//                     Bleu Score
//                   </button>
//                   {msg.showBleu && (
//                     <div className="text-xs text-gray-700 mt-1">
//                       {msg.bleuScore.toFixed(3)}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {msg.sender === 'bot' && (
//                 <div className="text-xs text-gray-500 mt-1">
//                   {msg.model === 'llama3.2' ? 'Llama 3.2' : 'Gemini'}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//         {isLoading && (
//           <div className="flex justify-start mb-3">
//             <div className="px-4 py-2 rounded-xl bg-gray-100 rounded-bl-none flex space-x-1">
//               <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
//               <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-75"></span>
//               <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-150"></span>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Box */}
//       <form onSubmit={handleSubmit} className="flex space-x-2">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type your message..."
//           disabled={isLoading}
//           className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
//         />
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Chatbot;

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ModelSelector from './ModelSelector.jsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        model: selectedModel,
        showBleuInput: false,
        referenceCode: '',
        computedBleu: null
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        text: "Backend error: cannot respond.", 
        sender: 'bot',
        model: selectedModel,
        showBleuInput: false,
        referenceCode: '',
        computedBleu: null
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.sender === 'bot') {
      const lines = msg.text.split('\n');
      const codeLike = lines.some(line =>
        line.trim().startsWith('def ') ||
        line.trim().startsWith('class ') ||
        line.includes('import ') ||
        line.includes(':')
      );
      if (codeLike) {
        return (
          <SyntaxHighlighter
            language="python"
            style={oneDark}
            showLineNumbers
            wrapLongLines
            customStyle={{ maxHeight: '300px', overflow: 'auto' }}
          >
            {msg.text}
          </SyntaxHighlighter>
        );
      }
    }
    return <span>{msg.text}</span>;
  };

  const toggleBleuInput = (index) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, showBleuInput: !msg.showBleuInput } : msg
    ));
  };

  const submitReference = async (index) => {
    const msg = messages[index];
    if (!msg.referenceCode.trim()) return;

    try {
      const response = await axios.post('http://localhost:8000/codebleu', {
        generated_code: msg.text,
        reference_code: msg.referenceCode
      });

      setMessages(prev => prev.map((m, i) =>
        i === index ? { ...m, computedBleu: response.data.codebleu_score, showBleuInput: false } : m
      ));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
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
          <div key={i} className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-xl max-w-xs md:max-w-3xl ${
                msg.sender === 'user'
                  ? 'bg-blue-100 text-black rounded-br-none'
                  : 'bg-gray-100 text-black rounded-bl-none'
              }`}
            >
              {renderMessageContent(msg)}

              {/* BLEU Score button */}
              {msg.sender === 'bot' && !msg.computedBleu && (
                <div className="mt-2">
                  <button
                    onClick={() => toggleBleuInput(i)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Bleu Score
                  </button>

                  {msg.showBleuInput && (
                    <div className="mt-2 flex flex-col space-y-1">
                      <label className="text-xs font-semibold">Reference Code:</label>
                      <textarea
                        value={msg.referenceCode}
                        onChange={(e) =>
                          setMessages(prev => prev.map((m, idx) =>
                            idx === i ? { ...m, referenceCode: e.target.value } : m
                          ))
                        }
                        rows={6}
                        className="border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                        placeholder="Paste reference code here..."
                      />
                      <button
                        onClick={() => submitReference(i)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Show computed BLEU score */}
              {msg.computedBleu != null && (
                <div className="mt-2 flex flex-col space-y-1">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="text-xs font-semibold">Generated Code:</label>
                      <SyntaxHighlighter
                        language="python"
                        style={oneDark}
                        showLineNumbers
                        wrapLongLines
                        customStyle={{ maxHeight: '200px', overflow: 'auto' }}
                      >
                        {msg.text}
                      </SyntaxHighlighter>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold">Reference Code:</label>
                      <SyntaxHighlighter
                        language="python"
                        style={oneDark}
                        showLineNumbers
                        wrapLongLines
                        customStyle={{ maxHeight: '200px', overflow: 'auto' }}
                      >
                        {msg.referenceCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-700">
                    BLEU Score: {msg.computedBleu.toFixed(3)}
                  </div>
                </div>
              )}

              {msg.sender === 'bot' && (
                <div className="text-xs text-gray-500 mt-1">
                  {msg.model === 'llama3.2' ? 'Llama 3.2' : msg.model === 'gemini' ?'Gemini': msg.model === 'qwen' ? 'Qwen':'Codegemma'}
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
