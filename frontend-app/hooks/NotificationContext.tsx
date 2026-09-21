import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { orpc } from './orpc';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const result = await orpc.notifications.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.count);
      }
    } catch (error: any) {
      // Silently ignore session expired errors - user will be redirected to login by auth context
      if (error?.message !== 'Session expired' && error?.message !== 'Not Found') {
        console.error('Failed to fetch unread count:', error);
      }
    }
  };

  const decrementUnreadCount = () => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Fetch on mount
  useEffect(() => {
    refreshUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(refreshUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, decrementUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
