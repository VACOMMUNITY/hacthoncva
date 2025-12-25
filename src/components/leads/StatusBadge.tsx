import { cn } from '@/lib/utils';
import { LeadStatus } from '@/types/database';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'status-new' },
  contacted: { label: 'Contacted', className: 'status-contacted' },
  qualified: { label: 'Qualified', className: 'status-qualified' },
  registered: { label: 'Registered', className: 'status-registered' },
  won: { label: 'Won', className: 'status-won' },
  lost: { label: 'Lost', className: 'status-lost' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
};
