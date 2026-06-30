"use strict";
/* exported LOGO_I18N, LOGO_LANG_ORDER */

// Global registry of UI translations.
//
// Each lang/<code>.js file registers itself here as:
//   LOGO_I18N["<code>"] = { name: "<native name>", dict: { ...strings } };
//
// translate.js reads the active language's `dict` and builds the language
// dropdown from this registry, so adding a new language only requires dropping
// a new file in lang/ and including it from main.html.
var LOGO_I18N = {};

// Preferred display order for the language dropdown (roughly by global usage).
// Any registered language not listed here is appended afterwards.
var LOGO_LANG_ORDER = [
	"en-us",
	"zh-cn",
	"zh-tw",
	"es",
	"hi",
	"ar",
	"pt",
	"ru",
	"ja",
	"de",
	"fr",
	"ko",
	"it",
	"tr",
	"vi",
	"pl",
	"uk",
	"nl",
	"id",
	"th",
	"fa",
	"he",
	"el",
	"cs",
	"sv",
];
