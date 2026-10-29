import React, { createContext, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [color, setColor] = useState("bg-[#002060]");

  const [language, setLanguage] = useState("en"); // Default language is English
  
  const setGlobalColor = (newColor) => {
    setColor(newColor);
  };

  const toggleColor = () => {
    setColor((prevColor) =>
      prevColor === "bg-white text-black"
        ? "bg-black text-white"
        : "bg-white text-black"
    );
  };

  const setGlobalLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <ThemeContext.Provider
      value={{
        color,
        setGlobalColor,
        language,
        setGlobalLanguage,
        toggleColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
