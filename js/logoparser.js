'use strict';

class LogoParser {
	// needs a Logo Object
	constructor(logo) {
		this.logo = logo;
		this.clearWarning();
		this.clearErr();
		this.vars = {};
	}

	// push a varaible
	addVar(name, value) {
		this.vars[name] = this.evalVars(value);
	}

	// find a variable
	getVar(name) {
		if (name in this.vars) {
			return this.vars[name];
		}
		return null;
	}

	// clear Warnings
	clearWarning() {
		this.warning = '';
	}

	// clear Errors
	clearErr() {
		this.error = '';
	}

	// get all errors
	getErr() {
		return this.error;
	}

	// get all warnings
	getWarning() {
		return this.warning;
	}

	// record an error
	pushErr(x, word = '') {
		if (word) {
			this.error += 'Error: ' + x + ': ' + word + "\n";
		} else {
			this.error += 'Error: ' + x + "\n";
		}
	}

	// add a warning
	pushWarning(x, word = '') {
		if (word) {
			this.warning += 'Warning: ' + x + ': ' + word + "\n";
		} else {
			this.warning += 'Warning: ' + x + "\n";
		}
	}

	// eval variables
	evalVars(s) {
		let var_arr = parseVarName(s);
		let varlen = var_arr.length;
		for (let i = 0; i < varlen; ++ i) {
			let var_name = var_arr[i].substring(1);			
			let local = this.getVar(var_name);
			if (local) {					
				s = s.replaceAll(":" + var_name, local);
				break;
			}
		}
		return s;
	}

	// parse a LOGO program source code
	// source - s
	// left index - i
	// right index (not contain) - U
	run(s, i, U, depth = 0) {
		while (i < U) {
			// skip for white spaces and newlines
			while ((i < U) && (isSpace(s[i]) || s[i] == '\n')) {
				i ++;				
			}
			if (i >= U) {
				break;
			}
			// skip comments till the end
			if (s[i] == ';') {
				while ((i < U) && (s[i] != '\n')) {
					i ++;
				}
				i ++;
				continue;
			}
			// get next word and next index
			let x = getNextWord(s, i, U);
			i = x.next;
			let word = x.word;
			let lword = word.toLowerCase();
			let y = getNextWord(s, i, U);
			let word_next = y.word;			
			switch (word) {
				case ']':
					break;
				case "st":
				case "showturtle":
					this.logo.st();
					break;
				case "ht":
				case "hideturtle":
					this.logo.ht();
					break;
				case "cs":
				case "clearscreen":
					this.logo.cs();
					break;
				case "home":
					this.logo.home();
					break;
				case "pu":
				case "penup":
					this.logo.pu();
					break;
				case "dot":
					this.logo.dot();
					break;				
				case "make": // e.g. make "abc 123
					if (!word_next.startsWith("\"")) {
						this.pushErr(LOGO_ERR_MISSING_QUOTE);
						return;
					}
					let var_name = word_next.substring(1);
					if (!isValidVarName(var_name)) {
						this.pushError(LOGO_ERR_INVALID_VAR_NAME);
						return;
					}
					let word_next2 = getNextWord(s, y.next, U);
					if (word_next2.word == '[') {
						let find_next_body2 = getNextBody(s, i, U);
						if (find_next_body2.right >= U) {
							this.pushErr(LOGO_ERR_MISSING_RIGHT);
							return;
						}
						let body = s.substring(find_next_body2.left + 1, find_next_body2.right);
						this.addVar(var_name, body);
						i = find_next_body2.right + 1;
					} else {
						this.addVar(var_name, word_next2.word);
						i = word_next2.next + 1;
					}
					break;
				case "pd":
				case "pendown":
					this.logo.pd();
					break;
				case "fd":
				case "forward":
					try {
						word_next = eval(this.evalVars(word_next));
					} catch (e) {
						this.pushErr(LOGO_ERR_EVAL, word_next);
						return;
					}
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.fd(parseFloat(word_next));
					i = y.next;
					break;
				case "jump":
				case "jmp":
					try {
						word_next = eval(this.evalVars(word_next));
					} catch (e) {
						this.pushErr(LOGO_ERR_EVAL, word_next);
						return;
					}				
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					let pd = this.logo.isPendown();
					this.logo.pu();
					this.logo.fd(parseFloat(word_next));
					if (pd) {
						this.logo.pd();
					}
					i = y.next;
					break;					
				case "bk":
				case "backward":
					try {
						word_next = eval(this.evalVars(word_next));
					} catch (e) {
						this.pushErr(LOGO_ERR_EVAL, word_next);
						return;
					}				
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.bk(parseFloat(word_next));
					i = y.next;
					break;	
				case "fontsize":
					try {
						word_next = eval(this.evalVars(word_next));
					} catch (e) {
						this.pushErr(LOGO_ERR_EVAL, word_next);
						return;
					}				
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.setFontSize(parseFloat(word_next));
					i = y.next;
					break;						
				case "rt":
				case "right":
					try {
						word_next = eval(this.evalVars(word_next));
					} catch (e) {
						this.pushErr(LOGO_ERR_EVAL, word_next);
						return;
					}				
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.rt(parseFloat(word_next));
					i = y.next;
					break;		
				case "lt":
				case "left":
					try {
						word_next = eval(this.evalVars(word_next));
					} catch (e) {
						this.pushErr(LOGO_ERR_EVAL, word_next);
						return;
					}				
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.lt(parseFloat(word_next));
					i = y.next;
					break;
				case "width":
					try {
						word_next = eval(this.evalVars(word_next));
					} catch (e) {
						this.pushErr(LOGO_ERR_EVAL, word_next);
						return;
					}				
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.setLineWidth(parseFloat(word_next));
					i = y.next;
					break;												
				case "color":				
					if ((word_next == '')) {
						this.pushErr(LOGO_ERR_MISSING_PARAM, word_next);
						return;
					}
					this.logo.setLineColor(word_next);
					i = y.next;
					break;		
				case "text":
					if (word_next != '[') {
						this.pushErro(LOGO_ERR_MISSING_LEFT);
					}
					let find_next_body = getNextBody(s, i, U);
					if (find_next_body.right >= U) {
						this.pushErr(LOGO_ERR_MISSING_RIGHT);
						return;
					}
					let text_to_print = s.substring(find_next_body.left + 1, find_next_body.right);
					this.logo.drawText(text_to_print);
					i = find_next_body.right + 1;
					break;
				case "repeat":
					try {
						word_next = eval(this.evalVars(word_next));
					} catch (e) {
						this.pushErr(LOGO_ERR_EVAL, word_next);
						return;
					}				
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					let find_left = getNextWord(s, y.next, U);
					if (find_left.word != '[') {
						this.pushErr(LOGO_ERR_MISSING_LEFT, find_left.word);
						return;
					}
					let repeat_left = find_left.next;
					let find_right = repeat_left + 1;
					let nested = 1;
					// need to match [ and ]
					while (find_right < U) {
						if (s[find_right] == '[') {
							nested ++;
						}												
 						if (s[find_right] == ']') {
 							nested --;
 							if (nested == 0) {
 								break;
 							}
 						}
 						find_right ++;
					}
					if (find_right >= U) {
						this.pushWarning(LOGO_ERR_MISSING_RIGHT);						
					}
					for (let i = 0; i < word_next; ++ i) {
						// recursive call repeat body
						this.run(s, repeat_left, find_right, depth + 1);
					}
					i = find_right + 1;
					break;						
				default:
					this.pushErr(LOGO_ERR_UNKNOWN_COMMAND, word);												
			}
		}		
	}
}