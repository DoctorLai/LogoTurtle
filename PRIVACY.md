# Privacy Policy

_Last updated: 2026_

LogoTurtle ("the extension") is an open-source LOGO (turtle graphics)
interpreter that runs entirely inside your browser. Your privacy matters, and
this policy explains exactly what the extension does and does not do with your
data.

## Summary

- **We do not collect, transmit, or sell any personal data.**
- **No analytics, no tracking, no advertising, no remote code execution.**
- Everything you type and draw stays on your device.

## What the extension stores

To remember your work between sessions, the extension saves the following using
Chrome's built-in storage API (`chrome.storage.sync`):

- Your selected **UI language**.
- The contents of the **console** editor (your LOGO program).
- The contents of the **Global Procedures** editor.

This data is stored locally and, if you are signed into Chrome with sync
enabled, synchronised across your own devices by Google Chrome. It is never
sent to the extension's author or any third-party server.

## Permissions

The extension requests a single permission:

- **`storage`** — used solely to save and restore the settings described above.

It does **not** request access to your browsing history, tabs, web page
content, clipboard, location, camera, microphone, or any other sensitive data.

## Network usage

The extension does not make network requests to load or execute remote code. In
keeping with Manifest V3, all code is bundled with the extension and runs in a
sandbox without `eval()`. The Help/About tabs contain some outbound links (for
example to the project page or the author's blog); these only open when you
click them.

## Children's privacy

LogoTurtle is designed to be safe for learners of all ages, including children.
It does not collect any information from anyone.

## Changes to this policy

Any changes to this policy will be published in this file in the public
repository.

## Contact

Questions about privacy can be raised via the
[GitHub issue tracker](https://github.com/DoctorLai/LogoTurtle/issues).
