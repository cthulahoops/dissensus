import { type ReactNode } from "react";
import { useSleepData } from "../hooks/useSleepData";
import { useAuth } from "../hooks/useAuth";
import { SleepDataContext } from "./SleepDataContext";

export const SleepDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const sleepData = useSleepData(user?.id);

  return (
    <SleepDataContext.Provider value={sleepData}>
      {children}
    </SleepDataContext.Provider>
  );
};
