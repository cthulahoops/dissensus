import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthCallbackProps {
  onSuccess: () => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from the magic link
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError('Authentication failed: ' + error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          // Successfully authenticated
          onSuccess();
        } else {
          setError('No session found. Please try signing in again.');
          setLoading(false);
        }
      } catch (err) {
        setError('An unexpected error occurred during authentication.');
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        onSuccess();
      } else if (event === 'SIGNED_OUT') {
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    });

    handleAuthCallback();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [onSuccess]);

  if (loading) {
    return (
      <div className="auth-callback">
        <h2>Signing you in...</h2>
        <p>Please wait while we authenticate you.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-callback">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/'}>
          Try Again
        </button>
      </div>
    );
  }

  return null;
};
