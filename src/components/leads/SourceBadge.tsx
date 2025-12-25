import { cn } from '@/lib/utils';
import { LeadSource } from '@/types/database';
import { Globe, Calendar, Users, Share2, Footprints, MoreHorizontal } from 'lucide-react';

interface SourceBadgeProps {
  source: LeadSource;
  className?: string;
}

const sourceConfig: Record<LeadSource, { label: string; icon: typeof Globe }> = {
  website: { label: 'Website', icon: Globe },
  event: { label: 'Event', icon: Calendar },
  referral: { label: 'Referral', icon: Users },
  social_media: { label: 'Social Media', icon: Share2 },
  walk_in: { label: 'Walk-in', icon: Footprints },
  other: { label: 'Other', icon: MoreHorizontal },
};

export const SourceBadge = ({ source, className }: SourceBadgeProps) => {
  const config = sourceConfig[source];
  const Icon = config.icon;
  
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};
