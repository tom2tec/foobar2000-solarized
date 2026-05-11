// =============================================================================
// solarized_lib.js
// foobar2000-solarized shared library
// =============================================================================
// Version:   0.1.3-dev
// License:   MIT
// Author:    tom2tec / audio-file.org
// Repo:      https://github.com/tom2tec/foobar2000-solarized
// Requires:  Spider Monkey Panel 1.6.1 (32-bit)
//            foobar2000 2.25.8+
//            Columns UI 3.4.1+
//            Windows 10 / Windows 11
// -----------------------------------------------------------------------------
// File location:
//   Development: %fb2k_profile%\solarized\solarized_lib.js
//   Portable:    K:\foobar2000_solarized\profile\solarized\solarized_lib.js
//   Repo:        K:\foobar2000_solarized\repo\foobar2000-solarized\solarized_lib.js
// -----------------------------------------------------------------------------
// Change log:
//   0.1.3-dev  window.DPI undefined guard - fallback to 96dpi
//   0.1.2-dev  drawRoundRect arc guard fixed - FillSolidRect fallback added
//   0.1.1-dev  Hybrid dark/light switching - detectModeFromSystem(),
//              toggleModeWithSystem(), _lib_on_colours_changed()
//              on_colours_changed() added to mandatory panel callbacks
//   0.1.0-dev  Initial version - palette, DPI, fonts, icons, mode switching
// =============================================================================
//
// USAGE
// -----
// Include this file at the TOP of every panel script, before any other code:
//
//   include(fb.ProfilePath + 'solarized\\solarized_lib.js');
//
// After include, all constants and functions below are available globally.
//
// MANDATORY PATTERNS FOR PANEL SCRIPTS
// --------------------------------------
// Two callbacks MUST be implemented in every panel script.
// Both must call their library handler first.
//
// 1. on_notify_data - handles SMP toggle button switching:
//
//   function on_notify_data(name, data) {
//       _lib_on_notify_data(name, data);   // ALWAYS first
//       // ... panel-specific handlers below ...
//   }
//
// 2. on_colours_changed - handles Windows system dark/light mode switching
//    and CUI mode changes (Dark/Light/System setting in CUI preferences):
//
//   function on_colours_changed() {
//       _lib_on_colours_changed();         // ALWAYS first
//       // ... panel-specific handlers below ...
//   }
//
// Both callbacks are required for the hybrid switching architecture.
// Missing either one will cause panels to fall out of sync during mode changes.
//
// =============================================================================


// =============================================================================
// SECTION 1 - DPI SCALING
// =============================================================================
// All pixel values in drawing calls must go through px().
// Font sizes are in points and must NOT use px() - GDI scales them natively.
// DPI is read once at startup. Changing display scaling requires fb2k restart.
// This will be upgraded to on_dpi_changed in v1.1.
// =============================================================================

var _dpi = (typeof window.DPI !== 'undefined' && window.DPI > 0) ? window.DPI : 96;
var SCALE = _dpi / 96;

/**
 * Scale a base pixel value to the current display DPI.
 * Always use this for coordinates, sizes, widths - never raw numbers.
 * Math.round() prevents subpixel rendering artefacts in GDI.
 * @param {number} n - Base pixel value at 96 DPI (100% scaling)
 * @returns {number} Scaled whole-pixel value
 */
function px(n) {
    return Math.round(n * SCALE);
}


// =============================================================================
// SECTION 2 - SIZE CONSTANTS
// =============================================================================
// All values are pre-scaled at load time. Reference SZ.* throughout panel
// scripts - never use raw pixel values. Derived panel heights are documented
// below each group.
// =============================================================================

