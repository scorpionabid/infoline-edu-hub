
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppQueryProvider } from './context/QueryClientProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppQueryProvider>
      <App />
    </AppQueryProvider>
  </React.StrictMode>,
);
