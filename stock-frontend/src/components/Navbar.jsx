import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getIndices } from "../api/api";
import ChatBot from "./ChatBot";
import { MessageCircle } from "lucide-react";

export default function Navbar() {
  const [status, setStatus] = useState("Checking...");
  const [indices, setIndices] = useState([]);
  const [showChat, setShowChat] = useState(false);

  function checkStatus() {
    const now = new Date();
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const day = istTime.getDay();
    const h = istTime.getHours();
    const m = istTime.getMinutes();
    const totalMinutes = h * 60 + m;

    const PRE_OPEN_START = 9 * 60;
    const MARKET_START = 9 * 60 + 15;
    const MARKET_END = 15 * 60 + 30;

    let s = "Closed";

    if (day === 0 || day === 6) {
      s = "Closed (Weekend)";
    } else {
      if (totalMinutes >= PRE_OPEN_START && totalMinutes < MARKET_START) {
        s = "Pre-Open";
      } else if (totalMinutes >= MARKET_START && totalMinutes <= MARKET_END) {
        s = "Live";
      } else {
        s = "Closed";
      }
    }

    setStatus(s);
  }

  const fetchIndices = async () => {
    try {
      const data = await getIndices();
      setIndices(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkStatus();
    fetchIndices();
    const statusTimer = setInterval(checkStatus, 60000);
    const dataTimer = setInterval(fetchIndices, 60000);
    return () => {
      clearInterval(statusTimer);
      clearInterval(dataTimer);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-emerald-950/20 border-b border-emerald-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="text-3xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              SignalX
            </div>

            <div className="hidden md:flex gap-10 text-sm font-bold uppercase tracking-widest text-slate-400/80">
              <NavLink to="/market" className={({isActive}) => isActive ? "text-emerald-400 transition-all border-b-2 border-emerald-400 pb-1" : "hover:text-emerald-400 transition-all pb-1"}>
                Market
              </NavLink>
              <NavLink to="/watchlist" className={({isActive}) => isActive ? "text-emerald-400 transition-all border-b-2 border-emerald-400 pb-1" : "hover:text-emerald-400 transition-all pb-1"}>
                Watchlist
              </NavLink>
              <NavLink to="/" end className={({isActive}) => isActive ? "text-emerald-400 transition-all border-b-2 border-emerald-400 pb-1" : "hover:text-emerald-400 transition-all pb-1"}>
                Portfolio
              </NavLink>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowChat(true)}
                className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 transition-all active:scale-90"
              >
                <MessageCircle size={20} className="text-emerald-400" />
              </button>

              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${status === "Live" ? "bg-emerald-500 animate-ping" : "bg-rose-500"}`} />
                 <span
                   className={`text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-[0.2em] border ${
                     status === "Live"
                       ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                       : status === "Pre-Open"
                       ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                       : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                   }`}
                 >
                   {status}
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* 📉 UPDATED TICKER BAR (CENTERED) */}
        <div className="border-t border-emerald-500/10 bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-2 flex justify-center gap-8">
            {indices.map((idx) => (
              <div
                key={idx.name}
                className="flex items-center whitespace-nowrap px-4 py-1 rounded-full bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-default"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  {idx.name}
                </span>
                <span className={`ml-3 font-mono text-sm font-bold ${
                  idx.change >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {idx.price.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className={`ml-2 text-[10px] font-bold ${
                  idx.change >= 0 ? "text-emerald-500/80" : "text-rose-500/80"
                }`}>
                  {idx.change >= 0 ? "▲" : "▼"} {idx.percent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
    </>
  );
}