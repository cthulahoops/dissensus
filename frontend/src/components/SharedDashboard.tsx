import React, { useState, useEffect } from 'react';
import { supabase, type SleepRecord } from '../lib/supabase';
import { SleepDashboard } from './SleepDashboard';
import type { User } from '@supabase/supabase-js';

interface SharedDashboardProps {
  token: string;
}

export const SharedDashboard: React.FC<SharedDashboardProps> = ({ token }) => {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSharedData();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSharedData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use a stored procedure that sets the token and fetches data in one transaction
      // The RPC function will validate the token internally and throw an error if invalid
      const { data: records, error: fetchError } = await supabase
        .rpc('fetch_shared_sleep_records', { share_token: token });
      
      if (fetchError) {
        throw fetchError;
      }
      
      // If we get here, the token is valid (even if no records exist)
      setSleepRecords(records || []);
    } catch (err) {
      console.error('Error loading shared data:', err);
      setError('Invalid or expired share link. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  // For shared dashboards, we don't want the add record functionality
  const handleAddRecord = () => {
    // Do nothing - shared dashboards are read-only
  };

  // Check if user is authenticated for the "Back to Dashboard" button
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="App">
        <header className="app-header">
          <div className="user-info">
            <span>Loading shared dashboard...</span>
          </div>
        </header>
        <main>
          <div className="loading">Loading shared sleep data...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="app-header">
          <div className="user-info">
            <span>Shared Dashboard - Access Error</span>
          </div>
        </header>
        <main>
          <section>
            <h2>Access Error</h2>
            <div className="form-error">
              {error}
            </div>
            <p>
              If you believe this link should work, please contact the person who 
              shared it with you.
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="user-info">
          <span>Viewing Shared Dashboard ({sleepRecords.length} sleep records)</span>
          {user ? (
            <div>
              <button onClick={() => window.location.href = '/'}>
                Back to My Dashboard
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
              Not logged in
            </span>
          )}
        </div>
      </header>

      {/* Use the existing SleepDashboard component but without add functionality */}
      <SleepDashboard
        onAddRecord={handleAddRecord}
        sleepRecords={sleepRecords}
        loading={false}
        error={null}
        isSharedView={true}
        sharedViewInfo="You're viewing a shared sleep tracking dashboard. This is read-only access to someone's sleep data."
      />
    </div>
  );
};
