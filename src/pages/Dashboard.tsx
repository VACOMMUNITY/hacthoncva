import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadsByStatusChart, LeadsBySourceChart } from '@/components/dashboard/LeadsChart';
import { useLeadsCount, useNewLeadsToday, useConversionRate } from '@/hooks/useAnalytics';
import { useUpcomingFollowUps } from '@/hooks/useFollowUps';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, TrendingUp, Bell, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useCompleteFollowUp } from '@/hooks/useFollowUps';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { profile } = useAuth();
  const { data: totalLeads } = useLeadsCount();
  const { data: newToday } = useNewLeadsToday();
  const { data: conversionRate } = useConversionRate();
  const { data: upcomingFollowUps } = useUpcomingFollowUps();
  const completeFollowUp = useCompleteFollowUp();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'User'}!`}
        description="Here's an overview of your leads and activities."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={totalLeads || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="New Today"
          value={newToday || 0}
          icon={<UserPlus className="h-5 w-5" />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate || 0}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Follow-ups"
          value={upcomingFollowUps?.length || 0}
          icon={<Bell className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadsByStatusChart />
        <LeadsBySourceChart />
      </div>

      {/* Upcoming Follow-ups */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Upcoming Follow-ups</CardTitle>
          <Link to="/follow-ups">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingFollowUps && upcomingFollowUps.length > 0 ? (
            <div className="space-y-3">
              {upcomingFollowUps.slice(0, 5).map((followUp) => (
                <div
                  key={followUp.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{followUp.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{followUp.lead?.name}</span>
                      <span>•</span>
                      <span>{format(new Date(followUp.due_date), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => completeFollowUp.mutate(followUp.id)}
                    disabled={completeFollowUp.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No upcoming follow-ups
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
