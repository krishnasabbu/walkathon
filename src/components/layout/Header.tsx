import { useApp } from '@/contexts/AppContext';
import { Select } from '@/components/ui/Select';
import participantsData from '@/data/participants.json';
import { Participant } from '@/types';

export function Header() {
  const { currentParticipant, setCurrentParticipant, isAdmin } = useApp();

  const participants = participantsData as Participant[];

  const handleUserSwitch = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (participant) {
      setCurrentParticipant(participant);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-primary-600">Fit</span>
              <span className="text-gray-800"> & </span>
              <span className="text-secondary-500">50</span>
            </h1>
            <p className="text-sm text-gray-600">Stay Consistency. Stay Fit.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {isAdmin ? 'Admin' : 'Participant'} • {currentParticipant?.total_points || 0} pts
              </p>
            </div>
            <Select
              value={currentParticipant.id}
              onChange={(e) => handleUserSwitch(e.target.value)}
              className="min-w-[200px]"
            >
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name} {participant.role === 'admin' ? '(Admin)' : ''}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}
