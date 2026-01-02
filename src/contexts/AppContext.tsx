import { createContext, useContext, useState } from 'react';
import { Participant } from '@/types';
import participantsData from '@/data/participants.json';

interface AppContextType {
  currentParticipant: Participant;
  setCurrentParticipant: (participant: Participant) => void;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentParticipant, setCurrentParticipant] = useState<Participant>(
    participantsData[1] as Participant
  );

  const isAdmin = currentParticipant.role === 'admin';

  return (
    <AppContext.Provider value={{ currentParticipant, setCurrentParticipant, isAdmin }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
