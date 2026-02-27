import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import { getMarket } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { BarChart3, ArrowUpRight, X } from "lucide-react";

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

const Sparkline = ({ isProfit }) => {
  const points = [10, 15, 8, 22, 18, 25, 12, 30]; 
  return (
    <svg className="w-24 h-10 overflow-visible">
      <motion.polyline
        fill="none"
        stroke={isProfit ? "#10b981" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        points={points.map((p, i) => `${(i * 12)}, ${35 - p}`).join(" ")}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />
    </svg>
  );
};

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [marketData, setMarketData] = useState({});
  
  // Modal States
  const [modalConfig, setModalConfig] = useState(null); // { type: 'Buy' | 'Sell', symbol: string, price: number }
  const [tradeQuantity, setTradeQuantity] = useState(1);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("portfolio") || "[]");
    setPortfolio(saved);

    getMarket().then((data) => {
      const map = {};
      data.forEach((item) => {
        map[item.symbol] = item;
      });
      setMarketData(map);
    });
  }, []);

  const { totalInvested, currentValue } = useMemo(() => {
    let invested = 0;
    let current = 0;
    portfolio.forEach((p) => {
      const buy = parseFloat(p.price);
      const live = marketData[p.symbol]?.price || buy;
      invested += p.quantity * buy;
      current += p.quantity * live;
    });
    return { totalInvested: invested, currentValue: current };
  }, [portfolio, marketData]);

  const performancePercent = totalInvested > 0 ? (currentValue / totalInvested) * 100 : 0;

  // Handlers for the Modal Actions
  const handleTradeSubmit = () => {
    if (!modalConfig || tradeQuantity <= 0) return;

    let updated;
    if (modalConfig.type === "Buy") {
      updated = portfolio.map((p) =>
        p.symbol === modalConfig.symbol ? { ...p, quantity: p.quantity + Number(tradeQuantity) } : p
      );
    } else {
      updated = portfolio.map((p) =>
        p.symbol === modalConfig.symbol 
          ? { ...p, quantity: Math.max(0, p.quantity - Number(tradeQuantity)) } 
          : p
      );
    }

    setPortfolio(updated);
    localStorage.setItem("portfolio", JSON.stringify(updated));
    setModalConfig(null);
    setTradeQuantity(1);
  };

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden bg-[#061614]">
      
      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {modalConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#0a1a18] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative"
            >
              <h2 className="text-2xl font-black mb-6">
                {modalConfig.type} <span className="text-emerald-400">{modalConfig.symbol}</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">Quantity</label>
                  <input 
                    type="number"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
                
                <div className="py-2">
                  <p className="text-white/60 font-medium">Price: <span className="text-white font-bold ml-2">₹{modalConfig.price.toLocaleString("en-IN")}</span></p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setModalConfig(null)}
                    className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleTradeSubmit}
                    className={`flex-1 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                      modalConfig.type === 'Buy' 
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                        : 'bg-red-500 text-white hover:bg-red-400'
                    }`}
                  >
                    Confirm {modalConfig.type}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-emerald-400 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              boxShadow: p.glow,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}

        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-emerald-600 blur-[140px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600 blur-[140px] rounded-full" 
        />
        
        <div className="absolute inset-0 opacity-[0.1]" style={{ 
          backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
          backgroundSize: '50px 50px' 
        }} />
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-44 relative z-10 pb-20">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
              MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">PORTFOLIO</span>
            </h1>
            <div className="flex items-center gap-4 mt-4">
               <span className="h-[1px] w-12 bg-emerald-500/50"></span>
               <p className="text-emerald-500/70 font-mono text-xs uppercase tracking-[0.4em]">Live Analytics Terminal</p>
            </div>
          </motion.div>
        </div>

        {/* TOP METRIC CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            className="col-span-2 rounded-3xl p-8 bg-black/40 border border-emerald-500/30 backdrop-blur-3xl relative overflow-hidden"
          >
            <p className="text-emerald-400/60 font-mono text-[10px] uppercase tracking-widest mb-2">Net Asset Valuation</p>
            <h2 className="text-6xl font-black text-white tracking-tighter mb-6">
              ₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-end gap-2 h-12">
              {[8, 18, 12, 24, 16, 28, 14, 32, 10, 18, 22, 14].map((h, i) => (
                <motion.div 
                  key={i} 
                  initial={{ height: 0 }} 
                  animate={{ height: `${h}px` }} 
                  className="w-2 rounded-full bg-emerald-500/40" 
                />
              ))}
            </div>
          </motion.div>

          <motion.div className="rounded-3xl p-8 bg-black/40 border border-emerald-500/30 backdrop-blur-3xl flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="3" />
                <motion.circle 
                  cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="3" 
                  strokeDasharray="100" initial={{ strokeDashoffset: 100 }} 
                  animate={{ strokeDashoffset: 100 - Math.min(performancePercent, 100) }}
                  transition={{ duration: 2 }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black tracking-tighter">{performancePercent.toFixed(0)}%</span>
                <span className="text-[8px] uppercase opacity-50 font-bold">Return</span>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest">Performance</p>
          </motion.div>
        </div>

        {/* GLOSSY ASSET LIST */}
        <div className="space-y-6">
          {portfolio.map((p) => {
            const buy = parseFloat(p.price);
            const live = marketData[p.symbol]?.price || buy;
            const invested = buy * p.quantity;
            const current = live * p.quantity;
            const gain = current - invested;
            const percent = invested > 0 ? (gain / invested) * 100 : 0;
            const isProfit = gain >= 0;

            return (
              <motion.div
                key={p.symbol}
                className="relative group cursor-default"
                whileHover={{ scale: 1.01 }}
              >
                <div className={`absolute -inset-[1px] rounded-[2rem] opacity-20 blur-xl group-hover:opacity-50 transition-all ${isProfit ? 'bg-emerald-500' : 'bg-red-500'}`} />
                
                <div className="relative rounded-[1.8rem] bg-[#081210]/95 border border-white/10 backdrop-blur-3xl p-8 overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] duration-1000" />

                  <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-5 w-full lg:w-1/4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 ${isProfit ? 'border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-red-500/40 text-red-400'}`}>
                        {p.symbol.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                          {marketData[p.symbol]?.name || p.symbol}
                          <ArrowUpRight size={16} className={isProfit ? 'text-emerald-400' : 'text-red-400'}/>
                        </h3>
                        <Sparkline isProfit={isProfit} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 w-full border-x border-white/5 px-8">
                      <div>
                        <p className="text-white/30 text-[9px] uppercase font-black mb-1 tracking-widest">Avg Buy</p>
                        <p className="font-bold text-lg">₹{buy.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[9px] uppercase font-black mb-1 tracking-widest">Live Price</p>
                        <p className="font-black text-lg text-emerald-400">₹{live.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[9px] uppercase font-black mb-1 tracking-widest">Holdings</p>
                        <p className="font-bold text-lg">{p.quantity} Units</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[9px] uppercase font-black mb-1 tracking-widest">Returns</p>
                        <p className={`font-black text-lg ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '▲' : '▼'} {percent.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link to={`/stock/${p.symbol}`} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 size={14}/> view Details
                      </Link>
                      
                      {/* Updated onClick to trigger Modal */}
                      <button 
                        onClick={() => setModalConfig({ type: 'Buy', symbol: p.symbol, price: live })} 
                        className="px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all text-[9px] font-black uppercase tracking-widest"
                      >
                        + Add More
                      </button>
                      
                      <button 
                        onClick={() => setModalConfig({ type: 'Sell', symbol: p.symbol, price: live })} 
                        className="px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}