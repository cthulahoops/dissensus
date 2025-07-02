import { useState, useEffect, useCallback } from 'react';
import { sleepRecordsAPI } from '../lib/supabase';
import type { SleepRecord, SleepRecordInsert } from '../lib/supabase';

interface SleepDataState {
  records: SleepRecord[];
  loading: boolean;
  error: string | null;
  addRecord: (record: SleepRecordInsert) => Promise<SleepRecord | null>;
  refetch: () => void;
  deleteRecord: (id: string) => Promise<void>;
  updateRecord: (id: string, updates: Partial<SleepRecord>) => Promise<void>;
}

export function useSleepData(userId: string | undefined): SleepDataState {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sleepRecordsAPI.getAll(userId);
      setRecords(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to fetch sleep data: ${errorMessage}`);
      console.error("Error fetching sleep records:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRecords();
    }
  }, [userId, fetchRecords]);

  const addRecord = async (record: SleepRecordInsert) => {
    if (!userId) {
      setError('Cannot add record without a user.');
      return null;
    }
    setLoading(true);
    try {
      const newRecord = await sleepRecordsAPI.create(record);
      setRecords(prev => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to add sleep record: ${errorMessage}`);
      console.error("Error adding sleep record:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    setLoading(true);
    try {
      await sleepRecordsAPI.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to delete sleep record: ${errorMessage}`);
      console.error("Error deleting sleep record:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (id: string, updates: Partial<SleepRecord>) => {
    setLoading(true);
    try {
      const updatedRecord = await sleepRecordsAPI.update(id, updates);
      setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to update sleep record: ${errorMessage}`);
      console.error("Error updating sleep record:", err);
    } finally {
      setLoading(false);
    }
  };

  return { records, loading, error, addRecord, refetch: fetchRecords, deleteRecord, updateRecord };
}
