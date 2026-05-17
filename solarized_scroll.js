// ==================================================
// solarized_scroll.js
// foobar2000-solarized - Scrollbar replacement panel
// ==================================================
// Version:   0.1.0-dev
// Changed:   Initial framework - background and mode switching verified
// License:   MIT
// Author:    tom2tec
// Website:   audio-file.org
// Repo:      https://github.com/tom2tec/foobar2000-solarized
// Requires:  solarized_lib.js v0.1.4-dev or later
//            Spider Monkey Panel 1.6.1 (32-bit)
//            foobar2000 2.25.8+
//            Columns UI 3.4.1+
//            Windows 10 / Windows 11
// Location:  solarized\solarized_scroll.js
// Dev:       profile\solarized\solarized_scroll.js
// Repo:      solarized_scroll.js
// ==================================================
// Change log:
//   0.1.0-dev  Initial framework version
// ==================================================

include(fb.ProfilePath + 'solarized\\solarized_lib.js');

var _hover     = false;
var _dragging  = false;
var _thumb_pos = 0;    // 0.0 to 1.0
var _thumb_pct = 0.2;  // Thumb size as proportion of track

function getThumbRect(w, h) {
    var track_h  = h - px(4);
    var thumb_h  = Math.round(track_h * _thumb_pct);
    var thumb_y  = px(2) + Math.round(_thumb_pos * (track_h - thumb_h));
    var thumb_w  = w - px(4);
    return { x: px(2), y: thumb_y, w: thumb_w, h: thumb_h };
}

function on_paint(gr) {
    var w = window.Width;
    var h = window.Height;
    if (w < px(6) || h < px(20)) { drawBackground(gr, 0, 0, w, h); return; }
    drawBackground(gr, 0, 0, w, h);

    // Track
    gr.FillSolidRect(px(2), px(2), w - px(4), h - px(4), COL.scrollbar_track);

    // Thumb
    var t     = getThumbRect(w, h);
    var t_col = _dragging ? COL.scrollbar_drag
              : _hover    ? COL.scrollbar_hover
              : COL.scrollbar_thumb;
    gr.FillSolidRect(t.x, t.y, t.w, t.h, t_col);
}

function on_mouse_move(x, y) {
    var was = _hover;
    _hover  = inRect(x, y, 0, 0, window.Width, window.Height);
    window.SetCursor(32512);
    if (_hover !== was) window.Repaint();
}

function on_mouse_leave() {
    _hover = false;
    if (!_dragging) window.Repaint();
}

function on_notify_data(name, data) { _lib_on_notify_data(name, data); }
function on_colours_changed() { _lib_on_colours_changed(); }
