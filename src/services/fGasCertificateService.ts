
import { supabase } from '@/integrations/supabase/client';

interface FGasCertificateData {
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

export const fGasCertificateService = {
  async fetchCertificates(filterType: 'personal' | 'company' | 'all' = 'all') {
    let query = supabase
      .from('f_gas_certificates')
      .select(`
        *,
        users!holder_user_id(name, email)
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

    return data || [];
  },

  async fetchCertificateStats() {
    const { data, error } = await supabase
      .from('f_gas_certificates')
      .select('status');

    if (error) {
      console.error('Error fetching certificate stats:', error);
      throw new Error(`Kunne ikke hente statistikk: ${error.message}`);
    }

    return data || [];
  },

  async fetchExpiringCertificates(daysAhead: number = 30) {
    const { data, error } = await supabase
      .rpc('get_expiring_certificates', { days_ahead: daysAhead });

    if (error) {
      console.error('Error fetching expiring certificates:', error);
      throw new Error(`Kunne ikke hente utløpende sertifikater: ${error.message}`);
    }

    return data || [];
  },

  async createCertificate(data: FGasCertificateData, userId: string) {
    const { data: certificate, error } = await supabase
      .from('f_gas_certificates')
      .insert({
        ...data,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating certificate:', error);
      throw new Error(`Kunne ikke opprette sertifikat: ${error.message}`);
    }

    return certificate;
  },

  async updateCertificateStatus() {
    const { error } = await supabase.rpc('update_certificate_status');

    if (error) {
      console.error('Error updating certificate status:', error);
      throw new Error(`Kunne ikke oppdatere sertifikatstatus: ${error.message}`);
    }
  }
};
