import { useEffect, useState } from 'react';
import { dataService } from '@/services/dataService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Award, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { calculateConsistencyBonus, getConsistencyLabel } from '@/utils/points';

interface ParticipantConsistency {
  participant_id: string;
  name: string;
  team: string;
  activeDays: number;
  bonusPoints: number;
  bonusLabel: string;
  alreadyAwarded: boolean;
}

export function ConsistencyBonuses() {
  const [participants, setParticipants] = useState<ParticipantConsistency[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    calculateConsistency();
  }, [selectedWeek]);

  async function calculateConsistency() {
    setCalculating(true);

    try {
      const weekStart = startOfWeek(subWeeks(new Date(), selectedWeek));
      const weekEnd = endOfWeek(subWeeks(new Date(), selectedWeek));
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

      const activeParticipants = await dataService.participants.getActive();
      const activities = await dataService.activities.getByDateRange(weekStartStr, weekEndStr);
      const existingBonuses = await dataService.bonuses.getByWeek(weekStartStr);

      const awardedParticipants = new Set(existingBonuses.map(b => b.participant_id));

      const consistencyData: ParticipantConsistency[] = [];

      for (const participant of activeParticipants) {
        const participantActivities = activities.filter(a => a.participant_id === participant.id);
        const uniqueDays = new Set(participantActivities.map(a => a.date)).size;
        const bonusPoints = calculateConsistencyBonus(uniqueDays);
        const bonusLabel = getConsistencyLabel(uniqueDays);

        consistencyData.push({
          participant_id: participant.id,
          name: participant.name,
          team: participant.team,
          activeDays: uniqueDays,
          bonusPoints,
          bonusLabel,
          alreadyAwarded: awardedParticipants.has(participant.id)
        });
      }

      consistencyData.sort((a, b) => b.activeDays - a.activeDays);
      setParticipants(consistencyData);

    } catch (error) {
      console.error('Error calculating consistency:', error);
    } finally {
      setCalculating(false);
    }
  }

  async function awardBonuses() {
    if (!confirm('Are you sure you want to award consistency bonuses for this week? This action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      const weekStart = startOfWeek(subWeeks(new Date(), selectedWeek));
      const weekEnd = endOfWeek(subWeeks(new Date(), selectedWeek));
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

      const bonusesToAward = participants.filter(p => p.bonusPoints > 0 && !p.alreadyAwarded);

      if (bonusesToAward.length === 0) {
        alert('No bonuses to award for this week');
        return;
      }

      const bonusRecords = bonusesToAward.map(p => ({
        participant_id: p.participant_id,
        week_start_date: weekStartStr,
        week_end_date: weekEndStr,
        days_active: p.activeDays,
        points_earned: p.bonusPoints
      }));

      await dataService.bonuses.addBulk(bonusRecords);

      alert(`Successfully awarded bonuses to ${bonusesToAward.length} participants!`);
      await calculateConsistency();

    } catch (error: any) {
      console.error('Error awarding bonuses:', error);
      alert(`Failed to award bonuses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const weekStart = startOfWeek(subWeeks(new Date(), selectedWeek));
  const weekEnd = endOfWeek(subWeeks(new Date(), selectedWeek));
  const totalBonusPoints = participants.reduce((sum, p) => sum + (p.alreadyAwarded ? 0 : p.bonusPoints), 0);
  const eligibleCount = participants.filter(p => p.bonusPoints > 0 && !p.alreadyAwarded).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Consistency Bonuses</h2>
        <p className="text-gray-600 mt-1">Award weekly bonuses based on participant consistency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700">Total Participants</p>
              <p className="text-3xl font-bold text-primary-900 mt-1">{participants.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-700">Eligible for Bonus</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{eligibleCount}</p>
            </div>
            <Award className="w-12 h-12 text-secondary-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-700">Total Bonus Points</p>
              <p className="text-3xl font-bold text-accent-900 mt-1">{totalBonusPoints}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-accent-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Selected Week</p>
              <p className="text-xl font-bold text-blue-900 mt-1">
                {selectedWeek === 0 ? 'Current' : `${selectedWeek} week${selectedWeek > 1 ? 's' : ''} ago`}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Week Selection</h3>
            <p className="text-sm text-gray-600 mt-1">
              {format(weekStart, 'MMM dd, yyyy')} - {format(weekEnd, 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((week) => (
              <Button
                key={week}
                variant={selectedWeek === week ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedWeek(week)}
              >
                {week === 0 ? 'This Week' : `${week}w ago`}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Consistency Bonus Rules</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• 7 days (Every day) = 1000 points</p>
            <p>• 5 days = 800 points</p>
            <p>• 3 days = 500 points</p>
            <p className="mt-2 text-blue-700">Note: A day counts if any valid activity or steps are logged</p>
          </div>
        </div>

        {calculating ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Calculating consistency data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Participant</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Active Days</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Consistency Level</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Bonus Points</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No participants found
                      </td>
                    </tr>
                  ) : (
                    participants.map((participant) => (
                      <tr key={participant.participant_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{participant.name}</td>
                        <td className="py-3 px-4 text-gray-600">{participant.team}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold">
                            {participant.activeDays}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            participant.activeDays >= 7 ? 'bg-primary-100 text-primary-700' :
                            participant.activeDays >= 5 ? 'bg-secondary-100 text-secondary-700' :
                            participant.activeDays >= 3 ? 'bg-accent-100 text-accent-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {participant.bonusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 font-semibold">
                            {participant.bonusPoints} pts
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {participant.alreadyAwarded ? (
                            <span className="inline-flex items-center gap-1 text-sm text-primary-600">
                              <CheckCircle className="w-4 h-4" />
                              Awarded
                            </span>
                          ) : participant.bonusPoints > 0 ? (
                            <span className="text-sm text-gray-600">Pending</span>
                          ) : (
                            <span className="text-sm text-gray-400">Not eligible</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {eligibleCount > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  onClick={awardBonuses}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  {loading ? 'Awarding...' : `Award Bonuses to ${eligibleCount} Participants`}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
