
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProtectedRoute - User:', user?.email, 'IsAdmin:', isAdmin, 'RequireAdmin:', requireAdmin, 'Loading:', loading);
    
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to auth');
        navigate("/auth");
      } else if (requireAdmin && !isAdmin) {
        console.log('Admin required but user is not admin, redirecting to dashboard');
        navigate("/dashboard");
      }
    }
  }, [user, loading, isAdmin, requireAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário ou se precisa de admin mas não é admin, não renderiza nada
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
