// Client-only signal that a user's notification read-state changed (e.g.
// "Mark all read"). The topbar bell listens for it and re-fetches its
// count so the badge updates immediately, rather than waiting for the next
// poll. Same-tab only — other tabs catch up on their own poll.
export const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

export function emitNotificationsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
  }
}
