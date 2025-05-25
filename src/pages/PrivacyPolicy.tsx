
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold text-myhrvold-primary">Personvernpolicy</h1>
          <p className="text-gray-600 mt-2">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
          </p>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">1. Introduksjon</h2>
            <p className="text-gray-700 leading-relaxed">
              Myhrvold AS ("vi", "oss", "vår") respekterer ditt personvern og forplikter oss til å beskytte 
              dine personopplysninger. Denne personvernpolicyen forklarer hvordan vi samler inn, bruker, 
              lagrer og beskytter dine personopplysninger når du bruker vår reklamasjonsportal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">2. Databehandlingsansvarlig</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Myhrvold AS</p>
              <p>Organisasjonsnummer: [SETT INN ORG.NR]</p>
              <p>Adresse: [SETT INN ADRESSE]</p>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4" />
                <p>E-post: personvern@myhrvold.no</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4" />
                <p>Telefon: [SETT INN TELEFONNUMMER]</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">3. Hvilke personopplysninger samler vi inn?</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Brukerinformasjon:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Navn og brukernavn</li>
                  <li>E-postadresse</li>
                  <li>Telefonnummer</li>
                  <li>Stillingstittel og avdeling</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Reklamasjonsinformasjon:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Kundedata (navn, kontaktinformasjon)</li>
                  <li>Utstyrsinformasjon (modell, serienummer)</li>
                  <li>Beskrivelser av problemer og løsninger</li>
                  <li>Vedlegg og dokumenter</li>
                  <li>Kommunikasjonshistorikk</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Teknisk informasjon:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP-adresse</li>
                  <li>Nettlesertype og -versjon</li>
                  <li>Operativsystem</li>
                  <li>Besøkstidspunkter og -varigheter</li>
                  <li>Cookies og tilsvarende teknologier</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">4. Hvorfor behandler vi dine personopplysninger?</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-myhrvold-primary pl-4">
                <h3 className="font-medium">Kontraktsoppfyllelse</h3>
                <p className="text-gray-700">For å levere reklamasjonstjenester og oppfylle våre forpliktelser overfor kunder og partnere.</p>
              </div>
              <div className="border-l-4 border-myhrvold-primary pl-4">
                <h3 className="font-medium">Berettiget interesse</h3>
                <p className="text-gray-700">For å forbedre våre tjenester, sikkerhet og brukeropplevelse.</p>
              </div>
              <div className="border-l-4 border-myhrvold-primary pl-4">
                <h3 className="font-medium">Samtykke</h3>
                <p className="text-gray-700">For markedsføring og ikke-essensielle cookies (kun når du har gitt samtykke).</p>
              </div>
              <div className="border-l-4 border-myhrvold-primary pl-4">
                <h3 className="font-medium">Juridisk forpliktelse</h3>
                <p className="text-gray-700">For å overholde regnskapslover og andre juridiske krav.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">5. Hvor lenge lagrer vi dine data?</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li><strong>Brukerkontoer:</strong> Så lenge kontoen er aktiv + 2 år etter siste aktivitet</li>
                <li><strong>Reklamasjonssaker:</strong> 10 år i henhold til regnskapsloven</li>
                <li><strong>Kommunikasjonslogger:</strong> 3 år for kvalitetssikring</li>
                <li><strong>Tekniske logger:</strong> 12 måneder for sikkerhet og feilsøking</li>
                <li><strong>Cookies:</strong> Varierer fra 1 måned til 2 år avhengig av type</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">6. Dine rettigheter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Rett til innsyn</h3>
                <p className="text-sm text-gray-700">Du kan be om en kopi av alle personopplysninger vi har om deg.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Rett til retting</h3>
                <p className="text-sm text-gray-700">Du kan be oss rette unøyaktige eller ufullstendige opplysninger.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Rett til sletting</h3>
                <p className="text-sm text-gray-700">Du kan be om at vi sletter dine personopplysninger under visse omstendigheter.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Rett til portabilitet</h3>
                <p className="text-sm text-gray-700">Du kan be om å få dine data i et strukturert, maskinlesbart format.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Rett til begrensning</h3>
                <p className="text-sm text-gray-700">Du kan be om at vi begrenser behandlingen av dine personopplysninger.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Rett til innsigelse</h3>
                <p className="text-sm text-gray-700">Du kan protestere mot behandling basert på berettiget interesse.</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm">
                <strong>Merk:</strong> Noen av disse rettighetene kan være begrenset av regnskapsloven og andre juridiske forpliktelser.
                Kontakt oss for å utøve dine rettigheter eller få mer informasjon.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">7. Sikkerhet</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vi implementerer passende tekniske og organisatoriske tiltak for å beskytte dine personopplysninger mot:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Uautorisert tilgang og bruk</li>
              <li>Tap, ødeleggelse eller endring</li>
              <li>Utilsiktet utlevering</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Våre sikkerhetstiltak inkluderer kryptering, tilgangskontroll, regelmessige sikkerhetsvurderinger og opplæring av ansatte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">8. Deling av data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vi deler kun dine personopplysninger når:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Det er nødvendig for å levere våre tjenester</li>
              <li>Vi har ditt samtykke</li>
              <li>Det kreves av lov</li>
              <li>Det er nødvendig for å beskytte våre rettigheter</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Vi selger aldri dine personopplysninger til tredjeparter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">9. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi bruker cookies og lignende teknologier for å forbedre din opplevelse. 
              Du kan administrere dine cookie-preferanser via cookie-banneret eller i nettleserens innstillinger. 
              Les mer i vår detaljerte{' '}
              <Link to="/cookie-policy" className="text-myhrvold-primary underline">
                cookie-policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">10. Endringer i denne policyen</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi kan oppdatere denne personvernpolicyen fra tid til annen. Vesentlige endringer vil bli kommunisert 
              via e-post eller gjennom et varsel på nettstedet. Vi oppfordrer deg til å gjennomgå denne policyen regelmessig.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-myhrvold-primary mb-4">11. Kontakt oss</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hvis du har spørsmål om denne personvernpolicyen eller ønsker å utøve dine rettigheter, 
              kan du kontakte oss:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>E-post:</strong> personvern@myhrvold.no</p>
              <p><strong>Telefon:</strong> [SETT INN TELEFONNUMMER]</p>
              <p><strong>Post:</strong> Myhrvold AS, [ADRESSE]</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              Du har også rett til å klage til Datatilsynet hvis du mener vi ikke overholder personvernregelverket.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
