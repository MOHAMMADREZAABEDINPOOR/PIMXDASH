<div align="center">

<img src="assets/readme/hero.gif" width="1200" alt="PIMX DASH: a new-tab command center with bookmarks, search and focus widgets" />

**[English](README.md) · [فارسی](README.fa.md)**

</div>

# 🧩 PIMX DASH

A Manifest V3 Chrome/Chromium new-tab extension centered on bookmarks, fast search, focus tools and modular productivity widgets.

[GitHub](https://github.com/MOHAMMADREZAABEDINPOOR/PIMXDASH) · [PIMX / Profile](https://github.com/MOHAMMADREZAABEDINPOOR) · [Static artwork](assets/readme/hero.png)

| At a glance | Details |
|:---|:---|
| 🧩 Experience | Chrome / Chromium new-tab extension |
| 🧰 Built with | `React` · `Vite` · `TypeScript` · `Tailwind CSS` |
| 🌐 Documentation | [English](README.md) · [فارسی](README.fa.md) |

[✨ Features](#features) · [🚀 Getting started](#getting-started) · [⚙️ Configuration](#configuration) · [🌍 Deployment](#deployment)

---

<a id="features"></a>

## ✨ Features

| Area | Included capability |
|:---|:---|
| ⭐ Collection | Bookmark command center, search and categorization |
| 🗓️ Planning | Tasks, notes, habits, Pomodoro and world clocks |
| ⚡ Workflow | Weather, RSS/trending feeds and soundscapes |
| 🌐 Experience | Theme studio, keyboard shortcuts and English/Persian UI |

## Preview

![PIMXDASH dashboard example](dashboard-top.png)

<a id="stack"></a>

## 🧰 Stack

| Tool | Version / source |
|---|---|
| React | `^18.3.1` |
| Vite | `^6.1.0` |
| TypeScript | `^5.7.3` |
| Tailwind CSS | `^3.4.17` |

<a id="getting-started"></a>

## 🚀 Getting started

Node.js 22.12+ and the package manager declared in package.json. Install dependencies from the checked-in lockfile where available.

```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMXDASH.git
cd PIMXDASH

npm ci
npm run build
```

<a id="configuration"></a>

## ⚙️ Configuration

No standard environment template is defined. Standalone exercises need no external configuration; inspect any service constants or paths in the source before running.

<a id="usage"></a>

## 🎯 Usage

Run npm run build, open chrome://extensions, enable Developer mode and choose Load unpacked → dist. Open a new tab and complete onboarding. The Vite dev server previews the interface; Chrome APIs need the installed extension.

<a id="project-structure"></a>

## 🗂️ Project structure

| Path | Role |
|---|---|
| [`assets/`](assets/) | Brand/media/README assets |
| [`public/`](public/) | Public web assets |
| [`scripts/`](scripts/) | Development and maintenance utilities |
| [`src/`](src/) | Application source |
| [`index.html`](index.html) | Project entry/configuration file |
| [`newtab.html`](newtab.html) | Project entry/configuration file |
| [`package.json`](package.json) | Project entry/configuration file |
| [`tsconfig.json`](tsconfig.json) | Project entry/configuration file |

<a id="commands-and-checks"></a>

## 🧪 Commands and checks

| Command | Purpose |
|:---|:---|
| `npm run dev` | 🧑‍💻 Development server |
| `npm run build` | 📦 Production build |
| `npm run preview` | 👀 Preview a build |
| `npm run type-check` | 🔧 type-check |
| `npm run check:bookmarks` | 🔧 check:bookmarks |

```bash
npm run dev
npm run build
npm run preview
npm run type-check
npm run check:bookmarks
npm run check:background
npm run check:weather
npm run check:quotes
```

These commands are declared in package.json; the list is not a test execution report. Test commands may need a browser, service or prepared database.

<a id="deployment"></a>

## 🌍 Deployment

`npm run build` creates dist for Chrome Load unpacked. A browser-store submission also needs a manifest/privacy-policy review matching the actual permissions.

<a id="limitations"></a>

## 📌 Limitations

The manifest requests bookmarks, history, tabs, geolocation, system and notification permissions plus content-script access to HTTP/HTTPS pages. External feeds depend on their providers; inspect permissions before installation.

<a id="troubleshooting"></a>

## 🛠️ Troubleshooting

- Missing packages: install dependencies using the project’s package manager.
- API/network failure: check the configured origin, provider and hosting bindings.
- Old assets: rebuild when a build script exists, then clear the browser cache.

<a id="contributing"></a>

## 🤝 Contributing

Create a focused branch, verify the affected behavior and explain the change clearly. Keep private data, build outputs and local databases out of commits.

<a id="license"></a>

## 📄 License

No repository-level license file is included in this snapshot. Public visibility alone does not grant reuse rights; contact the repository owner for terms.

---

Part of **PIMX** · Documentation in English and Persian.

---

<div align="center">

🧩 **PIMX DASH** · [English](README.md) · [فارسی](README.fa.md)

</div>
