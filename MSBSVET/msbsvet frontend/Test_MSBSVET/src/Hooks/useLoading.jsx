import { useContext } from 'react';
import { LoadingContext } from '/src/Component/Context/LoadingProvider.jsx';

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

// Also provide as default export if needed
export default useLoading;