import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMarket } from "../api/api";
import { motion, AnimatePresence } from "framer-motion"; 
import { Search, Activity, Heart, ArrowUpRight, ArrowDownLeft } from "lucide-react";

// --- High-Intensity Particle Configuration ---
const PARTICLE_COUNT = 100;
const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  id: i,
  size: Math.random() * 4 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 8 + 4, 
  delay: Math.random() * 10,
  glow: Math.random() > 0.5 ? "0 0 12px #10b981" : "0 0 4px #34d399",
}));

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
    setWatchlist(saved);

    getMarket()
      .then((data) => {
        const map = {};
        data.forEach((item) => {
          map[item.symbol] = { 
            name: item.name, 
            price: item.price, 
            change: item.change 
          };
        });
        setMarketData(map);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load market data", err);
        setLoading(false);
      });
  }, []);

  const handleRemoveStock = (symbol) => {
    const newWatchlist = watchlist.filter((w) => w.symbol !== symbol);
    setWatchlist(newWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
  };

  const filteredWatchlist = useMemo(() => {
    return watchlist.filter((stock) => 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (stock.name && stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [watchlist, searchQuery]);

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden bg-[#030807]">
      
      {/* BACKGROUND (Exact Mirror of Market Page) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div 
            key={p.id} 
            className="absolute bg-emerald-400 rounded-full" 
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, boxShadow: p.glow }} 
            animate={{ x: [0, Math.random() * 200 - 100, 0], y: [0, Math.random() * 200 - 100, 0], opacity: [0.2, 0.7, 0.2], scale: [1, 1.5, 1] }} 
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }} 
          />
        ))}
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-emerald-600 blur-[140px] rounded-full" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600 blur-[140px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      </div>

      <Navbar />

      <div className="max-w-[1600px] mx-auto px-10 pt-48 relative z-10 pb-20">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-8xl md:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase mb-6">
              MY
              <span className="block text-transparent stroke-text bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-900">
                WATCHLIST
              </span>
            </h1>
            <div className="max-w-xl border-l-2 border-emerald-500/50 pl-8 mt-10">
              <p className="text-slate-300 text-sm md:text-base font-light tracking-[0.1em] leading-relaxed opacity-70">
                Encrypted portfolio monitoring. Real-time valuation of your high-liquidity assets and primary market signals.
              </p>
            </div>
          </motion.div>

          {/* SEARCH BAR */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-8 mt-20 w-full max-w-5xl"
          >
            <div className="relative flex-1 group">
              <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-emerald-400 pointer-events-none">
                <Search size={24} />
              </span>
              <input
                type="text"
                placeholder="Search Stocks or Companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-10 py-6 bg-black/40 border border-emerald-500/40 focus:border-emerald-400 focus:outline-none placeholder:text-emerald-400/30 font-mono tracking-widest text-lg rounded-xl shadow-lg transition-all"
              />
            </div>
          </motion.div>
        </div>

        {/* DATA GRID */}
        {loading ? (
          <div className="flex flex-col items-center py-24">
            <div className="font-mono text-emerald-500 animate-pulse tracking-[1em] text-[10px] uppercase">Decrypting_Market_Stream...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <AnimatePresence mode="popLayout">
              {filteredWatchlist.map((stock) => {
                const liveData = marketData[stock.symbol] || {};
                const isBullish = (liveData.change || 0) >= 0;

                return (
                  <motion.div
                    key={stock.symbol}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -8 }}
                    className="relative group"
                  >
                    {/* Background Glow */}
                    <div className={`absolute -inset-[1px] rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-700 ${isBullish ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                    <Link
                      to={`/stock/${stock.symbol}`}
                      className="relative block h-full rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl"
                    >
                      <div className="p-8 relative z-10">
                        {/* Top Section */}
                        <div className="flex justify-between items-start mb-8">
                          <div className={`px-3 py-1 rounded-lg text-[9px] font-black font-mono tracking-[0.2em] border ${isBullish ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {isBullish ? 'BULL_SIGNAL' : 'BEAR_SIGNAL'}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveStock(stock.symbol);
                            }}
                            className="p-2 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/5 transition-colors group/heart"
                          >
                            <Heart size={16} className="fill-red-500 text-red-500 scale-110" />
                          </button>
                        </div>

                        {/* Middle Section */}
                        <div className="mb-8">
                          <p className="text-white/30 text-[10px] font-mono tracking-widest mb-1 uppercase">{stock.symbol}</p>
                          <h3 className="font-bold text-xl tracking-tight leading-tight truncate uppercase text-white group-hover:text-emerald-400 transition-colors">
                            {stock.name || liveData.name || stock.symbol}
                          </h3>
                        </div>

                        {/* Bottom Price Section */}
                        <div className="flex items-end justify-between pt-4 border-t border-white/5">
                          <div>
                            <div className="font-mono text-2xl font-black text-white mb-1">
                              ₹{liveData.price?.toLocaleString("en-IN") || "---"}
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-flex ${isBullish ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"}`}>
                              {isBullish ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                              {liveData.change ? `${isBullish ? "+" : ""}${liveData.change.toFixed(2)}%` : "0.00%"}
                            </div>
                          </div>
                          
                          <div className={`transition-all duration-500 group-hover:rotate-12 ${isBullish ? 'text-emerald-500/40 group-hover:text-emerald-400' : 'text-rose-500/40 group-hover:text-rose-400'}`}>
                              <Activity size={28} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
}