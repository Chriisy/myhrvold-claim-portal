
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

const CookiePolicy = () => {
  const { openSettings } = useCookieConsent();

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
          <h1 className="text-3xl font-bold text-myhrvold-primary">Cookie-policy</h1>
          <p className="text-gray-600 mt-2">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
          </p>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">Hva er cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies er små tekstfiler som lagres på din enhet (datamaskin, nettbrett eller mobiltelefon) 
              når du besøker et nettsted. De hjelper nettstedet med å huske informasjon om ditt besøk, 
              som språkpreferanser og andre innstillinger.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">Hvorfor bruker vi cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vi bruker cookies for å:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Sikre at nettstedet fungerer korrekt</li>
              <li>Huske dine innloggingsdetaljer og preferanser</li>
              <li>Analysere hvordan nettstedet brukes for å forbedre opplevelsen</li>
              <li>Tilpasse innhold og annonser</li>
              <li>Sikre nettstedets sikkerhet</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">Typer cookies vi bruker</h2>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium text-myhrvold-primary mb-3">Nødvendige cookies</h3>
                <p className="text-gray-700 mb-4">
                  Disse cookies er essensielle for at nettstedet skal fungere og kan ikke slås av. 
                  De setter vanligvis bare som respons på handlinger du gjør som utgjør en forespørsel om tjenester.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Eksempler:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>supabase-auth-token:</strong> Autentisering og sesjonshåndtering</li>
                    <li><strong>cookie-consent:</strong> Husker dine cookie-preferanser</li>
                    <li><strong>csrf-token:</strong> Sikkerhet mot cross-site request forgery</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Varighet:</strong> Sesjon til 1 år
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium text-myhrvold-primary mb-3">Analytiske cookies</h3>
                <p className="text-gray-700 mb-4">
                  Disse cookies lar oss telle besøk og trafikkkilder slik at vi kan måle og forbedre 
                  ytelsen til nettstedet vårt. All informasjon samles inn anonymt.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Eksempler:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>_ga:</strong> Google Analytics - skiller brukere</li>
                    <li><strong>_ga_*:</strong> Google Analytics - samler data om nettstedsbruk</li>
                    <li><strong>_gid:</strong> Google Analytics - skiller brukere</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Varighet:</strong> 1 dag til 2 år
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium text-myhrvold-primary mb-3">Preferanse-cookies</h3>
                <p className="text-gray-700 mb-4">
                  Disse cookies gjør det mulig for nettstedet å huske valg du gjør og gi forbedrede, 
                  mer personlige funksjoner.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Eksempler:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>language:</strong> Husker språkvalg</li>
                    <li><strong>theme:</strong> Husker valg av lys/mørk modus</li>
                    <li><strong>dashboard-filters:</strong> Husker filterinnstillinger</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Varighet:</strong> 1 måned til 1 år
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium text-myhrvold-primary mb-3">Markedsføringscookies</h3>
                <p className="text-gray-700 mb-4">
                  Disse cookies kan settes gjennom nettstedet vårt av våre annonsepartnere for å bygge 
                  en profil av dine interesser og vise relevante annonser på andre nettsteder.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Eksempler:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>_fbp:</strong> Facebook Pixel - sporing av konverteringer</li>
                    <li><strong>ads-id:</strong> Annonse-ID for personaliserte annonser</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Varighet:</strong> 3 måneder til 2 år
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">Administrer dine cookie-preferanser</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Du kan når som helst endre dine cookie-preferanser ved å:
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">Bruke våre cookie-innstillinger</h3>
                  <p className="text-sm text-gray-600">
                    Klikk på knappen for å åpne cookie-innstillinger og tilpasse dine preferanser.
                  </p>
                </div>
                <Button onClick={openSettings} className="btn-primary">
                  Åpne innstillinger
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Nettleserinnstillinger</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Du kan også administrere cookies direkte i nettleseren din:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>Chrome:</strong> Innstillinger → Personvern og sikkerhet → Cookies og andre nettstedsdata</li>
                  <li><strong>Firefox:</strong> Innstillinger → Personvern og sikkerhet → Cookies og nettstedsdata</li>
                  <li><strong>Safari:</strong> Preferanser → Personvern → Cookies og nettstedsdata</li>
                  <li><strong>Edge:</strong> Innstillinger → Cookies og nettstedstillatelser</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">Tredjepartscookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vi bruker tjenester fra tredjeparter som kan sette sine egne cookies:
            </p>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Google Analytics</h3>
                <p className="text-sm text-gray-600">
                  For å analysere nettstedstrafikk. Les mer om Googles personvernpraksis på{' '}
                  <a href="https://policies.google.com/privacy" className="text-myhrvold-primary underline" target="_blank" rel="noopener noreferrer">
                    policies.google.com/privacy
                  </a>
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Supabase</h3>
                <p className="text-sm text-gray-600">
                  For database og autentisering. Les mer om Supabases personvernpraksis på{' '}
                  <a href="https://supabase.com/privacy" className="text-myhrvold-primary underline" target="_blank" rel="noopener noreferrer">
                    supabase.com/privacy
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">Kontakt oss</h2>
            <p className="text-gray-700 leading-relaxed">
              Hvis du har spørsmål om vår bruk av cookies, kan du kontakte oss på{' '}
              <a href="mailto:personvern@myhrvold.no" className="text-myhrvold-primary underline">
                personvern@myhrvold.no
              </a>
              {' '}eller se vår{' '}
              <Link to="/privacy-policy" className="text-myhrvold-primary underline">
                personvernpolicy
              </Link>
              {' '}for mer informasjon.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;
