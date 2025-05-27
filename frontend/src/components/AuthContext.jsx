import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // For now, just simulate a logged-in staff user for testing
    const [user] = useState({
        username: 'admin',
        is_staff: true
    });
    const [editMode, setEditMode] = useState(false);

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const value = {
        user,
        editMode,
        toggleEditMode,
        isStaff: true,
        // Dummy functions for now
        login: () => ({ success: true }),
        logout: () => { }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};