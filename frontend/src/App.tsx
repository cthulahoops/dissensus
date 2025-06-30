import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { SleepDashboard } from "./components/SleepDashboard";
import { SleepForm } from "./components/SleepForm";
import { LoginForm } from "./components/LoginForm";
import { AuthCallback } from "./components/AuthCallback";
import { SharedDashboard } from "./components/SharedDashboard";
import { ShareManager } from "./components/ShareManager";
import { sleepRecordsAPI } from "./lib/supabase";
import { extractTokenFromUrl, isShareUrl } from "./lib/shareUtils";
import type { SleepRecord } from "./lib/supabase";
import "./components/SleepDashboard.css";
import "./App.css";
import type { User } from '@supabase/supabase-js';

type AppState = 'loading' | 'login' | 'auth-callback' | 'dashboard' | 'add-record' | 'shared-dashboard' | 'share-manager';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareToken, setShareTokenState] = useState<string | null>(null);

  const loadSleepData = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const records = await sleepRecordsAPI.getAll(userId);
      setSleepRecords(records);
    } catch (err) {
      console.error("Error fetching sleep records:", err);
      setError("Failed to load sleep data: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we're on a shared dashboard route
    const currentPath = window.location.pathname;
    if (isShareUrl(currentPath)) {
      const token = extractTokenFromUrl(currentPath);
      if (token) {
        setShareTokenState(token);
        setAppState('shared-dashboard');
        return;
      }
    }

    // Check if we're on the auth callback route
    if (currentPath === '/auth/callback') {
      setAppState('auth-callback');
      return;
    }

    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        loadSleepData(session.user.id);
        setAppState('dashboard');
      } else {
        setAppState('login');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const newUserId = session.user.id;
        const currentUserId = user?.id;
        
        setUser(session.user);
        
        // Only reload data if user actually changed or we don't have data yet
        if (newUserId !== currentUserId || sleepRecords.length === 0) {
          loadSleepData(newUserId);
        }
        
        setAppState('dashboard');
      } else {
        setUser(null);
        setSleepRecords([]);
        setAppState('login');
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id, sleepRecords.length]);


  const handleAuthSuccess = () => {
    // Clear the callback URL and go to dashboard
    window.history.replaceState({}, '', '/');
    setAppState('dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSleepRecords([]);
    setError(null);
    setAppState('login');
  };

  const handleAddRecord = () => {
    setAppState('add-record');
  };

  const handleRecordSubmitted = (newRecord: SleepRecord) => {
    setSleepRecords(prev => [...prev, newRecord]);
    setAppState('dashboard');
  };

  const handleCancelAddRecord = () => {
    setAppState('dashboard');
  };

  const handleOpenShareManager = () => {
    setAppState('share-manager');
  };

  const handleCloseShareManager = () => {
    setAppState('dashboard');
  };

  if (appState === 'loading') {
    return (
      <div className="App">
        <div className="loading">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (appState === 'auth-callback') {
    return (
      <div className="App">
        <AuthCallback onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  if (appState === 'login') {
    return (
      <div className="App">
        <LoginForm onSuccess={() => {}} />
      </div>
    );
  }

  if (appState === 'shared-dashboard' && shareToken) {
    return (
      <div className="App">
        <SharedDashboard token={shareToken} />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="user-info">
          <span>Signed in as: {user?.email}</span>
          <div>
            <button onClick={handleOpenShareManager}>
              📤 Manage Share Links
            </button>
            <button onClick={handleSignOut} className="btn-cancel">
              Sign Out
            </button>
          </div>
        </div>
      </header>
      {appState === 'dashboard' && (
        <SleepDashboard 
          onAddRecord={handleAddRecord}
          sleepRecords={sleepRecords}
          loading={loading}
          error={error}
        />
      )}
      {appState === 'add-record' && user && (
        <SleepForm 
          userId={user.id}
          onSubmit={handleRecordSubmitted}
          onCancel={handleCancelAddRecord}
        />
      )}
      {appState === 'share-manager' && (
        <ShareManager onClose={handleCloseShareManager} />
      )}
    </div>
  );
}

export default App;
