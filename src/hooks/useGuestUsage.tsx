import { useState, useEffect } from 'react';

interface GuestUsage {
  canUse: boolean;
  usageCount: number;
  maxUsage: number;
  incrementUsage: () => void;
}

export const useGuestUsage = (key: string, maxUsage: number): GuestUsage => {
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    setUsageCount(stored ? parseInt(stored, 10) : 0);
  }, [key]);

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem(key, newCount.toString());
  };

  return {
    canUse: usageCount < maxUsage,
    usageCount,
    maxUsage,
    incrementUsage
  };
};
