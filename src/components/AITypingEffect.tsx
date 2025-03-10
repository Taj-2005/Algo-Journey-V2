"use client";
import { useEffect, useRef, useState } from "react";

export const AITypingEffect = ({
  text,
  className,
  duration = 0.01, // Faster effect for typing animation
}: {
  text: string;
  className?: string;
  duration?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Reset text when new text is provided
    setDisplayedText("");
    
    if (!text) return;
    
    const characters = text.split("");
    let currentText = "";
    let timeouts: NodeJS.Timeout[] = [];

    // Animate typing effect one character at a time
    characters.forEach((char, index) => {
      const timeout = setTimeout(() => {
        currentText += char;
        setDisplayedText(currentText);
        
        // Auto-adjust textarea height if needed
        if (textAreaRef.current) {
          textAreaRef.current.style.height = "auto";
          textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
      }, index * (duration * 1000)); // Control typing speed
      
      timeouts.push(timeout);
    });

    // Cleanup function to clear timeouts if component unmounts during animation
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [text, duration]);

  return (
    <div className="w-full">
      <textarea
        ref={textAreaRef}
        value={displayedText}
        readOnly
        className="w-full bg-transparent border-none outline-none resize-none overflow-hidden p-0"
        style={{ 
          whiteSpace: "pre-wrap",
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "inherit",
          width: "100%",
        }}
      />
    </div>
  );
};