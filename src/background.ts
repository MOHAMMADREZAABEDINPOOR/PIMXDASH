// The focus guard runs in the extension service worker so it survives closing
// PIMXDASH's new-tab page. Chrome wakes this worker for tab navigation events.
type ShieldState = {
  enabled?: boolean;
  blocklist?: string[];
  strictMode?: boolean;
  pauseUntil?: number;
  sessionUntil?: number;
};

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (!message || typeof message !== 'object' || !('type' in message) || message.type !== 'pimxdash:save-page') return;
  const rawUrl = sender.tab?.url;
  if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) { sendResponse({ ok: false }); return; }
  const suppliedTitle = (message as { title?: unknown }).title;
  const title = typeof suppliedTitle === 'string' ? suppliedTitle.slice(0, 200) : rawUrl;
  void chrome.bookmarks.search(rawUrl).then(async (existing) => {
    if (existing.some((item) => item.url === rawUrl)) return { ok: true, existing: true };
    await chrome.bookmarks.create({ title, url: rawUrl });
    return { ok: true, existing: false };
  }).then(sendResponse).catch(() => sendResponse({ ok: false }));
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url || !/^https?:\/\//i.test(changeInfo.url)) return;
  chrome.storage.local.get(
    "focus_shield",
    ({ focus_shield }: { focus_shield?: ShieldState }) => {
      if (
        chrome.runtime.lastError ||
        !focus_shield ||
        (!focus_shield.enabled &&
          !(
            focus_shield.sessionUntil && focus_shield.sessionUntil > Date.now()
          ))
      )
        return;
      if (focus_shield.pauseUntil && focus_shield.pauseUntil > Date.now())
        return;
      let host: string;
      try {
        host = new URL(changeInfo.url!).hostname
          .toLowerCase()
          .replace(/^www\./, "");
      } catch {
        return;
      }
      const blocked = (focus_shield.blocklist || []).some((domain) => {
        const clean = domain.toLowerCase().replace(/^www\./, "");
        return host === clean || host.endsWith(`.${clean}`);
      });
      if (!blocked) return;
      if (focus_shield.strictMode) chrome.tabs.remove(tabId);
      else
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL("newtab.html"),
        });
    },
  );
});

type CalendarReminder = { id: string; date: string; time: string; title: string; done?: boolean };
const alarmName = (id: string) => `calendar:${id}`;

async function syncCalendarAlarms() {
  const stored = await chrome.storage.local.get('calendar_reminders');
  const reminders: CalendarReminder[] = Array.isArray(stored.calendar_reminders) ? stored.calendar_reminders : [];
  const alarms = await chrome.alarms.getAll();
  const wanted = new Set<string>();
  for (const reminder of reminders) {
    const when = new Date(`${reminder.date}T${reminder.time || '09:00'}:00`).getTime();
    if (reminder.done || !Number.isFinite(when) || when <= Date.now()) continue;
    const name = alarmName(reminder.id);
    wanted.add(name);
    await chrome.alarms.create(name, { when });
  }
  for (const alarm of alarms) {
    if (alarm.name.startsWith('calendar:') && !wanted.has(alarm.name)) await chrome.alarms.clear(alarm.name);
  }
}

chrome.runtime.onInstalled.addListener(() => { void syncCalendarAlarms(); });
chrome.runtime.onStartup.addListener(() => { void syncCalendarAlarms(); });
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.calendar_reminders) void syncCalendarAlarms();
});
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith('calendar:')) return;
  const stored = await chrome.storage.local.get('calendar_reminders');
  const reminders: CalendarReminder[] = Array.isArray(stored.calendar_reminders) ? stored.calendar_reminders : [];
  const reminder = reminders.find((item) => alarmName(item.id) === alarm.name && !item.done);
  if (!reminder) return;
  await chrome.notifications.create(`reminder:${reminder.id}`, {
    type: 'basic', iconUrl: 'icons/icon128.png', title: 'PIMXDASH', message: reminder.title,
    priority: 2,
  });
});
chrome.notifications.onClicked.addListener((id) => {
  if (id.startsWith('reminder:')) void chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
});
