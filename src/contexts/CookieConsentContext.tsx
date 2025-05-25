
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsentContextType {
  consent: CookieConsent | null;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: CookieConsent) => void;
  openSettings: () => void;
  closeBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

export const CookieConsentProvider = ({ children }: { children: React.ReactNode }) => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      setConsent(JSON.parse(savedConsent));
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const acceptAll = () => {
    const allAccepted: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allAccepted);
  };

  const rejectAll = () => {
    const onlyNecessary: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(onlyNecessary);
  };

  const savePreferences = (preferences: CookieConsent) => {
    saveConsent(preferences);
  };

  const openSettings = () => {
    setShowBanner(true);
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        showBanner,
        acceptAll,
        rejectAll,
        savePreferences,
        openSettings,
        closeBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};
