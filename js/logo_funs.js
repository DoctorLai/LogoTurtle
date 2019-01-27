'use strict';

// check if character is space
const isSpace = (x) => {
	return (x == ' ') || (x == '\t') || (x == '\n');
}

// check if numeric
const isNumeric = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// get next word
// s - string
// i - start index
// U - end index (not contain)
// return {word, next}
const getNextWord = (s, i, U) => {
/*
let s = "repeat 4 [fd 100 rt 144]";
let U = s.length;
for (let i = 0; i < U;)  {
	let x = getNextWord(s, i, U);
	console.log(x);	
	i = x.next;
}
*/
	let _k = i;
	while ((i < U) && (isSpace(s[i]))) i ++;
	if (i >= U) {
		return {word: s.substring(_k).trim(), next: U + 1};
	}
	let ch = s[i];          
	if ((ch == '[') || (ch == ']') || (ch == ';') || (ch == '#')) {
		return {word: ch, next: i + 1};	  
	}
	_k = i;
	while ( ((i < U)) && (s[i] != '[') && (s[i] != ']') && (s[i] != ';') && (s[i] != '#')) {
		if (i + 1 < U) {
			if (s[i] == '/') {
				ch = s[i + 1];
				if ((ch == '/') || ( ch == '*')) break;
			}
		}
		if (isSpace(s[i])) break;
		i ++;
	}
	return {word: s.substring(_k, i).trim(), next: i};	  
}

// get absolute position
const cumulativeOffset = (element) => {
    let top = 0, left = 0;
    do {
		top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
}

// get next [] body
const getNextBody = (s, i, U) => {
	let nested = 0;
	// need to match [ and ]
	let start = i;
	while (i < U) {
		if (s[i] == '[') {
			nested ++;
			if (nested == 1) {
				start = i;
			}
		}												
		if (s[i] == ']') {
			nested --;
			if (nested == 0) {
				break;
			}
		}
		if (!isSpace(s[i]) && (nested == 0)) {
			start = i;
			while ((i < U) && (!isSpace(s[i]))) {
				i ++;
			}
			break;		
		}
		i ++;
	}
	return {left: start, right: i, ch: s[start]};
}

// check if valid var_name
const isValidVarName = (x) => {
	let pat = /^[a-zA-Z\_]+[a-zA-Z0-9\_]*$/g;
	return pat.test(x);
}

// parse var name
const parseVarName = (s) => {
	let pat = /(:[a-zA-Z]+[a-zA-Z0-9]*)/g;
	let arr = [];
	let matches;
	while (matches = pat.exec(s)) {
		arr.push(matches[1]);		
	}
	return arr;
}

// string replace all
String.prototype.replaceAll = function(search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// check if true
const iftrue = (x) => {
	switch (typeof x) {
		case "number":
			return parseInt(x) != 0;
		case "boolean":
			return x;
		case "string":
			return x.toLowerCase() == 'true';
	}
	return false;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = {
		isNumeric,
		isValidVarName,
		getNextBody,
		getNextWord
	}
}
