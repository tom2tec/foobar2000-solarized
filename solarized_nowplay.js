// ==================================================
// solarized_nowplay.js
// foobar2000-solarized - Now playing info panel
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
// Location:  solarized\solarized_nowplay.js
// Dev:       profile\solarized\solarized_nowplay.js
// Repo:      solarized_nowplay.js
// ==================================================
// Change log:
//   0.1.0-dev  Initial framework version
// ==================================================

include(fb.ProfilePath + 'solarized\\solarized_lib.js');

var _track  = '';
var _artist = '';
var _album  = '';
var _codec  = '';

function on_paint(gr) {
    var w = window.Width;
    var h = window.Height;
    if (w < px(40) || h < px(16)) { drawBackground(gr, 0, 0, w, h); return; }
    drawBackground(gr, 0, 0, w, h);
    drawDivider(gr, 0, 0, w);
    var line1 = _track  ? _track  : '[now playing]';
    var line2 = _artist ? _artist + (_album ? '  -  ' + _album : '') : '';
    var line3 = _codec  ? '[' + _codec + ']' : '';
    var row_h = Math.round(h / 3);
    gr.DrawString(line1, FONT.title,   COL.text_emph, px(4), 0,        w - px(8), row_h, 0);
    gr.DrawString(line2, FONT.ui,      COL.text,      px(4), row_h,    w - px(8), row_h, 0);
    gr.DrawString(line3, FONT.mono_sm, COL.accent,    px(4), row_h*2,  w - px(8), row_h, 0);
}

function on_playback_new_track(info) {
    if (info) {
        _track  = info.Title;
        _artist = info.Artist;
        _album  = info.Album;
        _codec  = info.Codec;
    }
    window.Repaint();
}

function on_playback_stop(reason) {
    _track = ''; _artist = ''; _album = ''; _codec = '';
    window.Repaint();
}

function on_notify_data(name, data) { _lib_on_notify_data(name, data); }
function on_colours_changed() { _lib_on_colours_changed(); }
