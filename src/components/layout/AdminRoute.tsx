import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const [hasNotified, setHasNotified] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAdmin && !hasNotified) {
      toast({
        title: 'Access Restricted',
        description: 'You do not have permission to access the hackathon administration console.',
        variant: 'destructive',
      });
      setHasNotified(true);
    }
  }, [isLoading, isAdmin, hasNotified, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
