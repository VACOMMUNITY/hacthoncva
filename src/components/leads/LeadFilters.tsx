import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { LeadFilters as LeadFiltersType } from '@/hooks/useLeads';
import { useEvents } from '@/hooks/useEvents';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFiltersChange: (filters: LeadFiltersType) => void;
}

export const LeadFilters = ({ filters, onFiltersChange }: LeadFiltersProps) => {
  const { data: events } = useEvents(true);

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasFilters = Object.values(filters).some(v => v);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border border-border">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status || 'all'}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? undefined : v as any })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="registered">Registered</SelectItem>
          <SelectItem value="won">Won</SelectItem>
          <SelectItem value="lost">Lost</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.source || 'all'}
        onValueChange={(v) => onFiltersChange({ ...filters, source: v === 'all' ? undefined : v as any })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="website">Website</SelectItem>
          <SelectItem value="event">Event</SelectItem>
          <SelectItem value="referral">Referral</SelectItem>
          <SelectItem value="social_media">Social Media</SelectItem>
          <SelectItem value="walk_in">Walk-in</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.event_id || 'all'}
        onValueChange={(v) => onFiltersChange({ ...filters, event_id: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Event" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          {events?.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};
