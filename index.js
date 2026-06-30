"use strict";

// export modules - npm compatible
const logoFuns = require("./js/logo_funs.js");
const logoConstants = require("./js/logo_constants.js");
const { safeEval } = require("./js/safe_eval.js");

Object.assign(globalThis, logoFuns, logoConstants, { safeEval });

const { LogoCanvas } = require("./js/logocanvas.js");
const { LogoParser } = require("./js/logoparser.js");

module.exports = {
	LogoCanvas,
	LogoParser,
	safeEval,
	...logoFuns,
};
