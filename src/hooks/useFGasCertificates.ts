import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FGasCertificate {
  id: string;
  certificate_type: 'personal' | 'company';
  certificate_number: string;
  holder_name?: string;
  holder_user_id?: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending_renewal';
  issuing_authority?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  users?: { name: string; email: string } | null;
}

interface CreateCertificateData {
  certificate_type: 'personal' | 'company';
  certificate_number: string;
  holder_name?: string;
  holder_user_id?: string | null;
  issue_date: string;
  expiry_date: string;
  issuing_authority?: string;
  notes?: string;
}

export const useFGasCertificates = (filterType: 'personal' | 'company' | 'all' = 'all') => {
  return useQuery({
    queryKey: ['f-gas-certificates', filterType],
    queryFn: async () => {
      let query = supabase
        .from('f_gas_certificates')
        .select(`
          *,
          users:holder_user_id(name, email)
        `)
        .order('expiry_date', { ascending: true });

      if (filterType !== 'all') {
        query = query.eq('certificate_type', filterType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching certificates:', error);
        throw new Error(`Kunne ikke hente sertifikater: ${error.message}`);
      }

      // Transform the data to handle the users join properly
      const transformedData = data?.map(cert => ({
        ...cert,
        users: cert.users && typeof cert.users === 'object' && 'name' in cert.users && cert.users.name
          ? cert.users as { name: string; email: string }
          : null
      })) || [];

      return transformedData as FGasCertificate[];
    },
  });
};

export const useFGasCertificateStats = () => {
  return useQuery({
    queryKey: ['f-gas-certificate-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('f_gas_certificates')
        .select('status');

      if (error) {
        console.error('Error fetching certificate stats:', error);
        throw new Error(`Kunne ikke hente statistikk: ${error.message}`);
      }

      const stats = data.reduce((acc, cert) => {
        acc.total += 1;
        acc[cert.status] = (acc[cert.status] || 0) + 1;
        return acc;
      }, {
        total: 0,
        active: 0,
        expiring_soon: 0,
        expired: 0,
        pending_renewal: 0
      });

      return stats;
    },
  });
};

export const useExpiringCertificates = (daysAhead: number = 30) => {
  return useQuery({
    queryKey: ['expiring-certificates', daysAhead],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_expiring_certificates', { days_ahead: daysAhead });

      if (error) {
        console.error('Error fetching expiring certificates:', error);
        throw new Error(`Kunne ikke hente utløpende sertifikater: ${error.message}`);
      }

      return data;
    },
  });
};

export const useCreateFGasCertificate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCertificateData) => {
      if (!user) {
        throw new Error('Du må være logget inn for å opprette sertifikater');
      }

      const { data: certificate, error } = await supabase
        .from('f_gas_certificates')
        .insert({
          ...data,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating certificate:', error);
        throw new Error(`Kunne ikke opprette sertifikat: ${error.message}`);
      }

      return certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['f-gas-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['f-gas-certificate-stats'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-certificates'] });
    },
  });
};

export const useUpdateCertificateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('update_certificate_status');

      if (error) {
        console.error('Error updating certificate status:', error);
        throw new Error(`Kunne ikke oppdatere sertifikatstatus: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['f-gas-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['f-gas-certificate-stats'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-certificates'] });
    },
  });
};
