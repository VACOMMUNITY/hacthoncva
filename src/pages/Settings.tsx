import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Mail } from 'lucide-react';

const Settings = () => {
  const { profile, role } = useAuth();

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{profile?.full_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{profile?.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Permissions
            </CardTitle>
            <CardDescription>Your access level in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="default" className="text-sm capitalize">
                {role}
              </Badge>
            </div>

            <div className="space-y-3">
              {role === 'admin' ? (
                <>
                  <p className="text-sm text-muted-foreground">As an Admin, you can:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>View and manage all leads</li>
                    <li>Assign leads to coordinators</li>
                    <li>Create and manage events</li>
                    <li>View analytics and reports</li>
                    <li>Manage user roles</li>
                    <li>Delete leads and events</li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">As a Coordinator, you can:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>View leads assigned to you</li>
                    <li>Update lead status and notes</li>
                    <li>Schedule follow-ups</li>
                    <li>Create new leads</li>
                    <li>View events</li>
                  </ul>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
