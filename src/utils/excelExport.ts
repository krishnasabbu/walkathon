import * as XLSX from 'xlsx';
import { DailyActivity, Participant, WorkoutCategory } from '@/types';
import { format } from 'date-fns';

interface ActivityWithDetails extends DailyActivity {
  participant_name?: string;
  category_name?: string;
}

export function exportToExcel(
  activities: ActivityWithDetails[],
  participants: Participant[],
  categories: WorkoutCategory[],
  dateRange: { startDate: string; endDate: string }
) {
  const workbook = XLSX.utils.book_new();

  const activityMap = new Map<string, ActivityWithDetails[]>();
  activities.forEach(activity => {
    const date = activity.date;
    if (!activityMap.has(date)) {
      activityMap.set(date, []);
    }
    activityMap.get(date)!.push(activity);
  });

  const dates = Array.from(activityMap.keys()).sort().reverse();

  dates.forEach(date => {
    const dayActivities = activityMap.get(date) || [];

    const data = dayActivities.map(activity => {
      const participant = participants.find(p => p.id === activity.participant_id);
      const category = categories.find(c => c.id === activity.category_id);

      return {
        'Date': format(new Date(activity.date), 'MMM dd, yyyy'),
        'Participant': participant?.name || 'Unknown',
        'Employee ID': participant?.employee_id || 'N/A',
        'Team': participant?.team || 'N/A',
        'Category': category?.name || activity.workout_type,
        'Workout Type': activity.workout_type,
        'Activity Details': activity.activity_details || '',
        'Duration (min)': activity.duration_minutes,
        'Points Earned': activity.points_earned,
        'Points/Min': category?.points_per_minute || 0
      };
    });

    const totalMinutes = dayActivities.reduce((sum, a) => sum + a.duration_minutes, 0);
    const totalPoints = dayActivities.reduce((sum, a) => sum + a.points_earned, 0);

    data.push({
      'Date': 'TOTAL',
      'Participant': '',
      'Employee ID': '',
      'Team': '',
      'Category': '',
      'Workout Type': '',
      'Activity Details': '',
      'Duration (min)': totalMinutes,
      'Points Earned': totalPoints,
      'Points/Min': ''
    } as any);

    const worksheet = XLSX.utils.json_to_sheet(data);

    const colWidths = [
      { wch: 12 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 }
    ];
    worksheet['!cols'] = colWidths;

    const sheetName = format(new Date(date), 'MMM-dd-yyyy');
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  const summaryData = participants
    .map(participant => {
      const participantActivities = activities.filter(a => a.participant_id === participant.id);
      const totalMinutes = participantActivities.reduce((sum, a) => sum + a.duration_minutes, 0);
      const totalPoints = participantActivities.reduce((sum, a) => sum + a.points_earned, 0);
      const activityCount = participantActivities.length;

      return {
        'Participant': participant.name,
        'Employee ID': participant.employee_id,
        'Team': participant.team,
        'Total Activities': activityCount,
        'Total Minutes': totalMinutes,
        'Total Points': totalPoints,
        'Avg Minutes/Day': activityCount > 0 ? Math.round(totalMinutes / activityCount) : 0,
        'Status': participant.status
      };
    })
    .filter(p => p['Total Activities'] > 0)
    .sort((a, b) => b['Total Points'] - a['Total Points']);

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  summaryWorksheet['!cols'] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 }
  ];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

  const categoryData = categories.map(category => {
    const categoryActivities = activities.filter(a => a.category_id === category.id);
    const totalMinutes = categoryActivities.reduce((sum, a) => sum + a.duration_minutes, 0);
    const totalPoints = categoryActivities.reduce((sum, a) => sum + a.points_earned, 0);
    const activityCount = categoryActivities.length;

    return {
      'Category': category.name,
      'Points/Minute': category.points_per_minute,
      'Total Activities': activityCount,
      'Total Minutes': totalMinutes,
      'Total Points': totalPoints,
      'Avg Duration': activityCount > 0 ? Math.round(totalMinutes / activityCount) : 0
    };
  })
  .filter(c => c['Total Activities'] > 0)
  .sort((a, b) => b['Total Minutes'] - a['Total Minutes']);

  const categoryWorksheet = XLSX.utils.json_to_sheet(categoryData);
  categoryWorksheet['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, categoryWorksheet, 'By Category');

  const filename = `Workout_Data_${format(new Date(dateRange.startDate), 'MMM-dd')}_to_${format(new Date(dateRange.endDate), 'MMM-dd-yyyy')}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
