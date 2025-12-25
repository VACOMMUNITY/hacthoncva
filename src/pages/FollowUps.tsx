import { PageHeader } from '@/components/layout/PageHeader';
import { useFollowUps, useCompleteFollowUp } from '@/hooks/useFollowUps';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Loader2, Bell } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Link } from 'react-router-dom';

const FollowUps = () => {
  const { data: followUps, isLoading } = useFollowUps();
  const completeFollowUp = useCompleteFollowUp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingFollowUps = followUps?.filter(f => !f.is_completed) || [];
  const completedFollowUps = followUps?.filter(f => f.is_completed) || [];

  const getStatusBadge = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <Badge variant="secondary" className="bg-success/10 text-success">Completed</Badge>;
    }
    if (isPast(new Date(dueDate)) && !isToday(new Date(dueDate))) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (isToday(new Date(dueDate))) {
      return <Badge variant="default" className="bg-warning/10 text-warning">Due Today</Badge>;
    }
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Track and manage your scheduled follow-ups."
      />

      {/* Pending Follow-ups */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending ({pendingFollowUps.length})
        </h2>

        {pendingFollowUps.length > 0 ? (
          <div className="space-y-3">
            {pendingFollowUps.map((followUp) => (
              <Card key={followUp.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{followUp.title}</h3>
                        {getStatusBadge(followUp.due_date, followUp.is_completed)}
                      </div>
                      {followUp.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {followUp.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Due: {format(new Date(followUp.due_date), 'PPP p')}</span>
                        {followUp.lead && (
                          <Link
                            to={`/leads/${followUp.lead.id}`}
                            className="text-primary hover:underline"
                          >
                            {followUp.lead.name}
                          </Link>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => completeFollowUp.mutate(followUp.id)}
                      disabled={completeFollowUp.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No pending follow-ups</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Follow-ups */}
      {completedFollowUps.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Completed ({completedFollowUps.length})
          </h2>

          <div className="space-y-3">
            {completedFollowUps.slice(0, 10).map((followUp) => (
              <Card key={followUp.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium line-through">{followUp.title}</h3>
                        {getStatusBadge(followUp.due_date, followUp.is_completed)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Completed: {followUp.completed_at && format(new Date(followUp.completed_at), 'PPP')}
                        </span>
                        {followUp.lead && (
                          <Link
                            to={`/leads/${followUp.lead.id}`}
                            className="text-primary hover:underline"
                          >
                            {followUp.lead.name}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
