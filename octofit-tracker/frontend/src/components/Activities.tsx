import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = {
  type?: string;
  minutes?: number;
  points?: number;
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setActivities(null);
    setError(null);

    getJson<{ activities?: Activity[] }>('/api/activities')
      .then((response) => {
        if (active) setActivities(Array.isArray(response.activities) ? response.activities : []);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      emptyText="No activities found."
      items={activities}
      error={error}
      renderItem={(activity) => (
        <span>
          {activity.type ?? 'Activity'} - {activity.minutes ?? 0} minutes - {activity.points ?? 0} points
        </span>
      )}
    />
  );
}
