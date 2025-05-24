import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Function to get CSRF token from cookie
const getCSRFTokenFromCookie = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState(null);

    // Get CSRF token on app load
    useEffect(() => {
        const initializeCSRF = async () => {
            try {
                // Make a simple GET request to get CSRF cookie set
                await axios.get('/api/auth/csrf/');
                // Then get the token from the cookie
                const token = getCSRFTokenFromCookie();
                setCsrfToken(token);
            } catch (error) {
                console.error('Error initializing CSRF:', error);
            }
        };

        initializeCSRF();
    }, []);

    // Set up axios interceptor for CSRF
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                // Get current token (either from state or cookie)
                const token = csrfToken || getCSRFTokenFromCookie();

                // Add CSRF token to headers for state-changing requests
                if (token && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
                    config.headers['X-CSRFToken'] = token;
                }

                // Ensure credentials are included for CSRF cookies
                config.withCredentials = true;

                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, [csrfToken]);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('/api/auth/status/', {
                withCredentials: true
            });
            setUser(response.data);

            // Update CSRF token if provided in response
            if (response.data.csrf_token) {
                setCsrfToken(response.data.csrf_token);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setUser({ authenticated: false, is_staff: false });
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout/', {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setUser({ authenticated: false, is_staff: false });
            setCsrfToken(null);
            window.location.reload();
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const value = {
        user,
        loading,
        checkAuthStatus,
        logout,
        isStaff: user?.is_staff || false,
        isAuthenticated: user?.authenticated || false,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};