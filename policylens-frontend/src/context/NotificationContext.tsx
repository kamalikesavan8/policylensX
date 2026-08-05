import { createContext, useContext, useState, ReactNode } from "react";

export interface AppNotification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (text: string) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (text: string) => {
    const newNotif: AppNotification = {
      id: Date.now(),
      text,
      time: "Just now",
      unread: true,
    };
    // Keep the most recent 20 notifications
    setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}