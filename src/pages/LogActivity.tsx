import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { WorkoutTypes, WorkoutType, StepSlabs } from '@/types';
import { calculateWorkoutPoints, calculateStepPoints } from '@/utils/points';
import { Activity, Footprints, Award, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function LogActivity() {
  const { currentParticipant } = useApp();
  const [workoutType, setWorkoutType] = useState<WorkoutType>('Simple Cardio');
  const [activityDetails, setActivityDetails] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [stepsCount, setStepsCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [todayActivities, setTodayActivities] = useState<any[]>([]);

  useEffect(() => {
    if (currentParticipant) {
      loadTodayActivities();
    }
  }, [currentParticipant]);

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

    const duration = parseInt(durationMinutes) || 0;
    const steps = parseInt(stepsCount) || 0;

    if (workoutType !== 'Steps Only' && duration < WorkoutTypes[workoutType].minDuration) {
      setError(`${workoutType} requires minimum ${WorkoutTypes[workoutType].minDuration} minutes`);
      return;
    }

    if (!activityDetails.trim()) {
      setError('Please provide activity details');
      return;
    }

    if (!activityDetails.trim()) {
      setError('Please provide activity details');
      return;
    }

    setLoading(true);

    try {
      const workoutPoints = calculateWorkoutPoints(workoutType, duration);
      const stepPoints = calculateStepPoints(steps);
      const totalPoints = workoutPoints + stepPoints;

      await dataService.activities.add({
        date: format(new Date(), 'yyyy-MM-dd'),
        participant_id: currentParticipant.id,
        workout_type: workoutType,
        activity_details: activityDetails,
        duration_minutes: duration,
        steps_count: steps,
        points_earned: totalPoints,
        proof_filename: null
      });

      setSuccess(`Activity logged successfully! You earned ${totalPoints} points.`);
      setActivityDetails('');
      setDurationMinutes('');
      setStepsCount('');

      await loadTodayActivities();
    } catch (err: any) {
      setError(err.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  }

  const selectedWorkout = WorkoutTypes[workoutType];
  const estimatedWorkoutPoints = calculateWorkoutPoints(workoutType, parseInt(durationMinutes) || 0);
  const estimatedStepPoints = calculateStepPoints(parseInt(stepsCount) || 0);
  const estimatedTotal = estimatedWorkoutPoints + estimatedStepPoints;

  const todayTotalPoints = todayActivities.reduce((sum, activity) => sum + activity.points_earned, 0);
  const hasLoggedToday = todayActivities.length > 0;

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
              label="Workout Type"
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
            >
              {Object.keys(WorkoutTypes).map((type) => (
                <option key={type} value={type}>
                  {WorkoutTypes[type as WorkoutType].icon} {type}
                </option>
              ))}
            </Select>

            <Input
              label="Activity Details"
              placeholder="e.g., Morning jog at park, Yoga session, etc."
              value={activityDetails}
              onChange={(e) => setActivityDetails(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={`Duration (min) ${workoutType !== 'Steps Only' ? `- Min: ${selectedWorkout.minDuration}` : ''}`}
                type="number"
                placeholder="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                min="0"
              />

              <Input
                label="Steps Count"
                type="number"
                placeholder="0"
                value={stepsCount}
                onChange={(e) => setStepsCount(e.target.value)}
                min="0"
              />
            </div>

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
                <span className="text-sm text-secondary-700">Workout:</span>
                <span className="font-bold text-secondary-900">{estimatedWorkoutPoints} pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-700">Steps:</span>
                <span className="font-bold text-secondary-900">{estimatedStepPoints} pts</span>
              </div>
              <div className="border-t-2 border-secondary-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-secondary-900">Total:</span>
                <span className="text-2xl font-bold text-secondary-900">{estimatedTotal} pts</span>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Footprints className="w-5 h-5 text-primary-600" />
              Step Slabs
            </h4>
            <div className="space-y-2">
              {StepSlabs.map((slab) => (
                <div
                  key={slab.steps}
                  className={`flex justify-between items-center p-2 rounded ${
                    parseInt(stepsCount) >= slab.steps
                      ? 'bg-primary-100 text-primary-900'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-sm font-medium">{slab.steps.toLocaleString()}+ steps</span>
                  <span className="font-bold">{slab.points} pts</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-600" />
              Selected Workout
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{workoutType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Points:</span>
                <span className="font-medium text-primary-600">{selectedWorkout.points}</span>
              </div>
              {workoutType !== 'Steps Only' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Duration:</span>
                  <span className="font-medium">{selectedWorkout.minDuration} min</span>
                </div>
              )}
            </div>
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
