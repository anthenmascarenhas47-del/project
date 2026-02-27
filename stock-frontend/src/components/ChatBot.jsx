import { useState } from "react";
import { Send, X, Bot, Sparkles } from "lucide-react"; 

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! Ask me about any stock 📈" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New Loading State

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true); // Start Loading

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const response = await res.json();
      setMessages((m) => [...m, { role: "ai", text: response.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Error contacting server ❌" },
      ]);
    } finally {
      setIsLoading(false); // Stop Loading
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[580px] bg-[#020b0a]/95 backdrop-blur-3xl border border-emerald-500/20 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[200] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10">
      
      {/* Header */}
      <div className="px-6 py-6 border-b border-emerald-500/10 flex justify-between items-center bg-gradient-to-b from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400 blur-md opacity-20 animate-pulse"></div>
            <div className="relative w-10 h-10 rounded-2xl bg-[#0a1b18] flex items-center justify-center border border-emerald-500/30">
              <Bot size={20} className="text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-white/95 text-base text-left">
              SignalX <span className="text-emerald-400">Intelligence</span>
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/60 font-medium">Neural Link Active</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-none">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`relative p-4 rounded-2xl max-w-[85%] text-[13px] leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-50 rounded-tr-none"
                  : "bg-white/[0.03] border border-white/5 text-slate-300 rounded-tl-none"
              }`}>
              {m.text}
              {m.role === "ai" && <Sparkles size={12} className="absolute -right-2 -top-2 text-emerald-500/40" />}
            </div>
          </div>
        ))}

        {/* --- TYPING INDICATOR --- */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce"></span>
              </div>
              <span className="text-[11px] text-emerald-500/40 font-mono tracking-wider ml-2 uppercase">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 pt-2">
        <div className={`relative flex items-center gap-3 bg-white/[0.03] border border-emerald-500/20 rounded-2xl px-4 py-2 transition-all shadow-lg ${isLoading ? 'opacity-50' : 'focus-within:border-emerald-400/50 focus-within:bg-white/[0.05]'}`}>
          <input
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-transparent py-2 text-white outline-none placeholder:text-slate-400 text-sm font-medium disabled:cursor-not-allowed"
            placeholder={isLoading ? "Processing stream..." : "Analyze market data..."}
          />
          <button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm ${
              isLoading || !input.trim() 
              ? "bg-white/5 text-slate-600 cursor-not-allowed" 
              : "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-[#020b0a]"
            }`}
          >
            <Send size={16} />
          </button>
        </div>
        
      </div>
    </div>
  );
}