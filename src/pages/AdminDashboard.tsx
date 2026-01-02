import { useEffect, useState } from 'react';
import { dataService } from '@/services/dataService';
import { Card } from '@/components/ui/Card';
import { Users, Activity, Footprints, Award, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface DailyMetrics {
  totalParticipants: number;
  activeToday: number;
  totalWorkoutMinutes: number;
  totalSteps: number;
  totalPointsToday: number;
}

interface Leaderboard {
  id: string;
  name: string;
  total_points: number;
  team: string;
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DailyMetrics>({
    totalParticipants: 0,
    activeToday: 0,
    totalWorkoutMinutes: 0,
    totalSteps: 0,
    totalPointsToday: 0
  });
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [activityDistribution, setActivityDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      const participants = await dataService.participants.getActive();
      const todayActivities = await dataService.activities.getByDate(today);

      const uniqueParticipantsToday = new Set(todayActivities?.map(a => a.participant_id)).size;

      const totalWorkoutMinutes = todayActivities?.reduce((sum, a) => sum + a.duration_minutes, 0) || 0;
      const totalSteps = todayActivities?.reduce((sum, a) => sum + a.steps_count, 0) || 0;
      const totalPointsToday = todayActivities?.reduce((sum, a) => sum + a.points_earned, 0) || 0;

      setMetrics({
        totalParticipants: participants.length,
        activeToday: uniqueParticipantsToday,
        totalWorkoutMinutes,
        totalSteps,
        totalPointsToday
      });

      const allParticipants = await dataService.participants.getAll();
      const topParticipants = allParticipants
        .filter(p => p.status === 'Active')
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 10);

      setLeaderboard(topParticipants);

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
      });

      const trendPromises = last7Days.map(async (date) => {
        const activities = await dataService.activities.getByDate(date);

        const uniqueParticipants = new Set(activities.map(a => a.participant_id)).size;
        const totalSteps = activities.reduce((sum, a) => sum + a.steps_count, 0);
        const totalMinutes = activities.reduce((sum, a) => sum + a.duration_minutes, 0);

        return {
          date: format(new Date(date), 'MMM dd'),
          participants: uniqueParticipants,
          steps: totalSteps,
          minutes: totalMinutes
        };
      });

      const trendData = await Promise.all(trendPromises);
      setDailyTrend(trendData);

      const allActivities = await dataService.activities.getAll();

      const activityCounts: Record<string, number> = {};
      allActivities.forEach(activity => {
        activityCounts[activity.workout_type] = (activityCounts[activity.workout_type] || 0) + 1;
      });

      const distributionData = Object.entries(activityCounts).map(([name, value]) => ({
        name,
        value
      }));

      setActivityDistribution(distributionData);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Overview of all walkathon activities and participant performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700">Total Participants</p>
              <p className="text-3xl font-bold text-primary-900 mt-1">{metrics.totalParticipants}</p>
            </div>
            <Users className="w-12 h-12 text-primary-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-700">Active Today</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{metrics.activeToday}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-secondary-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-700">Workout Minutes</p>
              <p className="text-3xl font-bold text-accent-900 mt-1">{metrics.totalWorkoutMinutes}</p>
            </div>
            <Activity className="w-12 h-12 text-accent-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Steps</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{metrics.totalSteps.toLocaleString()}</p>
            </div>
            <Footprints className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Points Today</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{metrics.totalPointsToday}</p>
            </div>
            <Award className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Participation Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="participants" stroke="#22c55e" strokeWidth={2} name="Active Participants" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Steps Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="steps" stroke="#eab308" strokeWidth={2} name="Total Steps" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Workout Minutes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="minutes" fill="#ef4444" name="Workout Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Activity Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {activityDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Top 10 Leaderboard</h3>
          <Award className="w-6 h-6 text-secondary-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((participant, index) => (
                <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      index === 0 ? 'bg-secondary-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{participant.name}</td>
                  <td className="py-3 px-4 text-gray-600">{participant.team}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-semibold">
                      {participant.total_points} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
