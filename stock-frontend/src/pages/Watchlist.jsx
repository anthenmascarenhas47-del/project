import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getMarket, searchCompanies } from "../api/api";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
    setWatchlist(saved);

    // Fetch market data
    getMarket()
      .then((data) => {
        const map = {};
        data.forEach((item) => {
          map[item.symbol] = { name: item.name, price: item.price };
        });
        setMarketData(map);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load market data", err);
        setLoading(false);
      });
  }, []);

  // Search for stocks
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchCompanies(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed", err);
      setSearchResults([]);
    }
    setSearching(false);
  };

  // Add stock to watchlist
  const handleAddStock = (stock) => {
    const exists = watchlist.find((w) => w.symbol === stock.symbol);
    if (exists) {
      setNotification({ type: "error", message: `${stock.symbol} is already in your watchlist!` });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const newWatchlist = [...watchlist, stock];
    setWatchlist(newWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
    setNotification({ type: "success", message: `✓ Added ${stock.name} to watchlist!` });
    setTimeout(() => setNotification(null), 3000);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Remove stock from watchlist
  const handleRemoveStock = (symbol) => {
    const newWatchlist = watchlist.filter((w) => w.symbol !== symbol);
    setWatchlist(newWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        
        {/* -------- NOTIFICATION -------- */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 animate-in slide-in-from-top ${
            notification.type === "success"
              ? "bg-green-900/30 border-green-500/50 text-green-400"
              : "bg-red-900/30 border-red-500/50 text-red-400"
          }`}>
            {notification.type === "success" ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}
        
        {/* -------- HEADER & ADD BUTTON -------- */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Watchlist</h1>
            <p className="text-slate-400 text-sm mt-1">Track your favorite stocks</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-lg"
          >
            + Add Stock
          </button>
        </div>

        {/* -------- WATCHLIST GRID -------- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-slate-400 mb-3">
              <svg className="w-16 h-16 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
              </svg>
            </div>
            <p className="text-slate-400 text-lg">Your watchlist is empty</p>
            <p className="text-slate-500 text-sm mt-2">Click "Add Stock" to start tracking</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((stock) => {
              const liveData = marketData[stock.symbol] || {};
              const livePrice = liveData.price || 0;
              const change = stock.price ? livePrice - stock.price : 0;
              const changePercent = stock.price ? ((change / stock.price) * 100).toFixed(2) : 0;

              return (
                <div
                  key={stock.symbol}
                  className="group relative bg-slate-800 rounded-xl p-5 border border-slate-700/50 
                             hover:border-blue-500/50 hover:bg-slate-750 hover:shadow-xl hover:shadow-blue-900/10 
                             transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {stock.name || stock.symbol}
                      </h3>
                      <p className="text-slate-400 text-xs font-mono mt-1">{stock.symbol}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveStock(stock.symbol)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/20 hover:bg-red-600/40 
                                 text-red-400 p-2 rounded transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-xs">Current Price</p>
                      <p className="text-2xl font-bold">
                        {livePrice === 0 ? "-" : `₹${livePrice.toFixed(2)}`}
                      </p>
                    </div>

                    {stock.price && livePrice !== 0 && (
                      <div className="pt-3 border-t border-slate-700">
                        <p className="text-slate-400 text-xs">Change</p>
                        <p className={`text-lg font-semibold ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {change >= 0 ? "+" : ""}₹{change.toFixed(2)} ({changePercent}%)
                        </p>
                      </div>
                    )}
                  </div>

                  <a
                    href={`/stock/${stock.symbol}`}
                    className="mt-4 block w-full text-center bg-slate-700 hover:bg-slate-600 py-2 rounded-lg 
                               font-medium text-sm transition-colors"
                  >
                    View Details
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ----------- ADD STOCK MODAL ----------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold">Add Stock to Watchlist</h2>

            {/* Search Input */}
            <div>
              <label className="text-sm text-slate-400 block mb-2">Search Stock</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or symbol..."
                className="w-full bg-slate-700 border border-slate-600 rounded p-3 outline-none 
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto">
              {searching && (
                <p className="text-slate-400 text-sm text-center py-4">Searching...</p>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={() => handleAddStock(result)}
                      className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                    >
                      <div className="font-semibold">{result.name}</div>
                      <div className="text-sm text-slate-400">{result.symbol}</div>
                    </button>
                  ))}
                </div>
              )}

              {!searching && searchQuery.trim() && searchResults.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No stocks found</p>
              )}

              {!searching && !searchQuery.trim() && (
                <p className="text-slate-400 text-sm text-center py-4">Type to search for stocks</p>
              )}
            </div>

            {/* Close Button */}
            <button
              className="w-full px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 font-medium transition-colors"
              onClick={() => setShowAddModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
