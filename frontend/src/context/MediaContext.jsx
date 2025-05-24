import React, { useState, useEffect } from 'react';

const MediaContext = React.createContext({
    getFullMediaUrl: (url) => url,
});

export const MediaProvider = ({ children }) => {
    const [mediaBaseUrl, setMediaBaseUrl] = useState('');

    useEffect(() => {
        // Dynamically determine the base URL from the current location
        const host = window.location.host;
        const protocol = window.location.protocol;

        // Set the media base URL to the current server
        setMediaBaseUrl(`${protocol}//${host}`);
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
    const context = React.useContext(MediaContext);
    if (context === undefined) {
        throw new Error('useMedia must be used within a MediaProvider');
    }
    return context;
};