// ==================================================
// solarized_toggle.js
// foobar2000-solarized - Dark/Light mode toggle button panel
// ==================================================
// Version:   0.1.6-dev
// Changed:   Header paths changed to relative format for portability
// License:   MIT
// Author:    tom2tec
// Website:   audio-file.org
// Repo:      https://github.com/tom2tec/foobar2000-solarized
// Requires:  solarized_lib.js v0.1.4-dev or later
//            Spider Monkey Panel 1.6.1 (32-bit)
//            foobar2000 2.25.8+
//            Columns UI 3.4.1+
//            Windows 10 / Windows 11
// Location:  solarized\solarized_toggle.js
// Dev:       profile\solarized\solarized_toggle.js
// Repo:      solarized_toggle.js
// ==================================================
// Change log:
//   0.1.6-dev  Header paths changed to relative format
//   0.1.5-dev  Final clean version - diagnostics removed - toggle verified
//   0.1.4-dev  Include path diagnostic - confirmed library loads correctly
//   0.1.3-dev  Minimal diagnostic - confirmed SMP rendering works
//   0.1.2-dev  Debug include wrapper - verified ProfilePath resolution
//   0.1.1-dev  toggleModeWithSystem() and on_colours_changed() added
//   0.1.0-dev  Initial version - sun/moon icon hover/press states tooltip
// ==================================================
// Known gaps (to be addressed before v1.0 release):
//   - Right-click menu not yet implemented
//   - solarized_system_mode property not yet in library
//   - No minimum panel size guard
// ==================================================

include(fb.ProfilePath + 'solarized\\solarized_lib.js');

// Panel state
var _hover   = false;
var _press   = false;
var _tooltip = window.CreateTooltip();

// ---- Paint ----

function on_paint(gr) {
    var w   = window.Width;
    var h   = window.Height;
    var cx  = Math.round(w / 2);
    var cy  = Math.round(h / 2);
    var ic  = Math.round(SZ.icon / 2);

    // Background
    drawBackground(gr, 0, 0, w, h);

    // Button hover state
    if (_hover) {
        drawRoundRect(
            gr,
            cx - Math.round(SZ.btn / 2),
            cy - Math.round(SZ.btn / 2),
            SZ.btn, SZ.btn,
            COL.bg_btn_hover
        );
    }

    // Icon colour based on interaction state
    var colour = _press ? COL.toggle_press
               : _hover ? COL.toggle_hover
               : COL.toggle_icon;

    // Sun in dark mode - click switches to light
    // Moon in light mode - click switches to dark
    var ix = cx - ic;
    var iy = cy - ic;
    if (getMode() === 'dark') {
        drawIconSun(gr, ix, iy, SZ.icon, colour);
    } else {
        drawIconMoon(gr, ix, iy, SZ.icon, colour);
    }
}

// ---- Mouse events ----

function on_mouse_move(x, y) {
    var was  = _hover;
    _hover   = inRect(x, y, 0, 0, window.Width, window.Height);
    window.SetCursor(32649);
    if (_hover !== was) {
        _tooltip.Text = (getMode() === 'dark') ? 'Switch to light mode'
                                               : 'Switch to dark mode';
        _tooltip.Activate();
        window.Repaint();
    }
}

function on_mouse_leave() {
    _hover = false;
    _press = false;
    _tooltip.Deactivate();
    window.Repaint();
}

function on_mouse_lbtn_down(x, y) {
    _press = true;
    window.Repaint();
}

function on_mouse_lbtn_up(x, y) {
    if (_press && _hover) toggleModeWithSystem();
    _press = false;
    window.Repaint();
}

// ---- Callbacks - required for hybrid mode switching ----

function on_notify_data(name, data) {
    _lib_on_notify_data(name, data);
}

function on_colours_changed() {
    _lib_on_colours_changed();
}
