import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { WorkoutCategory } from '@/types';
import { Activity, Award, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function LogActivity() {
  const { currentParticipant } = useApp();
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [todayActivities, setTodayActivities] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (currentParticipant) {
      loadTodayActivities();
    }
  }, [currentParticipant]);

  async function loadCategories() {
    try {
      setCategoriesLoading(true);
      const data = await dataService.categories.getAll();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load workout categories');
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function loadTodayActivities() {
    if (!currentParticipant) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      const activities = await dataService.activities.getByParticipant(currentParticipant.id);
      const todayActs = activities.filter(a => a.date === today);
      setTodayActivities(todayActs);
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentParticipant) {
      setError('Participant information not found');
      return;
    }

    if (!selectedCategoryId) {
      setError('Please select a workout category');
      return;
    }

    const duration = parseInt(durationMinutes) || 0;

    if (duration < 1) {
      setError('Duration must be at least 1 minute');
      return;
    }

    if (!activityDetails.trim()) {
      setError('Please provide activity details');
      return;
    }

    setLoading(true);

    try {
      const category = categories.find(c => c.id === selectedCategoryId);
      if (!category) {
        throw new Error('Selected category not found');
      }

      const totalPoints = category.points_per_minute * duration;

      await dataService.activities.add({
        date: format(new Date(), 'yyyy-MM-dd'),
        participant_id: currentParticipant.id,
        category_id: selectedCategoryId,
        workout_type: category.name,
        activity_details: activityDetails,
        duration_minutes: duration,
        points_earned: totalPoints,
        proof_filename: null
      });

      setSuccess(`Activity logged successfully! You earned ${totalPoints} points.`);
      setActivityDetails('');
      setDurationMinutes('');

      await loadTodayActivities();
    } catch (err: any) {
      setError(err.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  }

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const duration = parseInt(durationMinutes) || 0;
  const estimatedPoints = selectedCategory ? selectedCategory.points_per_minute * duration : 0;

  const todayTotalPoints = todayActivities.reduce((sum, activity) => sum + activity.points_earned, 0);
  const hasLoggedToday = todayActivities.length > 0;

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-yellow-50 border border-yellow-200">
          <div className="text-center py-8">
            <Activity className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-yellow-900 mb-2">No Workout Categories Available</h3>
            <p className="text-yellow-700">Please contact your admin to add workout categories first.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Log Daily Activity</h2>
        <p className="text-gray-600 mt-1">Track your workouts and steps to earn points</p>
      </div>

      {hasLoggedToday && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-12 h-12 text-primary-600" />
            <div>
              <h3 className="text-lg font-bold text-primary-900">Great Job Today!</h3>
              <p className="text-primary-700">
                You've logged {todayActivities.length} {todayActivities.length === 1 ? 'activity' : 'activities'} and earned {todayTotalPoints} points today
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Activity</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Workout Category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.points_per_minute} pts/min)
                </option>
              ))}
            </Select>

            <Input
              label="Duration (minutes)"
              type="number"
              placeholder="30"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min="1"
              required
            />

            <Input
              label="Activity Details"
              placeholder="e.g., Morning jog at park, Evening yoga session, etc."
              value={activityDetails}
              onChange={(e) => setActivityDetails(e.target.value)}
              required
            />

            {error && (
              <div className="bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging...' : 'Log Activity'}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-secondary-900">Estimated Points</h4>
              <Award className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-700">Duration:</span>
                <span className="font-bold text-secondary-900">{duration} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-700">Rate:</span>
                <span className="font-bold text-secondary-900">{selectedCategory?.points_per_minute || 0} pts/min</span>
              </div>
              <div className="border-t-2 border-secondary-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-secondary-900">Total:</span>
                <span className="text-2xl font-bold text-secondary-900">{estimatedPoints} pts</span>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-600" />
              Selected Category
            </h4>
            {selectedCategory ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{selectedCategory.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points/min:</span>
                  <span className="font-medium text-primary-600">{selectedCategory.points_per_minute}</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded mt-3">
                  <p className="text-xs text-blue-700">
                    <strong>Examples:</strong><br/>
                    30 min = {selectedCategory.points_per_minute * 30} pts<br/>
                    60 min = {selectedCategory.points_per_minute * 60} pts
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a category above</p>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <h4 className="font-bold text-green-900 mb-2">Quick Tip</h4>
            <p className="text-sm text-green-700">
              The longer you workout, the more points you earn! Stay consistent and reach your fitness goals.
            </p>
          </Card>
        </div>
      </div>

      {todayActivities.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Activities</h3>
          <div className="space-y-3">
            {todayActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{activity.workout_type}</h4>
                  <p className="text-sm text-gray-600">{activity.activity_details}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    {activity.duration_minutes > 0 && (
                      <span>{activity.duration_minutes} min</span>
                    )}
                    {activity.steps_count > 0 && (
                      <span>{activity.steps_count.toLocaleString()} steps</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-semibold">
                    {activity.points_earned} pts
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(activity.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
