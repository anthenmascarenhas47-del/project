import React, { useEffect, useRef } from "react";

// Animated stock-like background: moving line graph and candlesticks
export default function StockBackgroundAnimation() {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    let animationId;

    // Generate random stock data
    function generateStockData(points, min, max) {
      let arr = [];
      let last = (min + max) / 2;
      for (let i = 0; i < points; i++) {
        let change = (Math.random() - 0.5) * (max - min) * 0.08;
        last = Math.max(min, Math.min(max, last + change));
        arr.push(last);
      }
      return arr;
    }

    // More points for smoother, slower animation
    let stockLine = generateStockData(320, 0.2 * height, 0.8 * height);
    let candleData = Array.from({ length: 60 }, () => {
      let base = Math.random() * 0.5 * height + 0.25 * height;
      let high = base + Math.random() * 40;
      let low = base - Math.random() * 40;
      let open = base + (Math.random() - 0.5) * 20;
      let close = base + (Math.random() - 0.5) * 20;
      return { high, low, open, close };
    });
    let offset = 0;

    function draw() {
      ctx.clearRect(0, 0, width, height);
      // Draw smooth animated line graph (using quadratic curves)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, stockLine[offset % stockLine.length]);
      for (let i = 1; i < stockLine.length; i++) {
        const prevX = ((i - 1) / (stockLine.length - 1)) * width;
        const prevY = stockLine[(i - 1 + offset) % stockLine.length];
        const currX = (i / (stockLine.length - 1)) * width;
        const currY = stockLine[(i + offset) % stockLine.length];
        const midX = (prevX + currX) / 2;
        const midY = (prevY + currY) / 2;
        ctx.quadraticCurveTo(prevX, prevY, midX, midY);
      }
      ctx.strokeStyle = "rgba(16,185,129,0.18)";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 24;
      ctx.stroke();
      ctx.restore();

      // Draw animated candlesticks (fainter, more subtle)
      let candleWidth = width / candleData.length / 1.8;
      for (let i = 0; i < candleData.length; i++) {
        let x = (i / candleData.length) * width + candleWidth / 2;
        let { high, low, open, close } = candleData[(i + offset) % candleData.length];
        let isUp = close >= open;
        ctx.save();
        // Wick
        ctx.beginPath();
        ctx.moveTo(x, high);
        ctx.lineTo(x, low);
        ctx.strokeStyle = isUp ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.10)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Body
        ctx.beginPath();
        ctx.rect(x - candleWidth / 2, Math.min(open, close), candleWidth, Math.abs(close - open));
        ctx.fillStyle = isUp ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.07)";
        ctx.fill();
        ctx.restore();
      }
    }

    function animate() {
      // Move slower: advance offset every 3 frames
      let frame = 0;
      function step() {
        frame++;
        if (frame % 3 === 0) {
          offset = (offset + 1) % stockLine.length;
        }
        draw();
        animationId = requestAnimationFrame(step);
      }
      step();
    }

    animate();
    window.addEventListener("resize", handleResize);
    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 animate-fadein"
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
