import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const [hasNotified, setHasNotified] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && (!user || !isAdmin) && !hasNotified) {
      toast({
        title: 'Admin Access Required',
        description: 'Please sign in with administrator credentials (admin / admin123).',
        variant: 'destructive',
      });
      setHasNotified(true);
    }
  }, [isLoading, user, isAdmin, hasNotified, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
