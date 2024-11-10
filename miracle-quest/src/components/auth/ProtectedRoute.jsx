import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { rateLimiter } from '../../middleware/security';

const requestLimiter = rateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Rate limiting check
    if (!requestLimiter(user.uid)) {
        return <Navigate to="/error" state={{ message: 'Too many requests' }} />;
    }

    return children;
};

export default ProtectedRoute;