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

// Function to get CSRF token from cookies
const getCSRFToken = () => {
    // First try to get from meta tag
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    if (metaToken && metaToken.getAttribute('content')) {
        console.log('CSRF token from meta:', metaToken.getAttribute('content'));
        return metaToken.getAttribute('content');
    }

    // Fallback to cookie
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
    console.log('CSRF token from cookie:', cookieValue);
    return cookieValue;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set up axios defaults for CSRF
    useEffect(() => {
        // Add request interceptor to ensure CSRF token is always included
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = getCSRFToken();
                console.log('Request interceptor - CSRF token:', token);
                console.log('Request method:', config.method);
                console.log('Request URL:', config.url);

                if (token && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
                    config.headers['X-CSRFToken'] = token;
                    console.log('Added CSRF token to headers');
                }

                // Also try alternative header names
                if (token) {
                    config.headers['X-CSRFToken'] = token;
                    config.headers['HTTP_X_CSRFTOKEN'] = token;
                }

                console.log('Final headers:', config.headers);
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    const checkAuthStatus = async () => {
        try {
            console.log('Checking auth status...');
            const response = await axios.get('/api/auth/status/');
            console.log('Auth status response:', response.data);
            setUser(response.data);

            // Update CSRF token if provided
            if (response.data.csrf_token) {
                console.log('Updating CSRF token from response:', response.data.csrf_token);
                let metaTag = document.querySelector('meta[name="csrf-token"]');
                if (!metaTag) {
                    metaTag = document.createElement('meta');
                    metaTag.name = 'csrf-token';
                    document.head.appendChild(metaTag);
                }
                metaTag.setAttribute('content', response.data.csrf_token);
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
            console.log('Attempting logout...');
            const token = getCSRFToken();
            console.log('Logout CSRF token:', token);

            const response = await axios.post('/api/auth/logout/', {}, {
                headers: {
                    'X-CSRFToken': token,
                    'HTTP_X_CSRFTOKEN': token,
                }
            });
            console.log('Logout response:', response.data);
            setUser({ authenticated: false, is_staff: false });
            // Clear any cached data and reload
            window.location.reload();
        } catch (error) {
            console.error('Error logging out:', error);
            console.error('Error details:', error.response?.data);
            // Even if logout fails, clear local state
            setUser({ authenticated: false, is_staff: false });
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

// Add this temporarily to your browser console to debug CSRF issues
// Or add it to your AuthContext for testing

console.log('=== CSRF Debug Info ===');
console.log('Document cookies:', document.cookie);
console.log('Meta CSRF token:', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'));

// Function to get CSRF token
function getCSRFToken() {
    // Try meta tag first
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    if (metaToken && metaToken.getAttribute('content')) {
        return metaToken.getAttribute('content');
    }

    // Try cookie
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
}

console.log('CSRF token function result:', getCSRFToken());

// Test fetching CSRF token from the API
fetch('/api/auth/csrf/')
    .then(response => response.json())
    .then(data => {
        console.log('CSRF token from API:', data.csrf_token);

        // Now try to make an authenticated request
        return fetch('/api/auth/status/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': data.csrf_token,
            }
        });
    })
    .then(response => response.json())
    .then(data => {
        console.log('Auth status with CSRF:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });