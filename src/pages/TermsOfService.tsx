
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-myhrvold-bg p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til hovedsiden
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Brukervilkår</h1>
          <p className="text-gray-600 mt-2">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
          </p>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">1. Aksept av vilkår</h2>
            <p className="text-gray-700 leading-relaxed">
              Ved å bruke Myhrvold Reklamasjonsportal ("Tjenesten") aksepterer du å være bundet av disse brukervilkårene. 
              Hvis du ikke godtar disse vilkårene, skal du ikke bruke Tjenesten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">2. Beskrivelse av tjenesten</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Myhrvold Reklamasjonsportal er en webbasert plattform for håndtering av reklamasjoner, 
              garantisaker og kundehenvendelser. Tjenesten inkluderer:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Registrering og sporing av reklamasjoner</li>
              <li>Dokumenthåndtering og filvedlegg</li>
              <li>Kommunikasjon med kunder og leverandører</li>
              <li>Rapportering og analyse</li>
              <li>Brukeradministrasjon og tilgangskontroll</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">3. Brukerkontoer og tilgang</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">3.1 Kontokrav</h3>
                <p className="text-gray-700">
                  For å bruke Tjenesten må du ha en gyldig brukerkonto opprettet av Myhrvold AS. 
                  Du er ansvarlig for å opprettholde konfidensialiteten til dine påloggingsopplysninger.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">3.2 Autorisert bruk</h3>
                <p className="text-gray-700">
                  Tjenesten er kun tilgjengelig for autoriserte brukere, inkludert Myhrvold-ansatte, 
                  partnere og kunder som har fått tildelt tilgang.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">3.3 Kontosikkerhet</h3>
                <p className="text-gray-700">
                  Du er ansvarlig for all aktivitet som skjer under din konto. 
                  Rapporter umiddelbart mistenkelig aktivitet til systemadministrator.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">4. Tillatt bruk</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-green-700">Du kan:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Bruke Tjenesten for legitime forretningsformål</li>
                  <li>Laste opp relevante dokumenter og filer</li>
                  <li>Dele nødvendig informasjon med autoriserte brukere</li>
                  <li>Eksportere dine egne data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-red-700">Du kan ikke:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Dele påloggingsopplysninger med uautoriserte personer</li>
                  <li>Laste opp skadelig eller ulovlig innhold</li>
                  <li>Forsøke å få uautorisert tilgang til systemet</li>
                  <li>Misbruke eller overbelaste Tjenesten</li>
                  <li>Kopiere, distribuere eller modifisere Tjenesten</li>
                  <li>Bruke Tjenesten til konkurrerende formål</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">5. Immaterielle rettigheter</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Myhrvold AS eier alle rettigheter til Tjenesten, inkludert men ikke begrenset til:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Programvare og kildekode</li>
              <li>Design og brukergrensesnitt</li>
              <li>Logoer og varemerker</li>
              <li>Dokumentasjon og hjelpemateriale</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Du gis en begrenset, ikke-eksklusiv rett til å bruke Tjenesten i henhold til disse vilkårene.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">6. Databehandling og personvern</h2>
            <p className="text-gray-700 leading-relaxed">
              Din bruk av Tjenesten er også regulert av vår{' '}
              <Link to="/privacy-policy" className="text-myhrvold-primary underline">
                Personvernpolicy
              </Link>
              . Ved å bruke Tjenesten samtykker du til databehandling som beskrevet i personvernpolicyen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">7. Tjenestens tilgjengelighet</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Vi streber etter høy oppetid, men kan ikke garantere at Tjenesten vil være tilgjengelig 
                24/7 uten avbrudd. Planlagt vedlikehold vil bli varslet i forveien når mulig.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium mb-2">Forbehold om tjenesteavbrudd</h3>
                <p className="text-sm text-gray-700">
                  Myhrvold AS er ikke ansvarlig for tap eller skade forårsaket av tjenesteavbrudd, 
                  uansett årsak, inkludert men ikke begrenset til tekniske feil, vedlikehold eller ytre faktorer.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">8. Ansvarsbegrensning</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                Myhrvold AS' ansvar for skader som følge av bruk av Tjenesten er begrenset til det 
                maksimale som følger av ufravikelig lov. Vi er ikke ansvarlige for indirekte tap, 
                driftstap, tapt fortjeneste eller andre konsekvenstap.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">9. Oppsigelse</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">9.1 Din rett til oppsigelse</h3>
                <p className="text-gray-700">
                  Du kan når som helst slutte å bruke Tjenesten. Kontakt oss for å deaktivere din konto.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">9.2 Vår rett til oppsigelse</h3>
                <p className="text-gray-700">
                  Vi kan suspendere eller avslutte din tilgang til Tjenesten ved brudd på disse vilkårene 
                  eller av andre legitime grunner med rimelig varsel.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">9.3 Virkning av oppsigelse</h3>
                <p className="text-gray-700">
                  Ved oppsigelse opphører din rett til å bruke Tjenesten. 
                  Data kan bli slettet i henhold til vår datalagringspolicy.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">10. Endringer i vilkårene</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi kan oppdatere disse vilkårene fra tid til annen. Vesentlige endringer vil bli kommunisert 
              via e-post eller gjennom Tjenesten. Fortsatt bruk etter endringer utgjør aksept av de nye vilkårene.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">11. Gjeldende lov og verneting</h2>
            <p className="text-gray-700 leading-relaxed">
              Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal løses av norske domstoler, 
              med [SETT INN VERNETING] som verneting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">12. Kontaktinformasjon</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Myhrvold AS</p>
              <p>E-post: support@myhrvold.no</p>
              <p>Telefon: [SETT INN TELEFONNUMMER]</p>
              <p>Adresse: [SETT INN ADRESSE]</p>
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
