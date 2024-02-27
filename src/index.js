import React from 'react';
import ReactDOM from 'react-dom';

import * as Sentry from "@sentry/react";

import App from './App';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.browserTracingIntegration(),
      Sentry.replayIntegration()
    ],
    release: process.env.REACT_APP_COMMIT_REF || 'dev',
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: ['ResizeObserver loop limit exceeded'],
  });
}

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        console.info('Timing71 service worker registered: ', registration); // eslint-disable-line no-console
      }).catch(registrationError => {
        Sentry.captureException(registrationError);
      });
    });
  }
}

if (process.env.GA_TRACKING_ID) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACKING_ID}`;
  document.body.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  const gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', process.env.GA_TRACKING_ID, { debug_mode: process.env.NODE_ENV !== 'production' });
}

// Allow the import of @timing71/services to fail. This allows the web app to
// be compiled and run without the (private) services.
import(/* webpackChunkName: "services" */'@timing71/services').finally(
  () => {
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById('root')
    );
  }
);
