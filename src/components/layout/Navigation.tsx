import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Navigation() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 ${
              isActive('/')
                ? 'border-primary-600 text-primary-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-primary-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/participants"
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 ${
                  isActive('/participants')
                    ? 'border-primary-600 text-primary-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-primary-600'
                }`}
              >
                <Users className="w-5 h-5" />
                Participants
              </Link>

              <Link
                to="/consistency-bonuses"
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 ${
                  isActive('/consistency-bonuses')
                    ? 'border-primary-600 text-primary-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-primary-600'
                }`}
              >
                <Award className="w-5 h-5" />
                Bonuses
              </Link>
            </>
          )}

          {!isAdmin && (
            <Link
              to="/log-activity"
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 ${
                isActive('/log-activity')
                  ? 'border-primary-600 text-primary-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-primary-600'
              }`}
            >
              <Activity className="w-5 h-5" />
              Log Activity
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
