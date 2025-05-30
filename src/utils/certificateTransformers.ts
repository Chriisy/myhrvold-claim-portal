
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
  category?: string;
  birth_date?: string;
  issued_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  users?: { name: string; email: string } | null;
}

export const certificateTransformers = {
  transformCertificateData(rawData: any[]): FGasCertificate[] {
    return rawData.map((cert) => ({
      ...cert,
      users: cert.users 
        ? { 
            name: cert.users.name, 
            email: cert.users.email 
          } 
        : null
    }));
  },

  calculateStats(certificates: any[]) {
    return certificates.reduce((acc, cert) => {
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
  }
};