var SZ = {
    // Icons
    icon:            px(16),   // Standard control icon size
    icon_lg:         px(24),   // Large icon - now playing emphasis

    // Spacing
    padding_sm:      px(4),    // Tight internal padding
    padding:         px(8),    // Standard padding
    padding_lg:      px(16),   // Section padding

    // Borders and lines
    border:          px(1),    // Hairline border - stays 1px at 125% scaling
    divider:         px(1),    // Panel section divider

    // Seekbar
    // Minimum panel height: SZ.seekbar_thumb + SZ.padding * 2 = px(26)
    seekbar_h:       px(4),    // Seekbar track height
    seekbar_thumb:   px(10),   // Seekbar thumb diameter (overlaps track)
    seekbar_thumb_r: px(5),    // Seekbar thumb radius

    // Scrollbar
    scrollbar_w:     px(6),    // Scrollbar width - narrower than Windows native

    // Buttons
    // Minimum button panel height: SZ.btn + SZ.padding * 2 = px(48)
    btn:             px(32),   // Standard button hit area
    btn_lg:          px(40),   // Large button hit area
    btn_r:           px(2),    // Button corner radius - subtle rounding

    // Volume
    volume_h:        px(4),    // Volume slider track height
    volume_thumb:    px(10),   // Volume thumb diameter
    volume_thumb_r:  px(5),    // Volume thumb radius

    // Album art
    art_min:         px(120),  // Minimum album art dimension
    art_border:      px(1),    // Album art border width

    // Now playing info panel
    info_h:          px(48),   // Info panel height - accommodates two lines
};


// =============================================================================
// SECTION 3 - SOLARIZED PALETTE
// =============================================================================
// Canonical Solarized sRGB values from Ethan Schoonover.
// Format: 0xAARRGGBB - SMP native colour format.
// PAL is PRIVATE to this library. Panel scripts must use COL.* not PAL.*.
// Do not modify these values - they are the design authority.
// =============================================================================

var PAL = {
    // Base tones - swap roles between dark and light modes
    base03:  0xFF002b36,   // L*15  Dark background
    base02:  0xFF073642,   // L*20  Dark highlight background
    base01:  0xFF586e75,   // L*45  Dark secondary content
    base00:  0xFF657b83,   // L*50  Body text (near-shared)
    base0:   0xFF839496,   // L*60  Dark body text / Light secondary
    base1:   0xFF93a1a1,   // L*65  Emphasis (near-shared)
    base2:   0xFFeee8d5,   // L*92  Light highlight background
    base3:   0xFFfdf6e3,   // L*97  Light background

    // Accent colours - identical in dark and light modes
    yellow:  0xFFb58900,
    orange:  0xFFcb4b16,
    red:     0xFFdc322f,
    magenta: 0xFFd33682,
    violet:  0xFF6c71c4,
    blue:    0xFF268bd2,
    cyan:    0xFF2aa198,
    green:   0xFF859900,
};


// =============================================================================
// SECTION 4 - SEMANTIC COLOUR OBJECTS
// =============================================================================
// Maps semantic UI roles to palette values for dark and light modes.
// Both objects have IDENTICAL property names - this is essential.
// Panel drawing code references COL.* and works correctly in both modes
// without any conditional logic. Mode switching replaces COL transparently.
// =============================================================================

