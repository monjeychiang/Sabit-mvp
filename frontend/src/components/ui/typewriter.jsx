import React, { useState, useEffect } from "react";

const Typewriter = ({
  text,
  delay = 50,
  className = "",
  cursorClassName = "",
  showCursor = true,
  onComplete = () => {},
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete();
    }
  }, [currentIndex, delay, text, isComplete, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <span
          className={`inline-block animate-blink ${cursorClassName}`}
          style={{ animationDuration: "1s" }}
        >
          |
        </span>
      )}
    </span>
  );
};

export { Typewriter };
