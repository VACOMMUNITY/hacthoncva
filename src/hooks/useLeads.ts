import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export interface LeadFilters {
  status?: LeadStatus;
  source?: string;
  event_id?: string;
  assigned_to?: string;
  search?: string;
}

export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          event:events(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.source) {
        query = query.eq('source', filters.source as any);
      }
      if (filters?.event_id) {
        query = query.eq('event_id', filters.event_id);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,mobile.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Fetch assignee profiles separately
      const assigneeIds = [...new Set(data?.filter(l => l.assigned_to).map(l => l.assigned_to))] as string[];
      let assignees: Record<string, any> = {};
      
      if (assigneeIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', assigneeIds);
        
        if (profiles) {
          assignees = Object.fromEntries(profiles.map(p => [p.id, p]));
        }
      }

      return data?.map(lead => ({
        ...lead,
        assignee: lead.assigned_to ? assignees[lead.assigned_to] : null,
      })) as Lead[];
    },
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          event:events(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;

      // Fetch assignee if exists
      let assignee = null;
      if (data.assigned_to) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.assigned_to)
          .single();
        assignee = profile;
      }

      return { ...data, assignee } as Lead;
    },
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: Partial<Lead>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: lead.name!,
          email: lead.email!,
          mobile: lead.mobile,
          source: lead.source,
          status: lead.status,
          event_id: lead.event_id,
          assigned_to: lead.assigned_to,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Success', description: 'Lead created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({
          name: updates.name,
          email: updates.email,
          mobile: updates.mobile,
          source: updates.source,
          status: updates.status,
          event_id: updates.event_id,
          assigned_to: updates.assigned_to,
          payment_status: updates.payment_status,
          payment_amount: updates.payment_amount,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Success', description: 'Lead updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Success', description: 'Lead deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};