var COL_DARK = {
    // Backgrounds
    bg:               PAL.base03,   // Primary panel background
    bg_hi:            PAL.base02,   // Highlighted / selected background
    bg_btn_hover:     PAL.base02,   // Button background on hover
    bg_btn_press:     PAL.base02,   // Button background when pressed

    // Text hierarchy - brightest to dimmest on dark bg
    text_emph:        PAL.base1,    // Emphatic - track title
    text:             PAL.base0,    // Standard - artist, album
    text_sec:         PAL.base01,   // Secondary - technical data, headers
    text_nowplay:     PAL.blue,     // Now playing row text

    // Selection
    selection_bg:     PAL.base02,   // Selected row background
    selection_txt:    PAL.base1,    // Selected row text

    // Accents
    accent:           PAL.cyan,     // Primary accent - seekbar, volume fill
    accent_hover:     PAL.blue,     // Hover state accent
    accent2:          PAL.blue,     // Secondary accent

    // Playback control icons
    play:             PAL.green,    // Play button icon
    pause:            PAL.blue,     // Pause button icon
    stop:             PAL.red,      // Stop button icon
    prev:             PAL.base0,    // Previous button icon
    next:             PAL.base0,    // Next button icon
    icon_default:     PAL.base0,    // Default icon colour at rest
    icon_hover:       PAL.base1,    // Icon hover state
    icon_active:      PAL.cyan,     // Icon active/pressed state

    // Transport state indicators
    repeat_off:       PAL.base01,   // Repeat inactive
    repeat_on:        PAL.cyan,     // Repeat active
    shuffle_off:      PAL.base01,   // Shuffle inactive
    shuffle_on:       PAL.cyan,     // Shuffle active

    // Volume
    mute:             PAL.red,      // Muted state icon

    // Status indicators
    positive:         PAL.green,    // Success / good state
    warning:          PAL.orange,   // Caution / warning state
    error:            PAL.red,      // Error state
    lossy:            PAL.yellow,   // Lossy codec indicator
    hires:            PAL.cyan,     // Hi-res format indicator (24bit+/DSD)

    // Structure
    border:           PAL.base02,   // Panel borders
    splitter:         PAL.base02,   // Panel splitter bars
    divider:          PAL.base02,   // Internal section dividers

    // Scrollbar
    scrollbar_bg:     PAL.base03,   // Scrollbar panel background
    scrollbar_track:  PAL.base02,   // Scroll track area
    scrollbar_thumb:  PAL.base01,   // Thumb at rest
    scrollbar_hover:  PAL.base0,    // Thumb hover
    scrollbar_drag:   PAL.cyan,     // Thumb being dragged

    // Album art
    art_border:       PAL.base02,   // Art panel border
    art_placeholder:  PAL.base02,   // No-art placeholder background
    art_icon:         PAL.base01,   // No-art music note icon

    // Toggle button
    toggle_icon:      PAL.base0,    // Toggle icon at rest
    toggle_hover:     PAL.cyan,     // Toggle icon hover
    toggle_press:     PAL.blue,     // Toggle icon pressed
};

var COL_LIGHT = {
    // Backgrounds
    bg:               PAL.base3,    // Primary panel background
    bg_hi:            PAL.base2,    // Highlighted / selected background
    bg_btn_hover:     PAL.base2,    // Button background on hover
    bg_btn_press:     PAL.base2,    // Button background when pressed

    // Text hierarchy - darkest to lightest on light bg = highest to lowest contrast
    text_emph:        PAL.base01,   // Emphatic - track title (darkest)
    text:             PAL.base00,   // Standard - artist, album
    text_sec:         PAL.base1,    // Secondary - technical data (lightest)
    text_nowplay:     PAL.blue,     // Now playing row text

    // Selection
    selection_bg:     PAL.base2,    // Selected row background
    selection_txt:    PAL.base01,   // Selected row text

    // Accents - identical to dark mode (Solarized design property)
    accent:           PAL.cyan,
    accent_hover:     PAL.blue,
    accent2:          PAL.blue,

    // Playback control icons - identical to dark mode
    play:             PAL.green,
    pause:            PAL.blue,
    stop:             PAL.red,
    prev:             PAL.base00,
    next:             PAL.base00,
    icon_default:     PAL.base00,
    icon_hover:       PAL.base01,
    icon_active:      PAL.cyan,

    // Transport state indicators - identical to dark mode
    repeat_off:       PAL.base1,
    repeat_on:        PAL.cyan,
    shuffle_off:      PAL.base1,
    shuffle_on:       PAL.cyan,

    // Volume
    mute:             PAL.red,

    // Status indicators - identical to dark mode
    positive:         PAL.green,
    warning:          PAL.orange,
    error:            PAL.red,
    lossy:            PAL.yellow,
    hires:            PAL.cyan,

    // Structure
    border:           PAL.base2,
    splitter:         PAL.base2,
    divider:          PAL.base2,

    // Scrollbar
    scrollbar_bg:     PAL.base3,
    scrollbar_track:  PAL.base2,
    scrollbar_thumb:  PAL.base1,
    scrollbar_hover:  PAL.base00,
    scrollbar_drag:   PAL.cyan,

    // Album art
    art_border:       PAL.base2,
    art_placeholder:  PAL.base2,
    art_icon:         PAL.base1,

    // Toggle button
    toggle_icon:      PAL.base00,
    toggle_hover:     PAL.cyan,
    toggle_press:     PAL.blue,
};


