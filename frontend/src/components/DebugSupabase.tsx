import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const TEST_USER_ID = import.meta.env.VITE_TEST_USER_ID;

interface DebugInfo {
  connection?: string;
  directQuery?: { data: number; error: string } | string;
  auth?: { user: string; error: string } | string;
  userQuery?: { data: number; error: string } | string;
  totalRecords?: string;
  generalError?: unknown;
}

export const DebugSupabase: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      const debug: DebugInfo = {};

      try {
        // Test 1: Check if we can connect to Supabase at all
        debug.connection = "Testing connection...";

        // Test 2: Try to query without RLS (should fail with RLS enabled)
        debug.directQuery = "Testing direct query...";
        const { data: directData, error: directError } = await supabase
          .from("sleep_records")
          .select("*")
          .limit(5);

        debug.directQuery = {
          data: directData?.length || 0,
          error: directError?.message || "No error",
        };

        // Test 3: Check authentication status
        debug.auth = "Checking auth...";
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        debug.auth = {
          user: authData.user?.id || "No user",
          error: authError?.message || "No error",
        };

        // Test 4: Try to query with specific user_id filter
        debug.userQuery = "Testing user-specific query...";
        const { data: userData, error: userError } = await supabase
          .from("sleep_records")
          .select("*")
          .eq("user_id", TEST_USER_ID)
          .limit(5);

        debug.userQuery = {
          data: userData?.length || 0,
          error: userError?.message || "No error",
        };

        // Test 5: Check if records exist at all (using service role would be needed)
        debug.totalRecords = "Cannot check total without service role";

        setDebugInfo(debug);
      } catch (err) {
        debug.generalError = err;
        setDebugInfo(debug);
      } finally {
        setLoading(false);
      }
    };

    runDebug();
  }, []);

  if (loading) {
    return <div>Running debug tests...</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>Supabase Debug Information</h2>
      <pre style={{ background: "#f0f0f0", padding: "10px", overflow: "auto" }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>

      <h3>Likely Issues:</h3>
      <ul>
        <li>RLS policies require authentication, but we're not signed in</li>
        <li>
          We need to either sign in as the test user or temporarily disable RLS
        </li>
        <li>Or modify RLS policies to allow anonymous access for this user</li>
      </ul>
    </div>
  );
};
