import { CapabilityCard } from './CapabilityCard.js';

type Team = {
  name?: string;
  mascot?: string;
  members?: unknown[];
};

export default function Teams() {
  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      emptyText="No teams found."
      getItems={(response) => {
        const value = response as { teams?: Team[] };
        return Array.isArray(value.teams) ? value.teams : [];
      }}
      renderItem={(team) => (
        <span>
          {team.name ?? 'Team'}
          {team.mascot ? ` - ${team.mascot}` : ''}
          {team.members?.length ? ` (${team.members.length} members)` : ''}
        </span>
      )}
    />
  );
}
