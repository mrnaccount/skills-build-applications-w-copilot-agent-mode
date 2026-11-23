import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title?: string;
  reason?: string;
  minutes?: number;
};

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSuggestions(null);
    setError(null);

    getJson<{ suggestions?: WorkoutSuggestion[] }>(
      `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`,
    )
      .then((response) => {
        if (active) setSuggestions(Array.isArray(response.suggestions) ? response.suggestions : []);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      emptyText="No workout suggestions found."
      items={suggestions}
      error={error}
      renderItem={(workout) => (
        <span>
          {workout.title ?? 'Workout'}
          {workout.minutes ? ` - ${workout.minutes} minutes` : ''}
          {workout.reason ? `: ${workout.reason}` : ''}
        </span>
      )}
    />
  );
}
