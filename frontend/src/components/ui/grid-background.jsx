import React, { useEffect, useRef } from "react";
import { useTheme } from "../../components/theme-provider";

const GridBackground = ({ className }) => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    // 設置 canvas 尺寸為視窗大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // 初始化粒子
    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
        });
      }
    };

    // 繪製網格
    const drawGrid = () => {
      // 根據主題調整網格線透明度和顏色
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      // 深色模式下使用更高的透明度和更亮的顏色
      if (isDark) {
        ctx.strokeStyle = "rgba(180, 180, 255, 0.15)"; // 淺藍色，更高透明度
      } else {
        ctx.strokeStyle = "rgba(var(--grid-color), 0.1)";
      }

      ctx.lineWidth = 1;

      const gridSize = 30;
      const offsetX = (canvas.width / 2) % gridSize;
      const offsetY = (canvas.height / 2) % gridSize;

      // 繪製水平線
      for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 繪製垂直線
      for (let x = offsetX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    };

    // 繪製粒子
    const drawParticles = () => {
      // 根據主題調整粒子顏色
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (isDark) {
        ctx.fillStyle = "rgba(180, 180, 255, 0.6)"; // 淺藍色粒子，更高透明度
      } else {
        ctx.fillStyle = "rgba(var(--grid-color), 0.5)";
      }

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // 繪製連接線
    const drawConnections = () => {
      // 根據主題調整連接線顏色
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (isDark) {
        ctx.strokeStyle = "rgba(180, 180, 255, 0.2)"; // 淺藍色連接線，更高透明度
      } else {
        ctx.strokeStyle = "rgba(var(--grid-color), 0.15)";
      }

      ctx.lineWidth = 0.5;

      const maxDistance = 150;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // 更新粒子位置
    const updateParticles = () => {
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 邊界檢查
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx = -particle.vx;
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy = -particle.vy;
        }
      });
    };

    // 動畫循環
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid();
      updateParticles();
      drawParticles();
      drawConnections();

      animationFrameId = requestAnimationFrame(animate);
    };

    // 監聽視窗大小變化
    window.addEventListener("resize", resizeCanvas);

    // 初始化
    resizeCanvas();
    animate();

    // 清理
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]); // 添加 theme 作為依賴，當主題變化時重新渲染

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 -z-10 w-full h-full ${className}`}
      style={{
        "--grid-color": "var(--foreground)",
        opacity: theme === "dark" ? 0.6 : 0.4, // 深色模式下提高整體不透明度
      }}
    />
  );
};

export default GridBackground;
