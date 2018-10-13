'use strict';

class LogoParser {
	// needs a Logo Object
	constructor(logo, console, status) {
		this.logo = logo;
		this.console = console;
		this.status = status;
		this.clearWarning();
		this.clearErr();
		this.vars = {};
		this.funs = {};		
		this.loadShortCode();		
	}

	// update status
	updateStatus(text = "") {
		let msg = "";
		msg += "(" + this.logo.getX().toFixed(3) + ", " + (-this.logo.getY()).toFixed(3) + "), ";
		msg += "∠: " + (this.logo.getAngle() % 360).toFixed(3) + ", ";
		msg += this.logo.isPendown() ? "Pendown" : "Penup";
		msg += " " + this.getLastErr(text);
		this.status.html(msg);
	}

	// add a short function
	_addShortCode(fun_name, parameters, body) {
		this.funs[fun_name] = [parameters, body];
	}

	// add some short funcs
	loadShortCode() {
		this._addShortCode("polygon", ["corner", "len"], 
			"repeat :corner " + 
			"[fd :len rt 360/:corner]");
		this._addShortCode("star", ["len"], 
			"repeat 5 " + 
			"[fd :len rt 144]");		
		this._addShortCode("tri", ["n"], 
			"repeat 3 " + 
			"[fd :n rt 120]");
		this._addShortCode("cube", ["n"], 
			"repeat 6 " + 
			"[tri :n rt 60]");		
		this._addShortCode("fillsquare", ["size"], 
			"make \"tmp :size repeat :size " + 
			"[polygon 4 :tmp dec :tmp]");
		this._addShortCode("fillpolygon", ["corner", "size"], 
			"make \"tmp :size repeat :size " +
			"[polygon :corner :tmp dec :tmp]");
	}

	// push a varaible
	addVar(name, value) {
		this.vars[name] = this.evalVars(value);
	}

