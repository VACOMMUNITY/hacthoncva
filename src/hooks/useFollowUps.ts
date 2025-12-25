import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FollowUp, Lead } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useFollowUps = (leadId?: string) => {
  return useQuery({
    queryKey: ['follow-ups', leadId],
    queryFn: async () => {
      let query = supabase
        .from('follow_ups')
        .select('*')
        .order('due_date', { ascending: true });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Fetch leads separately
      const leadIds = [...new Set(data?.map(f => f.lead_id))] as string[];
      let leads: Record<string, Lead> = {};
      
      if (leadIds.length > 0) {
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .in('id', leadIds);
        
        if (leadsData) {
          leads = Object.fromEntries(leadsData.map(l => [l.id, l as Lead]));
        }
      }

      return data?.map(followUp => ({
        ...followUp,
        lead: leads[followUp.lead_id],
      })) as FollowUp[];
    },
  });
};

export const useUpcomingFollowUps = () => {
  return useQuery({
    queryKey: ['upcoming-follow-ups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('is_completed', false)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(10);
      
      if (error) throw error;

      // Fetch leads separately
      const leadIds = [...new Set(data?.map(f => f.lead_id))] as string[];
      let leads: Record<string, Lead> = {};
      
      if (leadIds.length > 0) {
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .in('id', leadIds);
        
        if (leadsData) {
          leads = Object.fromEntries(leadsData.map(l => [l.id, l as Lead]));
        }
      }

      return data?.map(followUp => ({
        ...followUp,
        lead: leads[followUp.lead_id],
      })) as FollowUp[];
    },
  });
};

export const useCreateFollowUp = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (followUp: { lead_id: string; title: string; description?: string | null; due_date: string; assigned_to?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          lead_id: followUp.lead_id,
          title: followUp.title,
          description: followUp.description,
          due_date: followUp.due_date,
          assigned_to: followUp.assigned_to || user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-follow-ups'] });
      toast({ title: 'Success', description: 'Follow-up created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateFollowUp = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FollowUp> & { id: string }) => {
      const { data, error } = await supabase
        .from('follow_ups')
        .update({
          title: updates.title,
          description: updates.description,
          due_date: updates.due_date,
          is_completed: updates.is_completed,
          completed_at: updates.completed_at,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-follow-ups'] });
      toast({ title: 'Success', description: 'Follow-up updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useCompleteFollowUp = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('follow_ups')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-follow-ups'] });
      toast({ title: 'Success', description: 'Follow-up completed!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
