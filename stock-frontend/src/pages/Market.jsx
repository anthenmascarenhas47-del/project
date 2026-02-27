import { useEffect, useRef, useState, useMemo } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import { getMarket } from "../api/api";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, ChevronLeft, ChevronRight, Cpu, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CAROUSEL_SLIDES = [
  {
    title: "LIVE MARKET",
    highlight: "INTELLIGENCE",
    desc: "Real-time price action, deep liquidity insights, and advanced trading analytics — all in one powerful terminal.",
    img: "https://i.pinimg.com/1200x/92/8b/da/928bda891bc1de9a4ec5305208d87ce0.jpg",
    id: "TRML_001"
  },
  {
    title: "Smart Market",
    highlight: "Radar",
    desc: "Track your selected stocks with live updates, performance signals, and precision monitoring.",
    img: "https://i.pinimg.com/1200x/75/b7/bc/75b7bc9633de734e0a5b81c6078f045f.jpg",
    id: "TRML_002"
  },
  {
    title: "Portfolio",
    highlight: "Intelligence",
    desc: "Monitor performance, analyze gains, and manage your capital with complete transparency.",
    img: "https://i.pinimg.com/1200x/d1/58/92/d15892a474216f76c4b9817df598f83c.jpg",
    id: "TRML_003"
  }
];

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

