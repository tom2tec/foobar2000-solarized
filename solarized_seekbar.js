// ==================================================
// solarized_seekbar.js
// foobar2000-solarized - Seekbar panel
// ==================================================
// Version:   0.1.0-dev
// Changed:   Initial version - on_notify_data communication test
//            Confirms inter-panel mode switching via NotifyOthers
//            Background and text render correctly in both modes
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
//   0.1.0-dev  Initial version - on_notify_data communication test
// ==================================================
// This version tests:
//   1. Library include works correctly
//   2. Background renders in correct Solarized colour
//   3. on_notify_data fires when toggle button is clicked
//   4. Panel repaints with correct colours after mode switch
//   5. on_colours_changed fires on Windows system mode change
// Full seekbar functionality added in v0.2.0-dev
// ==================================================

include(fb.ProfilePath + 'solarized\\solarized_lib.js');

// ---- Paint ----

function on_paint(gr) {
    var w = window.Width;
    var h = window.Height;

    // Minimum size guard
    if (w < 10 || h < 10) return;

    // Background - confirms COL.bg is correct for current mode
    drawBackground(gr, 0, 0, w, h);

    // Divider line at top of panel
    drawDivider(gr, 0, 0, w);

    // Show current mode and confirm on_notify_data is working
    var mode_text = 'seekbar panel - mode: ' + getMode();
    gr.DrawString(mode_text, FONT.mono_sm, COL.text_sec, px(4), 0, w - px(8), h, 0);
}

// ---- Callbacks - required for hybrid mode switching ----

function on_notify_data(name, data) {
    _lib_on_notify_data(name, data);
}

function on_colours_changed() {
    _lib_on_colours_changed();
}
