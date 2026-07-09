# Security Policy

## Supported versions

Security fixes are considered for the latest released version of LogoTurtle.

| Version | Supported |
| ------- | --------- |
| 1.1.x   | Yes       |
| < 1.1   | No        |

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use GitHub's
private vulnerability reporting for this repository when available, or contact
the maintainer at `dr.zhihua.lai@gmail.com`.

Include the affected version, reproduction steps, expected impact, and any
known workaround. You can expect an initial response within 7 days.

## Security model

LogoTurtle is a browser extension that runs locally, requests only the
`storage` permission, and does not collect personal data. The interpreter uses
a sandboxed expression evaluator instead of `eval()` so it can satisfy
Manifest V3's extension Content Security Policy.
