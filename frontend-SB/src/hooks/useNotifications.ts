import { useState, useEffect, useCallback } from "react";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from "@/services/notification_service";
import type { Notification } from "@/types";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.items || data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchUnread = useCallback(async () => {
    try { const data = await getUnreadCount(); setUnreadCount(data.count ?? 0); } catch {}
  }, []);

  const markRead = async (id: string | number) => {
    try { await markAsRead(id); setNotifications((p) => p.map((n) => n.id === id ? { ...n, is_read: true } : n)); setUnreadCount((p) => Math.max(0, p - 1)); } catch {}
  };

  const markAllRead = async () => {
    try { await markAllAsRead(); setNotifications((p) => p.map((n) => ({ ...n, is_read: true }))); setUnreadCount(0); } catch {}
  };

  const remove = async (id: string | number) => {
    try { await deleteNotification(id); setNotifications((p) => p.filter((n) => n.id !== id)); fetchUnread(); } catch {}
  };

  useEffect(() => { fetchNotifs(); fetchUnread(); }, [fetchNotifs, fetchUnread]);

  return { notifications, unreadCount, loading, markRead, markAllRead, remove, refetch: fetchNotifs };
}
