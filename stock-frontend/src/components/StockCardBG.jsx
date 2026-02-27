import React, { useRef, useEffect } from "react";

// Animated mini stock chart background for each card
export default function StockCardBG({ bullish = true }) {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width = 320;
    let height = 80;
    canvas.width = width;
    canvas.height = height;

    function drawGraph() {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.beginPath();
      let base = bullish ? height * 0.7 : height * 0.3;
      ctx.moveTo(0, base);
      for (let x = 0; x <= width; x += 8) {
        let t = (Date.now() / 1200 + x / 60);
        let y = base + Math.sin(t) * 10 + Math.cos(t * 0.7) * 6 + (bullish ? -x * 0.08 : x * 0.08);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = bullish ? "#10b981" : "#ef4444";
      ctx.shadowColor = bullish ? "#10b981" : "#ef4444";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.22;
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      drawGraph();
      animationId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [bullish]);

  return (
    <canvas
      ref={ref}
      width={320}
      height={80}
      className="absolute left-0 bottom-0 w-full h-20 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  );
}
