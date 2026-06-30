# Contributing to LogoTurtle

Thanks for your interest in improving LogoTurtle — the open-source LOGO
(turtle graphics) interpreter that runs as a Chrome extension. Contributions of
all kinds are welcome: bug fixes, new LOGO commands, UI translations,
documentation and tests.

## Getting started

```bash
git clone https://github.com/DoctorLai/LogoTurtle.git
cd LogoTurtle
npm install
```

## Project layout

| Path               | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `manifest.json`    | Chrome extension manifest (Manifest V3)                    |
| `main.html`        | Extension popup UI                                         |
| `js/logoparser.js` | The LOGO interpreter (`LogoParser`)                        |
| `js/logocanvas.js` | Turtle / HTML5 canvas drawing (`LogoCanvas`)               |
| `js/safe_eval.js`  | Sandboxed expression evaluator (replaces `eval()` for MV3) |
| `js/logo_funs.js`  | Pure helper functions (tokenizer, validators)              |
| `js/translate.js`  | UI translation + language dropdown                         |
| `lang/`            | UI translations (one file per language, see below)         |
| `test/`            | Mocha + Chai unit/integration tests                        |
| `scripts/`         | Build tooling (Web Store zip packaging)                    |

## NPM scripts

| Command                | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `npm test`             | Run the Mocha test suite                                      |
| `npm run coverage`     | Run tests with coverage and enforce the minimum threshold     |
| `npm run lint`         | Lint the source with ESLint                                   |
| `npm run lint:fix`     | Auto-fix lint problems where possible                         |
| `npm run format`       | Format the codebase with Prettier                             |
| `npm run format:check` | Verify formatting without writing changes                     |
| `npm run check`        | Lint + formatting check + coverage (run this before a PR)     |
| `npm run bundle`       | Build the npm library bundle (`dist/dist.min.js`) via webpack |
| `npm run build`        | Package the extension into `dist/logoturtle-v<version>.zip`   |
| `npm run ci`           | `check` + `build` — mirrors the CI pipeline                   |

## Loading the extension locally

1. Run `npm run build` (or just use the repository folder directly).
2. Open `chrome://extensions`, enable **Developer mode**.
3. Click **Load unpacked** and select the project folder, or **drag** the
   generated `dist/logoturtle-v<version>.zip` onto the page.

## Code style

- Formatting is enforced by **Prettier** and linting by **ESLint**.
- Run `npm run format` before committing, and make sure `npm run check` passes.
- Keep changes focused; avoid unrelated refactors in the same pull request.

## Adding a UI translation

Translations live in `lang/`. Each language is a single self-registering file:

1. Copy `lang/en-us.js` to `lang/<code>.js` (e.g. `lang/nb.js`).
2. Set the native `name` and translate every string in `dict`.
3. Register the file in `main.html` with a `<script src="lang/<code>.js">` tag.
4. (Optional) Add the `<code>` to `LOGO_LANG_ORDER` in `lang/registry.js` to
   control where it appears in the dropdown.

All languages must expose the same set of keys as `lang/en-us.js`.

## Submitting changes

1. Fork the repository and create a feature branch:
   `git checkout -b my-feature`
2. Make your change and add tests where it makes sense.
3. Ensure `npm run check` passes.
4. Commit with a clear message and open a pull request describing the change.

By contributing you agree that your contributions are licensed under the
project's [MIT License](LICENSE).
