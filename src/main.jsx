import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import './mobile-v1.css'; /* MOBILE-V1 — remove this line to revert mobile styles */
import './components/ask/ask.css'; /* ASK — remove this line to revert dev ask panel */
import App from './App.jsx';
import { queryClient } from './query/client';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
