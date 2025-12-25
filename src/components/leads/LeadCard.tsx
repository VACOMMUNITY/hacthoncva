import { Lead } from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { SourceBadge } from './SourceBadge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface LeadCardProps {
  lead: Lead;
  draggable?: boolean;
}

export const LeadCard = ({ lead, draggable = false }: LeadCardProps) => {
  const initials = lead.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link to={`/leads/${lead.id}`}>
      <Card className={`kanban-card ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{lead.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <SourceBadge source={lead.source} />
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.mobile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{lead.mobile}</span>
            </div>
          )}
        </div>

        {lead.event && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
            <Calendar className="h-3 w-3" />
            <span className="truncate">{lead.event.name}</span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {format(new Date(lead.created_at), 'MMM d, yyyy')}
          </span>
          {lead.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-secondary">
                {lead.assignee.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </Card>
    </Link>
  );
};
