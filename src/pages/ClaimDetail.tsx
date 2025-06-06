
import { useParams } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClaimTimeline } from '@/components/claim-detail/ClaimTimeline';
import ClaimCosts from '@/components/claim-detail/ClaimCosts';
import ClaimCredits from '@/components/claim-detail/ClaimCredits';
import { ClaimFiles } from '@/components/claim-detail/ClaimFiles';
import { EditableClaimOverview } from '@/components/claim-detail/EditableClaimOverview';
import { ImprovementTab } from '@/components/claim-detail/ImprovementTab';
import { useClaimQuery } from '@/hooks/queries/useClaimsQuery';
import { usePermissions } from '@/hooks/usePermissions';

const ClaimDetail = () => {
  const { id } = useParams();
  const { canEditAllClaims, canEditOwnClaims, user } = usePermissions();

  const { data: claim, isLoading, error } = useClaimQuery(id || '');

  if (!id) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Reklamasjon ikke funnet</h1>
            <p className="text-gray-600">Ugyldig reklamasjons-ID</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Laster reklamasjon...</h1>
            <p className="text-gray-600">Henter data fra databasen</p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-myhrvold-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !claim) {
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
            <h1 className="text-3xl font-bold text-myhrvold-primary">Kunne ikke laste reklamasjon</h1>
            <p className="text-gray-600">Reklamasjonen ble ikke funnet eller du har ikke tilgang</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if improvement tab should be visible
  const canEdit = canEditAllClaims() || (canEditOwnClaims() && claim.created_by === user?.id);
  const shouldShowImprovementTab = canEdit || ['Godkjent', 'Avslått', 'Bokført', 'Lukket'].includes(claim.status || '');

  const displayTitle = claim.display_id || id;

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
          <h1 className="text-3xl font-bold text-myhrvold-primary">Reklamasjon {displayTitle}</h1>
          <p className="text-gray-600">
            {claim.customer_name} - {claim.machine_model}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={`grid w-full ${shouldShowImprovementTab ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="files">Vedlegg</TabsTrigger>
          <TabsTrigger value="timeline">Tidslinje</TabsTrigger>
          <TabsTrigger value="costs">Kostnader</TabsTrigger>
          <TabsTrigger value="credits">Kreditnotaer</TabsTrigger>
          {shouldShowImprovementTab && (
            <TabsTrigger value="improvement">Tiltak & Forbedring</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <EditableClaimOverview claim={claim} />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <ClaimFiles claimId={claim.id} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <ClaimTimeline claimId={claim.id} />
          </div>
        </TabsContent>

        <TabsContent value="costs" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <ClaimCosts claimId={claim.id} />
          </div>
        </TabsContent>

        <TabsContent value="credits" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <ClaimCredits claimId={claim.id} />
          </div>
        </TabsContent>

        {shouldShowImprovementTab && (
          <TabsContent value="improvement" className="mt-6">
            <ImprovementTab claim={claim} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ClaimDetail;
