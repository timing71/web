import React from 'react';
import ReactDOM from 'react-dom';

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

import App from './App';
import reportWebVitals from './reportWebVitals';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [new BrowserTracing()],
    release: process.env.REACT_APP_COMMIT_REF || 'dev',
    tracesSampleRate: 1.0,
    ignoreErrors: ['ResizeObserver loop limit exceeded'],
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
