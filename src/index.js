import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
// Silence noisy console.log/info/debug calls by default to stop
// devtools auto-scrolling flood. To re-enable, set REACT_APP_ENABLE_LOGS=true
// in your environment or set `window.__APP_DEBUG__ = true` in the console.
const ENABLE_LOGS = (process.env.REACT_APP_ENABLE_LOGS === 'true') || (typeof window !== 'undefined' && window.__APP_DEBUG__ === true);
if (!ENABLE_LOGS && typeof console !== 'undefined') {
  const _warn = console.warn.bind(console);
  const _error = console.error.bind(console);
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  // keep warnings and errors visible
  console.warn = (...args) => _warn(...args);
  console.error = (...args) => _error(...args);
}

// Global error handlers to capture uncaught exceptions and promise rejections.
// These will log concise diagnostics (message + stack) to help trace where
// JSON.parse errors are originating.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (evt) => {
    try {
      console.error('[Global Error]', evt.message || evt.error?.message || evt.error, evt.error?.stack || evt.filename + ':' + evt.lineno + ':' + evt.colno);
      // expose last error for manual inspection in the console
      window.__LAST_ERROR__ = { message: evt.message, stack: evt.error?.stack, filename: evt.filename, lineno: evt.lineno, colno: evt.colno };
    } catch (e) {
      // ignore
    }
  });

  window.addEventListener('unhandledrejection', (evt) => {
    try {
      const reason = evt.reason;
      console.error('[Unhandled Rejection]', reason && reason.message ? reason.message : reason, reason && reason.stack ? reason.stack : 'no-stack');
      window.__LAST_UNHANDLED_REJECTION__ = { reason: reason, time: Date.now() };
    } catch (e) {
      // ignore
    }
  });
}
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import { store } from './store';
import { Provider } from 'react-redux';

// 

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();