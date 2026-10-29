import { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicKey } from "../lib/services/securityService";
import { setPublicKey, clearPublicKey } from "../lib/api/authService";

const PublicKeyContext = createContext(null);

export const PublicKeyProvider = ({ children }) => {
    const {
        data: publicKey,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["publicKey"],
        queryFn: fetchPublicKey,
        staleTime: Infinity,   
        cacheTime: Infinity,   
        retry: 1
    });

    // Inject into agent when available
    useEffect(() => {
        debugger;
        if (publicKey) {
            setPublicKey(publicKey);
        }

        return () => {
            clearPublicKey();
        };
    }, [publicKey]);

    if (isError) {
    }

    return (
        <PublicKeyContext.Provider
            value={{
                publicKey,
                loading: isLoading
            }}
        >
            {children}
        </PublicKeyContext.Provider>
    );
};

export const usePublicKey = () => useContext(PublicKeyContext);