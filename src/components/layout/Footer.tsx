
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

export const Footer = () => {
  const { openSettings } = useCookieConsent();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Myhrvold AS. Alle rettigheter reservert.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center space-x-6 text-sm text-gray-600">
              <Link 
                to="/privacy-policy" 
                className="hover:text-myhrvold-primary transition-colors"
              >
                Personvernpolicy
              </Link>
              <Link 
                to="/cookie-policy" 
                className="hover:text-myhrvold-primary transition-colors"
              >
                Cookie-policy
              </Link>
              <Link 
                to="/terms-of-service" 
                className="hover:text-myhrvold-primary transition-colors"
              >
                Brukervilkår
              </Link>
              <button 
                onClick={openSettings}
                className="hover:text-myhrvold-primary transition-colors"
              >
                Cookie-innstillinger
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
