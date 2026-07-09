"use strict";

const fs = require("fs");
const path = require("path");
const { expect } = require("chai");

const root = path.resolve(__dirname, "..");

function readJson(...parts) {
	return JSON.parse(fs.readFileSync(path.join(root, ...parts), "utf8"));
}

describe("repository metadata", function () {
	it("keeps package, lockfile and extension versions aligned", function () {
		const pkg = readJson("package.json");
		const lock = readJson("package-lock.json");
		const manifest = readJson("manifest.json");

		expect(pkg.version, "package.json version should look like SemVer").to.match(/^\d+\.\d+\.\d+$/);
		expect(lock.version).to.equal(pkg.version);
		expect(lock.packages[""].version).to.equal(pkg.version);
		expect(manifest.version).to.equal(pkg.version);
	});

	it("declares a supported Node.js engine", function () {
		const pkg = readJson("package.json");
		expect(pkg.engines).to.have.property("node", ">=18");
	});

	it("documents the expected maintenance npm scripts", function () {
		const scripts = readJson("package.json").scripts;
		const expectedScripts = [
			"badges",
			"badges:check",
			"build",
			"bundle",
			"check",
			"coverage",
			"format",
			"format:check",
			"lint",
			"lint:fix",
			"test",
			"watch",
		];

		for (const script of expectedScripts) {
			expect(scripts, script).to.have.property(script).that.is.a("string").and.is.not.empty;
		}
	});

	it("publishes a valid Shields endpoint for the JavaScript badge", function () {
		const badge = readJson("badges", "javascript.json");

		expect(badge).to.deep.include({
			schemaVersion: 1,
			label: "JavaScript",
			color: "f1e05a",
		});
		expect(badge.message).to.match(/^\d+\.\d%$/);
	});

	it("keeps at least 25 UI languages and Chrome locales", function () {
		const langFiles = fs
			.readdirSync(path.join(root, "lang"))
			.filter((file) => file.endsWith(".js") && file !== "registry.js");
		const localeDirs = fs.readdirSync(path.join(root, "_locales"));

		expect(langFiles).to.have.lengthOf.at.least(25);
		expect(localeDirs).to.have.lengthOf.at.least(25);
	});
});
