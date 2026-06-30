"use strict";

/**
 * safe_eval.js — a small, sandboxed arithmetic/boolean expression evaluator.
 *
 * Manifest V3 forbids `eval()` and `new Function()` (no `'unsafe-eval'` in the
 * Content Security Policy). LogoTurtle historically relied on `eval()` to
 * compute LOGO expressions such as `:n + 5`, `360 / :corner` or
 * `parseInt(:random * 3)`. This module re-implements just enough of a JS
 * expression evaluator — using a tokenizer plus a recursive-descent parser — so
 * the interpreter keeps working without ever calling `eval()`.
 *
 * Supported grammar:
 *   - number literals (incl. floats and scientific notation: 1, 3.14, 2e3)
 *   - parentheses
 *   - unary:        - + !
 *   - exponent:     **            (right associative)
 *   - multiplicative: * / %
 *   - additive:     + -
 *   - relational:   < > <= >=
 *   - equality:     == != === !==
 *   - logical:      && ||
 *   - ternary:      cond ? a : b
 *   - constants:    PI, E, true, false (also Math.PI / Math.E)
 *   - functions:    abs sqrt cbrt sin cos tan asin acos atan atan2 sinh cosh
 *                   tanh floor ceil round trunc sign exp log log2 log10 pow
 *                   hypot min max random parseInt parseFloat int deg rad
 *
 * Anything it cannot evaluate (bare words, strings, unknown identifiers, etc.)
 * throws, which lets callers fall back to the original raw string — matching
 * the previous `try { eval(s) } catch { return s }` behaviour.
 */
