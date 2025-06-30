import React, { useState, useEffect } from 'react';
import { setShareToken } from '../lib/shareUtils';
import { supabase, type SleepRecord } from '../lib/supabase';
import { SleepDashboard } from './SleepDashboard';

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

      console.log('Setting share token:', token);
      // Set the share token for this session
      await setShareToken(token);
      console.log('Share token set successfully');

      // Debug: Check if our share token is being found
      console.log('Checking if share token exists in database...');
      const { data: shareCheck, error: shareError } = await supabase
        .from('public_shares')
        .select('*')
        .eq('share_token', token);
      
      console.log('Share token check result:', shareCheck);
      if (shareError) {
        console.error('Share check error:', shareError);
      }

      // Debug: Check what the current setting returns
      console.log('Testing current_setting function...');
      const { data: settingTest, error: settingError } = await supabase
        .rpc('current_setting', { setting_name: 'app.share_token' });
      console.log('Current setting result:', settingTest, settingError);
      
      // Debug: Check all share links in the database
      console.log('Checking all share links in database...');
      const { data: allShares, error: allSharesError } = await supabase
        .from('public_shares')
        .select('*');
      console.log('All share links:', allShares, allSharesError);

      // Try to fetch data directly from supabase with the share token active
      console.log('Fetching sleep records...');
      const { data: records, error: fetchError } = await supabase
        .from('sleep_records')
        .select('*')
        .order('date', { ascending: true });
      
      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }
      
      console.log('Records fetched:', records?.length || 0);
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

  if (loading) {
    return (
      <div className="shared-dashboard">
        <div className="shared-dashboard-header">
          <h1>Shared Sleep Dashboard</h1>
          <p>Loading shared sleep data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-dashboard">
        <div className="shared-dashboard-header">
          <h1>Shared Sleep Dashboard</h1>
          <div className="error-message">
            <h2>Access Error</h2>
            <p>{error}</p>
            <p>
              If you believe this link should work, please contact the person who 
              shared it with you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-dashboard">
      <div className="shared-dashboard-header">
        <h1>Shared Sleep Dashboard</h1>
        <p>
          You're viewing a shared sleep tracking dashboard. 
          This is read-only access to someone's sleep data.
        </p>
        <div className="shared-dashboard-info">
          <span className="record-count">
            {sleepRecords.length} sleep records shared
          </span>
        </div>
      </div>

      {/* Use the existing SleepDashboard component but without add functionality */}
      <SleepDashboard
        onAddRecord={handleAddRecord}
        sleepRecords={sleepRecords}
        loading={false}
        error={null}
      />

      <footer className="shared-dashboard-footer">
        <p>
          Want to track your own sleep? 
          <a href="/" style={{ marginLeft: '8px' }}>
            Create your own sleep tracker account
          </a>
        </p>
      </footer>
    </div>
  );
};
