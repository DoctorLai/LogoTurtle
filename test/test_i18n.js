"use strict";

// End-to-end test for the i18n registry refactor. Loads jQuery, the registry,
// every lang/*.js file and translate.js inside a jsdom window, then exercises
// populate_languages() and get_lang() against a real <select> element.

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { expect } = require("chai");

function loadWindow() {
	const dom = new JSDOM('<!DOCTYPE html><body><select id="lang"></select></body>', {
		runScripts: "outside-only",
	});
	const { window } = dom;
	window.eval(fs.readFileSync(path.join(__dirname, "..", "js", "jquery-3.3.1.min.js"), "utf8"));

	const langDir = path.join(__dirname, "..", "lang");
	let code = fs.readFileSync(path.join(langDir, "registry.js"), "utf8") + "\n";
	const files = fs.readdirSync(langDir).filter((f) => f.endsWith(".js") && f !== "registry.js");
	for (const f of files) {
		code += fs.readFileSync(path.join(langDir, f), "utf8") + "\n";
	}
	code += fs.readFileSync(path.join(__dirname, "..", "js", "translate.js"), "utf8") + "\n";
	code +=
		"window.populate_languages = populate_languages;" +
		"window.get_lang = get_lang;" +
		"window.LOGO_I18N = LOGO_I18N;";
	window.eval(code);
	return window;
}

describe("i18n registry", function () {
	it("registers 25 languages", function () {
		const window = loadWindow();
		expect(Object.keys(window.LOGO_I18N)).to.have.lengthOf(25);
	});

	it("populates the language dropdown from the registry", function () {
		const window = loadWindow();
		window.populate_languages();
		const options = window.document.querySelectorAll("#lang option");
		expect(options.length).to.equal(25);
		expect(options[0].value).to.equal("en-us");
	});

	it("returns the selected language dictionary", function () {
		const window = loadWindow();
		window.populate_languages();
		window.$("#lang").val("fr");
		expect(window.get_lang().help).to.equal("Aide");
		window.$("#lang").val("de");
		expect(window.get_lang().help).to.equal("Hilfe");
	});

	it("falls back to English for unknown languages", function () {
		const window = loadWindow();
		window.populate_languages();
		window.$("#lang").val("does-not-exist");
		expect(window.get_lang().help).to.equal("Help");
	});
});
