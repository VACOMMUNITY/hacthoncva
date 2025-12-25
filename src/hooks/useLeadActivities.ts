import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadActivity, Profile } from '@/types/database';

export const useLeadActivities = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(data?.filter(a => a.user_id).map(a => a.user_id))] as string[];
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

      return data?.map(activity => ({
        ...activity,
        user: activity.user_id ? users[activity.user_id] : null,
      })) as LeadActivity[];
    },
    enabled: !!leadId,
  });
};
