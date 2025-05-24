
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClaimTimeline } from '@/components/claim-detail/ClaimTimeline';
import { ClaimCosts } from '@/components/claim-detail/ClaimCosts';
import { ClaimCredits } from '@/components/claim-detail/ClaimCredits';

const ClaimDetail = () => {
  const { id } = useParams();

  if (!id) {
    return <div>Reklamasjon ikke funnet</div>;
  }

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
          <Card>
            <CardHeader>
              <CardTitle>Reklamasjon Detaljer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Grunnleggende informasjon</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span> 
                      <Badge className="bg-orange-100 text-orange-800">Ny</Badge>
                    </div>
                    <div><span className="font-medium">Kunde:</span> TM Service Oslo</div>
                    <div><span className="font-medium">Maskin:</span> Comenda FC45</div>
                    <div><span className="font-medium">Serienummer:</span> MS123456</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ansvarlige</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Tekniker:</span> Erik Moe</div>
                    <div><span className="font-medium">Selger:</span> Mylnvold AS</div>
                    <div><span className="font-medium">Leverandør:</span> Comenda</div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Beskrivelse</h3>
                <p className="text-gray-600">Detaljert visning av reklamasjon vil bli implementert i neste fase.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ClaimTimeline claimId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ClaimCosts claimId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ClaimCredits claimId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimDetail;
