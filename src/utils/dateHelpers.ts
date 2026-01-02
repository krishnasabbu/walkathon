import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getDateRange(period: 'today' | 'week' | 'month' | 'all', referenceDate: Date = new Date()): { startDate: string; endDate: string } {
  const today = formatDate(referenceDate);

  switch (period) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'week':
      return {
        startDate: formatDate(startOfWeek(referenceDate, { weekStartsOn: 1 })),
        endDate: formatDate(endOfWeek(referenceDate, { weekStartsOn: 1 }))
      };
    case 'month':
      return {
        startDate: formatDate(startOfMonth(referenceDate)),
        endDate: formatDate(endOfMonth(referenceDate))
      };
    case 'all':
      return {
        startDate: '2000-01-01',
        endDate: formatDate(new Date())
      };
    default:
      return { startDate: today, endDate: today };
  }
}

export function getDaysAgo(days: number): string {
  return formatDate(subDays(new Date(), days));
}

export function getAllDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    dates.push(formatDate(current));
  }

  return dates;
}