// =============================================================================
// SECTION 5 - ACTIVE COLOUR STATE AND MODE SWITCHING
// =============================================================================
// Hybrid switching architecture - three paths all produce correct results:
//
// Path 1 - SMP toggle button:
//   toggleModeWithSystem() -> writes Windows registry -> triggers
//   on_colours_changed() in all panels -> _lib_on_colours_changed() ->
//   detectModeFromSystem() -> setMode() -> NotifyOthers -> all panels repaint
//
// Path 2 - Windows Settings dark/light mode change:
//   User changes Windows mode -> CUI responds via System setting ->
//   on_colours_changed() fires in all panels -> same chain as Path 1
//
// Path 3 - CUI mode set to fixed Dark or Light:
//   on_colours_changed() fires -> detectModeFromSystem() reads registry ->
//   setMode() -> all panels update to match
//
// All three paths converge on setMode() ensuring consistent state.
// COL is always the authoritative colour object for all panel drawing.
// =============================================================================

var _mode = window.GetProperty('solarized_mode', 'dark');
var COL = (_mode === 'dark') ? COL_DARK : COL_LIGHT;

/**
 * Read Windows registry to determine current system dark/light mode.
 * This is the single source of truth for mode detection.
 * Returns 'dark' if registry read fails - safe default.
 * @returns {string} 'dark' or 'light'
 */
function detectModeFromSystem() {
    try {
        var shell = new ActiveXObject('WScript.Shell');
        var val = shell.RegRead(
            'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize\\AppsUseLightTheme'
        );
        return (val === 0) ? 'dark' : 'light';
    } catch(e) {
        return 'dark';
    }
}

/**
 * Switch between dark and light Solarized modes.
 * Updates COL, persists state, notifies all SMP panels, repaints.
 * Internal use - call toggleModeWithSystem() from toggle button.
 * @param {string} mode - 'dark' or 'light'
 */
function setMode(mode) {
    if (mode !== 'dark' && mode !== 'light') return;
    _mode = mode;
    COL = (_mode === 'dark') ? COL_DARK : COL_LIGHT;
    window.SetProperty('solarized_mode', _mode);
    window.NotifyOthers('solarized_mode_changed', _mode);
    window.Repaint();
}

/**
 * Toggle mode and write Windows registry.
 * Use this in the toggle button panel - not toggleMode() or setMode().
 * Writing the registry triggers on_colours_changed() in all panels
 * which in turn calls detectModeFromSystem() to confirm the new state.
 * setMode() is also called directly as a safety net in case the registry
 * write does not trigger on_colours_changed() immediately.
 */
function toggleModeWithSystem() {
    var newMode = (_mode === 'dark') ? 'light' : 'dark';
    try {
        var shell = new ActiveXObject('WScript.Shell');
        shell.RegWrite(
            'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize\\AppsUseLightTheme',
            newMode === 'light' ? 1 : 0,
            'REG_DWORD'
        );
    } catch(e) {
        // Registry write failed - fall through to setMode() directly
    }
    // Direct setMode() call ensures SMP panels update even if registry
    // write does not immediately trigger on_colours_changed()
    setMode(newMode);
}

/**
 * Get the current mode string.
 * @returns {string} 'dark' or 'light'
 */
function getMode() {
    return _mode;
}

/**
 * Library-internal colours changed handler.
 * MUST be called first from on_colours_changed() in every panel script.
 * Fires when CUI mode changes via Windows system, CUI preferences,
 * or our registry write in toggleModeWithSystem().
 * Detects new mode from registry and updates all panels if changed.
 */
function _lib_on_colours_changed() {
    var detected = detectModeFromSystem();
    if (detected !== _mode) {
        setMode(detected);
    } else {
        // Mode unchanged but colours may have been adjusted -
        // repaint to pick up any CUI colour updates
        window.Repaint();
    }
}

/**
 * Library-internal notify handler.
 * MUST be called first from on_notify_data() in every panel script.
 * Updates COL and repaints when another panel calls setMode().
 * @param {string} name - Notification name
 * @param {*} data - Notification data
 */
