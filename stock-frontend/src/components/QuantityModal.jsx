import React, { useState } from "react";

export default function QuantityModal({
  open,
  mode = "add", // "add" or "sell"
  stock,
  price,
  onCancel,
  onConfirm,
}) {
  const [qty, setQty] = useState(1);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-[#18202b] rounded-2xl p-10 w-full max-w-md shadow-2xl border border-emerald-400/20 flex flex-col justify-center items-center"
        style={{ minWidth: 380, minHeight: 320 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {mode === "add" ? "Buy" : "Sell"} {stock}
        </h2>
        <div className="mb-6 w-full">
          <label className="block text-emerald-200 text-base mb-2">Quantity</label>
          <input
            type="number"
            min={1}
            className="w-full px-4 py-3 rounded-lg bg-[#232c3a] text-white border border-emerald-400/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg"
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
          />
        </div>
        <div className="mb-8 text-emerald-200 text-lg w-full text-left">
          Price: <span className="font-mono">₹{price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex gap-6 w-full">
          <button
            className="flex-1 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-500 transition text-lg"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition text-lg"
            onClick={() => onConfirm(qty)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
