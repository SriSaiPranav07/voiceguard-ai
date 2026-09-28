import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { LiveProtection } from './pages/LiveProtection';
import { AnalyzeRecording } from './pages/AnalyzeRecording';
import { Reports } from './pages/Reports';
import { DemoLab } from './pages/DemoLab';
import { HowItWorks } from './pages/HowItWorks';
import { Settings } from './pages/Settings';
import { fetchHealth, type User } from './services/api';

// Route alias / redirect resolver for backward compatibility
function resolveRoute(route: string): string {
  switch (route) {
    case 'live-detection':
    case 'call-shield':
      return 'live-protection';
    case 'audio-analysis':
    case 'multilingual':
      return 'analyze-recording';
    case 'attack-sim':
    case 'attack-simulation':
      return 'demo-lab';
    case 'analytics':
    case 'incidents':
      return 'reports';
    case 'ai-models':
    case 'architecture':
      return 'how-it-works';
    default:
      return route;
  }
}

export function App() {
  const [apiOnline, setApiOnline] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<string>('overview');
  const [pendingTargetView, setPendingTargetView] = useState<string>('overview');

  // Demo user profile for immediate testing
  const [user, setUser] = useState<User | null>({
    id: 'usr_lead_01',
    name: 'Security Lead',
    email: 'analyst@voiceguard.ai',
    role: 'Security Analyst',
  });

  useEffect(() => {
    let active = true;
    const checkApi = () => {
      fetchHealth().then((health) => {
        if (active) {
          setApiOnline(health.api_online);
          setModelLoaded(health.model_loaded);
        }
      });
    };
    checkApi();
    const interval = window.setInterval(checkApi, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const navigateProtected = (targetView: string) => {
    const resolved = resolveRoute(targetView);
    if (!user && resolved !== 'landing' && resolved !== 'auth') {
      setPendingTargetView(resolved);
      setCurrentView('auth');
    } else {
      setCurrentView(resolved);
    }
  };

  const handleLoginSuccess = (userData: User, authToken: string) => {
    setUser(userData);
    if (authToken) console.log('Session token initialized');
    setCurrentView(pendingTargetView ? resolveRoute(pendingTargetView) : 'overview');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  // Render Landing Page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onStartLive={() => navigateProtected('live-protection')}
        onAnalyzeRecording={() => navigateProtected('analyze-recording')}
        onViewDemo={() => navigateProtected('overview')}
        onExploreDemoLab={() => navigateProtected('demo-lab')}
        onHowItWorks={() => navigateProtected('how-it-works')}
      />
    );
  }

  // Render Auth Page
  if (currentView === 'auth') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const activeView = resolveRoute(currentView);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar
        currentView={activeView}
        setCurrentView={(view) => navigateProtected(view)}
        user={user}
        apiOnline={apiOnline}
        modelLoaded={modelLoaded}
        onLogout={handleLogout}
      />

      <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
          currentView={activeView}
          onStartLive={() => navigateProtected('live-protection')}
          onAnalyzeRecording={() => navigateProtected('analyze-recording')}
        />

        <div style={{ flex: 1 }}>
          {activeView === 'overview' && (
            <Dashboard
              onStartLive={() => navigateProtected('live-protection')}
              onAnalyzeRecording={() => navigateProtected('analyze-recording')}
              onSelectDemoLab={() => navigateProtected('demo-lab')}
              onSelectReports={() => navigateProtected('reports')}
            />
          )}

          {activeView === 'live-protection' && <LiveProtection />}

          {activeView === 'analyze-recording' && <AnalyzeRecording />}

          {activeView === 'reports' && <Reports />}

          {activeView === 'demo-lab' && <DemoLab />}

          {activeView === 'how-it-works' && <HowItWorks />}

          {activeView === 'settings' && (
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