function _lib_on_notify_data(name, data) {
    if (name === 'solarized_mode_changed') {
        _mode = data;
        COL = (_mode === 'dark') ? COL_DARK : COL_LIGHT;
        window.Repaint();
    }
}


// =============================================================================
// SECTION 6 - AUTO-SWITCH TIMER INFRASTRUCTURE (STUB)
// =============================================================================
// Properties are declared and persisted now for forward compatibility.
// Timer logic is deferred to v1.1. A v1.0 user upgrading to v1.1 will find
// these properties already present with correct default values.
// DO NOT implement timer logic here until v1.1.
// =============================================================================

var _auto_switch = window.GetProperty('solarized_auto_switch', false);
var _dark_time   = window.GetProperty('solarized_dark_time',   '20:00');
var _light_time  = window.GetProperty('solarized_light_time',  '07:00');

// v1.1 implementation note:
// - on_timer callback checks current time against _dark_time and _light_time
// - Timer interval: 60000ms (60 seconds)
// - Manual toggle always overrides auto state
// - Settings accessible via right-click on toggle button


// =============================================================================
// SECTION 7 - FONT DEFINITIONS
// =============================================================================
// Sizes are in POINTS - do not pass through px().
// GDI scales fonts natively for display DPI.
// All three fonts are guaranteed Windows 10/11 system fonts.
// gdi.Font(name, point_size, style) - style: 0=normal 1=bold 2=italic 3=bold italic
// =============================================================================

var FONT = {
    ui:         gdi.Font('Verdana',  10, 0),   // Standard UI text
    ui_sm:      gdi.Font('Verdana',   8, 0),   // Small UI text - status bar
    ui_bold:    gdi.Font('Verdana',  10, 1),   // Bold UI text - labels
    ui_lg:      gdi.Font('Verdana',  11, 0),   // Large UI text
    mono:       gdi.Font('Consolas',  9, 0),   // Technical data - bitrate, format
    mono_sm:    gdi.Font('Consolas',  8, 0),   // Small monospace
    mono_bold:  gdi.Font('Consolas',  9, 1),   // Bold monospace - codec name
    title:      gdi.Font('Georgia',  11, 0),   // Track title
    title_lg:   gdi.Font('Georgia',  14, 0),   // Large title emphasis
    title_bold: gdi.Font('Georgia',  11, 1),   // Bold title
};


// =============================================================================
// SECTION 8 - COMMON DRAWING UTILITIES
// =============================================================================
// All drawing goes through these functions.
// Panel scripts must not call gr.* directly with raw colour values.
// This enforces palette compliance throughout the codebase.
// =============================================================================

/**
 * Fill panel background with current mode background colour.
 */
function drawBackground(gr, x, y, w, h) {
    gr.FillSolidRect(x, y, w, h, COL.bg);
}

/**
 * Draw a 1px panel border.
 * w-1 and h-1 keep the border inside the panel bounds.
 */
function drawBorder(gr, x, y, w, h) {
    gr.DrawRect(x, y, w - SZ.border, h - SZ.border, SZ.border, COL.border);
}

/**
 * Draw a horizontal divider line.
 */
function drawDivider(gr, x, y, w) {
    gr.DrawLine(x, y, x + w, y, SZ.divider, COL.divider);
}

/**
 * Draw a filled rounded rectangle - used for button hover/press states.
 * Arc values guarded against panel dimensions to prevent invalid value errors.
 */
function drawRoundRect(gr, x, y, w, h, colour) {
    var r = Math.min(SZ.btn_r, Math.floor(w / 2), Math.floor(h / 2));
    if (r > 0) {
        gr.FillRoundRect(x, y, w, h, r, r, colour);
    } else {
        gr.FillSolidRect(x, y, w, h, colour);
    }
}

/**
 * Draw text with standard alignment flags.
 * flags: 0=top-left, 1=top-centre, 2=top-right,
 *        4=middle-left, 5=middle-centre, 6=middle-right
 */
function drawText(gr, str, font, colour, x, y, w, h, flags) {
    gr.DrawString(str, font, colour, x, y, w, h, flags || 0);
}


