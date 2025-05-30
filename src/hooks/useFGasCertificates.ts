
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fGasCertificateService } from '@/services/fGasCertificateService';
import { certificateTransformers } from '@/utils/certificateTransformers';

interface CreateCertificateData {
  certificate_type: 'personal' | 'company';
  certificate_number: string;
  holder_name?: string;
  holder_user_id?: string | null;
  issue_date: string;
  expiry_date: string;
  issuing_authority?: string;
  notes?: string;
  category?: string;
  birth_date?: string;
  issued_date?: string;
}

export const useFGasCertificates = (filterType: 'personal' | 'company' | 'all' = 'all') => {
  return useQuery({
    queryKey: ['f-gas-certificates', filterType],
    queryFn: async () => {
      const rawData = await fGasCertificateService.fetchCertificates(filterType);
      return certificateTransformers.transformCertificateData(rawData);
    },
  });
};

export const useFGasCertificateStats = () => {
  return useQuery({
    queryKey: ['f-gas-certificate-stats'],
    queryFn: async () => {
      const data = await fGasCertificateService.fetchCertificateStats();
      return certificateTransformers.calculateStats(data);
    },
  });
};

export const useExpiringCertificates = (daysAhead: number = 30) => {
  return useQuery({
    queryKey: ['expiring-certificates', daysAhead],
    queryFn: () => fGasCertificateService.fetchExpiringCertificates(daysAhead),
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
      return fGasCertificateService.createCertificate(data, user.id);
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
    mutationFn: () => fGasCertificateService.updateCertificateStatus(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['f-gas-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['f-gas-certificate-stats'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-certificates'] });
    },
  });
};
