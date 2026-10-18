"use client";

import { useEffect, useState, useCallback } from "react";
import { orpc } from "@/lib/oprc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconBell, IconCheck, IconClockHour4, IconInbox } from "@tabler/icons-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orpc.notifications.getUserNotifications({ limit: 50 });
      if (res.success && res.notifications) {
        setNotifications(res.notifications as unknown as NotificationItem[]);
      } else {
        toast.error("Failed to load notifications.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    setMarking(notificationId);
    try {
      const res = await orpc.notifications.markAsRead({ notificationId });
      if (res.success) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item
          )
        );
        toast.success("Notification marked as read.");
      } else {
        toast.error(res.message || "Failed to mark notification as read.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to mark notification as read.");
    } finally {
      setMarking(null);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconBell className="size-4" /> Notifications
            </CardTitle>
            <CardDescription>
              Stay on top of orders, commissions, and system alerts.
            </CardDescription>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end sm:flex-row">
            <div className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              {unreadCount} unread
            </div>
            <Button variant="secondary" size="sm" onClick={fetchNotifications}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="grid place-items-center py-12 text-center text-sm text-muted-foreground">
              <IconInbox className="mb-3 size-10 text-muted-foreground" />
              <p>No notifications yet.</p>
              <p className="text-xs">You will see updates here when there are new alerts, commissions, or order messages.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-2xl border p-4 transition-colors ${notification.read ? 'border-border bg-background' : 'border-primary/20 bg-primary/5'}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span>{notification.title}</span>
                        {!notification.read ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground">
                            New
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            <IconCheck className="size-3" /> Read
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={marking === notification.id}
                        >
                          {marking === notification.id ? 'Marking...' : 'Mark as read'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
