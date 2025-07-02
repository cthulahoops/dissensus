
import { useContext } from 'react';
import { SleepDataContext } from './SleepDataContext';

export const useSleepDataContext = () => {
  const context = useContext(SleepDataContext);
  if (context === undefined) {
    throw new Error('useSleepDataContext must be used within a SleepDataProvider');
  }
  return context;
};
