import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        // Add CSRF token to headers for POST, PUT, PATCH, DELETE requests
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
            config.headers['X-CSRFToken'] = csrfToken;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// API helper functions
export const fetchEvents = () => api.get('/api/events/');
export const fetchBandMembers = () => api.get('/api/band/');
export const fetchAboutSections = () => api.get('/api/about/');
export const fetchContactInfo = () => api.get('/api/contact/');

export const submitContactForm = (formData) => api.post('/api/contact-form/', formData);

export default api;