import React, { useEffect, useRef } from 'react';

const DataFlow = ({ className }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let dataLines = [];
    
    // 設置 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      initDataLines();
    };
    
    // 初始化數據線
    const initDataLines = () => {
      dataLines = [];
      const lineCount = Math.floor(canvas.width / 40);
      
      for (let i = 0; i < lineCount; i++) {
        dataLines.push({
          x: Math.random() * canvas.width,
          segments: [],
          speed: Math.random() * 2 + 1,
          width: Math.random() * 2 + 0.5,
          hue: Math.random() * 60 + 180, // 藍綠色系
          lastSegmentTime: 0,
          segmentInterval: Math.random() * 500 + 200
        });
        
        // 初始化線段
        generateInitialSegments(dataLines[i]);
      }
    };
    
    // 為數據線生成初始線段
    const generateInitialSegments = (line) => {
      const segmentCount = Math.floor(Math.random() * 3) + 2;
      let y = -20;
      
      for (let i = 0; i < segmentCount; i++) {
        const length = Math.random() * 30 + 10;
        line.segments.push({
          y: y,
          length: length,
          alpha: Math.random() * 0.5 + 0.5
        });
        y -= length + Math.random() * 40 + 20;
      }
    };
    
    // 添加新線段
    const addSegment = (line) => {
      const now = Date.now();
      if (now - line.lastSegmentTime > line.segmentInterval) {
        line.lastSegmentTime = now;
        
        const lastSegment = line.segments[line.segments.length - 1];
        const y = lastSegment ? lastSegment.y - lastSegment.length - Math.random() * 40 - 20 : -20;
        
        line.segments.push({
          y: y,
          length: Math.random() * 30 + 10,
          alpha: Math.random() * 0.5 + 0.5
        });
      }
    };
    
    // 更新數據線
    const updateDataLines = () => {
      dataLines.forEach(line => {
        // 移動線段
        line.segments.forEach(segment => {
          segment.y += line.speed;
        });
        
        // 移除超出範圍的線段
        while (line.segments.length > 0 && line.segments[0].y > canvas.height) {
          line.segments.shift();
        }
        
        // 添加新線段
        addSegment(line);
        
        // 如果沒有線段了，重置這條線
        if (line.segments.length === 0) {
          line.x = Math.random() * canvas.width;
          generateInitialSegments(line);
        }
      });
    };
    
    // 繪製數據線
    const drawDataLines = () => {
      dataLines.forEach(line => {
        line.segments.forEach(segment => {
          const gradient = ctx.createLinearGradient(line.x, segment.y, line.x, segment.y + segment.length);
          gradient.addColorStop(0, `hsla(${line.hue}, 100%, 70%, 0)`);
          gradient.addColorStop(0.5, `hsla(${line.hue}, 100%, 70%, ${segment.alpha})`);
          gradient.addColorStop(1, `hsla(${line.hue}, 100%, 70%, 0)`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = line.width;
          ctx.beginPath();
          ctx.moveTo(line.x, segment.y);
          ctx.lineTo(line.x, segment.y + segment.length);
          ctx.stroke();
        });
      });
    };
    
    // 動畫循環
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updateDataLines();
      drawDataLines();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // 監聽視窗大小變化
    window.addEventListener('resize', resizeCanvas);
    
    // 初始化
    resizeCanvas();
    animate();
    
    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
    />
  );
};

export default DataFlow; 