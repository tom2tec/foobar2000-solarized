// =============================================================================
// solarized_toggle.js
// foobar2000-solarized - Dark/Light mode toggle button panel
// =============================================================================
// Version:  0.1.0-dev
// Requires: solarized_lib.js
// =============================================================================

include(fb.ProfilePath + 'solarized\\solarized_lib.js');

// Panel state
var _hover = false;
var _press = false;
var _tooltip = window.CreateTooltip();

// ---- Paint ----

function on_paint(gr) {
    var w  = window.Width;
    var h  = window.Height;
    var cx = Math.round(w / 2);
    var cy = Math.round(h / 2);
    var ic = Math.round(SZ.icon / 2);

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

    // Sun in dark mode (click switches to light)
    // Moon in light mode (click switches to dark)
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
    var was = _hover;
    _hover = inRect(x, y, 0, 0, window.Width, window.Height);
    // IDC_HAND = 32649 in Win32 - SMP 1.6.1 requires numeric constant
    window.SetCursor(32649);
    _tooltip.Text = (getMode() === 'dark') ? 'Switch to light mode'
                                           : 'Switch to dark mode';
    _tooltip.Activate();
    if (_hover !== was) window.Repaint();
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
    if (_press && _hover) toggleMode();
    _press = false;
    window.Repaint();
}

// ---- Notify - required for mode switching ----

function on_notify_data(name, data) {
    _lib_on_notify_data(name, data);
}