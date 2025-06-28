import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { SleepDashboard } from "./components/SleepDashboard";
import { SleepForm } from "./components/SleepForm";
import { LoginForm } from "./components/LoginForm";
import { AuthCallback } from "./components/AuthCallback";
import "./components/SleepDashboard.css";
import "./App.css";
import type { User } from '@supabase/supabase-js';

type AppState = 'loading' | 'login' | 'auth-callback' | 'dashboard' | 'add-record';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if we're on the auth callback route
    if (window.location.pathname === '/auth/callback') {
      setAppState('auth-callback');
      return;
    }

    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setAppState('dashboard');
      } else {
        setAppState('login');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setAppState('dashboard');
      } else {
        setUser(null);
        setAppState('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // Clear the callback URL and go to dashboard
    window.history.replaceState({}, '', '/');
    setAppState('dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAppState('login');
  };

  const handleAddRecord = () => {
    setAppState('add-record');
  };

  const handleRecordSubmitted = () => {
    setAppState('dashboard');
  };

  const handleCancelAddRecord = () => {
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

  return (
    <div className="App">
      <header className="app-header">
        <div className="user-info">
          <span>Signed in as: {user?.email}</span>
          <button onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>
      {appState === 'dashboard' && (
        <SleepDashboard onAddRecord={handleAddRecord} />
      )}
      {appState === 'add-record' && user && (
        <SleepForm 
          userId={user.id}
          onSubmit={handleRecordSubmitted}
          onCancel={handleCancelAddRecord}
        />
      )}
    </div>
  );
}

export default App;
