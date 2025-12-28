'use client';
import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  measurementId: string;
}

declare global {
  interface Window {
    gtag?: (command: string, targetId?: string, parameters?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

export const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  useEffect(() => {
    if (!measurementId) return;

    // inject GA script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${measurementId}', { debug_mode: true });
    `;
    document.head.appendChild(script2);

    // listener pour SPA / changements de "page"
    const handleRouteChange = () => {
      if (window.gtag) {
        window.gtag('event', 'page_view', { page_path: window.location.pathname });
      }
    };
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [measurementId]);

  return null;
};
