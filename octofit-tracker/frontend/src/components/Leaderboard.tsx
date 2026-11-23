import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = {
  teamName?: string;
  totalPoints?: number;
  rank?: number;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLeaderboard(null);
    setError(null);

    getJson<{ leaderboard?: LeaderboardEntry[] }>('/api/leaderboard')
      .then((response) => {
        if (active) setLeaderboard(Array.isArray(response.leaderboard) ? response.leaderboard : []);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      emptyText="No leaderboard rankings found."
      items={leaderboard}
      error={error}
      renderItem={(entry) => (
        <span>
          {entry.rank ? `${entry.rank}. ` : ''}
          {entry.teamName ?? 'Team'} - {entry.totalPoints ?? 0} points
        </span>
      )}
    />
  );
}
