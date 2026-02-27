import React, { useRef, useEffect } from "react";

// Animated candlestick and graph background for dashboard
export default function AnimatedCandlesBG() {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Generate random candle data
    const candleCount = Math.floor(width / 24);
    let candles = Array.from({ length: candleCount }, (_, i) => {
      let base = height * 0.65 + Math.sin(i / 6) * 18;
      let open = base + (Math.random() - 0.5) * 18;
      let close = open + (Math.random() - 0.5) * 16;
      let high = Math.max(open, close) + Math.random() * 10;
      let low = Math.min(open, close) - Math.random() * 10;
      return { open, close, high, low };
    });

    function drawCandles(offsetY = 0) {
      for (let i = 0; i < candles.length; i++) {
        let x = i * 24 + 40;
        let c = candles[i];
        let bullish = c.close > c.open;
        ctx.save();
        ctx.strokeStyle = bullish ? "#10b981" : "#ef4444";
        ctx.shadowColor = bullish ? "#10b981" : "#ef4444";
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.moveTo(x, c.high + offsetY);
        ctx.lineTo(x, c.low + offsetY);
        ctx.stroke();
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, c.open + offsetY);
        ctx.lineTo(x, c.close + offsetY);
        ctx.stroke();
        ctx.restore();
      }
    }

    function drawGraphLine(offsetY, color, glow) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, offsetY);
      for (let x = 0; x <= width; x += 18) {
        let y = offsetY + Math.sin((x / 120) + Date.now() / 2200) * 18 + Math.cos((x / 80) + Date.now() / 3400) * 8;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.13;
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      drawCandles(0);
      drawGraphLine(height * 0.35, "#10b981", "#10b981");
      drawGraphLine(height * 0.55, "#22d3ee", "#22d3ee");
      drawGraphLine(height * 0.75, "#a3e635", "#a3e635");
      animationId = requestAnimationFrame(animate);
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
