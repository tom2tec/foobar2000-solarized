// ==================================================
// solarized_volume.js
// foobar2000-solarized - Volume control panel
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
// Location:  solarized\solarized_volume.js
// Dev:       profile\solarized\solarized_volume.js
// Repo:      solarized_volume.js
// ==================================================
// Change log:
//   0.1.0-dev  Initial framework version
// ==================================================

include(fb.ProfilePath + 'solarized\\solarized_lib.js');

var _volume = fb.Volume;
var _muted  = fb.IsMuted;

function on_paint(gr) {
    var w = window.Width;
    var h = window.Height;
    if (w < px(40) || h < px(16)) { drawBackground(gr, 0, 0, w, h); return; }
    drawBackground(gr, 0, 0, w, h);
    drawDivider(gr, 0, 0, w);
    var txt = '[volume] ' + (_muted ? 'muted' : Math.round(_volume) + ' dB');
    gr.DrawString(txt, FONT.mono_sm, COL.text_sec, px(4), 0, w - px(8), h, 0);
}

function on_mouse_wheel(delta) {
    fb.Volume = clamp(_volume + delta * 1.0, -100, 0);
    _volume = fb.Volume;
    window.Repaint();
}

function on_volume_change(val) {
    _volume = val;
    _muted  = fb.IsMuted;
    window.Repaint();
}

function on_notify_data(name, data) { _lib_on_notify_data(name, data); }
function on_colours_changed() { _lib_on_colours_changed(); }
