/* jshint -W117 */
/* jshint -W097 */
/* jshint -W119 */
"use strict";

// button click when press enter in text
const textPressEnterButtonClick = (text, button) => {
    text.keydown(function(e) {
        if (e.keyCode == 13) {
            button.click();
        }
    });        
}

// get chrome version
const getChromeVersion = () => {
    const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
}

// Delay for a number of milliseconds
const sleep = (ms) => {
    const start = new Date().getTime();
    // busy waiting
    while (new Date().getTime() <= start + ms);
}

/**
 * This is the function that will take care of image extracting and
 * setting proper filename for the download.
 * IMPORTANT: Call it from within a onclick event.
*/
const downloadCanvas = (link, canvasId, filename) => {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}