/* ── Notification scheduler ──────────────────────────────────────── *
 * Requests browser notification permission, then fires a daily       *
 * reminder at the stored hour (default 8 AM).                        *
 * Works whenever the browser tab is open.                            *
 * ------------------------------------------------------------------ */

const REMINDER_HOUR_KEY = "wordgarden_reminder_hour";
const DEFAULT_HOUR      = 8; // 8:00 AM

export function getReminderHour() {
  const stored = localStorage.getItem(REMINDER_HOUR_KEY);
  return stored !== null ? Number(stored) : DEFAULT_HOUR;
}

export function setReminderHour(hour) {
  localStorage.setItem(REMINDER_HOUR_KEY, String(hour));
}

/** Ask for permission. Returns true if granted. */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied")  return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/** Show a browser notification immediately. */
function showNotification(title, body) {
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag:  "wordgarden-daily",   // replaces previous if still showing
    });
  } catch {}
}

/**
 * Schedules a daily notification at the configured hour.
 * - If opened after the reminder hour and the user hasn't played today → fires immediately.
 * - Always schedules the NEXT occurrence too.
 * Call once on app mount.
 */
export function scheduleDailyReminder(lastPlayedDate) {
  if (Notification.permission !== "granted") return;

  const hour    = getReminderHour();
  const now     = new Date();
  const today   = now.toDateString();
  const hasPlayed = lastPlayedDate === today;

  // Fire immediately if past reminder time and not yet played today
  if (now.getHours() >= hour && !hasPlayed) {
    showNotification(
      "🌱 Word Garden is waiting!",
      "You haven't practised today. Just 5 minutes keeps your streak alive!"
    );
  }

  // Schedule next trigger at the reminder hour
  const next = new Date();
  next.setHours(hour, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1); // push to tomorrow if already passed

  const msUntilNext = next - now;
  const timerId = setTimeout(() => {
    showNotification(
      "🌱 Time to practise!",
      "Open Word Garden and keep your streak going. It only takes 5 minutes!"
    );
    // Re-schedule for the next day
    scheduleDailyReminder(null);
  }, msUntilNext);

  // Return cleanup so callers can cancel if needed
  return () => clearTimeout(timerId);
}
