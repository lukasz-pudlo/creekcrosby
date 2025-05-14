/**
 * Format date to UK format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string (DD/MM/YYYY)
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Format time in 24-hour format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted time string (HH:MM)
 */
export const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Truncate text and add ellipsis if it exceeds max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};