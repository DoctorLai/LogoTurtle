"use strict";

const js = require("@eslint/js");
const globals = require("globals");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
	{
		ignores: [
			"node_modules/",
			"dist/",
			"coverage/",
			".nyc_output/",
			"**/*.zip",
			"js/jquery-3.3.1.min.js",
			"js/jquery-ui.js",
			"bs/",
		],
	},
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: "script",
			globals: {
				...globals.browser,
				...globals.es2021,
				...globals.jquery,
				chrome: "readonly",
			},
		},
		rules: {
			"no-undef": "off",
			"no-unused-vars": ["warn", { caughtErrors: "none" }],
			"no-fallthrough": "off",
			"no-case-declarations": "off",
			"no-cond-assign": "off",
			"no-empty": "warn",
			"no-redeclare": "warn",
			"no-useless-escape": "warn",
			"no-prototype-builtins": "warn",
			"no-irregular-whitespace": "warn",
			"no-control-regex": "warn",
			"no-constant-condition": ["warn", { checkLoops: false }],
			"no-useless-assignment": "off",
		},
	},
	{
		files: ["test/**/*.js"],
		languageOptions: {
			globals: {
				...globals.mocha,
				...globals.node,
			},
		},
	},
	{
		files: ["scripts/**/*.js", "webpack.config.js", "index.js"],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	prettierConfig,
];
