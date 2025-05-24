
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

const ClaimDetail = () => {
  const { id } = useParams();

  if (!id) {
    return <div>Reklamasjon ikke funnet</div>;
  }

  // Mock claim data - in a real app this would come from a hook
  const mockClaim = {
    id,
    customer_name: 'TM Service Oslo',
    customer_no: 'K001',
    department: 'Service',
    machine_model: 'Comenda FC45',
    machine_serial: 'MS123456',
    warranty: false,
    quantity: 1,
    category: 'ServiceJobb',
    description: 'Detaljert beskrivelse av reklamasjonen...',
    visma_order_no: 'VO-2024-001',
    customer_po: 'PO-2024-001',
    reported_by: 'John Doe',
    internal_note: 'Interne notater om reklamasjonen...',
    status: 'Ny'
  };

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
          <EditableClaimOverview claim={mockClaim} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <ClaimTimeline claimId={id} />
          </div>
        </TabsContent>

        <TabsContent value="costs" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <ClaimCosts claimId={id} />
          </div>
        </TabsContent>

        <TabsContent value="credits" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <ClaimCredits claimId={id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimDetail;
