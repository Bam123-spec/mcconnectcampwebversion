const EVENT_BASELINES = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46] as const;

const hashValue = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

export const getDemoEventBaseline = (eventId: string, eventName?: string | null) => {
  const key = `${eventId}:${eventName ?? ""}`;
  return EVENT_BASELINES[hashValue(key) % EVENT_BASELINES.length];
};

export const getDisplayEventTurnout = ({
  eventId,
  eventName,
  realCount,
}: {
  eventId: string;
  eventName?: string | null;
  realCount?: number | null;
}) => getDemoEventBaseline(eventId, eventName) + Math.max(realCount ?? 0, 0);