export default function Market() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const intervalRef = useRef(null);

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentSlide, setCurrentSlide] = useState(0);

  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleWatchlist = (stock) => {
    const exists = watchlist.find((w) => w.symbol === stock.symbol);
    const updated = exists ? watchlist.filter((w) => w.symbol !== stock.symbol) : [...watchlist, stock];
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getMarket().then((data) => {
      setStocks(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    let isDisposed = false;
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: { background: { color: "transparent" }, textColor: "#94a3b8" },
      grid: { vertLines: { color: "rgba(16, 185, 129, 0.05)" }, horzLines: { color: "rgba(16, 185, 129, 0.05)" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
    });
    chartRef.current = chart;
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981", downColor: "#ef4444",
      borderUpColor: "#10b981", borderDownColor: "#ef4444",
      wickUpColor: "#10b981", wickDownColor: "#ef4444",
    });
    const step = 3600;
    const candles = [];
    let base = 250;
    let time = Math.floor(Date.now() / 1000) - 500 * step;
    for (let i = 0; i < 500; i++) {
      const open = base + (Math.random() - 0.5) * 8;
      const close = open + (Math.random() - 0.5) * 10;
      const high = Math.max(open, close) + Math.random() * 4;
      const low = Math.min(open, close) - Math.random() * 4;
      candles.push({ time, open, high, low, close });
      base = close;
      time += step;
    }
    candleSeries.setData(candles);
    intervalRef.current = setInterval(() => {
      if (isDisposed) return;
      const last = candles[candles.length - 1];
      const newOpen = last.close;
      const newClose = newOpen + (Math.random() - 0.5) * 6;
      const newHigh = Math.max(newOpen, newClose) + Math.random() * 3;
      const newLow = Math.min(newOpen, newClose) - Math.random() * 3;
      const newTime = last.time + step;
      const newCandle = { time: newTime, open: newOpen, high: newHigh, low: newLow, close: newClose };
      candles.push(newCandle);
      try { candleSeries.update(newCandle); } catch (err) {}
    }, 3000);
    const handleResize = () => { if (!isDisposed && chartRef.current) chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth }); };
    window.addEventListener("resize", handleResize);
    return () => {
      isDisposed = true;
      clearInterval(intervalRef.current);
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) chartRef.current.remove();
    };
  }, []);

  const filteredStocks = useMemo(() => {
    return stocks
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.symbol.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "priceHigh") return b.price - a.price;
        if (sortBy === "priceLow") return a.price - b.price;
        if (sortBy === "nameAZ") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [stocks, search, sortBy]);

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden bg-[#030807]">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div key={p.id} className="absolute bg-emerald-400 rounded-full" style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, boxShadow: p.glow }} animate={{ x: [0, Math.random() * 200 - 100, 0], y: [0, Math.random() * 200 - 100, 0], opacity: [0.2, 0.7, 0.2], scale: [1, 1.5, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }} />
        ))}
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-emerald-600 blur-[140px] rounded-full" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600 blur-[140px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      </div>

      <Navbar />

      <div className="max-w-[1600px] mx-auto px-10 pt-48 relative z-10 pb-20">
        
        {/* CINEMATIC CAROUSEL */}
        <div className="relative w-full h-[650px] mb-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center"
            >
              <div className="w-full lg:w-3/4 z-20">
                <motion.h1 
                   initial={{ x: -50, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: 0.3, duration: 0.8 }}
                   className="text-8xl md:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase mb-6"
                >
                  {CAROUSEL_SLIDES[currentSlide].title}
                  <span className="block text-transparent stroke-text bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-900">
                    {CAROUSEL_SLIDES[currentSlide].highlight}
                  </span>
                </motion.h1>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-xl border-l-2 border-emerald-500/50 pl-8"
                >
                  <p className="text-slate-300 text-sm md:text-base font-light tracking-[0.1em] leading-relaxed opacity-70 mb-8">
                    {CAROUSEL_SLIDES[currentSlide].desc}
                  </p>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: 100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="hidden lg:block absolute right-0 w-[45%] h-[500px] grayscale-0 brightness-100 transition-all duration-1000 ease-in-out"
              >
                <div className="absolute inset-0 border border-emerald-500/20 z-20 pointer-events-none" />
                <img 
                  src={CAROUSEL_SLIDES[currentSlide].img} 
                  className="w-full h-full object-cover shadow-[0_0_100px_rgba(16,185,129,0.1)]" 
                  alt="Cinematic Market" 
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-0 left-0 w-full flex justify-between items-end border-t border-white/5 pt-8">
            <div className="flex gap-4">
              {CAROUSEL_SLIDES.map((_, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-0.5 transition-all duration-1000 cursor-pointer ${currentSlide === idx ? "w-24 bg-emerald-400" : "w-8 bg-white/5 hover:bg-white/20"}`}
                />
              ))}
            </div>
            <div className="flex gap-[2px]">
              <button onClick={() => setCurrentSlide(prev => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)} className="p-6 bg-white/5 hover:bg-emerald-500 transition-all group">
                <ChevronLeft size={20} className="group-hover:text-black" />
              </button>
              <button onClick={() => setCurrentSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length)} className="p-6 bg-white/5 hover:bg-emerald-500 transition-all group">
                <ChevronRight size={20} className="group-hover:text-black" />
              </button>
            </div>
          </div>
        </div>

        {/* LIVE CHART */}
        <div className="relative w-full h-[650px] bg-black/40 backdrop-blur-2xl border-y border-emerald-500/10 mb-40 overflow-hidden group">
          <div className="absolute top-4 left-10 flex items-center gap-3 z-10">
             <Cpu size={14} className="text-emerald-500 animate-spin-slow" />
             <span className="text-[10px] font-mono text-emerald-500/50 tracking-[0.3em] uppercase">Market_Stream_Live</span>
          </div>
          <div ref={chartContainerRef} className="w-full h-full brightness-90 group-hover:brightness-110 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#030807] to-transparent pointer-events-none" />
        </div>

        {/* SEARCH & SORT */}
        <div className="flex flex-col md:flex-row gap-8 mb-32 justify-center w-full max-w-5xl mx-auto z-20 relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-10 py-6 bg-black/40 border border-emerald-500/40 focus:border-emerald-400 rounded-xl shadow-lg text-lg font-mono tracking-wide uppercase text-emerald-400 focus:outline-none hover:border-emerald-400 transition-all cursor-pointer"
            style={{ backgroundColor: '#101a17', color: '#10b981' }}
          >
            <option value="default">SORT PARAMETERS</option>
            <option value="priceHigh">HIGH_VAL</option>
            <option value="priceLow">LOW_VAL</option>
            <option value="nameAZ">TITLE_A_Z</option>
          </select>
          <div className="relative flex-1 group">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search stocks, companies, tickers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-10 py-6 bg-black/40 border border-emerald-500/40 focus:border-emerald-400 focus:outline-none placeholder:text-emerald-400 font-mono tracking text-lg rounded-xl shadow-lg transition-all"
            />
          </div>
        </div>

        {/* ACTIVE INSTRUMENTS - MODERN GLASSY DESIGN */}
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-20 text-center"
          >
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-2">Live <span className="text-emerald-500">Signals</span></h2>
            <div className="h-1 w-20 bg-emerald-500/50 mx-auto rounded-full" />
          </motion.div>

          {loading ? (
            <div className="font-mono text-emerald-500 animate-pulse tracking-[1em] text-[10px]">AUTHENTICATING_STREAM...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
              {filteredStocks.map((s) => {
                const isBullish = s.change >= 0;
                const isSaved = watchlist.find((w) => w.symbol === s.symbol);
                
                return (
                  <motion.div
                    key={s.symbol}
                    whileHover={{ y: -8, scale: 1.01 }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    {/* Background Glow Overlay */}
                    <div className={`absolute -inset-[1px] rounded-[2rem] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-700 ${isBullish ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                    <Link
                      to={`/stock/${s.symbol}`}
                      className="relative block h-full rounded-[1.8rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl group"
                    >
                      {/* Glossy Shine Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%] duration-1000 ease-in-out" />

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
                              toggleWatchlist(s);
                            }}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                          >
                            <Heart
                              size={16}
                              className={`transition-all duration-300 ${isSaved ? "fill-red-500 text-red-500 scale-110" : "text-white/30"}`}
                            />
                          </button>
                        </div>

                        {/* Middle Section */}
                        <div className="mb-8">
                          <p className="text-white/30 text-[10px] font-mono tracking-widest mb-1 uppercase">{s.symbol}</p>
                          <h3 className="font-bold text-xl tracking-tight leading-tight truncate uppercase text-white group-hover:text-emerald-400 transition-colors">
                            {s.name}
                          </h3>
                        </div>

                        {/* Bottom Price Section */}
                        <div className="flex items-end justify-between pt-4 border-t border-white/5">
                          <div>
                            <div className="font-mono text-2xl font-black text-white mb-1">
                              ₹{s.price?.toLocaleString("en-IN")}
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 rounded-md inline-flex ${isBullish ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"}`}>
                              {isBullish ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                              {isBullish ? "+" : ""}{s.change.toFixed(2)}%
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
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(16, 185, 129, 0.3);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}