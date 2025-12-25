import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/leads/StatusBadge';
import { SourceBadge } from '@/components/leads/SourceBadge';
import { LeadFormDialog } from '@/components/leads/LeadFormDialog';
import { FollowUpFormDialog } from '@/components/followups/FollowUpFormDialog';
import { useLead, useDeleteLead } from '@/hooks/useLeads';
import { useLeadNotes, useCreateLeadNote } from '@/hooks/useLeadNotes';
import { useLeadActivities } from '@/hooks/useLeadActivities';
import { useFollowUps, useCompleteFollowUp } from '@/hooks/useFollowUps';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  Bell,
  CheckCircle,
  Loader2,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: lead, isLoading } = useLead(id!);
  const { data: notes } = useLeadNotes(id!);
  const { data: activities } = useLeadActivities(id!);
  const { data: followUps } = useFollowUps(id);
  const deleteLead = useDeleteLead();
  const createNote = useCreateLeadNote();
  const completeFollowUp = useCompleteFollowUp();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  if (isLoading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteLead.mutateAsync(lead.id);
    navigate('/leads');
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await createNote.mutateAsync({ leadId: lead.id, content: newNote });
    setNewNote('');
  };

  const initials = lead.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={lead.name}
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsFollowUpOpen(true)}>
                <Bell className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this lead? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{lead.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={lead.status} />
                  <SourceBadge source={lead.source} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>
                {lead.mobile && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${lead.mobile}`} className="text-primary hover:underline">
                      {lead.mobile}
                    </a>
                  </div>
                )}
                {lead.event && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.event.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Created {format(new Date(lead.created_at), 'PPP')}</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
                <Badge
                  variant={lead.payment_status === 'paid' ? 'default' : 'secondary'}
                  className={
                    lead.payment_status === 'paid'
                      ? 'bg-success/10 text-success'
                      : ''
                  }
                >
                  {lead.payment_status}
                </Badge>
                {lead.payment_amount && (
                  <p className="text-sm mt-2">Amount: ₹{lead.payment_amount}</p>
                )}
              </div>

              {/* Assigned To */}
              {lead.assignee && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Assigned To</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-secondary">
                        {lead.assignee.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{lead.assignee.full_name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow-ups */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followUps && followUps.length > 0 ? (
                <div className="space-y-3">
                  {followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className={`p-3 rounded-lg ${followUp.is_completed ? 'bg-muted/30' : 'bg-muted/50'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={followUp.is_completed ? 'line-through opacity-60' : ''}>
                          <p className="font-medium text-sm">{followUp.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(followUp.due_date), 'PPP p')}
                          </p>
                        </div>
                        {!followUp.is_completed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => completeFollowUp.mutate(followUp.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No follow-ups scheduled
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Note */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || createNote.isPending}
                >
                  {createNote.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Add'
                  )}
                </Button>
              </div>

              {notes && notes.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{note.user?.full_name}</span>
                        <span>•</span>
                        <span>{format(new Date(note.created_at), 'PPP p')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {index < activities.length - 1 && (
                          <div className="w-px h-full bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {activity.user && <span>{activity.user.full_name}</span>}
                          <span>•</span>
                          <span>{format(new Date(activity.created_at), 'PPP p')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No activity yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <LeadFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} lead={lead} />
      <FollowUpFormDialog open={isFollowUpOpen} onOpenChange={setIsFollowUpOpen} leadId={lead.id} />
    </div>
  );
};

export default LeadDetail;
