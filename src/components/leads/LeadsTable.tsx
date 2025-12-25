import { Lead } from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { SourceBadge } from './SourceBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
}

export const LeadsTable = ({ leads, isLoading }: LeadsTableProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">No leads found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Lead</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{lead.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{lead.email}</div>
                  {lead.mobile && (
                    <div className="text-muted-foreground">{lead.mobile}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <SourceBadge source={lead.source} />
              </TableCell>
              <TableCell>
                {lead.event ? (
                  <span className="text-sm">{lead.event.name}</span>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell>
                {lead.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-secondary">
                        {lead.assignee.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{lead.assignee.full_name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={lead.payment_status === 'paid' ? 'default' : 'secondary'}
                  className={
                    lead.payment_status === 'paid'
                      ? 'bg-success/10 text-success hover:bg-success/20'
                      : ''
                  }
                >
                  {lead.payment_status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(lead.created_at), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
