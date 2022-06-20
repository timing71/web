import React from 'react';
import ReactDOM from 'react-dom';

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

import App from './App';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [new BrowserTracing()],
    release: process.env.REACT_APP_COMMIT_REF || 'dev',
    tracesSampleRate: 0.5,
    ignoreErrors: ['ResizeObserver loop limit exceeded'],
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
