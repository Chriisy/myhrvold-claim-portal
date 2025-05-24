
import { useParams } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClaimTimeline } from '@/components/claim-detail/ClaimTimeline';
import { ClaimCosts } from '@/components/claim-detail/ClaimCosts';
import { ClaimCredits } from '@/components/claim-detail/ClaimCredits';
import { EditableClaimOverview } from '@/components/claim-detail/EditableClaimOverview';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ClaimDetail = () => {
  const { id } = useParams();

  // Try to get the actual claim data from the database
  const { data: claim, isLoading, error } = useQuery({
    queryKey: ['claim', id],
    queryFn: async () => {
      if (!id) return null;
      
      // First try to get by UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (isUUID) {
        const { data, error } = await supabase
          .from('claims')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // For now, we'll use the existing UUID since we don't have a claim_number field
        // You might want to add a claim_number field to your claims table
        const existingClaimId = 'a1468dd3-f579-4bdc-9fd4-4e1119c8d840';
        const { data, error } = await supabase
          .from('claims')
          .select('*')
          .eq('id', existingClaimId)
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    enabled: !!id
  });

  if (!id) {
    return <div>Reklamasjon ikke funnet</div>;
  }

  if (isLoading) {
    return <div>Laster reklamasjon...</div>;
  }

  if (error) {
    return <div>Kunne ikke laste reklamasjon</div>;
  }

  // Use actual claim data or fallback to mock data
  const claimData = claim || {
    id,
    customer_name: 'TM Service Oslo',
    customer_no: 'K001',
    department: 'Service',
    machine_model: 'Comenda FC45',
    machine_serial: 'MS123456',
    warranty: false,
    quantity: 1,
    category: 'ServiceJobb' as const,
    description: 'Detaljert beskrivelse av reklamasjonen...',
    visma_order_no: 'VO-2024-001',
    customer_po: 'PO-2024-001',
    reported_by: 'John Doe',
    internal_note: 'Interne notater om reklamasjonen...',
    status: 'Ny' as const
  };

  // Use the actual claim ID for timeline, costs, and credits
  const actualClaimId = claim?.id || 'a1468dd3-f579-4bdc-9fd4-4e1119c8d840';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Link to="/claims">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Reklamasjon {id}</h1>
          <p className="text-gray-600">Detaljer for reklamasjon</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="timeline">Tidslinje</TabsTrigger>
          <TabsTrigger value="costs">Kostnader</TabsTrigger>
          <TabsTrigger value="credits">Kreditnotaer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <EditableClaimOverview claim={claimData} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <ClaimTimeline claimId={actualClaimId} />
          </div>
        </TabsContent>

        <TabsContent value="costs" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <ClaimCosts claimId={actualClaimId} />
          </div>
        </TabsContent>

        <TabsContent value="credits" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <ClaimCredits claimId={actualClaimId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimDetail;
