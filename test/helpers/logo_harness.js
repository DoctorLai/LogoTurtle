"use strict";

// Shared test harness for the LOGO interpreter.
//
// LogoParser and its helpers are written as browser-style classic scripts that
// share a single global scope. To exercise them from Node we concatenate the
// relevant sources and evaluate them once inside a `vm` context, then drive the
// parser with lightweight mocks that record every turtle command.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SOURCES = ["logo_funs.js", "logo_constants.js", "safe_eval.js", "logoparser.js"];

const combined =
	SOURCES.map((f) => fs.readFileSync(path.join(__dirname, "..", "..", "js", f), "utf8")).join(
		"\n;\n"
	) + "\nglobalThis.LogoParser = LogoParser;\n";

function makeSandbox() {
	const sandbox = {
		Math,
		console: { log() {}, error() {}, warn() {} },
	};
	vm.createContext(sandbox);
	vm.runInContext(combined, sandbox);
	return sandbox;
}

const sandbox = makeSandbox();
const { LogoParser } = sandbox;

// Records every turtle command call so tests can assert on them.
function createMockLogo() {
	const calls = [];
	const state = { x: 0, y: 0, angle: 0, pendown: true };
	const handler = {
		get(target, prop) {
			if (prop === "calls") return calls;
			if (prop === "getX") return () => state.x;
			if (prop === "getY") return () => state.y;
			if (prop === "getAngle") return () => state.angle;
			if (prop === "isPendown") return () => state.pendown;
			return (...args) => {
				calls.push({ name: prop, args });
			};
		},
	};
	return new Proxy({}, handler);
}

function createMockConsole() {
	let value = "";
	return {
		val(x) {
			if (arguments.length) {
				value = x;
				return this;
			}
			return value;
		},
	};
}

const mockStatus = {
	html() {
		return this;
	},
};

function runProgram(src) {
	const logo = createMockLogo();
	const cons = createMockConsole();
	const parser = new LogoParser(logo, cons, mockStatus);
	parser.clearErr();
	parser.clearWarning();
	parser.scanForLabels(src, 0, src.length);
	const ok = parser.run(src, 0, src.length);
	return { ok, logo, cons, parser };
}

function callsNamed(logo, name) {
	return logo.calls.filter((c) => c.name === name);
}

module.exports = {
	LogoParser,
	makeSandbox,
	createMockLogo,
	createMockConsole,
	mockStatus,
	runProgram,
	callsNamed,
};
