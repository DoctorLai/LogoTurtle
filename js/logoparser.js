'use strict';

class LogoParser {
	// needs a Logo Object
	constructor(logo) {
		this.logo = logo;
		this.clearWarning();
		this.clearErr();
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

	// parse a LOGO program source code
	// source - s
	// left index - i
	// right index (not contain) - U
	run(s, i, U) {
		while (i < U) {
			// get next word and next index
			let x = getNextWord(s, i, U);
			i = x.next;
			let word = x.word;
			let lword = word.toLowerCase();
			let y = getNextWord(s, i, U);
			let word_next = y.word;			
			switch (word) {
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
				case "pd":
				case "pendown":
					this.logo.pd();
					break;
				case "fd":
				case "forward":
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.fd(parseFloat(word_next));
					i = y.next;
					break;
				case "bk":
				case "backward":
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.bk(parseFloat(word_next));
					i = y.next;
					break;	
				case "rt":
				case "right":
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.rt(parseFloat(word_next));
					i = y.next;
					break;		
				case "lt":
				case "left":
					if ((word_next == '') || (!isNumeric(word_next))) {
						this.pushErr(LOGO_ERR_MISSING_NUMBERS, word_next);
						return;
					}
					this.logo.lt(parseFloat(word_next));
					i = y.next;
					break;
				case "width":
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
				case "repeat":
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
						this.run(s, repeat_left, find_right);
					}
					i = find_right + 1;
					break;						
				default:
					this.pushErr(LOGO_ERR_UNKNOWN_COMMAND, word);												
			}
		}		
	}
}