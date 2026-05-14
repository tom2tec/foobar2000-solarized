// ==================================================
// solarized_seekbar.js
// foobar2000-solarized - Seekbar panel
// ==================================================
// Version:   0.2.0-dev
// Changed:   Full seekbar implementation
//            Playback position track with played/unplayed portions
//            Draggable thumb for seeking
//            Elapsed and remaining time display
//            Responds to playback events
// License:   MIT
// Author:    tom2tec
// Website:   audio-file.org
// Repo:      https://github.com/tom2tec/foobar2000-solarized
// Requires:  solarized_lib.js v0.1.3-dev or later
//            Spider Monkey Panel 1.6.1 (32-bit)
//            foobar2000 2.25.8+
//            Columns UI 3.4.1+
//            Windows 10 / Windows 11
// Dev:       K:\foobar2000_solarized\profile\solarized\solarized_seekbar.js
// Repo:      K:\foobar2000_solarized\repo\foobar2000-solarized\solarized_seekbar.js
// ==================================================
// Change log:
//   0.2.0-dev  Full seekbar implementation - track thumb time display seeking
//   0.1.0-dev  Initial version - on_notify_data communication test
// ==================================================

include(fb.ProfilePath + 'solarized\\solarized_lib.js');

// ---- State ----

var _pos        = 0;      // Current playback position in seconds
var _len        = 0;      // Track length in seconds
var _dragging   = false;  // User is dragging the thumb
var _drag_pos   = 0;      // Drag position in seconds
var _hover      = false;  // Mouse is over the panel

// ---- Layout helpers ----

// Returns the x pixel position for a given time value
function timeToX(time, len, track_x, track_w) {
    if (len <= 0) return track_x;
    return track_x + Math.round((time / len) * track_w);
}

// Returns the time value for a given x pixel position
function xToTime(x, len, track_x, track_w) {
    if (track_w <= 0) return 0;
    var ratio = (x - track_x) / track_w;
    return clamp(ratio * len, 0, len);
}

// Returns the track geometry for the current panel size
function getTrack(w, h) {
    var time_w  = px(40);   // Width reserved for time strings each side
    var pad     = px(8);    // Padding
    var track_y = Math.round(h / 2);
    var track_x = time_w + pad;
    var track_w = w - (time_w * 2) - (pad * 2);
    return { x: track_x, y: track_y, w: track_w };
}

// ---- Paint ----

function on_paint(gr) {
    var w = window.Width;
    var h = window.Height;

    // Minimum size guard
    if (w < px(120) || h < px(16)) {
        drawBackground(gr, 0, 0, w, h);
        return;
    }

    // Background
    drawBackground(gr, 0, 0, w, h);

    // Top divider
    drawDivider(gr, 0, 0, w);

    var track = getTrack(w, h);
    var pos   = _dragging ? _drag_pos : _pos;
    var len   = _len;

    // ---- Track background ----
    var track_top = track.y - Math.round(SZ.seekbar_h / 2);
    gr.FillSolidRect(track.x, track_top, track.w, SZ.seekbar_h, COL.bg_hi);

    // ---- Played portion ----
    if (len > 0) {
        var played_w = Math.round((pos / len) * track.w);
        if (played_w > 0) {
            gr.FillSolidRect(track.x, track_top, played_w, SZ.seekbar_h, COL.accent);
        }
    }

    // ---- Thumb ----
    if (len > 0 && (_hover || _dragging)) {
        var thumb_x = timeToX(pos, len, track.x, track.w);
        var thumb_r = SZ.seekbar_thumb_r;
        var thumb_col = _dragging ? COL.accent_hover : COL.accent;
        gr.FillEllipse(
            thumb_x - thumb_r,
            track.y - thumb_r,
            thumb_r * 2,
            thumb_r * 2,
            thumb_col
        );
    }

    // ---- Time display ----
    var elapsed   = formatTime(pos);
    var remaining = '-' + formatTime(len - pos);

    // Elapsed - left aligned
    gr.DrawString(elapsed, FONT.mono_sm, COL.text_sec,
        0, 0, track.x - px(2), h, 6);

    // Remaining - right aligned
    var right_x = track.x + track.w + px(2);
    gr.DrawString(remaining, FONT.mono_sm, COL.text_sec,
        right_x, 0, w - right_x, h, 6);
}

// ---- Playback callbacks ----

function on_playback_new_track(info) {
    _len = info ? info.length : 0;
    _pos = 0;
    window.Repaint();
}

function on_playback_stop(reason) {
    _pos = 0;
    _len = 0;
    window.Repaint();
}

function on_playback_time(time) {
    if (!_dragging) {
        _pos = time;
        window.Repaint();
    }
}

function on_playback_seek(time) {
    _pos = time;
    window.Repaint();
}

function on_playback_pause(state) {
    window.Repaint();
}

// ---- Mouse events ----

function on_mouse_move(x, y) {
    var was   = _hover;
    _hover    = inRect(x, y, 0, 0, window.Width, window.Height);
    window.SetCursor(32649);

    if (_dragging && _len > 0) {
        var track = getTrack(window.Width, window.Height);
        _drag_pos = xToTime(x, _len, track.x, track.w);
        window.Repaint();
    } else if (_hover !== was) {
        window.Repaint();
    }
}

function on_mouse_leave() {
    _hover = false;
    if (!_dragging) window.Repaint();
}

function on_mouse_lbtn_down(x, y) {
    if (_len <= 0) return;
    var track = getTrack(window.Width, window.Height);
    if (inRect(x, y, track.x - px(8), 0, track.w + px(16), window.Height)) {
        _dragging = true;
        _drag_pos = xToTime(x, _len, track.x, track.w);
        window.SetCursor(32649);
        window.Repaint();
    }
}

function on_mouse_lbtn_up(x, y) {
    if (_dragging && _len > 0) {
        var track = getTrack(window.Width, window.Height);
        var seek_pos = xToTime(x, _len, track.x, track.w);
        fb.PlaybackTime = seek_pos;
        _pos = seek_pos;
    }
    _dragging = false;
    window.Repaint();
}

// ---- Initialise from current playback state ----

(function() {
    if (fb.IsPlaying || fb.IsPaused) {
        var info = fb.GetNowPlaying();
        if (info) {
            _len = info.length;
            _pos = fb.PlaybackTime;
        }
    }
})();

// ---- Callbacks - required for hybrid mode switching ----

function on_notify_data(name, data) {
    _lib_on_notify_data(name, data);
}

function on_colours_changed() {
    _lib_on_colours_changed();
}
