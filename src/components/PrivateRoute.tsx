
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredTier?: 'basic' | 'premium' | 'elite';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children,
  requiredTier = 'basic'
}) => {
  const { isAuthenticated, isLoading, subscriptionTier } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check subscription tier requirements
  if (requiredTier === 'premium' && subscriptionTier === 'basic') {
    return <Navigate to="/subscription" />;
  }
  
  if (requiredTier === 'elite' && (subscriptionTier === 'basic' || subscriptionTier === 'premium')) {
    return <Navigate to="/subscription" />;
  }
  
  return <>{children}</>;
};

export default PrivateRoute;
