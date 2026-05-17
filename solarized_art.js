// ==================================================
// solarized_art.js
// foobar2000-solarized - Album art panel
// ==================================================
// Version:   0.1.0-dev
// Changed:   Initial framework - background and mode switching verified
//            Loads and displays album art for current track
//            Placeholder shown when no art available
// License:   MIT
// Author:    tom2tec
// Website:   audio-file.org
// Repo:      https://github.com/tom2tec/foobar2000-solarized
// Requires:  solarized_lib.js v0.1.4-dev or later
//            Spider Monkey Panel 1.6.1 (32-bit)
//            foobar2000 2.25.8+
//            Columns UI 3.4.1+
//            Windows 10 / Windows 11
// Location:  solarized\solarized_art.js
// Dev:       profile\solarized\solarized_art.js
// Repo:      solarized_art.js
// ==================================================
// Change log:
//   0.1.0-dev  Initial framework version
// ==================================================

include(fb.ProfilePath + 'solarized\\solarized_lib.js');

var _art      = null;   // Current album art image object
var _no_art   = true;   // No art available flag

function loadArt() {
    _art    = null;
    _no_art = true;
    var track = fb.GetNowPlaying();
    if (!track) { window.Repaint(); return; }
    utils.GetAlbumArtAsync(window.ID, track, 0);
}

function on_paint(gr) {
    var w = window.Width;
    var h = window.Height;
    if (w < px(20) || h < px(20)) { drawBackground(gr, 0, 0, w, h); return; }

    drawBackground(gr, 0, 0, w, h);
    drawBorder(gr, 0, 0, w, h);

    if (_art && !_no_art) {
        // Draw art scaled to fit panel maintaining aspect ratio
        var art_w = _art.Width;
        var art_h = _art.Height;
        var scale = Math.min(w / art_w, h / art_h);
        var draw_w = Math.round(art_w * scale);
        var draw_h = Math.round(art_h * scale);
        var draw_x = Math.round((w - draw_w) / 2);
        var draw_y = Math.round((h - draw_h) / 2);
        gr.DrawImage(_art, draw_x, draw_y, draw_w, draw_h,
                     0, 0, art_w, art_h, 0, 255);
    } else {
        // Placeholder - filled background with music note label
        gr.FillSolidRect(px(1), px(1), w - px(2), h - px(2), COL.art_placeholder);
        gr.DrawString('[art]', FONT.ui_sm, COL.art_icon,
                      0, 0, w, h, 0x00000005);
    }
}

function on_get_album_art_done(metadb, art_id, image, image_path) {
    if (image) {
        _art    = image;
        _no_art = false;
    } else {
        _art    = null;
        _no_art = true;
    }
    window.Repaint();
}

function on_playback_new_track(info) { loadArt(); }
function on_playback_stop(reason)    { _art = null; _no_art = true; window.Repaint(); }

function on_notify_data(name, data) { _lib_on_notify_data(name, data); }
function on_colours_changed() { _lib_on_colours_changed(); }
