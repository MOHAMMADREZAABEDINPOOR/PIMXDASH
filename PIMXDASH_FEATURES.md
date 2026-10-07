# PIMXDASH

Build with `npm run build`, then load the `dist` folder through Chrome's **Load unpacked** action. The project also runs in a normal browser with demo bookmark data, but Chrome bookmark edits and the background Focus Shield require the installed extension.

## Current dashboard

- The new tab uses the full viewport width. Widgets use a flexible 12-column grid with individually adjustable widths and collapse to one column on narrow screens.
- The widget manager saves one of 40 color and surface combinations independently for each widget. The main clock has 40 styles, and up to six city clocks in the hero can each use any of those styles.
- The sticky navbar samples CPU counters and physical memory through `chrome.system.cpu` and `chrome.system.memory` about every 750 ms while the page is visible. Chrome does not expose GPU utilization to this extension, so its percentage is shown as unavailable. Chrome system values require the installed extension.
- The prominent search field opens URLs directly or searches the selected engine. Quick links open Google web, image, video and news results for the entered query.
- A content-script companion appears on HTTP(S) sites and Google results. It offers bookmark saving, link and citation copying, a reader view, an image gallery, search modes and a shortcut back to the new tab. Press `Alt+Shift+P` to toggle it.
- Calendar reminders have a date, time, category and completion state. The extension service worker schedules `chrome.alarms` and shows a system notification even when the dashboard tab is closed. Chrome may delay alarms; near-term alarms can take at least 30 seconds. The browser must be running.
- ZenQuotes supplies famous quotations through its API with a source link; cached quotes and offline fallbacks remain available. Using its API avoids brittle HTML scraping.
- Launchpad cards resolve the site's favicon through Chrome's favicon API, then a remote favicon service, and show a letter only if both fail.
- The breathing guide starts only on request and stops after a chosen number of cycles. Recent visits support search, copy and adding a site to Launchpad. Tab Radar and Unit Converter are available in the flexible dashboard grid.

## New capabilities

### Bookmark Atlas

1. Full Chrome bookmark tree, refreshed when Chrome bookmarks change.
2. Search across titles, URLs, domains, folders, tags and private notes.
3. Favorite bookmarks.
4. Read later list.
5. Local archive without removing a Chrome bookmark.
6. Custom tags for each bookmark.
7. Private notes for each bookmark.
8. Folder filter.
9. Domain filter.
10. Smart topic filter.
11. Recently added view.
12. Older than a year view.
13. Untagged view.
14. Duplicate URL detection after URL normalization.
15. Confirmed duplicate removal.
16. Confirmed removal of tracking parameters from links.
17. Confirmed organization into real Chrome topic folders.
18. Sort by newest, oldest, title, domain or folder.
19. Grid and list layouts.
20. Progressive loading for large bookmark collections.
21. Select multiple bookmarks or all filtered results.
22. Open selected bookmarks.
23. Copy selected URLs.
24. Move selected bookmarks to a folder.
25. Delete selected bookmarks after confirmation.
26. Add a bookmark.
27. Edit a bookmark title or URL.
28. Add a real Chrome bookmark folder.
29. Pin a bookmark to the dashboard.
30. Export selected or filtered bookmarks as JSON or CSV.
31. Import bookmark JSON while skipping existing URLs.

### Dashboard

32. PIMXDASH visual identity, SVG mark and matching extension icons.
33. Configurable multi-city clocks beside the main clock.
34. Matrix-inspired terminal styling across the dashboard, navigation and overlays.
35. Animated code rain with reduced motion support.
36. Self-contained vector icons for common shortcuts, with fallback initials for missing favicons.
37. A prominent browser-style search and address field below the clocks.
38. A navigation bar with bookmark access and live CPU and memory values.
39. One unified shortcut and widget layout without space switching.
40. Search bookmarks, open tabs, history, notes and tasks from the command palette.
41. Close overlays by clicking their backdrop.

### Daily tools

42. Detect the user's location for default weather when location access is available.
43. Search and select a city for weather.
44. Switch temperature units from the weather popover.
45. Refresh weather and show source and update time.
46. Persistent Pomodoro timer using an absolute deadline.
47. Session count starts at zero and a long break follows every four work sessions.
48. Focus Shield runs in an MV3 service worker, even when the dashboard tab closes.
49. Strict blocking, temporary pause and optional Pomodoro activation.
50. Save tab sessions without closing tabs, or choose to close after saving.
51. Search, rename and restore tab sessions.
52. Fetch every configured RSS source and retain read state across refreshes.
53. Filter unread articles and remove sources.
54. PIMXDASH workspace backup with a preview before restore.
55. Pause live weather, RSS, news and connection checks in Settings.
56. Local Inter and Vazirmatn fonts, plus Chrome's own favicon API.
57. Live quotes from ZenQuotes, cached locally with an offline fallback and source credit.

## Notes

- Bookmark deletion, folder organization and link cleanup act only when the user triggers them in the Bookmark Atlas and confirms the browser dialog.
- RSS uses the third-party rss2json proxy; it receives the feed URL. With location permission, weather sends current coordinates to Open-Meteo for the forecast and directly from the browser to BigDataCloud to resolve the city name.
- The quotes widget requests a batch from ZenQuotes about once per day, keeps it in browser storage and displays cached quotes when the network is unavailable. Disabling live network data in Settings stops quote requests too.
- Workspace backup covers PIMXDASH data. Chrome bookmarks are exported and imported separately through Bookmark Atlas.
- Live extension behavior, including browser permissions and the service worker, must be checked in Chrome after loading `dist`.
- The site companion runs only on normal HTTP(S) pages. Browser internal pages, the Chrome Web Store and other restricted pages do not allow content scripts.
