"use strict";

// Command-level coverage for the LOGO interpreter: pen state, shapes, colours,
// variables, loops, control flow, output and a few error paths.

const { expect } = require("chai");
const { runProgram, callsNamed } = require("./helpers/logo_harness");

describe("LogoParser - pen and turtle state", function () {
	it("handles pen up / pen down", function () {
		const { logo, parser } = runProgram("pu fd 10 pd fd 20");
		expect(parser.getErr()).to.equal("");
		expect(callsNamed(logo, "pu")).to.have.lengthOf(1);
		expect(callsNamed(logo, "pd")).to.have.lengthOf(1);
		expect(callsNamed(logo, "fd")).to.have.lengthOf(2);
	});

	it("shows, hides, clears and homes the turtle", function () {
		const { logo } = runProgram("ht st cs home");
		expect(callsNamed(logo, "ht")).to.have.lengthOf(1);
		expect(callsNamed(logo, "st")).to.have.lengthOf(1);
		expect(callsNamed(logo, "cs")).to.have.lengthOf(1);
		expect(callsNamed(logo, "home")).to.have.lengthOf(1);
	});

	it("sets width and heading", function () {
		const { logo } = runProgram("width 5 seth 90");
		expect(callsNamed(logo, "setLineWidth")[0].args[0]).to.equal(5);
		expect(callsNamed(logo, "setAngle")[0].args[0]).to.equal(90);
	});
});

describe("LogoParser - shapes", function () {
	it("draws a circle, square and rectangle", function () {
		const { logo, parser } = runProgram("circle 50 square 30 rect 10 20");
		expect(parser.getErr()).to.equal("");
		expect(callsNamed(logo, "circle")[0].args[0]).to.equal(50);
		expect(callsNamed(logo, "square")[0].args[0]).to.equal(30);
		expect(callsNamed(logo, "fillRec")[0].args).to.deep.equal([10, 20]);
	});
});

describe("LogoParser - colours", function () {
	it("sets a numeric pen colour", function () {
		const { logo } = runProgram("setpc 5");
		expect(callsNamed(logo, "setPc")[0].args[0]).to.equal(5);
	});

	it("sets an RGB pen colour", function () {
		const { logo, parser } = runProgram("setpc [255 0 0]");
		expect(parser.getErr()).to.equal("");
		expect(callsNamed(logo, "setLineColor")[0].args[0]).to.equal("rgb(255,0, 0)");
	});

	it("rejects an RGB list with the wrong number of components", function () {
		const { parser } = runProgram("setpc [255 0]");
		expect(parser.getErr()).to.contain("RGB");
	});
});

describe("LogoParser - variables", function () {
	it("increments and decrements", function () {
		const { logo } = runProgram('make "n 5 inc :n inc :n dec :n fd :n');
		expect(callsNamed(logo, "fd")[0].args[0]).to.equal(6);
	});

	it("removes a variable", function () {
		const { parser } = runProgram('make "n 5 remove "n fd :n');
		expect(parser.getErr()).to.contain("Missing Numbers");
	});

	it("clears all variables without error", function () {
		const { parser } = runProgram('make "n 5 clear');
		expect(parser.getErr()).to.equal("");
	});
});

describe("LogoParser - loops", function () {
	it("nests repeat blocks", function () {
		const { logo } = runProgram("repeat 2 [repeat 3 [fd 1]]");
		expect(callsNamed(logo, "fd")).to.have.lengthOf(6);
	});

	it("exposes :repcount inside repeat", function () {
		const { logo } = runProgram("repeat 3 [fd :repcount]");
		const fd = callsNamed(logo, "fd").map((c) => c.args[0]);
		expect(fd).to.deep.equal([1, 2, 3]);
	});

	it("runs a while loop", function () {
		const { logo } = runProgram('make "n 0 while :n<3 [fd 10 inc :n]');
		expect(callsNamed(logo, "fd")).to.have.lengthOf(3);
	});

	it("runs a FOR loop with a step", function () {
		const { logo } = runProgram("for [i 0 10 5] [fd 1]");
		expect(callsNamed(logo, "fd")).to.have.lengthOf(3); // 0, 5, 10
	});

	it("runs a DO/ELSE loop and takes the else branch when initially false", function () {
		const { logo } = runProgram('make "n 9 do :n<3 [fd 1] else [fd 99]');
		const fd = callsNamed(logo, "fd");
		expect(fd).to.have.lengthOf(1);
		expect(fd[0].args[0]).to.equal(99);
	});
});

describe("LogoParser - control flow", function () {
	it("supports GOTO labels", function () {
		const src = 'make "i 0\n@loop\nfd 10\ninc :i\nif :i<3 [goto @loop]';
		const { logo, parser } = runProgram(src);
		expect(parser.getErr()).to.equal("");
		expect(callsNamed(logo, "fd")).to.have.lengthOf(3);
	});

	it("STOP halts execution", function () {
		const { logo } = runProgram("fd 10 stop fd 20");
		expect(callsNamed(logo, "fd")).to.have.lengthOf(1);
	});

	it("recurses with a terminating condition", function () {
		const { logo } = runProgram("to count :n if :n>0 [fd 10 count :n-1] end count 3");
		expect(callsNamed(logo, "fd")).to.have.lengthOf(3);
	});

	it("guards against runaway recursion (stack overflow)", function () {
		const { parser } = runProgram("to loop loop end loop");
		expect(parser.getErr()).to.contain("Stack Overflow");
	});
});

describe("LogoParser - output and error reporting", function () {
	it("prints to the console", function () {
		const { cons } = runProgram("print [hello]");
		expect(cons.val()).to.contain("hello");
	});

	it("evaluates the JS command as a safe expression", function () {
		const { cons, parser } = runProgram("js [6*7]");
		expect(parser.getErr()).to.equal("");
		expect(cons.val()).to.contain("42");
	});

	it("reports a missing [ after IF", function () {
		const { parser } = runProgram("if 1>0 fd 10");
		expect(parser.getErr()).to.contain("Missing [");
	});
});
