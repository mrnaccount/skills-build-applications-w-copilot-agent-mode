import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title?: string;
  reason?: string;
  minutes?: number;
};

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
      emptyText="No workout suggestions found."
      getItems={(response) => {
        const value = response as { suggestions?: WorkoutSuggestion[] };
        return Array.isArray(value.suggestions) ? value.suggestions : [];
      }}
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
