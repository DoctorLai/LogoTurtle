# LogoTurtle 🐢

[![CI](https://github.com/DoctorLai/LogoTurtle/actions/workflows/ci.yml/badge.svg)](https://github.com/DoctorLai/LogoTurtle/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-blue.svg)](manifest.json)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/dcoeaobaokbccdcnadncifmconllpihp.svg?label=web%20store)](https://chrome.google.com/webstore/detail/logo-turtle/dcoeaobaokbccdcnadncifmconllpihp)
[![Users](https://img.shields.io/chrome-web-store/users/dcoeaobaokbccdcnadncifmconllpihp.svg)](https://chrome.google.com/webstore/detail/logo-turtle/dcoeaobaokbccdcnadncifmconllpihp)
[![Rating](https://img.shields.io/chrome-web-store/rating/dcoeaobaokbccdcnadncifmconllpihp.svg)](https://chrome.google.com/webstore/detail/logo-turtle/dcoeaobaokbccdcnadncifmconllpihp)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Privacy](https://img.shields.io/badge/privacy-policy-blue.svg)](PRIVACY.md)
[![Last Commit](https://img.shields.io/github/last-commit/DoctorLai/LogoTurtle.svg)](https://github.com/DoctorLai/LogoTurtle/commits)
[![Issues](https://img.shields.io/github/issues/DoctorLai/LogoTurtle.svg)](https://github.com/DoctorLai/LogoTurtle/issues)
[![Stars](https://img.shields.io/github/stars/DoctorLai/LogoTurtle.svg?style=social)](https://github.com/DoctorLai/LogoTurtle/stargazers)

**LogoTurtle** is the first open-source **LOGO programming language interpreter
(turtle graphics)** packaged as a Chrome extension. Type a few commands, press
**Ctrl + Enter**, and watch the turtle draw — a fun, visual way to teach kids
(and grown-ups) how to program.

![Spiral](https://helloacm.com/wp-content/uploads/2018/03/logo-spiral.jpg)
![If / Else](https://github.com/DoctorLai/LogoTurtle/blob/master/images/if-else.jpg?raw=true)
![For](https://github.com/DoctorLai/LogoTurtle/blob/master/images/for.jpg?raw=true)
![Tree](https://helloacm.com/wp-content/uploads/2018/03/logo-tree.jpg)

## Features

- 🐢 A complete LOGO interpreter: loops, conditionals, variables, recursion and
  user-defined procedures.
- 🧮 A **sandboxed expression evaluator** — arithmetic and math functions work
  **without `eval()`**, so the extension is fully **Manifest V3** compliant.
- 🌍 **25 UI languages** out of the box, contributed through a simple
  translation registry.
- 💾 Your program, global procedures and language are saved automatically via
  `chrome.storage.sync`.
- 🔒 **Privacy-first**: no tracking, no analytics, no remote code. See
  [PRIVACY.md](PRIVACY.md).
- 🖼️ Export your drawing as a PNG.

## Install

### Chrome Web Store (recommended)

Install directly from the
[Chrome Web Store](https://chrome.google.com/webstore/detail/logo-turtle/dcoeaobaokbccdcnadncifmconllpihp).

### Load unpacked (for development)

1. Download or clone this repository (or grab a zip from
   [Releases](https://github.com/DoctorLai/LogoTurtle/releases)).
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the project folder.

### Other browsers

The extension also works on Firefox and other Chromium-based browsers (lightly
tested) via
[Chrome Store Foxified](https://addons.mozilla.org/firefox/addon/chrome-store-foxified/).

## The LOGO language

Open the popup, type your program into the console box and press **Ctrl + Enter**
to run it. Expressions must not contain spaces (e.g. write `:n+5`, not `:n + 5`).

### Examples

```logo
; a colourful spiral
repeat 100 [fd :repcount*3 rt 90]
```

```logo
; a fractal star (recursion)
cs ht
to star :size :small
  if :size<:small [stop]
  repeat 5 [fd :size star :size*0.3 :small rt 144]
end
star 200 10
```

```logo
; a user-defined procedure with a parameter
to polygon :corner :len
  repeat :corner [fd :len rt 360/:corner]
end
polygon 6 80
```

### Supported commands

| Category   | Commands                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Movement   | `FD`/`FORWARD`/`WALK`, `BK`/`BACKWARD`, `RT`/`RIGHT`, `LT`/`LEFT`, `HOME`, `JMP`/`JUMP`, `SETX`, `SETY`, `SETXY`/`MOVETO`, `TURN`/`SETH` |
| Pen        | `PU`/`PENUP`, `PD`/`PENDOWN`, `PE`/`PENERASE`, `PPT`/`PENPAINT`, `WIDTH`, `COLOR`, `PC`/`SETPC`/`SETCOLOR`/`SETPENCOLOR`                 |
| Turtle     | `ST`/`SHOWTURTLE`, `HT`/`HIDETURTLE`                                                                                                     |
| Screen     | `CS`/`CLEARSCREEN`, `SCREEN`/`SETSC`/`SETSCREENCOLOR`, `CLEAR`, `CLEARCONSOLE`                                                           |
| Shapes     | `CIRCLE`, `RECT`, `SQUARE`, `DOT`, `DOTXY`                                                                                               |
| Text       | `TEXT`/`LABEL`, `FONTSIZE`, `PRINT`/`CONSOLE`                                                                                            |
| Control    | `REPEAT`, `IF`/`ELSE`, `WHILE`, `DO`/`ELSE`, `FOR`, `STOP`, `GOTO`                                                                       |
| Variables  | `MAKE`, `INC`, `DEC`, `REMOVE`                                                                                                           |
| Procedures | `TO` … `END`                                                                                                                             |
| Misc       | `WAIT`, `JS`                                                                                                                             |

### Global variables

`:random`, `:repcount`, `:turtlex`, `:turtley`, `:turtleangle`

### Expressions

Arithmetic (`+ - * / % **`), comparisons, `&&`/`||`/`!`, ternary `?:`, and math
helpers such as `parseInt`, `parseFloat`, `abs`, `sqrt`, `sin`, `cos`, `floor`,
`ceil`, `round`, `min`, `max`, `pow`, `random()` and the constants `PI` / `E`.

> **Manifest V3 note:** The `JS` command no longer runs arbitrary JavaScript.
> It now evaluates a safe expression and prints the result, because MV3 forbids
> `eval()`. All other commands are unchanged.

## Use as a module

The package entry (`index.js`) exports the interpreter so it can be used outside
the extension:

```js
const { LogoParser, LogoCanvas, safeEval } = require("logoturtle");

safeEval("2 ** 10"); // => 1024
```

| Export                        | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `LogoParser`                  | The LOGO interpreter                           |
| `LogoCanvas`                  | Turtle drawing surface (needs an HTML5 canvas) |
| `safeEval`                    | The sandboxed expression evaluator             |
| `getNextWord`, `isNumeric`, … | Tokenizer / validator helpers                  |

A pre-bundled build is produced by `npm run bundle` (output:
`dist/dist.min.js`).

## Development

```bash
npm install        # install dependencies
npm test           # run the test suite (Mocha + Chai)
npm run coverage   # run tests with an enforced coverage threshold
npm run lint       # lint with ESLint
npm run format     # format with Prettier
npm run check      # lint + format check + coverage
npm run build      # package dist/logoturtle-v<version>.zip for the Web Store
```

`npm run build` produces a Chrome Web Store ready ZIP in `dist/`.

### Adding a language

1. Copy `lang/en-us.js` to `lang/<code>.js` and translate the `dict` values.
2. Add a `<script src="lang/<code>.js">` tag in `main.html`.
3. Optionally add `<code>` to `LOGO_LANG_ORDER` in `lang/registry.js`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

## Contributing

Pull requests are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and
make sure `npm run check` passes before opening a PR.

## Privacy

LogoTurtle collects **no** personal data. Read the full
[Privacy Policy](PRIVACY.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes and the history of blog posts
describing each version.

## License

Released under the [MIT License](LICENSE). Built with ❤️ by
[@justyy](https://steemit.com/@justyy) ([helloacm.com](https://helloacm.com)).
