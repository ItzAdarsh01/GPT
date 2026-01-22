import { useState, useEffect, useRef } from 'react'
import { URL } from './constants.js'
import './App.css'
import Answers from './components/Answers.jsx'

function App() {
  const [question, setQuestion] = useState("") 
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const chatRefs = useRef({});

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(history));
  }, [history]);

  const scrollToChat = (id) => {
    const element = chatRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const askQuestion = async (searchQuery = null) => { 
    const finalQuestion = searchQuery || question;
    if (!finalQuestion.trim()) return;

    // Cyfuture AI (OpenAI Compatible) Payload
    const payload = {
      model: "/workspace/models/Llama-4-Maverick-17B-128E-Instruct", 
      messages: [
        { role: "user", content: finalQuestion }
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 1,
      stream: false
    };

    // VITE_GEMINI_API_KEY hi rehne de, bas .env mein Cyfuture wali key daal dein
    const apiKey = import.meta.env.VITE_AI_API_KEY; 

    try {
      let response = await fetch(URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify(payload)
      });

      // 400 Error check karne ke liye detailed log
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Detailed Error:", errorData);
        alert(`Error ${response.status}: ${errorData.error?.message || "Check Console"}`);
        return;
      }

      let data = await response.json();
      let rawText = data.choices[0].message.content;
      
      // Formatting
      let cleanText = rawText.replace(/\*\*/g, ""); 
      let dataArray = cleanText.split("\n").filter(item => item.trim() !== "");

      if (!searchQuery) {
        const newEntry = {
          ques: finalQuestion,
          ans: dataArray,
          id: Date.now()
        };
        setHistory(prev => [...prev, newEntry]);
        setQuestion(""); 
      } else {
        setHistory(prev => prev.map(item => 
          item.ques === searchQuery ? { ...item, ans: dataArray } : item
        ));
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  }

  const clearHistory = () => {
    if (window.confirm("Do you wanna delete all the history?")) {
      setHistory([]);
      localStorage.removeItem("chatHistory");
    }
  }

  return (
    <div className="grid grid-cols-5 h-screen bg-zinc-900 text-white overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="col-span-1 bg-zinc-800 border-r border-zinc-700 flex flex-col p-4 overflow-hidden">
        <h2 className="text-xl font-bold mb-6 pt-4">History</h2>
        <div className="flex-grow overflow-y-auto space-y-2 pr-2">
          {[...history].reverse().map((item) => (
            <div 
              key={item.id} 
              onClick={() => scrollToChat(item.id)} 
              className="p-3 bg-zinc-700/30 rounded-lg hover:bg-zinc-600 cursor-pointer text-sm truncate border border-zinc-700/50 transition-colors"
            >
              {item.ques}
            </div>
          ))}
        </div>
        
        {history.length > 0 && (
          <button onClick={clearHistory} className="mt-4 w-full py-2 px-4 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-bold rounded-lg border border-red-900/50 transition-all cursor-pointer">
            🗑️ Clear All History
          </button>
        )}
      </div>

      {/* MAIN AREA */}
      <div className="col-span-4 flex flex-col h-full overflow-hidden">
        <header className="p-4 border-b border-zinc-800 text-center shrink-0">
          <h1 className="text-2xl font-black tracking-tighter">REACTGPT</h1>
        </header>

        <div className="flex-grow overflow-y-auto p-8 space-y-8 scroll-smooth">
          {history.length === 0 && (
            <div className="h-full flex items-center justify-center text-zinc-500">
              Start a new chat with  AI...
            </div>
          )}
          {history.map((chat) => (
            <div 
              key={chat.id} 
              ref={(el) => (chatRefs.current[chat.id] = el)} 
              className="max-w-4xl mx-auto space-y-4"
            >
              <div className="flex justify-end">
                <div className="bg-blue-600 px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg">
                  <p className="text-xs font-bold opacity-70">You</p>
                  <p>{chat.ques}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-zinc-800 border border-zinc-700 p-5 rounded-2xl rounded-tl-none w-full shadow-lg">
                  <p className="text-xs font-bold text-blue-400 mb-2">REACTGPT</p>
                  <div className="space-y-1">
                    {chat.ans.map((line, i) => (
                      <Answers key={i} ans={line} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="p-6 bg-zinc-900 border-t border-zinc-800 shrink-0">
          <div className="max-w-3xl mx-auto bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center p-2 shadow-2xl">
            <input 
              type="text" 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
              className="flex-grow bg-transparent p-3 outline-none text-white" 
              placeholder="Type your message..." 
            />
            <button onClick={() => askQuestion()} className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-zinc-200 transition-colors cursor-pointer shrink-0">
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;