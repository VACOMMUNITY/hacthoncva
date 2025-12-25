import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadStatus, LeadSource } from '@/types/database';

interface LeadsByStatus {
  status: LeadStatus;
  count: number;
}

interface LeadsBySource {
  source: LeadSource;
  count: number;
}

interface LeadsByDate {
  date: string;
  count: number;
}

export const useLeadsByStatus = () => {
  return useQuery({
    queryKey: ['analytics', 'leads-by-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('status');
      
      if (error) throw error;

      const counts = data.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts).map(([status, count]) => ({
        status: status as LeadStatus,
        count,
      })) as LeadsByStatus[];
    },
  });
};

export const useLeadsBySource = () => {
  return useQuery({
    queryKey: ['analytics', 'leads-by-source'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('source');
      
      if (error) throw error;

      const counts = data.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts).map(([source, count]) => ({
        source: source as LeadSource,
        count,
      })) as LeadsBySource[];
    },
  });
};

export const useLeadsByEvent = () => {
  return useQuery({
    queryKey: ['analytics', 'leads-by-event'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          event_id,
          event:events(name)
        `)
        .not('event_id', 'is', null);
      
      if (error) throw error;

      const counts = data.reduce((acc, lead) => {
        const eventName = lead.event?.name || 'Unknown';
        acc[eventName] = (acc[eventName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts).map(([event, count]) => ({
        event,
        count,
      }));
    },
  });
};

export const useLeadsTrend = (days = 30) => {
  return useQuery({
    queryKey: ['analytics', 'leads-trend', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('leads')
        .select('created_at')
        .gte('created_at', startDate.toISOString());
      
      if (error) throw error;

      const counts = data.reduce((acc, lead) => {
        const date = new Date(lead.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as LeadsByDate[];
    },
  });
};

export const useLeadsCount = () => {
  return useQuery({
    queryKey: ['analytics', 'total-leads'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });
};

export const useNewLeadsToday = () => {
  return useQuery({
    queryKey: ['analytics', 'new-leads-today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
  });
};

export const useConversionRate = () => {
  return useQuery({
    queryKey: ['analytics', 'conversion-rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('status');
      
      if (error) throw error;

      const total = data.length;
      const won = data.filter(l => l.status === 'won').length;
      
      return total > 0 ? Math.round((won / total) * 100) : 0;
    },
  });
};
