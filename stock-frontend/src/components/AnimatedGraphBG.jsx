import { useEffect, useRef } from "react";

const AnimatedGraphBG = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const points = [];
    const pointCount = 60;

    for (let i = 0; i < pointCount; i++) {
      points.push({
        x: (width / pointCount) * i,
        y: height / 2 + Math.sin(i * 0.5) * 50,
        speed: 0.02 + Math.random() * 0.02,
      });
    }

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);

    let animationFrame;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      points.forEach((point, index) => {
        point.y =
          height / 2 +
          Math.sin(Date.now() * point.speed + index) * 60;

        ctx.lineTo(point.x, point.y);
      });

      ctx.strokeStyle = "rgba(16,185,129,0.8)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(16,185,129,0.8)";
      ctx.shadowBlur = 20;
      ctx.stroke();

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default AnimatedGraphBG;