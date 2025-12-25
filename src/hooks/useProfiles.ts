import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data as Profile[];
    },
  });
};

export const useCoordinators = () => {
  return useQuery({
    queryKey: ['coordinators'],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      const userIds = roles?.map(r => r.user_id) || [];
      
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
        .order('full_name');
      
      if (profilesError) throw profilesError;

      return profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.id)?.role || 'coordinator',
      })) || [];
    },
  });
};
