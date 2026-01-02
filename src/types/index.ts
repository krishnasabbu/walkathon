export interface Participant {
  id: string;
  employee_id: string;
  name: string;
  team: string;
  email: string;
  status: 'Active' | 'Inactive';
  total_points: number;
  role: 'admin' | 'participant';
  created_at: string;
  updated_at: string;
}

export interface DailyActivity {
  id: string;
  date: string;
  participant_id: string;
  workout_type: string;
  activity_details: string;
  duration_minutes: number;
  steps_count: number;
  points_earned: number;
  proof_filename: string | null;
  created_at: string;
}

export interface WeeklyBonus {
  id: string;
  participant_id: string;
  week_start_date: string;
  week_end_date: string;
  days_active: number;
  points_earned: number;
  created_at: string;
}

export interface DashboardMetrics {
  totalParticipants: number;
  activeToday: number;
  totalWorkoutMinutes: number;
  totalSteps: number;
  totalPointsToday: number;
}

export const WorkoutTypes = {
  'Any Sport': { points: 150, minDuration: 30, icon: '🟢' },
  'Simple Cardio': { points: 100, minDuration: 15, icon: '🟡' },
  'Intense Cardio': { points: 180, minDuration: 30, icon: '🔴' },
  'Bodyweight / Functional Training': { points: 200, minDuration: 30, icon: '🔵' },
  'Gym Training': { points: 200, minDuration: 30, icon: '🟣' },
  'Yoga / Meditation / Stretching': { points: 120, minDuration: 30, icon: '🟢' },
  'Bodyweight Challenge': { points: 150, minDuration: 15, icon: '🔥' },
  'Steps Only': { points: 0, minDuration: 0, icon: '👟' }
} as const;

export type WorkoutType = keyof typeof WorkoutTypes;

export const StepSlabs = [
  { steps: 20000, points: 500 },
  { steps: 15000, points: 300 },
  { steps: 10000, points: 150 },
  { steps: 8000, points: 80 }
];

export const ConsistencyBonuses = [
  { days: 7, points: 1000, label: 'Every day' },
  { days: 5, points: 800, label: '5 days/week' },
  { days: 3, points: 500, label: '3 days/week' }
];
