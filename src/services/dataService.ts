import { Participant, DailyActivity, WeeklyBonus } from '@/types';
import participantsData from '@/data/participants.json';
import activitiesData from '@/data/activities.json';
import bonusesData from '@/data/bonuses.json';

let participants: Participant[] = [...(participantsData as Participant[])];
let activities: DailyActivity[] = [...(activitiesData as DailyActivity[])];
let bonuses: WeeklyBonus[] = [...(bonusesData as WeeklyBonus[])];

export const dataService = {
  participants: {
    getAll: async (): Promise<Participant[]> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...participants]), 100);
      });
    },

    getById: async (id: string): Promise<Participant | null> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const participant = participants.find(p => p.id === id);
          resolve(participant || null);
        }, 100);
      });
    },

    getActive: async (): Promise<Participant[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(participants.filter(p => p.status === 'Active'));
        }, 100);
      });
    },

    add: async (participant: Omit<Participant, 'id' | 'created_at' | 'updated_at'>): Promise<Participant> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newParticipant: Participant = {
            ...participant,
            id: `${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          participants.push(newParticipant);
          resolve(newParticipant);
        }, 100);
      });
    },

    update: async (id: string, updates: Partial<Participant>): Promise<Participant | null> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = participants.findIndex(p => p.id === id);
          if (index !== -1) {
            participants[index] = {
              ...participants[index],
              ...updates,
              updated_at: new Date().toISOString()
            };
            resolve(participants[index]);
          } else {
            resolve(null);
          }
        }, 100);
      });
    },

    recalculatePoints: (participantId: string) => {
      const participantActivities = activities.filter(a => a.participant_id === participantId);
      const participantBonuses = bonuses.filter(b => b.participant_id === participantId);

      const activityPoints = participantActivities.reduce((sum, a) => sum + a.points_earned, 0);
      const bonusPoints = participantBonuses.reduce((sum, b) => sum + b.points_earned, 0);

      const index = participants.findIndex(p => p.id === participantId);
      if (index !== -1) {
        participants[index].total_points = activityPoints + bonusPoints;
      }
    }
  },

  activities: {
    getAll: async (): Promise<DailyActivity[]> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...activities]), 100);
      });
    },

    getByDate: async (date: string): Promise<DailyActivity[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(activities.filter(a => a.date === date));
        }, 100);
      });
    },

    getByParticipant: async (participantId: string): Promise<DailyActivity[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(activities.filter(a => a.participant_id === participantId).sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ));
        }, 100);
      });
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<DailyActivity[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(activities.filter(a => a.date >= startDate && a.date <= endDate));
        }, 100);
      });
    },

    add: async (activity: Omit<DailyActivity, 'id' | 'created_at'>): Promise<DailyActivity> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newActivity: DailyActivity = {
            ...activity,
            id: `act${Date.now()}`,
            created_at: new Date().toISOString()
          };
          activities.push(newActivity);

          dataService.participants.recalculatePoints(activity.participant_id);

          resolve(newActivity);
        }, 100);
      });
    }
  },

  bonuses: {
    getAll: async (): Promise<WeeklyBonus[]> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...bonuses]), 100);
      });
    },

    getByParticipant: async (participantId: string): Promise<WeeklyBonus[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(bonuses.filter(b => b.participant_id === participantId));
        }, 100);
      });
    },

    getByWeek: async (weekStart: string): Promise<WeeklyBonus[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(bonuses.filter(b => b.week_start_date === weekStart));
        }, 100);
      });
    },

    addBulk: async (newBonuses: Omit<WeeklyBonus, 'id' | 'created_at'>[]): Promise<WeeklyBonus[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const createdBonuses: WeeklyBonus[] = newBonuses.map(bonus => ({
            ...bonus,
            id: `bonus${Date.now()}_${Math.random()}`,
            created_at: new Date().toISOString()
          }));

          bonuses.push(...createdBonuses);

          createdBonuses.forEach(bonus => {
            dataService.participants.recalculatePoints(bonus.participant_id);
          });

          resolve(createdBonuses);
        }, 100);
      });
    }
  }
};
