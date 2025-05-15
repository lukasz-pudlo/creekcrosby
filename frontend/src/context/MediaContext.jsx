import React, { createContext, useContext, useState, useEffect } from 'react';

const MediaContext = createContext({
    getFullMediaUrl: (url) => url,
});

export const MediaProvider = ({ children }) => {
    const [mediaBaseUrl, setMediaBaseUrl] = useState('');

    useEffect(() => {
        // Set the base URL for media files
        setMediaBaseUrl('http://localhost:8000');
    }, []);

    // Create the context value object
    const contextValue = {
        getFullMediaUrl: (url) => {
            if (!url) return null;
            if (url.startsWith('http')) return url;
            return `${mediaBaseUrl}${url}`;
        }
    };

    return (
        <MediaContext.Provider value={contextValue}>
            {children}
        </MediaContext.Provider>
    );
};

// Export the hook with a clear error message if used outside the provider
export const useMedia = () => {
    const context = useContext(MediaContext);
    if (context === undefined) {
        throw new Error('useMedia must be used within a MediaProvider');
    }
    return context;
};