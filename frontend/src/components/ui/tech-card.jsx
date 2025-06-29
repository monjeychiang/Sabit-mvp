import React from "react";
import { Card } from "./card";

const TechCard = ({ children, className = "", ...props }) => {
  return (
    <div className={`relative ${className}`}>
      {/* 卡片內容 */}
      <Card
        className="relative z-10 border bg-background/80 backdrop-blur-sm"
        {...props}
      >
        {children}
      </Card>
    </div>
  );
};

export { TechCard };
