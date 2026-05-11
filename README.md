# foobar2000-solarized

> A complete, 100% Solarized-compliant theme for foobar2000 Columns UI — available in both dark and light modes.

**Status:** Work In Progress | **Version:** 0.1.3-dev | **License:** MIT

---
Overview

`foobar2000-solarized` is a port of Ethan Schoonover's [Solarized](https://ethanschoonover.com/solarized/) colour scheme to foobar2000's Columns UI framework. Unlike partial theme implementations, this project targets 100% palette compliance, every visible pixel is either directly controlled by Columns UI colour settings or replaced by a custom Spider Monkey Panel (SMP) script. Native Windows controls that cannot be themed are replaced rather than approximated.

The theme prioritises visibility and simplicity, a minimal, focused interface designed for listening, not managing.

Features:

- Full Solarized Dark and Solarized Light modes
- Switchable between dark and light at runtime
- Minimal component set with no visual clutter
- Custom SMP panels replacing unthemeable native controls
- 100% Solarized palette compliance with no approximations
- Works out of the box, no custom font installation required

Solarized Palette

Base Tones

| Name   | Dark Mode | Light Mode | Role |
|--------|-----------|------------|------|
| base03 | `#002b36` | —          | Background |
| base02 | `#073642` | —          | Highlight background |
| base01 | `#586e75` | —          | Secondary content |
| base00 | `#657b83` | —          | Body text (light) |
| base0  | `#839496` | `#657b83`  | Body text |
| base1  | `#93a1a1` | `#586e75`  | Emphasis |
| base2  | `#eee8d5` | —          | Light highlight background |
| base3  | `#fdf6e3` | —          | Light background |

Accent Colors (identical in both modes)

| Name    | Hex       | Usage |
|---------|-----------|-------|
| Cyan    | `#2aa198` | Primary accent, selection |
| Blue    | `#268bd2` | Now playing indicator |
| Green   | `#859900` | Positive indicators |
| Yellow  | `#b58900` | Labels |
| Orange  | `#cb4b16` | Warnings |
| Red     | `#dc322f` | Stop, errors |
| Magenta | `#d33682` | Special highlights |
| Violet  | `#6c71c4` | Secondary accent |

Typography:

All fonts are standard Windows system fonts, no installation required.

| Role       | Font      | Usage |
|------------|-----------|-------|
| Monospace  | Consolas  | Technical data, bitrate, format, sample rate |
| Sans-serif | Verdana   | Playlist columns, artist, album, general UI |
| Serif      | Georgia   | Now-playing title, highlighted content |

Components:

The theme uses a deliberately minimal component set:

- Columns UI Playlist — core playlist view
- Now Playing Info Panel — track, artist, album display
- Seekbar — custom SMP implementation
- Playback Controls — custom SMP implementation
- Volume Control — custom SMP implementation
- Album Art Panel — fixed size, compact

Components excluded by design: Library Tree, Lyrics Panel, Visualizations, Tabs, Toolbar, Playlist Switcher.

Requirements:

- foobar2000 v2.25.8 or later
- [Columns UI](https://github.com/reupen/columns_ui) (latest release)
- [Spider Monkey Panel](https://github.com/theqwertiest/foo_spider_monkey_panel) (latest release)
- Windows 7 or later

---

Installation

> Installation instructions will be added when the first release is published.

Known Limitations:

- Multi-disc and nested folder structures not yet supported in log viewer integration
- Requires Windows dark mode enabled for best dark theme scrollbar rendering

Attributions:

- Solarized colour scheme by [Ethan Schoonover](https://ethanschoonover.com/solarized/) — MIT License
- Theme developed by [tom2tec](https://audio-file.org)

License

MIT License — see [LICENSE](LICENSE) for details.

Part of the [audio-file.org](https://audio-file.org) project ecosystem.
