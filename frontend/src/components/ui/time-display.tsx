import { useEffect, useState } from 'react';

interface TimeDisplayProps {
  createdAt: string;
  expiresAt?: string | null;
}

export function TimeDisplay({ createdAt, expiresAt }: TimeDisplayProps) {
  const [timeText, setTimeText] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const created = new Date(createdAt);

      if (expiresAt) {
        const expires = new Date(expiresAt);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeText('Expired');
          return;
        }

        // Calculate countdown
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeText(`Expires in ${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeText(`Expires in ${hours}h ${minutes}m`);
        } else {
          setTimeText(`Expires in ${minutes}m`);
        }
      } else {
        // Calculate time since creation (count up)
        const diff = now.getTime() - created.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeText(`Posted ${days}d ${hours}h ago`);
        } else if (hours > 0) {
          setTimeText(`Posted ${hours}h ${minutes}m ago`);
        } else if (minutes > 0) {
          setTimeText(`Posted ${minutes}m ago`);
        } else {
          setTimeText('Posted just now');
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [createdAt, expiresAt]);

  return <span>{timeText}</span>;
}
