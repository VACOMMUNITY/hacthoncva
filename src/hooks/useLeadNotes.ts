import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadNote, Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useLeadNotes = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(data?.map(n => n.user_id))] as string[];
      let users: Record<string, Profile> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);
        
        if (profiles) {
          users = Object.fromEntries(profiles.map(p => [p.id, p]));
        }
      }

      return data?.map(note => ({
        ...note,
        user: users[note.user_id],
      })) as LeadNote[];
    },
    enabled: !!leadId,
  });
};

export const useCreateLeadNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ leadId, content }: { leadId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          user_id: user.id,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
      toast({ title: 'Success', description: 'Note added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
