"use strict";

require("chai").should();
let modules = require("../js/logo_funs");

describe("isNumeric", function () {
	it("true", function () {
		modules.isNumeric(1).should.equal(true);
		modules.isNumeric(1.2).should.equal(true);
		modules.isNumeric(0).should.equal(true);
		modules.isNumeric("00").should.equal(true);
		modules.isNumeric("11").should.equal(true);
	});
	it("false", function () {
		modules.isNumeric("0..0").should.equal(false);
		modules.isNumeric("11ff").should.equal(false);
		modules.isNumeric("ff").should.equal(false);
		modules.isNumeric("").should.equal(false);
	});
});

describe("isValidVarName", function () {
	it("true", function () {
		modules.isValidVarName("aa11").should.equal(true);
		modules.isValidVarName("abc").should.equal(true);
		modules.isValidVarName("ABC").should.equal(true);
		modules.isValidVarName("AxBxC").should.equal(true);
		modules.isValidVarName("Aa1234").should.equal(true);
		modules.isValidVarName("abd__234").should.equal(true);
	});
	it("false", function () {
		modules.isValidVarName("0..0").should.equal(false);
		modules.isValidVarName("11ff").should.equal(false);
		modules.isValidVarName("000ff").should.equal(false);
		modules.isValidVarName("  kk d").should.equal(false);
		modules.isValidVarName("aa  kk d").should.equal(false);
	});
});

describe("isSpace", function () {
	it("true for whitespace", function () {
		modules.isSpace(" ").should.equal(true);
		modules.isSpace("\t").should.equal(true);
		modules.isSpace("\n").should.equal(true);
	});
	it("false for non-whitespace", function () {
		modules.isSpace("a").should.equal(false);
		modules.isSpace("1").should.equal(false);
		modules.isSpace("[").should.equal(false);
	});
});

describe("getNextWord", function () {
	it("reads space-separated words", function () {
		let a = modules.getNextWord("fd 100", 0, 6);
		a.word.should.equal("fd");
		let b = modules.getNextWord("fd 100", a.next, 6);
		b.word.should.equal("100");
	});
	it("treats brackets as single-character tokens", function () {
		let a = modules.getNextWord("[fd]", 0, 4);
		a.word.should.equal("[");
		a.next.should.equal(1);
	});
	it("stops at comment markers", function () {
		let a = modules.getNextWord("fd#c", 0, 4);
		a.word.should.equal("fd");
	});
});

describe("getNextBody", function () {
	it("finds a simple bracket body", function () {
		let r = modules.getNextBody("[fd 100]", 0, 8);
		r.ch.should.equal("[");
		r.left.should.equal(0);
		r.right.should.equal(7);
	});
	it("matches nested brackets", function () {
		let s = "[a [b] c]";
		let r = modules.getNextBody(s, 0, s.length);
		r.ch.should.equal("[");
		r.right.should.equal(s.length - 1);
	});
});

describe("parseVarName", function () {
	it("extracts variable references", function () {
		modules.parseVarName(":n+5").should.deep.equal([":n"]);
		modules.parseVarName(":a*:b").should.deep.equal([":a", ":b"]);
	});
	it("returns an empty array when there are no variables", function () {
		modules.parseVarName("100+5").should.deep.equal([]);
	});
});

describe("iftrue", function () {
	it("handles numbers", function () {
		modules.iftrue(1).should.equal(true);
		modules.iftrue(0).should.equal(false);
		modules.iftrue(5).should.equal(true);
	});
	it("handles booleans", function () {
		modules.iftrue(true).should.equal(true);
		modules.iftrue(false).should.equal(false);
	});
	it("handles strings", function () {
		modules.iftrue("true").should.equal(true);
		modules.iftrue("false").should.equal(false);
		modules.iftrue("TRUE").should.equal(true);
	});
});
