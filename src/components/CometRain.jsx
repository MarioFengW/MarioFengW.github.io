import React, { useEffect, useRef } from "react";

// Fondo de lluvia de cometas lenta, color #657ea4 (versión de línea con estela).
export default function CometRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let comets = [];

    const COLOR = "101, 126, 164"; // #657ea4 en rgb

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
    }

    function newComet() {
      return {
        x: Math.random() * canvas.width * 1.3,
        y: -20,
        len: Math.random() * 70 + 50,
        speed: Math.random() * 3 + 2,
        angle: Math.PI / 4,
        alpha: Math.random() * 0.4 + 0.4,
      };
    }

    function init() {
      resize();
      comets = Array.from({ length: 30 }, () => {
        const c = newComet();
        c.y = Math.random() * canvas.height;
        return c;
      });
    }

    function draw() {
      ctx.fillStyle = "rgba(11, 15, 20, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      comets.forEach((c) => {
        c.x -= Math.cos(c.angle) * c.speed;
        c.y += Math.sin(c.angle) * c.speed;

        if (c.y > canvas.height + 20 || c.x < -100) {
          Object.assign(c, newComet());
        }

        const tailX = c.x + Math.cos(c.angle) * c.len;
        const tailY = c.y - Math.sin(c.angle) * c.len;

        const grad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
        grad.addColorStop(0, `rgba(${COLOR}, ${c.alpha})`);
        grad.addColorStop(1, `rgba(${COLOR}, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLOR}, ${c.alpha})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}