// =============================================================================
// SECTION 9 - ICON DRAWING FUNCTIONS
// =============================================================================
// All icons are drawn using GDI primitives - no bitmap assets required.
// Feather Icons geometry is the reference for all shapes.
// All coordinates are relative to (x, y) top-left of the icon bounding box.
// Size parameter is the icon bounding box dimension in pixels (use SZ.icon).
// Colour parameter should be a COL.* value.
//
// Coordinate derivation: Feather Icons use a 24x24 viewBox.
// Scale factor from Feather coords to px: s = size / 24
// Point (fx, fy) in Feather space = (x + fx * s, y + fy * s) in screen space
//
// Icons implemented for v1.0:
//   Play, Pause, Stop, Previous, Next,
//   Volume (3 levels), Mute,
//   Sun (light mode), Moon (dark mode)
//
// Deferred to v1.1: Repeat, Shuffle (require bezier paths)
// =============================================================================

/**
 * Draw play icon - filled triangle.
 * Feather: polygon points="5 3 19 12 5 21 5 3"
 */
function drawIconPlay(gr, x, y, size, colour) {
    var s = size / 24;
    var points = [
        x + Math.round(5  * s), y + Math.round(3  * s),
        x + Math.round(19 * s), y + Math.round(12 * s),
        x + Math.round(5  * s), y + Math.round(21 * s),
    ];
    gr.FillPolygon(colour, 0, points);
}

/**
 * Draw pause icon - two vertical rectangles.
 * Feather: rect x="6" y="4" width="4" height="16" + rect x="14" y="4" width="4" height="16"
 */
function drawIconPause(gr, x, y, size, colour) {
    var s = size / 24;
    var bar_w = Math.round(4 * s);
    var bar_h = Math.round(16 * s);
    var top   = y + Math.round(4 * s);
    gr.FillSolidRect(x + Math.round(6  * s), top, bar_w, bar_h, colour);
    gr.FillSolidRect(x + Math.round(14 * s), top, bar_w, bar_h, colour);
}

/**
 * Draw stop icon - filled square.
 * Feather: rect x="4" y="4" width="16" height="16"
 */
function drawIconStop(gr, x, y, size, colour) {
    var s  = size / 24;
    var sq = Math.round(16 * s);
    gr.FillSolidRect(x + Math.round(4 * s), y + Math.round(4 * s), sq, sq, colour);
}

/**
 * Draw previous track icon - triangle + vertical bar.
 * Feather: polygon "19 20 9 12 19 4 19 20" + line x1="5" y1="19" x2="5" y2="5"
 */
function drawIconPrev(gr, x, y, size, colour) {
    var s = size / 24;
    var lw = Math.max(SZ.border * 2, px(2));
    var points = [
        x + Math.round(19 * s), y + Math.round(20 * s),
        x + Math.round(9  * s), y + Math.round(12 * s),
        x + Math.round(19 * s), y + Math.round(4  * s),
    ];
    gr.FillPolygon(colour, 0, points);
    var bx = x + Math.round(5 * s);
    gr.DrawLine(bx, y + Math.round(5 * s), bx, y + Math.round(19 * s), lw, colour);
}

/**
 * Draw next track icon - triangle + vertical bar.
 * Feather: polygon "5 4 15 12 5 20 5 4" + line x1="19" y1="5" x2="19" y2="19"
 */
function drawIconNext(gr, x, y, size, colour) {
    var s = size / 24;
    var lw = Math.max(SZ.border * 2, px(2));
    var points = [
        x + Math.round(5  * s), y + Math.round(4  * s),
        x + Math.round(15 * s), y + Math.round(12 * s),
        x + Math.round(5  * s), y + Math.round(20 * s),
    ];
    gr.FillPolygon(colour, 0, points);
    var bx = x + Math.round(19 * s);
    gr.DrawLine(bx, y + Math.round(5 * s), bx, y + Math.round(19 * s), lw, colour);
}

/**
 * Draw volume icon - speaker polygon + arc lines for level.
 * level: 0=silent body only, 1=small arc, 2=medium arc, 3=large arc
 * Feather speaker body: polygon "11 5 6 9 2 9 2 15 6 15 11 19 11 5"
 */
