import React, { createContext, useState } from "react";

// Export the context so it can be imported elsewhere
export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const startLoading = () => setLoading(true);
    const stopLoading = () => setLoading(false);
    return (
        <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

// Optional default export
export default LoadingProvider; 