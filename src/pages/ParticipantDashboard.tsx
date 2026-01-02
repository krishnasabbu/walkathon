import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Award, Calendar, Flame, TrendingUp, Activity } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function ParticipantDashboard() {
  const { participant } = useAuth();
  const [stats, setStats] = useState({
    totalPoints: 0,
    todayPoints: 0,
    weeklyActiveDays: 0,
    totalActivities: 0,
    currentStreak: 0
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (participant) {
      loadDashboardData();
    }
  }, [participant]);

  async function loadDashboardData() {
    if (!participant) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');

      const { data: allActivities } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('participant_id', participant.id)
        .order('date', { ascending: false });

      const { data: todayActivities } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('participant_id', participant.id)
        .eq('date', today);

      const { data: weekActivities } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('participant_id', participant.id)
        .gte('date', weekStart)
        .lte('date', weekEnd);

      const todayPoints = todayActivities?.reduce((sum, a) => sum + a.points_earned, 0) || 0;

      const weeklyUniqueDays = new Set(weekActivities?.map(a => a.date)).size;

      const currentStreak = calculateStreak(allActivities || []);

      setStats({
        totalPoints: participant.total_points,
        todayPoints,
        weeklyActiveDays: weeklyUniqueDays,
        totalActivities: allActivities?.length || 0,
        currentStreak
      });

      const daysOfWeek = eachDayOfInterval({
        start: startOfWeek(new Date()),
        end: endOfWeek(new Date())
      });

      const weeklyChartData = daysOfWeek.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayActivities = weekActivities?.filter(a => a.date === dateStr) || [];
        const points = dayActivities.reduce((sum, a) => sum + a.points_earned, 0);
        const minutes = dayActivities.reduce((sum, a) => sum + a.duration_minutes, 0);

        return {
          day: format(day, 'EEE'),
          points,
          minutes,
          activities: dayActivities.length
        };
      });

      setWeeklyData(weeklyChartData);
      setRecentActivities(allActivities?.slice(0, 10) || []);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStreak(activities: any[]): number {
    if (!activities.length) return 0;

    const uniqueDates = [...new Set(activities.map(a => a.date))].sort().reverse();
    let streak = 0;
    let currentDate = new Date();

    for (const date of uniqueDates) {
      const activityDate = new Date(date);
      const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Dashboard</h2>
        <p className="text-gray-600">Track your progress and stay consistent</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700">Total Points</p>
              <p className="text-3xl font-bold text-primary-900 mt-1">{stats.totalPoints}</p>
            </div>
            <Award className="w-12 h-12 text-primary-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-700">Today's Points</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{stats.todayPoints}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-secondary-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-700">This Week</p>
              <p className="text-3xl font-bold text-accent-900 mt-1">{stats.weeklyActiveDays}/7</p>
            </div>
            <Calendar className="w-12 h-12 text-accent-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Current Streak</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{stats.currentStreak}</p>
            </div>
            <Flame className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Activities</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalActivities}</p>
            </div>
            <Activity className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Points</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="points" fill="#22c55e" name="Points Earned" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Workout Minutes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="minutes" stroke="#ef4444" strokeWidth={2} name="Minutes" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Weekly Consistency Progress</h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Daily Target (7 days)</span>
              <span className="font-medium">{stats.weeklyActiveDays}/7 days</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  stats.weeklyActiveDays >= 7
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                    : 'bg-primary-500'
                }`}
                style={{ width: `${(stats.weeklyActiveDays / 7) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {stats.weeklyActiveDays >= 7 ? '1000 pts bonus earned!' :
               stats.weeklyActiveDays >= 5 ? 'Almost there! Keep going for 1000 pts' :
               stats.weeklyActiveDays >= 3 ? 'Good progress! 2 more days for 800 pts' :
               'Log activities to earn consistency bonus'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              stats.weeklyActiveDays >= 3
                ? 'bg-primary-50 border-primary-500'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-sm font-medium text-gray-700">3 Days</p>
              <p className="text-2xl font-bold text-primary-600">500 pts</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${
              stats.weeklyActiveDays >= 5
                ? 'bg-primary-50 border-primary-500'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-sm font-medium text-gray-700">5 Days</p>
              <p className="text-2xl font-bold text-primary-600">800 pts</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${
              stats.weeklyActiveDays >= 7
                ? 'bg-primary-50 border-primary-500'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-sm font-medium text-gray-700">7 Days</p>
              <p className="text-2xl font-bold text-primary-600">1000 pts</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No activities logged yet</p>
          ) : (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activity.workout_type.includes('Cardio') ? '🏃' :
                                                   activity.workout_type.includes('Gym') ? '🏋️' :
                                                   activity.workout_type.includes('Yoga') ? '🧘' :
                                                   activity.workout_type.includes('Sport') ? '⚽' : '💪'}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">{activity.workout_type}</h4>
                      <p className="text-sm text-gray-600">{activity.activity_details}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                    {activity.points_earned} pts
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(activity.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