function drawIconVolume(gr, x, y, size, colour, level) {
    var s = size / 24;
    var lw = Math.max(SZ.border, px(1));
    level = level || 0;

    // Speaker body
    var body = [
        x + Math.round(11 * s), y + Math.round(5  * s),
        x + Math.round(6  * s), y + Math.round(9  * s),
        x + Math.round(2  * s), y + Math.round(9  * s),
        x + Math.round(2  * s), y + Math.round(15 * s),
        x + Math.round(6  * s), y + Math.round(15 * s),
        x + Math.round(11 * s), y + Math.round(19 * s),
    ];
    gr.FillPolygon(colour, 0, body);

    // Volume arcs - approximated as short diagonal lines
    // Feather uses bezier arcs; we approximate with straight lines at icon sizes
    if (level >= 1) {
        // Small arc - inner wave
        var ax1 = x + Math.round(14.5 * s);
        gr.DrawLine(ax1, y + Math.round(9.5  * s),
                    ax1 + Math.round(1 * s), y + Math.round(12 * s), lw, colour);
        gr.DrawLine(ax1 + Math.round(1 * s), y + Math.round(12 * s),
                    ax1, y + Math.round(14.5 * s), lw, colour);
    }
    if (level >= 2) {
        // Medium arc
        var ax2 = x + Math.round(17 * s);
        gr.DrawLine(ax2, y + Math.round(7 * s),
                    ax2 + Math.round(1.5 * s), y + Math.round(12 * s), lw, colour);
        gr.DrawLine(ax2 + Math.round(1.5 * s), y + Math.round(12 * s),
                    ax2, y + Math.round(17 * s), lw, colour);
    }
    if (level >= 3) {
        // Large arc
        var ax3 = x + Math.round(19 * s);
        gr.DrawLine(ax3, y + Math.round(4.5 * s),
                    ax3 + Math.round(2 * s), y + Math.round(12 * s), lw, colour);
        gr.DrawLine(ax3 + Math.round(2 * s), y + Math.round(12 * s),
                    ax3, y + Math.round(19.5 * s), lw, colour);
    }
}

/**
 * Draw mute icon - speaker body + X mark.
 * Feather: volume speaker body + lines for X
 */
function drawIconMute(gr, x, y, size, colour) {
    var s  = size / 24;
    var lw = Math.max(SZ.border, px(1));

    // Speaker body (same as volume)
    var body = [
        x + Math.round(11 * s), y + Math.round(5  * s),
        x + Math.round(6  * s), y + Math.round(9  * s),
        x + Math.round(2  * s), y + Math.round(9  * s),
        x + Math.round(2  * s), y + Math.round(15 * s),
        x + Math.round(6  * s), y + Math.round(15 * s),
        x + Math.round(11 * s), y + Math.round(19 * s),
    ];
    gr.FillPolygon(colour, 0, body);

    // X mark - two diagonal lines
    // Feather: line x1="23" y1="9" x2="17" y2="15" + line x1="17" y1="9" x2="23" y2="15"
    gr.DrawLine(
        x + Math.round(23 * s), y + Math.round(9  * s),
        x + Math.round(17 * s), y + Math.round(15 * s),
        lw, colour
    );
    gr.DrawLine(
        x + Math.round(17 * s), y + Math.round(9  * s),
        x + Math.round(23 * s), y + Math.round(15 * s),
        lw, colour
    );
}

/**
 * Draw sun icon - circle with 8 radiating lines.
 * Indicates: click to switch to light mode (shown in dark mode).
 * Feather: circle cx="12" cy="12" r="5" + 8 lines
 */
