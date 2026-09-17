import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { LiveDetection } from './pages/LiveDetection';
import { CallShield } from './pages/CallShield';
import { AudioAnalysis } from './pages/AudioAnalysis';
import { MultilingualAnalysis } from './pages/MultilingualAnalysis';
import { Analytics } from './pages/Analytics';
import { AIModels } from './pages/AIModels';
import { Settings } from './pages/Settings';
import type { User } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [pendingTargetView, setPendingTargetView] = useState<string>('overview');
  
  // Initial state is unauthenticated (null) so user must authenticate via Gmail/Mobile OTP
  const [user, setUser] = useState<User | null>(null);

  const navigateProtected = (targetView: string) => {
    if (!user) {
      setPendingTargetView(targetView);
      setCurrentView('auth');
    } else {
      setCurrentView(targetView);
    }
  };

  const handleLoginSuccess = (userData: User, authToken: string) => {
    setUser(userData);
    if (authToken) console.log('Session token initialized');
    setCurrentView(pendingTargetView || 'overview');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  // Render Landing Page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onStartLive={() => navigateProtected('live-detection')}
        onAnalyzeRecording={() => navigateProtected('audio-analysis')}
        onViewDemo={() => navigateProtected('overview')}
        onExploreIntel={() => navigateProtected('call-shield')}
      />
    );
  }

  // Render Auth Page if requesting login or required for action
  if (currentView === 'auth') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render Main SOC Platform Layout with Sidebar & Header
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => navigateProtected(view)}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
          currentView={currentView}
          onStartLive={() => navigateProtected('live-detection')}
          onAnalyzeRecording={() => navigateProtected('audio-analysis')}
        />

        <div style={{ flex: 1 }}>
          {currentView === 'overview' && (
            <Dashboard
              onStartLive={() => navigateProtected('live-detection')}
              onAnalyzeRecording={() => navigateProtected('audio-analysis')}
              onSelectCallShield={() => navigateProtected('call-shield')}
            />
          )}

          {currentView === 'live-detection' && <LiveDetection />}

          {currentView === 'call-shield' && <CallShield />}

          {currentView === 'audio-analysis' && <AudioAnalysis />}

          {currentView === 'multilingual' && <MultilingualAnalysis />}

          {currentView === 'analytics' && <Analytics />}

          {currentView === 'ai-models' && <AIModels />}

          {currentView === 'settings' && (
            <Settings
              user={user}
              onLogout={handleLogout}
              onNavigateAuth={() => setCurrentView('auth')}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
