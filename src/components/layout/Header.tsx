import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { participant, signOut, isAdmin } = useAuth();

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
              <p className="font-medium text-gray-800">{participant?.name}</p>
              <p className="text-sm text-gray-600">
                {isAdmin ? 'Admin' : 'Participant'} • {participant?.total_points || 0} pts
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
