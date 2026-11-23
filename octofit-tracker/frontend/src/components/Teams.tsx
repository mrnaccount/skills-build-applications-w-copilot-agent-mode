import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = {
  name?: string;
  mascot?: string;
  members?: unknown[];
};

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setTeams(null);
    setError(null);

    getJson<{ teams?: Team[] }>('/api/teams')
      .then((response) => {
        if (active) setTeams(Array.isArray(response.teams) ? response.teams : []);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      emptyText="No teams found."
      items={teams}
      error={error}
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
