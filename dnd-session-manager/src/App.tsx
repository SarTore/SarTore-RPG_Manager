import React from 'react';
import { SessionProvider } from './context/SessionContext';
import { I18nProvider } from './lib/i18n';
import { DnDSessionManager } from './components/DnDSessionManager';
import './App.css';

function App() {
  return (
    <I18nProvider>
      <SessionProvider>
        <DnDSessionManager />
      </SessionProvider>
    </I18nProvider>
  );
}

export default App;