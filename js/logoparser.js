'use strict';

class LogoParser {
	// needs a Logo Object
	constructor(logo) {
		this.logo = logo;
		this.clearWarning();
		this.clearErr();
		this.vars = {};
		this.funs = {};
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
	pushErr(cmd, x, word = '') {
		if (word) {
			this.error += 'Error: ' + cmd + " " +  x + ': ' + word + "\n";
		} else {
			this.error += 'Error: ' + cmd + " " + x + "\n";
		}
	}

	// add a warning
	pushWarning(cmd, x, word = '') {
		if (word) {
			this.warning += 'Warning: ' + cmd + " " + x + ': ' + word + "\n";
		} else {
			this.warning += 'Warning: ' + cmd + " " + x + "\n";
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
		try {
			return eval(s);
		} catch (e) {
			return s;
		}
	}

	// parse a LOGO program source code
	// source - s
	// left index - i
	// right index (not contain) - U
	run(s, i, U, depth = 0) {
		let find_left, find_right, repeat_left, repeat_right, find_else;
		let nested, expr, second_word, second_word_word;
		if (depth > MAX_DEPTH) {
			// Stack Overflow e.g. recursion without terminating conditions
			this.pushErr("", LOGO_ERR_STACK_OVERFLOW, depth);
			return false;
		}
		while (i < U) {
			// skip for white spaces and newlines
			while ((i < U) && (isSpace(s[i]) || s[i] == '\n')) {
				i ++;				
			}
			if (i >= U) { // reach block end
				break;
			}
			// skip comments till the end
			if ((s[i] == ';') || (s[i] == '#')) {
				while ((i < U) && (s[i] != '\n')) {
					i ++;
				}
				i ++;
				continue;
			}
			// skip // comments
			if (i + 1 < U) {
				if ((s[i] == '/') && (s[i + 1] == '/')) {
					while ((i < U) && (s[i] != '\n')) {
						i ++;
					}
					i ++;
					continue;
				}
			}
			// get next word and next index
			let x = getNextWord(s, i, U);
			i = x.next;
			let word = x.word;
			let lword = word.toLowerCase();
			let y = getNextWord(s, i, U);
			let word_next = y.word;			
			switch (lword) {
				case '[': // ignore additional []
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
						this.pushErr(word, LOGO_ERR_MISSING_QUOTE);
						return false;
					}
					let var_name = word_next.substring(1);
					if (!isValidVarName(var_name)) {
						this.pushErr(word, LOGO_ERR_INVALID_VAR_NAME);
						return false;
					}
					let word_next2 = getNextWord(s, y.next, U);
					if (word_next2.word == '[') {
						let find_next_body2 = getNextBody(s, i, U);
						if (find_next_body2.right >= U) {
							this.pushErr(word, LOGO_ERR_MISSING_RIGHT);
							return false;
						}
						let body = s.substring(find_next_body2.left + 1, find_next_body2.right);
						this.addVar(var_name, body);
						i = find_next_body2.right + 1;
					} else {
						this.addVar(var_name, this.evalVars(word_next2.word));
						i = word_next2.next + 1;
					}
					break;
				case "stop":
					return false;
				case "pd":
				case "pendown":
					this.logo.pd();
					break;
				case "fd":
				case "walk":
				case "forward":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.fd(parseFloat(word_next));
					i = y.next;
					break;
				case "jump":
				case "jmp":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
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
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.bk(parseFloat(word_next));
					i = y.next;
					break;	
				case "fontsize":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.setFontSize(parseFloat(word_next));
					i = y.next;
					break;						
				case "rt":
				case "right":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.rt(parseFloat(word_next));
					i = y.next;
					break;	
				case "circle":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.circle(parseFloat(word_next));
					i = y.next;
					break;	
				case "moveto":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					second_word = getNextWord(s, y.next, U);
					second_word_word = second_word.word;
					expr = this.evalVars(second_word_word);
					try {
						second_word_word = eval(expr);
					} catch (e) {
						this.pushErr(word, LOGO_ERR_EVAL, expr);
						return false;
					}						
					if ((second_word_word == '') || (!isNumeric(second_word_word))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, second_word_word);
						return false;
					}					
					this.logo.moveTo(word_next, second_word_word);
					i = second_word.next;
					break;									
				case "screen":
					if ((word_next == '')) {
						this.pushErr(word, LOGO_ERR_MISSING_PARAM, word_next);
						return false;
					}
					this.logo.setScreenColor(word_next);
					i = y.next;
					break;							
				case "turn":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.setAngle(parseFloat(word_next));
					i = y.next;
					break;
				case "lt":
				case "left":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.lt(parseFloat(word_next));
					i = y.next;
					break;
				case "width":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.setLineWidth(parseFloat(word_next));
					i = y.next;
					break;												
				case "color":				
					if ((word_next == '')) {
						this.pushErr(word, LOGO_ERR_MISSING_PARAM, word_next);
						return false;
					}
					this.logo.setLineColor(word_next);
					i = y.next;
					break;		
				case "text":
					if (word_next != '[') {
						this.pushErr(word, LOGO_ERR_MISSING_LEFT);
					}
					let find_next_body = getNextBody(s, i, U);
					if (find_next_body.right >= U) {
						this.pushErr(word, LOGO_ERR_MISSING_RIGHT);
						return false;
					}
					let text_to_print = s.substring(find_next_body.left + 1, find_next_body.right);
					this.logo.drawText(text_to_print);
					i = find_next_body.right + 1;
					break;
				case "if":
					word_next = this.evalVars(word_next);				
					if (word_next === '') {
						this.pushErr(word, LOGO_ERR_MISSING_EXP, word_next);
						return false;
					}
					find_left = getNextWord(s, y.next, U);
					if (find_left.word != '[') {
						this.pushErr(word, LOGO_ERR_MISSING_LEFT, find_left.word);
						return false;
					}
					repeat_left = find_left.next;
					find_right = repeat_left + 1;
					nested = 1;
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
						this.pushWarning(word, LOGO_ERR_MISSING_RIGHT);						
					}
					let ifelse = iftrue(word_next);
					if (ifelse) {
						// if body
						if (!this.run(s, repeat_left, find_right, depth + 1)) {		
							return false;
						}
					} 	
					find_else = getNextWord(s, find_right + 1, U);
					if (find_else.word.toLowerCase() == 'else') {
						let else_block = getNextBody(s, find_else.next, U);
						if (else_block.ch != '[') {
							this.pushErr(word, LOGO_ERR_MISSING_LEFT, else_block.ch);
							return false;
						}
						if (!ifelse) {
							// else body
							if (!this.run(s, else_block.left, else_block.right, depth + 1)) {
								return false;
							}
						}
						i = else_block.right + 1;
					} else {
						// no else block
						i = find_right + 1; 
					}
					break;	
				case "to": // define a function
					let next_word;
					let funs_name = y.word.trim();
					if (!isValidVarName(funs_name)) {
						this.pushErr(word, LOGO_ERR_INVALID_FUN_NAME, funs_name);
						return false;
					}
					i = y.next;
					let start_fun_idx = i;
					let end_fun_idx = -1;
					for (;;) {
						let prev = i;
						next_word = getNextWord(s, i, U);
						i = next_word.next;
						if (next_word.word.toLowerCase() == 'end') {
							end_fun_idx = prev;
							break;
						}
						if ((next_word.word == '' || next_word.next >= U)) {
							this.pushErr(word, LOGO_ERR_MISSING_END, next_word);
							return false;
						}
					}
					if (end_fun_idx == -1) {
						this.pushErr(word, LOGO_ERR_MISSING_END, '');
						return false;						
					}
					let funs_s = s.substring(start_fun_idx, end_fun_idx).trim();
					if (funs_s && y) {
						let ii = 0;
						let UU = s.length;
						let funs_params = []; // funs parameter
						let j = ii;
						while (ii < U) {
							j = ii;
							let to_word = getNextWord(funs_s, ii, UU);
							ii = to_word.next;
							if (to_word.word.startsWith(':')) {
								let to_word_param = to_word.word.substring(1);
								if (!isValidVarName(to_word_param)) {
									this.pushErr(word, LOGO_ERR_INVALID_VAR_NAME, to_word_param);
									return false;
								}
								funs_params.push(to_word_param);
							} else {
								break;
							}							
						}
						let funs_body = funs_s.substring(j, UU).trim();
						// declare the function
						this.funs[funs_name] = [funs_params, funs_body];
					}
					break;
				case "repeat":
					word_next = this.evalVars(word_next);
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					find_left = getNextWord(s, y.next, U);
					if (find_left.word != '[') {
						this.pushErr(word, LOGO_ERR_MISSING_LEFT, find_left.word);
						return false;
					}
					repeat_left = find_left.next;
					find_right = repeat_left + 1;
					nested = 1;
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
						this.pushWarning(word, LOGO_ERR_MISSING_RIGHT);						
					}
					for (let i = 0; i < word_next; ++ i) {
						// recursive call repeat body
						if (!this.run(s, repeat_left, find_right, depth + 1)) {
							return false;
						}
					}
					i = find_right + 1;
					break;						
				default:
					if (word in this.funs) {
						// it is a function
						let f_params = this.funs[word][0];
						let f_body = this.funs[word][1];
						let f_len = f_params.length;
						// save the vars for current scope
						let local_vars = {}						
						for (let fi = 0; fi < f_len; ++ fi) {
							let param = getNextWord(s, i, U);
							i = param.next;
							word_next = param.word;				
							expr = this.evalVars(word_next);
							try {
								word_next = eval(expr);
							} catch (e) {
								this.pushErr(word, LOGO_ERR_EVAL, word_next);
								return false;
							}				
							if ((word_next == '') || (!isNumeric(word_next))) {
								this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
								return false;
							}
							// save a copy
							local_vars[f_params[fi]] = this.vars[f_params[fi]];
							this.addVar(f_params[fi], word_next);
							if (i >= U) {
								break;
							}
						}
						let result = this.run(f_body, 0, f_body.length, depth + 1);
						// restore
						for (let fi = 0; fi < f_len; ++ fi) {
							this.vars[f_params[fi]] = local_vars[f_params[fi]];
						}
						i = y.next;
						continue;
					}
					this.pushErr(word, LOGO_ERR_UNKNOWN_COMMAND, word);
					return false;											
			}		
		}	
		return true; // SUCCESS	
	}
}