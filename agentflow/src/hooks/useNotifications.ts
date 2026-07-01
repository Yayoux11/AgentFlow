"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { Notification } from "@/lib/types";

const POLL_INTERVAL = 30_000;

export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    try {
      const data = await api.get<Notification[]>("/notifications");
      setNotifications(data);
    } catch {
      // silent — user might not be logged in
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetch();
    timerRef.current = setInterval(fetch, POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [enabled, fetch]);

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`, {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await api.patch("/notifications/read-all", {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead };
}
