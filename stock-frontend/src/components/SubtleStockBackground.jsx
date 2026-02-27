import React, { useEffect, useRef } from "react";

// Very slow, subtle animated background: floating stock icons and lines
const ICONS = [
  // SVG paths for stock/finance icons (briefcase, chart, dollar, etc.)
  // Only a few for demo; you can add more
  {
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z", // info/dot
    color: "rgba(16,185,129,0.13)"
  },
  {
    path: "M3 17v2c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2M16 11V7a4 4 0 00-8 0v4M12 17v-6", // briefcase
    color: "rgba(16,185,129,0.10)"
  },
  {
    path: "M4 12h16M12 4v16", // plus/cross
    color: "rgba(16,185,129,0.09)"
  }
];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

export default function SubtleStockBackground() {
  const ref = useRef();
  const icons = useRef([]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Generate floating icons
    icons.current = Array.from({ length: 8 }, (_, i) => ({
      icon: ICONS[i % ICONS.length],
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      size: randomBetween(60, 120),
      speed: randomBetween(0.03, 0.07),
      drift: randomBetween(-0.04, 0.04),
      angle: randomBetween(0, Math.PI * 2),
      rotateSpeed: randomBetween(-0.002, 0.002)
    }));

    function drawIcon(ctx, icon, x, y, size, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(size / 24, size / 24);
      ctx.beginPath();
      const path = new Path2D(icon.path);
      ctx.fillStyle = icon.color;
      ctx.fill(path);
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      // Draw floating icons
      for (const obj of icons.current) {
        drawIcon(ctx, obj.icon, obj.x, obj.y, obj.size, obj.angle);
      }
      // Draw faint horizontal lines
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, (i + 1) * height / 7);
        ctx.lineTo(width, (i + 1) * height / 7);
        ctx.strokeStyle = "rgba(16,185,129,0.06)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([8, 16]);
        ctx.stroke();
        ctx.restore();
      }
    }

    function animate() {
      for (const obj of icons.current) {
        obj.y -= obj.speed;
        obj.x += obj.drift;
        obj.angle += obj.rotateSpeed;
        if (obj.y + obj.size < 0) {
          obj.y = height + obj.size;
          obj.x = randomBetween(0, width);
        }
        if (obj.x < -obj.size) obj.x = width + obj.size;
        if (obj.x > width + obj.size) obj.x = -obj.size;
      }
      draw();
      requestAnimationFrame(animate);
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
