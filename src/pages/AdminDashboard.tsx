import { useEffect, useState } from 'react';
import { dataService } from '@/services/dataService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Users, Activity, Award, TrendingUp, Download, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDateRange, formatDate } from '@/utils/dateHelpers';
import { exportToExcel } from '@/utils/excelExport';
import { DailyActivity, Participant, WorkoutCategory } from '@/types';

type TimePeriod = 'today' | 'week' | 'month' | 'all';
type ViewMode = 'overview' | 'by-category' | 'by-user';

interface CategoryBreakdown {
  category: string;
  minutes: number;
  points: number;
  activities: number;
  color: string;
}

interface UserBreakdown {
  id: string;
  name: string;
  team: string;
  minutes: number;
  points: number;
  activities: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function AdminDashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);

  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [activeParticipants, setActiveParticipants] = useState(0);

  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [userBreakdown, setUserBreakdown] = useState<UserBreakdown[]>([]);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [timePeriod, customStartDate, customEndDate, selectedCategory, selectedUser]);

  async function loadData() {
    setLoading(true);
    try {
      const [participantsData, categoriesData] = await Promise.all([
        dataService.participants.getAll(),
        dataService.categories.getAll()
      ]);

      setParticipants(participantsData);
      setCategories(categoriesData);

      let dateRange;
      if (customStartDate && customEndDate) {
        dateRange = { startDate: customStartDate, endDate: customEndDate };
      } else {
        dateRange = getDateRange(timePeriod);
      }

      const activitiesData = await dataService.activities.getByDateRange(
        dateRange.startDate,
        dateRange.endDate
      );

      let filteredActivities = activitiesData;

      if (selectedCategory !== 'all') {
        filteredActivities = filteredActivities.filter(a => a.category_id === selectedCategory);
      }

      if (selectedUser !== 'all') {
        filteredActivities = filteredActivities.filter(a => a.participant_id === selectedUser);
      }

      setActivities(filteredActivities);

      const minutes = filteredActivities.reduce((sum, a) => sum + a.duration_minutes, 0);
      const points = filteredActivities.reduce((sum, a) => sum + a.points_earned, 0);
      const uniqueParticipants = new Set(filteredActivities.map(a => a.participant_id)).size;

      setTotalMinutes(minutes);
      setTotalPoints(points);
      setTotalActivities(filteredActivities.length);
      setActiveParticipants(uniqueParticipants);

      const categoryMap = new Map<string, CategoryBreakdown>();
      filteredActivities.forEach(activity => {
        const category = categoriesData.find(c => c.id === activity.category_id);
        const categoryName = category?.name || activity.workout_type;

        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            category: categoryName,
            minutes: 0,
            points: 0,
            activities: 0,
            color: COLORS[categoryMap.size % COLORS.length]
          });
        }

        const breakdown = categoryMap.get(categoryName)!;
        breakdown.minutes += activity.duration_minutes;
        breakdown.points += activity.points_earned;
        breakdown.activities += 1;
      });

      const categoryBreakdownData = Array.from(categoryMap.values())
        .sort((a, b) => b.minutes - a.minutes);
      setCategoryBreakdown(categoryBreakdownData);

      const userMap = new Map<string, UserBreakdown>();
      filteredActivities.forEach(activity => {
        const participant = participantsData.find(p => p.id === activity.participant_id);

        if (participant && !userMap.has(participant.id)) {
          userMap.set(participant.id, {
            id: participant.id,
            name: participant.name,
            team: participant.team,
            minutes: 0,
            points: 0,
            activities: 0
          });
        }

        if (participant) {
          const breakdown = userMap.get(participant.id)!;
          breakdown.minutes += activity.duration_minutes;
          breakdown.points += activity.points_earned;
          breakdown.activities += 1;
        }
      });

      const userBreakdownData = Array.from(userMap.values())
        .sort((a, b) => b.minutes - a.minutes);
      setUserBreakdown(userBreakdownData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      let dateRange;
      if (customStartDate && customEndDate) {
        dateRange = { startDate: customStartDate, endDate: customEndDate };
      } else {
        dateRange = getDateRange(timePeriod);
      }

      const exportActivities = await dataService.activities.getByDateRange(
        dateRange.startDate,
        dateRange.endDate
      );

      let filteredForExport = exportActivities;
      if (selectedCategory !== 'all') {
        filteredForExport = filteredForExport.filter(a => a.category_id === selectedCategory);
      }
      if (selectedUser !== 'all') {
        filteredForExport = filteredForExport.filter(a => a.participant_id === selectedUser);
      }

      exportToExcel(filteredForExport, participants, categories, dateRange);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  function handleTimePeriodChange(period: TimePeriod) {
    setTimePeriod(period);
    setCustomStartDate('');
    setCustomEndDate('');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button
          onClick={handleExport}
          disabled={exporting || activities.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['today', 'week', 'month', 'all'] as TimePeriod[]).map(period => (
                  <Button
                    key={period}
                    onClick={() => handleTimePeriodChange(period)}
                    variant={timePeriod === period ? 'primary' : 'secondary'}
                    className="text-sm capitalize"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Filter
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Filter
              </label>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="all">All Users</option>
                {participants.filter(p => p.status === 'Active').map(participant => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Custom Date Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={formatDate(new Date())}
                />
                <span className="self-center text-gray-500">to</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  max={formatDate(new Date())}
                  min={customStartDate}
                />
              </div>
            </div>

            <div className="flex items-end">
              <div className="grid grid-cols-3 gap-2 w-full">
                {(['overview', 'by-category', 'by-user'] as ViewMode[]).map(mode => (
                  <Button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    variant={viewMode === mode ? 'primary' : 'secondary'}
                    className="text-sm"
                  >
                    {mode === 'overview' ? 'Overview' : mode === 'by-category' ? 'By Category' : 'By User'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Minutes</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{totalMinutes.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Activity className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Points</p>
              <p className="text-3xl font-bold text-secondary-600 mt-2">{totalPoints.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Award className="w-8 h-8 text-secondary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activities</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalActivities}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{activeParticipants}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Minutes by Category</h3>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="minutes" fill="#3b82f6" name="Minutes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available for selected filters
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution</h3>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="activities"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available for selected filters
              </div>
            )}
          </Card>
        </div>
      )}

      {viewMode === 'by-category' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown by Category</h3>
          {categoryBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Minutes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Minutes/Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryBreakdown.map((category, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium text-gray-900">{category.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.activities}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.minutes.toLocaleString()} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.points.toLocaleString()} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round(category.minutes / category.activities)} min
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalActivities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalMinutes.toLocaleString()} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalPoints.toLocaleString()} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalActivities > 0 ? Math.round(totalMinutes / totalActivities) : 0} min
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No data available for selected filters
            </div>
          )}
        </Card>
      )}

      {viewMode === 'by-user' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown by User</h3>
          {userBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Minutes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Minutes/Day
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userBreakdown.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.team}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.activities}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.minutes.toLocaleString()} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.points.toLocaleString()} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round(user.minutes / user.activities)} min
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={3}>
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalActivities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalMinutes.toLocaleString()} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalPoints.toLocaleString()} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalActivities > 0 ? Math.round(totalMinutes / totalActivities) : 0} min
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No data available for selected filters
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
