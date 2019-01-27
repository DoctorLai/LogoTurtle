'use strict';

// log in the textarea
const logit = (msg) => {
    let d = new Date();
    let n = d.toLocaleTimeString();
    let dom = $('textarea#about');
    let s = dom.val();
    dom.val(s + "\n" + n + ": " + msg);
}

// save settings
const saveSettings = (showMsg = true) => {
    let settings = {};
    settings['lang'] = $('select#lang').val();
    settings['console'] = $('textarea#console').val().trim();
    settings['procedures'] = $('textarea#procedures').val().trim();
    chrome.storage.sync.set({ 
        logosettings: settings
    }, function() {
        if (showMsg) {
            alert(get_text('alert_save'));
        }
    });
}

// on document ready
document.addEventListener('DOMContentLoaded', function() {
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });      
    let canvas = document.getElementById('logo');
    let logo = new LogoCanvas(canvas, $('#turtle'));
    let log = $('textarea#about');
    let status = $('div#status');
    let logoparser = new LogoParser(logo, log, status);
    // update status
    logoparser.updateStatus();
    $('button#run').click(function() {
        let s = "";
        s += $('textarea#procedures').val().trim();
        s += "\n";
        s += $('textarea#console').val().trim();        
        logoparser.clearErr();
        logoparser.clearWarning();
        logoparser.scanForLabels(s, 0, s.length);
        logoparser.run(s, 0, s.length);
        let err = logoparser.getErr();
        let warning = logoparser.getWarning();
        if (err != '') {
            logit(err.trim());
        }
        if (warning != '') {
            logit(warning.trim());
        }
        // save the source code
        saveSettings(false);
        // update status
        logoparser.updateStatus(err);
    });
    $('textarea#console').keydown(function (e) {
        if (e.ctrlKey && e.keyCode == 13) {
            // Ctrl-Enter pressed
            $('button#run').click();
        }
    });    
    // open canvas as png in new tab
    document.getElementById('download').addEventListener('click', () => {
        chrome.tabs.create({ url: canvas.toDataURL() });
    }, false);
    // load settings
    chrome.storage.sync.get('logosettings', function(data) {
        if (data && data.logosettings) {
            let settings = data.logosettings;
            let lang = settings['lang'];
            let console = settings['console'];
            let procedures = settings['procedures'];
            $("select#lang").val(lang);
            $("textarea#console").val(console);
            $('textarea#procedures').val(procedures);
        } else {
            // first time set default parameters
        }
        // about
        let manifest = chrome.runtime.getManifest();    
        let app_name = manifest.name + " v" + manifest.version;
        // version number
        $('textarea#about').val(get_text('application') + ': ' + app_name + '\n' + get_text('chrome_version') + ': ' + getChromeVersion());
        // translate
        ui_translate();
    });
    // save settings when button 'save' is clicked
    $('button#setting_save_btn').click(function() {
        saveSettings();
        // translate
        ui_translate();        
    });
}, false);