function drawIconSun(gr, x, y, size, colour) {
    var s   = size / 24;
    var lw  = Math.max(SZ.border, px(1));
    var cx  = x + Math.round(12 * s);
    var cy  = y + Math.round(12 * s);
    var r   = Math.round(5 * s);

    // Central circle
    gr.DrawEllipse(cx - r, cy - r, r * 2, r * 2, lw, colour);

    // 8 rays - Feather positions
    var rays = [
        [12, 2,  12, 4 ],   // top
        [12, 20, 12, 22],   // bottom
        [2,  12, 4,  12],   // left
        [20, 12, 22, 12],   // right
        [4.2,  4.2,  5.6,  5.6 ],  // top-left
        [18.4, 18.4, 19.8, 19.8],  // bottom-right
        [19.8, 4.2,  18.4, 5.6 ],  // top-right
        [5.6,  18.4, 4.2,  19.8],  // bottom-left
    ];
    rays.forEach(function(r) {
        gr.DrawLine(
            x + Math.round(r[0] * s), y + Math.round(r[1] * s),
            x + Math.round(r[2] * s), y + Math.round(r[3] * s),
            lw, colour
        );
    });
}

/**
 * Draw moon icon - crescent using two overlapping circles.
 * Indicates: click to switch to dark mode (shown in light mode).
 * Feather uses a bezier path; we approximate with filled circles.
 * Method: filled circle minus offset filled circle in background colour.
 */
function drawIconMoon(gr, x, y, size, colour) {
    var s  = size / 24;
    var cx = x + Math.round(12 * s);
    var cy = y + Math.round(12 * s);
    var r  = Math.round(8  * s);
    var or = Math.round(6  * s);   // Offset circle radius
    var ox = Math.round(5  * s);   // Offset in x
    var oy = Math.round(-3 * s);   // Offset in y

    // Main filled circle - the full moon body
    gr.FillEllipse(cx - r, cy - r, r * 2, r * 2, colour);

    // Offset circle in background colour - cuts the crescent
    gr.FillEllipse(cx - r + ox, cy - r + oy, or * 2, or * 2, COL.bg);
}


// =============================================================================
// SECTION 10 - HELPER UTILITIES
// =============================================================================

/**
 * Clamp a value between min and max.
 */
function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

/**
 * Check if mouse coordinates are within a rectangle.
 * @returns {boolean}
 */
function inRect(mx, my, x, y, w, h) {
    return mx >= x && mx <= x + w && my >= y && my <= y + h;
}

/**
 * Format seconds as M:SS string for time display.
 * @param {number} secs - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(secs) {
    if (secs < 0) return '-:--';
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
}

/**
 * Format bytes to nearest sensible unit for bitrate display.
 * @param {number} kbps - Bitrate in kbps
 * @returns {string} Formatted string e.g. "320 kbps" or "1.4 Mbps"
 */
function formatBitrate(kbps) {
    if (kbps < 1000) return kbps + ' kbps';
    return (kbps / 1000).toFixed(1) + ' Mbps';
}

/**
 * Determine codec display colour based on format type.
 * Returns COL.hires for lossless/hi-res, COL.lossy for lossy, COL.accent for others.
 * @param {string} codec - Codec name from foobar2000 title formatting
 * @returns {number} Colour value
 */
function codecColour(codec) {
    var lossless = ['FLAC', 'WAV', 'AIFF', 'ALAC', 'APE', 'WAVPACK', 'TTA', 'DSD', 'DFF', 'DSF'];
    var lossy    = ['MP3', 'AAC', 'OGG', 'VORBIS', 'OPUS', 'WMA', 'MP4', 'M4A', 'AC3', 'EAC3'];
    var upper    = (codec || '').toUpperCase();
    if (lossless.indexOf(upper) >= 0) return COL.hires;
    if (lossy.indexOf(upper)    >= 0) return COL.lossy;
    return COL.accent;
}


// =============================================================================
// END OF solarized_lib.js
// =============================================================================
// Quick reference - panel script template:
//
//   include(fb.ProfilePath + 'solarized\\solarized_lib.js');
//
//   // ... panel code using COL.*, SZ.*, FONT.*, px(), drawIcon*() ...
//
//   // Required - handles SMP panel-to-panel switching
//   function on_notify_data(name, data) {
//       _lib_on_notify_data(name, data);   // ALWAYS first
//   }
//
//   // Required - handles Windows system mode and CUI mode changes
//   function on_colours_changed() {
//       _lib_on_colours_changed();         // ALWAYS first
//   }
//
//   function on_paint(gr) {
//       drawBackground(gr, 0, 0, window.Width, window.Height);
//       // ... draw panel content ...
//   }
// =============================================================================
