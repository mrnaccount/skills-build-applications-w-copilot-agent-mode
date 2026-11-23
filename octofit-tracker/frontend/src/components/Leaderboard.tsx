import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = {
  teamName?: string;
  totalPoints?: number;
  rank?: number;
};

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      emptyText="No leaderboard rankings found."
      getItems={(response) => {
        const value = response as { leaderboard?: LeaderboardEntry[] };
        return Array.isArray(value.leaderboard) ? value.leaderboard : [];
      }}
      renderItem={(entry) => (
        <span>
          {entry.rank ? `${entry.rank}. ` : ''}
          {entry.teamName ?? 'Team'} - {entry.totalPoints ?? 0} points
        </span>
      )}
    />
  );
}
