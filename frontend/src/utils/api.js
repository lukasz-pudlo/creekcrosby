import axios from 'axios';

// Create axios instance with dynamic base URL
const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Set the base URL dynamically before each request
api.interceptors.request.use(
    (config) => {
        // Use the current location as the base URL
        config.baseURL = `${window.location.origin}`;

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