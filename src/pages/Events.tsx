import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EventFormDialog } from '@/components/events/EventFormDialog';
import { useEvents, useDeleteEvent } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Calendar, MapPin, Edit, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/types/database';

const Events = () => {
  const { isAdmin } = useAuth();
  const { data: events, isLoading } = useEvents();
  const deleteEvent = useDeleteEvent();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingEvent(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Events"
        description="Manage cultural events and workshops."
        actions={
          isAdmin && (
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )
        }
      />

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{event.name}</h3>
                      <Badge variant={event.is_active ? 'default' : 'secondary'}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {event.event_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(event.event_date), 'PPP p')}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.event_type && (
                        <Badge variant="outline" className="text-xs">
                          {event.event_type}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{event.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEvent.mutate(event.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event to start capturing leads.
            </p>
            {isAdmin && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <EventFormDialog
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        event={editingEvent}
      />
    </div>
  );
};

export default Events;