	// clear a variable
	delVar(name) {
		if (name in this.vars) {
			delete this.vars[name];
		} else {
			this.pushWarning("delVar", name);
		}
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

	// get last err
	getLastErr(error) {
		error = error || this.error;
		error = error.trim();
		let arr = error.split("\n");
		console.log(arr);
		if (arr.length > 0) {
			return arr[arr.length - 1].trim();
		}
		return "";
	}

	// add a warning
	pushWarning(cmd, x, word = '') {
		if (word) {
			this.warning += 'Warning: ' + cmd + " " + x + ': ' + word + "\n";
		} else {
			this.warning += 'Warning: ' + cmd + " " + x + "\n";
		}
	}

	updateVars() {
		this.vars['random'] = Math.random();
		this.vars['RANDOM'] = Math.random();
		this.vars['turtlex'] = this.logo.getX();
		this.vars['turtley'] = this.logo.getY();
		this.vars['turtleangle'] = this.logo.getAngle();			
	}

	// eval variables
	evalVars(s) {
		let var_arr = parseVarName(s);
		let varlen = var_arr.length;		
		this.updateVars();
		for (let i = 0; i < varlen; ++ i) {
			let var_name = var_arr[i].substring(1);		
			let local = this.getVar(var_name);			
			if (local !== undefined) {				
				s = s.replaceAll(":" + var_name, local);				
			}
		}
		try {
			return eval(s);
		} catch (e) {
			return s;
		}
	}

	// jump comments and white spaces
	skipTo(s, i, U) {
		// skip for white spaces and newlines
		while ((i < U) && (isSpace(s[i]) || s[i] == '\n')) {
			i ++;				
		}
		if (i >= U) { // reach block end
			return i;
		}
		// skip comments till the end
		if ((s[i] == ';') || (s[i] == '#')) {
			i ++;
			while ((i < U) && (s[i] != '\n')) {
				i ++;
			}
			i ++;
		}
		// skip // comments
		if (i + 1 < U) {
			if ((s[i] == '/') && (s[i + 1] == '/')) {
				i += 2;
				while ((i < U) && (s[i] != '\n')) {
					i ++;
				}
				i ++;
			}
		}
		// skip /* */ comments
		if (i + 1 < U) {
			if ((s[i] == '/') && (s[i + 1] == '*')) {
				i += 2;
				while ((i < U) && ((s[i] != '*') || (s[i + 1] != '/'))) {
					i ++;
				}
				i += 2;				
			}
		}		
		return i;	
	}

	// parse a LOGO program source code
	// source - s
	// left index - i
	// right index (not contain) - U
	run(s, i, U, depth = 0) {
		let find_left, find_right, repeat_left, repeat_right, find_else;
		let nested, expr, second_word, second_word_word, find_next_body, ifelse;
		let the_var_name;
		if (depth > MAX_DEPTH) {
			// Stack Overflow e.g. recursion without terminating conditions
			this.pushErr("", LOGO_ERR_STACK_OVERFLOW, depth);
			return false;
		}
		while (i < U) {
			// jump Comments and white spaces
			i = this.skipTo(s, i, U);
			if (i >= U) {
				break;
			}
			// get next word and next index
			let x = getNextWord(s, i, U);
			i = x.next;
			let word = x.word;
			if (word == '') {
				continue;
			}
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
				case "rect":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
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
					if ((second_word_word === '') || (!isNumeric(second_word_word))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, second_word_word);
						return false;
					}					
					this.logo.fillRec(word_next, second_word_word);
					i = second_word.next;
					break;
				case "penerase":
				case "pe":
					this.logo.eraser();
				case "wait":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.wait(parseFloat(word_next));
					i = y.next;
					break;
				case "remove": // e.g. remove "abc
					if (!word_next.startsWith("\"")) { 
						// variable must be noted with double quotes
						this.pushErr(word, LOGO_ERR_MISSING_QUOTE);
						return false;
					}
					// get the variable name
					let var_name1 = word_next.substring(1); 
					// not a valid variable name
					if (!isValidVarName(var_name1)) {
						this.pushErr(word, LOGO_ERR_INVALID_VAR_NAME);
						return false;
					}
					// remove it from memory
					this.delVar(var_name1);
					i = y.next;
					break;					
				case "clear": 
					// clear workspace variables
					this.vars = {};
					// clear all functions
					this.funs = {};
					break;
				case "clearconsole": 
					// clear console
					this.console.val('');
					break;					
				case "penpaint":
				case "ppt":				
					this.logo.pen();
				case "pd":
				case "pendown":
					this.logo.pd();
					break;
				case "fd":
				case "walk":
				case "forward":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.fd(parseFloat(word_next));
					i = y.next;
					break;
				case "square":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.square(parseFloat(word_next));
					i = y.next;
					break;			
				case "setpc":
				case "pc":
				case "setpencolor":
				case "setcolor":
					if (word_next == '[') {
						find_next_body = getNextBody(s, i, U);
						if (find_next_body.right >= U) {
							this.pushErr(word, LOGO_ERR_MISSING_RIGHT);
							return false;
						}
						let rgb = s.substring(find_next_body.left + 1, find_next_body.right);
						let rgb_arr = rgb.split(' ').map(item => item.trim()).filter(x => x != '');
						if (rgb_arr.length != 3) {
							this.pushErr(word, LOGO_ERR_INVALID_RGB, rgb);
							return false;
						}
						let rgb_r = this.evalVars(rgb_arr[0]);
						let rgb_g = this.evalVars(rgb_arr[1]);
						let rgb_b = this.evalVars(rgb_arr[2]);
						this.logo.setLineColor("rgb(" + rgb_r + "," + rgb_g + ", " + rgb_b + ")");
						i = find_next_body.right + 1;
					} else {
						word_next = this.evalVars(word_next);
						if ((word_next === '') || (!isNumeric(word_next))) {
							this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
							return false;
						}
						this.logo.setPc(parseInt(word_next));
						i = y.next;
					}
					break;										
				case "jump":
				case "jmp":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
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
				case "setx":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.moveToX(parseFloat(word_next));
					i = y.next;
					break;		
				case "sety":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.moveToY(-parseFloat(word_next));
					i = y.next;
					break;														
				case "bk":
				case "backward":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.bk(parseFloat(word_next));
					i = y.next;
					break;	
				case "fontsize":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.setFontSize(parseFloat(word_next));
					i = y.next;
					break;			
				case "print":
				case "console":
					let cur_console_text, result;
					if (word_next != '[') {
						word_next = this.evalVars(word_next);					
						result = word_next;			
						if (this.console) {					    
						    cur_console_text = this.console.val();
						    this.console.val(cur_console_text + "\n" + result);
						}
						console.log(result);
						i = y.next;						
					} else {
						find_next_body = getNextBody(s, i, U);
						if (find_next_body.right >= U) {
							this.pushErr(word, LOGO_ERR_MISSING_RIGHT);
							return false;
						}
						result = this.evalVars(s.substring(find_next_body.left + 1, find_next_body.right));					
						if (this.console) {					    
						    cur_console_text = this.console.val();
						    this.console.val(cur_console_text + "\n" + result);
						}
						console.log(result);						
						i = find_next_body.right + 1;						
					}
					break;									
				case "rt":
				case "right":
					word_next = this.evalVars(word_next);					
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.rt(parseFloat(word_next));
					i = y.next;
					break;	
				case "circle":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.circle(parseFloat(word_next));
					i = y.next;
					break;	
				case "dotxy":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
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
					if ((second_word_word === '') || (!isNumeric(second_word_word))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, second_word_word);
						return false;
					}					
					this.logo.dotxy(word_next, second_word_word);
					i = second_word.next;
					break;	
				case "setxy": // standard LOGO programming
				case "moveto":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
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
					if ((second_word_word === '') || (!isNumeric(second_word_word))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, second_word_word);
						return false;
					}					
					this.logo.moveTo(word_next, -second_word_word);
					i = second_word.next;
					break;									
				case "screen":
				case "setsc":
				case "setscreencolor":
					if ((word_next === '')) {
						this.pushErr(word, LOGO_ERR_MISSING_PARAM, word_next);
						return false;
					}
					this.logo.setScreenColor(word_next);
					i = y.next;
					break;
				case "dec":
					if (!word_next.startsWith(':')) {
						this.pushErr(word, LOGO_ERR_MISSING_VAR_NAME, word_next);
						return false;
					}
					the_var_name = word_next.substring(1);
					if (the_var_name in this.vars) {
						this.vars[the_var_name] --;
					} else {
						this.pushErr(word, LOGO_ERR_INVALID_VAR_NAME, word_next);
						return false;
					}
					i = y.next;
					break;												
				case "turn":
				case "seth":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.setAngle(parseFloat(word_next));
					i = y.next;
					break;					
				case "inc":
					if (!word_next.startsWith(':')) {
						this.pushErr(word, LOGO_ERR_MISSING_VAR_NAME, word_next);
						return false;
					}
					the_var_name = word_next.substring(1);
					if (the_var_name in this.vars) {
						this.vars[the_var_name] ++;
					} else {
						this.pushErr(word, LOGO_ERR_INVALID_VAR_NAME, word_next);
						return false;
					}
					i = y.next;
					break;
				case "lt":
				case "left":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.lt(parseFloat(word_next));
					i = y.next;
					break;
				case "width":
					word_next = this.evalVars(word_next);
					if ((word_next === '') || (!isNumeric(word_next))) {
						this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
						return false;
					}
					this.logo.setLineWidth(parseFloat(word_next));
					i = y.next;
					break;												
				case "color":				
					if ((word_next === '')) {
						this.pushErr(word, LOGO_ERR_MISSING_PARAM, word_next);
						return false;
					}
					this.logo.setLineColor(word_next);
					i = y.next;
					break;		
				case "text":
				case "label":
					let text_result;
					if (word_next != '[') {
						word_next = this.evalVars(word_next);					
						this.logo.drawText(word_next);
						i = y.next;						
					} else {
						find_next_body = getNextBody(s, i, U);
						if (find_next_body.right >= U) {
							this.pushErr(word, LOGO_ERR_MISSING_RIGHT);
							return false;
						}
						text_result = s.substring(find_next_body.left + 1, find_next_body.right);					
						this.logo.drawText(this.evalVars(text_result));				
						i = find_next_body.right + 1;						
					}
					break;
				case "js":
					if (word_next != '[') {
						this.pushErr(word, LOGO_ERR_MISSING_LEFT, word_next);
					}
					find_next_body = getNextBody(s, i, U);
					if (find_next_body.right >= U) {
						this.pushErr(word, LOGO_ERR_MISSING_RIGHT);
						return false;
					}
					let js_code = s.substring(find_next_body.left + 1, find_next_body.right).trim();
					eval(js_code);
					i = find_next_body.right + 1;
					break;	
				case "for":
					if (word_next != '[') {
						this.pushErr(word, LOGO_ERR_MISSING_LEFT, word_next);
					}				
					find_next_body = getNextBody(s, i, U);
					if (find_next_body.right >= U) {
						this.pushErr(word, LOGO_ERR_MISSING_RIGHT);
						return false;
					}
					let for_code = s.substring(find_next_body.left + 1, find_next_body.right).trim();
					i = find_next_body.right + 1;
					let for_body = getNextBody(s, i, U);
					if (for_body.right >= U) {
						this.pushErr(word, LOGO_ERR_MISSING_RIGHT);
						return false;
					}					
					let for_code2 = s.substring(for_body.left + 1, for_body.right).trim();
					if ((for_code.length > 0) && (for_code2.length > 0)) {
						// remove surrounding white spaces
						let for_code_arr = for_code.split(' ').map(item => item.trim()).filter(x => x != '');
						// For Syntax: [VarName Start Stop Step]
						let for_index = 0;
						let for_var = "";
						let saved_for_var = null;
						if (isValidVarName(for_code_arr[0])) {
							for_var = for_code_arr[0];
							if (for_var in this.vars) {
								saved_for_var = this.vars[for_var];
							}							
							this.vars[for_var] = 0;
							for_index ++;
						}
						if (for_code_arr.length - for_index < 2) {
							this.pushErr(word, LOGO_ERR_INVALID_FOR);
							return false;
						}
						if (for_code_arr.length - for_index > 3) {
							this.pushErr(word, LOGO_ERR_INVALID_FOR);
							return false;
						}						
						let for_start = this.evalVars(for_code_arr[for_index]);
						let for_stop = this.evalVars(for_code_arr[for_index + 1]);
						let for_step = 1;
						if (for_index + 2 < for_code_arr.length) {
							for_step = this.evalVars(for_code_arr[for_index + 2]);
						}
						if ((for_start === '') || (!isNumeric(for_start))) {
							this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, for_start);
							return false;
						}		
						if ((for_stop === '') || (!isNumeric(for_stop))) {
							this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, for_stop);
							return false;
						}	
						if ((for_step === '') || (!isNumeric(for_step))) {
							this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, for_step);
							return false;
						}
						// get for values
						for_start = parseInt(for_start);
						for_stop = parseInt(for_stop);
						for_step = parseInt(for_step);
						// beware of endless loop ^_^
						for (let for_loop = for_start; for_loop <= for_stop; for_loop += for_step) {
							// update repeat count
							this.addVar('repcount', for_loop - for_start + 1);
							this.addVar('REPCOUNT', for_loop - for_start + 1);
							if (for_var != "") {
								this.vars[for_var] = for_loop;
							}
							// if body
							if (!this.run(for_code2, 0, for_code2.length, depth + 1)) {		
								return false;
							}							
						}
						// restore loop variable
						if ((for_var != "") && saved_for_var !== null) {
							this.vars[for_var] = saved_for_var;
						}
					}
					// parse next token
					i = for_body.right + 1;					
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
					ifelse = iftrue(word_next);					
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
					let funs_name = y.word.trim().toLowerCase();
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
					if ((word_next === '') || (!isNumeric(word_next))) {
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
						// update repeat count
						this.addVar('repcount', i + 1);
						this.addVar('REPCOUNT', i + 1);
						// recursive call repeat body
						if (!this.run(s, repeat_left, find_right, depth + 1)) {
							return false;
						}
					}
					i = find_right + 1;
					break;		
				case "while":
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
					let tmp = word_next;
					while (true) {
						// re-evaluate the while expression
						word_next = this.evalVars(tmp);
						if (word_next === '') {
							this.pushErr(word, LOGO_ERR_MISSING_NUMBERS, word_next);
							return false;
						}
						if (!iftrue(word_next)) {
							// while expression evaluated to false
							break;
						}
						// while loop body
						if (!this.run(s, repeat_left, find_right, depth + 1)) {
							return false;
						}
					}
					i = find_right + 1;
					break;					
				case "do":
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
					let do_exp = word_next;													
					word_next = this.evalVars(do_exp);			
					ifelse = iftrue(word_next);
					if (word_next === '') {
						this.pushErr(word, LOGO_ERR_MISSING_EXP, word_next);
						return false;
					}												
					while (iftrue(word_next)) {
						// do body
						if (!this.run(s, repeat_left, find_right, depth + 1)) {		
							return false;
						}
						word_next = this.evalVars(do_exp);
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
				default:
					word = word.toLowerCase();
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
							if ((word_next === '') || (!isNumeric(word_next))) {
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
						if (i >= U) {
							break;
						}
						continue;
					}
					this.pushErr(word, LOGO_ERR_UNKNOWN_COMMAND, word);
					return false;											
			}		
		}	
		return true; // SUCCESS	
	}
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = {
		LogoParser
	}
}
