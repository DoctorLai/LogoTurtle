"use strict";

const should = require("chai").should();
const { safeEval } = require("../js/safe_eval");

describe("safeEval - numbers", function () {
	it("evaluates integer and float literals", function () {
		safeEval("0").should.equal(0);
		safeEval("42").should.equal(42);
		safeEval("3.14").should.equal(3.14);
		safeEval(".5").should.equal(0.5);
		safeEval("2e3").should.equal(2000);
		safeEval("1.5e-2").should.equal(0.015);
	});

	it("passes through numeric and boolean input unchanged", function () {
		safeEval(6).should.equal(6);
		safeEval(true).should.equal(true);
		safeEval(false).should.equal(false);
	});
});

describe("safeEval - arithmetic", function () {
	it("handles the four basic operators", function () {
		safeEval("1 + 5").should.equal(6);
		safeEval("10 - 3").should.equal(7);
		safeEval("4 * 2.5").should.equal(10);
		safeEval("360 / 4").should.equal(90);
	});

	it("handles modulo and exponent", function () {
		safeEval("10 % 3").should.equal(1);
		safeEval("2 ** 10").should.equal(1024);
	});

	it("respects operator precedence", function () {
		safeEval("1 + 2 * 3").should.equal(7);
		safeEval("(1 + 2) * 3").should.equal(9);
		safeEval("2 ** 3 ** 2").should.equal(512); // right associative
	});

	it("handles unary minus and plus", function () {
		safeEval("-5").should.equal(-5);
		safeEval("-(3 + 2)").should.equal(-5);
		safeEval("+7").should.equal(7);
		safeEval("3 - -2").should.equal(5);
	});
});

describe("safeEval - comparison and logic", function () {
	it("evaluates relational operators", function () {
		safeEval("16 > 15").should.equal(true);
		safeEval("1 < 10").should.equal(true);
		safeEval("5 <= 5").should.equal(true);
		safeEval("5 >= 6").should.equal(false);
	});

	it("evaluates equality operators", function () {
		safeEval("3 == 3").should.equal(true);
		safeEval("3 != 4").should.equal(true);
		safeEval("3 === 3").should.equal(true);
		safeEval("3 !== 3").should.equal(false);
	});

	it("evaluates logical operators and ternary", function () {
		safeEval("!0").should.equal(true);
		safeEval("1 && 1").should.equal(1);
		safeEval("0 || 7").should.equal(7);
		safeEval("5 > 3 ? 100 : 200").should.equal(100);
		safeEval("5 < 3 ? 100 : 200").should.equal(200);
	});
});

describe("safeEval - functions and constants", function () {
	it("supports parseInt and parseFloat", function () {
		safeEval("parseInt(0.9 * 3)").should.equal(2);
		safeEval("parseFloat(3.5)").should.equal(3.5);
	});

	it("supports Math helpers", function () {
		safeEval("abs(-4)").should.equal(4);
		safeEval("sqrt(16)").should.equal(4);
		safeEval("floor(3.9)").should.equal(3);
		safeEval("ceil(3.1)").should.equal(4);
		safeEval("round(3.5)").should.equal(4);
		safeEval("max(1, 9, 4)").should.equal(9);
		safeEval("min(1, 9, 4)").should.equal(1);
		safeEval("pow(2, 8)").should.equal(256);
	});

	it("supports named and Math-prefixed constants", function () {
		safeEval("PI").should.equal(Math.PI);
		safeEval("Math.PI").should.equal(Math.PI);
		safeEval("E").should.equal(Math.E);
		safeEval("true").should.equal(true);
	});

	it("produces random values within [0, 1)", function () {
		const r = safeEval("random()");
		r.should.be.within(0, 1);
	});
});

describe("safeEval - errors", function () {
	it("throws on bare words and unknown identifiers", function () {
		(() => safeEval("red")).should.throw();
		(() => safeEval("Hello World")).should.throw();
		(() => safeEval("foo(1)")).should.throw();
	});

	it("throws on empty or malformed input", function () {
		(() => safeEval("")).should.throw();
		(() => safeEval("1 +")).should.throw();
		(() => safeEval("(1 + 2")).should.throw();
		(() => safeEval("1 2 3")).should.throw();
	});

	it("does not execute arbitrary JavaScript", function () {
		(() => safeEval("global.leaked = 1")).should.throw();
		(() => safeEval("this")).should.throw();
		(() => safeEval("constructor")).should.throw();
		should.equal(typeof global.leaked, "undefined");
	});

	it("throws on unsupported input types", function () {
		(() => safeEval(null)).should.throw();
		(() => safeEval(undefined)).should.throw();
		(() => safeEval({})).should.throw();
		(() => safeEval([1, 2])).should.throw();
	});

	it("throws on malformed numbers", function () {
		(() => safeEval("1.2.3")).should.throw();
	});
});
