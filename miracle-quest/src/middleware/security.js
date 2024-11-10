import { sanitizeInput } from '../utils/securityUtils';

export const validateFormInput = (formData) => {
    const sanitizedData = {};
    for (let [key, value] of Object.entries(formData)) {
        sanitizedData[key] = sanitizeInput(value);
    }
    return sanitizedData;
};

export const rateLimiter = (requestCount, timeWindow) => {
    const requests = new Map();
    
    return (userId) => {
        const now = Date.now();
        const userRequests = requests.get(userId) || [];
        const recentRequests = userRequests.filter(time => now - time < timeWindow);
        
        if (recentRequests.length >= requestCount) {
            return false;
        }
        
        recentRequests.push(now);
        requests.set(userId, recentRequests);
        return true;
    };
}; 