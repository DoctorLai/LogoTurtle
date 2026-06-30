"use strict";

// Integration tests for LogoParser after replacing eval() with safeEval().

const { expect } = require("chai");
const { runProgram, callsNamed } = require("./helpers/logo_harness");

describe("LogoParser - basic movement", function () {
	it("runs forward and right turns", function () {
		const { logo, parser } = runProgram("fd 100 rt 90");
		expect(parser.getErr()).to.equal("");
		expect(callsNamed(logo, "fd")).to.have.lengthOf(1);
		expect(callsNamed(logo, "fd")[0].args[0]).to.equal(100);
		expect(callsNamed(logo, "rt")[0].args[0]).to.equal(90);
	});

	it("supports command aliases (forward/right)", function () {
		const { logo } = runProgram("forward 50 right 45");
		expect(callsNamed(logo, "fd")[0].args[0]).to.equal(50);
		expect(callsNamed(logo, "rt")[0].args[0]).to.equal(45);
	});
});

describe("LogoParser - expression evaluation (eval replacement)", function () {
	it("evaluates arithmetic arguments", function () {
		const { logo } = runProgram("fd 2*3");
		expect(callsNamed(logo, "fd")[0].args[0]).to.equal(6);
	});

	it("substitutes variables then evaluates", function () {
		const { logo } = runProgram('make "n 5 fd :n+10');
		expect(callsNamed(logo, "fd")[0].args[0]).to.equal(15);
	});

	it("supports parseInt and random-free math", function () {
		const { logo } = runProgram("fd parseInt(7.9) rt 360/4");
		expect(callsNamed(logo, "fd")[0].args[0]).to.equal(7);
		expect(callsNamed(logo, "rt")[0].args[0]).to.equal(90);
	});

	it("evaluates two-argument commands like setxy", function () {
		const { logo, parser } = runProgram("setxy 10+5 20");
		expect(parser.getErr()).to.equal("");
		expect(callsNamed(logo, "moveTo")).to.have.lengthOf(1);
		expect(callsNamed(logo, "moveTo")[0].args[0]).to.equal(15);
	});
});

describe("LogoParser - loops, conditionals and procedures", function () {
	it("repeats a block the right number of times", function () {
		const { logo } = runProgram("repeat 4 [fd 100 rt 90]");
		expect(callsNamed(logo, "fd")).to.have.lengthOf(4);
		expect(callsNamed(logo, "rt")).to.have.lengthOf(4);
	});

	it("runs IF with a comparison expression", function () {
		const { logo } = runProgram('make "x 10 if :x>5 [fd 1]');
		expect(callsNamed(logo, "fd")).to.have.lengthOf(1);
	});

	it("skips IF body when the condition is false", function () {
		const { logo } = runProgram('make "x 1 if :x>5 [fd 1]');
		expect(callsNamed(logo, "fd")).to.have.lengthOf(0);
	});

	it("defines and calls a procedure with parameters", function () {
		const { logo, parser } = runProgram("to sq :n repeat 4 [fd :n rt 90] end sq 50");
		expect(parser.getErr()).to.equal("");
		const fd = callsNamed(logo, "fd");
		expect(fd).to.have.lengthOf(4);
		fd.forEach((c) => expect(c.args[0]).to.equal(50));
	});

	it("evaluates a FOR loop range", function () {
		const { logo } = runProgram("for [i 1 3] [fd 10]");
		expect(callsNamed(logo, "fd")).to.have.lengthOf(3);
	});
});

describe("LogoParser - error handling", function () {
	it("reports unknown commands", function () {
		const { parser } = runProgram("frobnicate 10");
		expect(parser.getErr()).to.contain("Unknown Command");
	});

	it("treats bare colour names as strings, not expressions", function () {
		const { logo, parser } = runProgram("color red");
		expect(parser.getErr()).to.equal("");
		expect(callsNamed(logo, "setLineColor")[0].args[0]).to.equal("red");
	});
});
