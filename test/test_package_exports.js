"use strict";

const { expect } = require("chai");
const { LogoParser, LogoCanvas, safeEval, getNextWord } = require("../index.js");

describe("package exports", function () {
	it("exports the documented classes and helpers", function () {
		expect(LogoParser).to.be.a("function");
		expect(LogoCanvas).to.be.a("function");
		expect(safeEval).to.be.a("function");
		expect(getNextWord).to.be.a("function");
	});

	it("creates a LogoParser that can evaluate expressions", function () {
		let fdValue = null;
		const logo = {
			getX: () => 0,
			getY: () => 0,
			getAngle: () => 0,
			isPendown: () => true,
			fd: (value) => {
				fdValue = value;
			},
		};
		const parser = new LogoParser(logo, { val: () => "" }, { html: () => {} });
		const source = "fd 2*3";
		parser.run(source, 0, source.length);
		expect(parser.getErr()).to.equal("");
		expect(fdValue).to.equal(6);
	});
});
