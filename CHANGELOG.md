# Changelog

All notable changes to foobar2000-solarized are documented here.

Format: [version] - date - description

---

## [Unreleased - v0.1.x-dev] - 2026

### solarized_lib.js

#### v0.1.3-dev
- window.DPI undefined guard added - fallback to 96 DPI if window.DPI unavailable in SMP 1.6.1
- drawRoundRect arc guard added - FillSolidRect fallback prevents invalid arc value errors

#### v0.1.2-dev
- drawRoundRect arc guard first attempt - subsequently revised in v0.1.3-dev

#### v0.1.1-dev
- Hybrid dark/light switching architecture implemented
- detectModeFromSystem() - reads Windows registry as single source of truth
- toggleModeWithSystem() - writes registry and updates SMP panels simultaneously
- _lib_on_colours_changed() - handles CUI colour change events from any source
- on_colours_changed() added to mandatory panel callback documentation

#### v0.1.0-dev
- Initial version
- Complete Solarized palette - 16 canonical values as PAL.* constants
- Semantic colour objects COL_DARK and COL_LIGHT with identical property names
- DPI scaling via px() function
- Size constants SZ.*
- Font definitions FONT.* - Verdana, Consolas, Georgia
- Mode switching - setMode(), getMode()
- Auto-switch property stubs for v1.1 forward compatibility
- Icon drawing functions - play, pause, stop, prev, next, volume, mute, sun, moon
- Common drawing utilities - drawBackground, drawBorder, drawDivider, drawRoundRect
- Helper utilities - clamp, inRect, formatTime, formatBitrate, codecColour

### solarized_toggle.js

#### v0.1.5-dev
- Final clean version - all diagnostic code removed
- Toggle confirmed working - dark/light switching verified end to end
- Background colour confirmed correct in both modes
- Mode persistence confirmed across foobar2000 restarts
- Tooltip now activates only on hover entry not every mouse move

#### v0.1.1-dev - v0.1.4-dev
- Diagnostic versions - used to identify and resolve include path,
  rendering, DPI and colour initialisation issues

#### v0.1.0-dev
- Initial version
- Sun icon in dark mode, moon icon in light mode
- Hover and press interaction states
- Tooltip support
- on_notify_data and on_colours_changed callbacks

---

## Known gaps before v1.0 release

- Right-click menu on toggle button not yet implemented
- forEach in drawIconSun to be replaced with for loop
- solarized_system_mode property not yet in library
- Minimum panel size guard not yet implemented
- CUI Layer 1 colour configuration not yet done
- All SMP panels except toggle not yet built
- Layout not yet assembled in CUI
- FCL files not yet exported

---

## Planned releases

- v1.0.0 - September 2026 - CUI theme with all SMP panels
- v1.1.0 - November 2026 - Repeat/shuffle icons, auto time switching, 64-bit
- v2.0.0 - June 2027 - Full SMP playlist renderer