(function () {
	const CONSTANTS = {
		pi: Math.PI,
		e: Math.E,
		true: true,
		false: false,
		infinity: Infinity,
		nan: NaN,
	};

	const FUNCTIONS = {
		abs: Math.abs,
		sqrt: Math.sqrt,
		cbrt: Math.cbrt,
		sin: Math.sin,
		cos: Math.cos,
		tan: Math.tan,
		asin: Math.asin,
		acos: Math.acos,
		atan: Math.atan,
		atan2: Math.atan2,
		sinh: Math.sinh,
		cosh: Math.cosh,
		tanh: Math.tanh,
		floor: Math.floor,
		ceil: Math.ceil,
		round: Math.round,
		trunc: Math.trunc,
		sign: Math.sign,
		exp: Math.exp,
		log: Math.log,
		log2: Math.log2,
		log10: Math.log10,
		pow: Math.pow,
		hypot: Math.hypot,
		min: Math.min,
		max: Math.max,
		random: Math.random,
		parseint: (x, r) => parseInt(x, r || 10),
		parsefloat: (x) => parseFloat(x),
		int: (x) => Math.trunc(x),
		deg: (x) => (x * 180) / Math.PI,
		rad: (x) => (x * Math.PI) / 180,
	};

	const isDigit = (c) => c >= "0" && c <= "9";
	const isIdentStart = (c) => /[A-Za-z_$]/.test(c);
	const isIdentPart = (c) => /[A-Za-z0-9_$.]/.test(c);

	const TWO_CHAR_OPS = ["==", "!=", "<=", ">=", "&&", "||", "**"];

	// Tokenize an expression string into a flat list of tokens.
	function tokenize(input) {
		const tokens = [];
		let i = 0;
		const n = input.length;
		while (i < n) {
			const c = input[i];
			if (c === " " || c === "\t" || c === "\n" || c === "\r") {
				i++;
				continue;
			}
			if (isDigit(c) || (c === "." && isDigit(input[i + 1]))) {
				const start = i;
				while (i < n && (isDigit(input[i]) || input[i] === ".")) i++;
				if (i < n && (input[i] === "e" || input[i] === "E")) {
					i++;
					if (input[i] === "+" || input[i] === "-") i++;
					while (i < n && isDigit(input[i])) i++;
				}
				const num = Number(input.slice(start, i));
				if (Number.isNaN(num)) {
					throw new Error("Invalid number: " + input.slice(start, i));
				}
				tokens.push({ t: "num", v: num });
				continue;
			}
			if (isIdentStart(c)) {
				const start = i;
				while (i < n && isIdentPart(input[i])) i++;
				tokens.push({ t: "ident", v: input.slice(start, i) });
				continue;
			}
			const three = input.substr(i, 3);
			if (three === "===" || three === "!==") {
				tokens.push({ t: "op", v: three });
				i += 3;
				continue;
			}
			const two = input.substr(i, 2);
			if (TWO_CHAR_OPS.indexOf(two) !== -1) {
				tokens.push({ t: "op", v: two });
				i += 2;
				continue;
			}
			if ("+-*/%<>!".indexOf(c) !== -1) {
				tokens.push({ t: "op", v: c });
				i++;
				continue;
			}
			if (c === "(") {
				tokens.push({ t: "lp" });
				i++;
				continue;
			}
			if (c === ")") {
				tokens.push({ t: "rp" });
				i++;
				continue;
			}
			if (c === ",") {
				tokens.push({ t: "comma" });
				i++;
				continue;
			}
			if (c === "?") {
				tokens.push({ t: "question" });
				i++;
				continue;
			}
			if (c === ":") {
				tokens.push({ t: "colon" });
				i++;
				continue;
			}
			throw new Error("Unexpected character: " + c);
		}
		tokens.push({ t: "eof" });
		return tokens;
	}

	const BIN_PREC = {
		"||": 1,
		"&&": 2,
		"==": 3,
		"!=": 3,
		"===": 3,
		"!==": 3,
		"<": 4,
		">": 4,
		"<=": 4,
		">=": 4,
		"+": 5,
		"-": 5,
		"*": 6,
		"/": 6,
		"%": 6,
		"**": 7,
	};
	const RIGHT_ASSOC = { "**": true };

	function applyBinary(op, a, b) {
		switch (op) {
			case "+":
				return a + b;
			case "-":
				return a - b;
			case "*":
				return a * b;
			case "/":
				return a / b;
			case "%":
				return a % b;
			case "**":
				return a ** b;
			case "<":
				return a < b;
			case ">":
				return a > b;
			case "<=":
				return a <= b;
			case ">=":
				return a >= b;
			case "==":
				return a == b; // eslint-disable-line eqeqeq
			case "!=":
				return a != b; // eslint-disable-line eqeqeq
			case "===":
				return a === b;
			case "!==":
				return a !== b;
			case "&&":
				return a && b;
			case "||":
				return a || b;
			default:
				throw new Error("Unknown operator: " + op);
		}
	}

	function resolveName(name) {
		const lower = name.toLowerCase();
		return lower.indexOf("math.") === 0 ? lower.slice(5) : lower;
	}

	function lookupConstant(name) {
		const key = resolveName(name);
		if (Object.prototype.hasOwnProperty.call(CONSTANTS, key)) {
			return CONSTANTS[key];
		}
		throw new Error("Unknown identifier: " + name);
	}

	function callFunction(name, args) {
		const key = resolveName(name);
		const fn = FUNCTIONS[key];
		if (typeof fn !== "function") {
			throw new Error("Unknown function: " + name);
		}
		return fn.apply(null, args);
	}

	// Recursive-descent parser that evaluates as it parses.
	function parse(tokens) {
		let pos = 0;
		const peek = () => tokens[pos];
		const advance = () => tokens[pos++];
		const expect = (t) => {
			const tok = advance();
			if (tok.t !== t) {
				throw new Error("Expected " + t + " but found " + tok.t);
			}
			return tok;
		};

		function parseExpression() {
			return parseTernary();
		}

		function parseTernary() {
			const cond = parseBinary(0);
			if (peek().t === "question") {
				advance();
				const whenTrue = parseExpression();
				expect("colon");
				const whenFalse = parseExpression();
				return cond ? whenTrue : whenFalse;
			}
			return cond;
		}

		function parseBinary(minPrec) {
			let left = parseUnary();
			for (;;) {
				const tok = peek();
				if (tok.t !== "op" || !(tok.v in BIN_PREC)) break;
				const prec = BIN_PREC[tok.v];
				if (prec < minPrec) break;
				advance();
				const nextMin = RIGHT_ASSOC[tok.v] ? prec : prec + 1;
				const right = parseBinary(nextMin);
				left = applyBinary(tok.v, left, right);
			}
			return left;
		}

		function parseUnary() {
			const tok = peek();
			if (tok.t === "op" && (tok.v === "-" || tok.v === "+" || tok.v === "!")) {
				advance();
				const operand = parseUnary();
				if (tok.v === "-") return -operand;
				if (tok.v === "+") return +operand;
				return !operand;
			}
			return parsePrimary();
		}

		function parsePrimary() {
			const tok = advance();
			if (tok.t === "num") return tok.v;
			if (tok.t === "lp") {
				const value = parseExpression();
				expect("rp");
				return value;
			}
			if (tok.t === "ident") {
				if (peek().t === "lp") {
					advance();
					const args = [];
					if (peek().t !== "rp") {
						args.push(parseExpression());
						while (peek().t === "comma") {
							advance();
							args.push(parseExpression());
						}
					}
					expect("rp");
					return callFunction(tok.v, args);
				}
				return lookupConstant(tok.v);
			}
			throw new Error("Unexpected token: " + tok.t);
		}

		const result = parseExpression();
		if (peek().t !== "eof") {
			throw new Error("Unexpected trailing input");
		}
		return result;
	}

	/**
	 * Evaluate an arithmetic / boolean expression without using eval().
	 * @param {string|number|boolean} input
	 * @returns {number|boolean} the evaluated value
	 * @throws {Error} when the input is not a valid, supported expression
	 */
	function safeEval(input) {
		if (typeof input === "number" || typeof input === "boolean") {
			return input;
		}
		if (typeof input !== "string") {
			throw new Error("Cannot evaluate non-string input");
		}
		const trimmed = input.trim();
		if (trimmed === "") {
			throw new Error("Empty expression");
		}
		return parse(tokenize(trimmed));
	}

	// Expose as a global for the extension's classic <script> includes and as a
	// CommonJS module for the Node-based unit tests.
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
		module.exports = { safeEval };
	}
	if (typeof globalThis !== "undefined") {
		globalThis.safeEval = safeEval;
	}
})();
