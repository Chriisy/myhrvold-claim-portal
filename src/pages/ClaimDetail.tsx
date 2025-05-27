
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
import { useClaimQuery } from '@/hooks/useClaimsQuery';
import { usePermissions } from '@/hooks/usePermissions';

const ClaimDetail = () => {
  const { id } = useParams();
  const { canEditAllClaims, canEditOwnClaims, user } = usePermissions();

  const { data: claim, isLoading, error } = useClaimQuery(id || '');

  if (!id) {
    return (
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-myhrvold-primary">Reklamasjon ikke funnet</h1>
            <p className="text-gray-600">Ugyldig reklamasjons-ID</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-myhrvold-primary">Laster reklamasjon...</h1>
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
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <Link to="/claims">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-myhrvold-primary">Kunne ikke laste reklamasjon</h1>
            <p className="text-gray-600">Reklamasjonen ble ikke funnet eller du har ikke tilgang</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if improvement tab should be visible
  const canEdit = canEditAllClaims() || (canEditOwnClaims() && claim.created_by === user?.id);
  const shouldShowImprovementTab = canEdit || ['Godkjent', 'Avslått', 'Bokført', 'Lukket'].includes(claim.status || '');

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <Link to="/claims">
            <Button variant="outline" size="sm" className="lg:px-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake
            </Button>
          </Link>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-myhrvold-primary">Reklamasjon {id}</h1>
          <p className="text-gray-600 text-sm lg:text-base">
            {claim.customer_name} - {claim.machine_model}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={`grid w-full ${shouldShowImprovementTab ? 'grid-cols-3 lg:grid-cols-6' : 'grid-cols-3 lg:grid-cols-5'}`}>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="files">Vedlegg</TabsTrigger>
          <TabsTrigger value="timeline">Tidslinje</TabsTrigger>
          <TabsTrigger value="costs">Kostnader</TabsTrigger>
          <TabsTrigger value="credits">Kreditnotaer</TabsTrigger>
          {shouldShowImprovementTab && (
            <TabsTrigger value="improvement">Tiltak & Forbedring</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6 lg:mt-8">
          <EditableClaimOverview claim={claim} />
        </TabsContent>

        <TabsContent value="files" className="mt-6 lg:mt-8">
          <ClaimFiles claimId={claim.id} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6 lg:mt-8">
          <div className="bg-white rounded-lg border p-6 lg:p-8">
            <ClaimTimeline claimId={claim.id} />
          </div>
        </TabsContent>

        <TabsContent value="costs" className="mt-6 lg:mt-8">
          <div className="bg-white rounded-lg border p-6 lg:p-8">
            <ClaimCosts claimId={claim.id} />
          </div>
        </TabsContent>

        <TabsContent value="credits" className="mt-6 lg:mt-8">
          <div className="bg-white rounded-lg border p-6 lg:p-8">
            <ClaimCredits claimId={claim.id} />
          </div>
        </TabsContent>

        {shouldShowImprovementTab && (
          <TabsContent value="improvement" className="mt-6 lg:mt-8">
            <ImprovementTab claim={claim} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ClaimDetail;
