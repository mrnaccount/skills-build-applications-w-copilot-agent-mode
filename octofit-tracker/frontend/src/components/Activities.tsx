import { CapabilityCard } from './CapabilityCard.js';

type Activity = {
  type?: string;
  minutes?: number;
  points?: number;
};

export default function Activities() {
  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      emptyText="No activities found."
      getItems={(response) => {
        const value = response as { activities?: Activity[] };
        return Array.isArray(value.activities) ? value.activities : [];
      }}
      renderItem={(activity) => (
        <span>
          {activity.type ?? 'Activity'} - {activity.minutes ?? 0} minutes - {activity.points ?? 0} points
        </span>
      )}
    />
  );
}
