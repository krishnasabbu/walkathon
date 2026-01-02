import { WorkoutTypes, StepSlabs, ConsistencyBonuses, WorkoutType } from '@/types';

export function calculateWorkoutPoints(workoutType: WorkoutType, durationMinutes: number): number {
  const workout = WorkoutTypes[workoutType];

  if (workoutType === 'Steps Only') {
    return 0;
  }

  if (durationMinutes < workout.minDuration) {
    return 0;
  }

  return workout.points;
}

export function calculateStepPoints(steps: number): number {
  for (const slab of StepSlabs) {
    if (steps >= slab.steps) {
      return slab.points;
    }
  }
  return 0;
}

export function calculateConsistencyBonus(activeDays: number): number {
  for (const bonus of ConsistencyBonuses) {
    if (activeDays >= bonus.days) {
      return bonus.points;
    }
  }
  return 0;
}

export function getConsistencyLabel(activeDays: number): string {
  for (const bonus of ConsistencyBonuses) {
    if (activeDays >= bonus.days) {
      return bonus.label;
    }
  }
  return 'No bonus';
}
